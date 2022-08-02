import { Router, Request, Response } from "express";
import { body, param } from "express-validator";
import httpStatus, { NO_CONTENT } from "http-status";

import validation from "../middleware/validation";
import asyncWrapper from "../util/asyncWrapper";
import APIError from "../util/apiError";
import errors from "../util/errors";

import Challenge from "../models/challenge";
import ChallengeCertify from "../models/challengeCertify";
import AccumlateCertifies from "../models/accumlateCertifies";

import { verifyToken } from "../middleware/verifyTK";
import mongoose, { Mongoose, Types } from "mongoose";

const router = Router();

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const createChallenge = async (req, res) => {
  const { challengeName, challengeContents, challengeCategory } = req.body;
  // 챌린지가 존재하는지 확인
  if (await Challenge.exists({ challengeName })) {
    throw new APIError(
      errors.CHALLENGE_ALREADY_EXISTS.statusCode,
      errors.CHALLENGE_ALREADY_EXISTS.errorCode,
      errors.CHALLENGE_ALREADY_EXISTS.errorMsg
    );
  }

  const challenge = new Challenge();
  challenge.challengeName = challengeName;
  challenge.challengeContents = challengeContents;
  challenge.challengeCategory = challengeCategory;

  //verifyTK.js 확인
  challenge.clients = [res.locals.client.id];

  await challenge.save();

  res.status(httpStatus.CREATED).json({
    id: challenge.id,
  });
};
//챌린지 생성
router.post(
  "/",
  verifyToken,

  body("challengeName").exists(),
  body("challengeContents").exists(),
  body("challengeCategory").exists(),
  validation,

  asyncWrapper(createChallenge)
);

//챌린지 참여
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const participateChallenge = async (req, res) => {
  const { challengeId } = req.params;

  const challenge = await Challenge.findById(challengeId);

  if (!challenge) {
    throw new APIError(
      errors.CHALLENGE_NOT_EXISTS.statusCode,
      errors.CHALLENGE_NOT_EXISTS.errorCode,
      errors.CHALLENGE_NOT_EXISTS.errorMsg
    );
  }

  const challengeContainsClient = challenge.clients.find((id) =>
    id.equals(res.locals.client.id)
  );

  if (challengeContainsClient) {
    throw new APIError(
      errors.CHALLENGE_ALREADY_PARTICIPATED.statusCode,
      errors.CHALLENGE_ALREADY_PARTICIPATED.errorCode,
      errors.CHALLENGE_ALREADY_PARTICIPATED.errorMsg
    );
  }

  await Challenge.findByIdAndUpdate(challengeId, {
    $push: {
      clients: res.locals.client.id,
    },
  });

  res.status(httpStatus.CREATED).send();
};

router.post(
  "/:challengeId",

  param("challengeId").exists(),
  validation,

  verifyToken,
  asyncWrapper(participateChallenge)
);

//챌린지 탈퇴

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const exitChallenge = async (req, res) => {
  const { challengeId } = req.params;

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    throw new APIError(
      errors.CHALLENGE_NOT_EXISTS.statusCode,
      errors.CHALLENGE_NOT_EXISTS.errorCode,
      errors.CHALLENGE_NOT_EXISTS.errorMsg
    );
  }

  const challengeContainsClient = challenge.clients.find((id) =>
    id.equals(res.locals.client.id)
  );

  if (!challengeContainsClient) {
    throw new APIError(
      errors.CHALLENGE_ALREADY_NOT_PARTICIPATED.statusCode,
      errors.CHALLENGE_ALREADY_NOT_PARTICIPATED.errorCode,
      errors.CHALLENGE_ALREADY_NOT_PARTICIPATED.errorMsg
    );
  }

  await Challenge.findByIdAndUpdate(challengeId, {
    //지정된 항목 제거
    $pull: {
      clients: res.locals.client.id,
    },
  });
  res.status(httpStatus.NO_CONTENT).send();
};

router.delete(
  "/:challengeId",
  verifyToken,

  param("challengeId").exists(),
  validation,

  asyncWrapper(exitChallenge)
);

//챌린지 조회
router.get("/", verifyToken, async (req, res) => {
  let allChallenges = await Challenge.find();
  res.status(httpStatus.OK).json(allChallenges);
});

//누적 정보 출력 테스트
router.get("/testaccumlate", verifyToken, async (req, res) => {
    let allAccumlate = await AccumlateCertifies.find();
    res.status(httpStatus.OK).json(allAccumlate);
  });
  
// 챌린지 인증하기
const certifyingChallenge = async(req,res) => {
    const { challengeId } = req.params;
    const { imageUrl, certifyingContents } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const challenge = await Challenge.findById(challengeId);


    if (!challenge) {
        throw new APIError(
          errors.CHALLENGE_NOT_EXISTS.statusCode,
          errors.CHALLENGE_NOT_EXISTS.errorCode,
          errors.CHALLENGE_NOT_EXISTS.errorMsg
        );
    }

//    오늘 작성된 챌린지 인증글이 있는지 확인
//    오늘 날짜, 챌린지 아이디, 고객 아이디로 검색.
    const challengecertify = await ChallengeCertify.findOne({
        dateCreated: today,
        challengeId: challengeId,
        authorId: res.locals.client.id,
    });

    if(challengecertify) {
        throw new APIError(
            errors.ALREADY_ATHENTICATED.statusCode,
            errors.ALREADY_ATHENTICATED.errorCode,
            errors.ALREADY_ATHENTICATED.errorMsg
        );
    }

    const challengeCertify = new ChallengeCertify();
    challengeCertify.imageUrl = imageUrl;
    challengeCertify.certifyingContents = certifyingContents;
    challengeCertify.authorId = res.locals.client.id;
    challengeCertify.authorName = res.locals.client.name;
    challengeCertify.dateCreated = today;
    challengeCertify.challengeId = challengeId;

    await challengeCertify.save()

    const filter = {
        challengeId: challengeId,
        writerId: res.locals.client.id
    }

    //인증글 스키마에 이미 참여했으면 1일 누적, 처음이면 1일 시작
    const accumlate = await AccumlateCertifies.findOne(filter)

    if(accumlate) {
        let accumlateInfo = await AccumlateCertifies.findOne(filter)
        await AccumlateCertifies.findOneAndUpdate(filter,
            {
                challengeCount: accumlateInfo.challengeCount + 1
            }
        )
    } else {
        const accumlatecertifies = new AccumlateCertifies(); 
        accumlatecertifies.challengeId = challengeId;
        accumlatecertifies.writerId = res.locals.client.id;
        accumlatecertifies.writerName = res.locals.client.name;
    
        await accumlatecertifies.save();
    }
    res.status(httpStatus.CREATED).send()
}

router.post(
    "/complete/:challengeId",
    param("challengeId").exists(),
    body("certifyingContents").exists(),
    body("imageUrl").exists(),
    validation,

    verifyToken,

    asyncWrapper(certifyingChallenge)
);

router.get("/test1", async (req, res) => {
    let date = nowDate();
    res.json({'날짜':date});
});

//오늘 인증한 해당 챌린지 인증글 조회
const getCertifiedChallenge = async (req,res) => {
    const { clientId, challengeId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const challenges = await ChallengeCertify.findOne({
        dateCreated: today,
        authorId: clientId,
        challengeId,
    });

    res.status(httpStatus.OK).json({completed: challenges ? true : false});
}

router.get(
    "/challengecertify/:challengeId/:clientId", 
    param("challengeId").exists(),
    validation,
    verifyToken,
    asyncWrapper(getCertifiedChallenge)
);

//챌린지 누적 정보 모두 조회
router.get("/accumulate", async(req,res) => {
    let write = await AccumlateCertifies.find();
    res.send(write);
})

export default router;
