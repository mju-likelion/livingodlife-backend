import { Router, Request, Response } from "express";
import { body, param, query } from "express-validator";
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
import { getUrl } from "../util/multer";

const router = Router();

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const createChallenge = async (req, res) => {
  const { challengeName, challengeCategory } = req.body;
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

  body("challengeName").not().isEmpty(),
  body("challengeCategory").not().isEmpty(),
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

  param("challengeId").not().isEmpty(),
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

  param("challengeId").not().isEmpty(),
  validation,

  asyncWrapper(exitChallenge)
);

//챌린지 조회
router.get("/", verifyToken, async (req, res) => {
  let allChallenges = await Challenge.find(
    {
      clients: {
        $in: res.locals.client.id,
      },
    }
  );
  res.status(httpStatus.OK).json(allChallenges);
});

//해당 챌린지 랭킹 조회
const getChallengeAccumulate = async (req, res) => {
  const { challengeId } = req.params;
  const challenge = await Challenge.findById(challengeId);

  //해당 챌린지가 challenge객체 내 존재하는지
  if (!challenge) {
    throw new APIError(
      errors.CHALLENGE_NOT_EXISTS.statusCode,
      errors.CHALLENGE_NOT_EXISTS.errorCode,
      errors.CHALLENGE_NOT_EXISTS.errorMsg
    );
  }

  let allAccumlate = await AccumlateCertifies.find(
    { contentId: challengeId },
    { contentId: false, writerId: false, __v: false, _id: false }
  );
  allAccumlate.sort((a, b) => {
    if (a.contentCount < b.contentCount) return 1;
    if (a.contentCount > b.contentCount) return -1;
  });

  res.status(httpStatus.OK).json(allAccumlate);
};

router.get(
  "/getchallengerank/:challengeId",
  param("challengeId").not().isEmpty(),
  validation,
  verifyToken,
  asyncWrapper(getChallengeAccumulate)
);

//챌린지 전체 누적 정보 출력
router.get("/testaccumlate", verifyToken, async (req, res) => {
  let allAccumlate = await AccumlateCertifies.find();
  res.status(httpStatus.OK).json(allAccumlate);
});

//챌린지 누적정보 임의 조작 기능
router.put("/manipulateAccumlate", verifyToken, async (req, res) => {
  const { id } = req.body;
  await AccumlateCertifies.updateOne(
    { _id: id },
    { $inc: { contentCount: +1 } }
  );
  res.status(httpStatus.OK).send("누적정보 1 추가");
});

// 챌린지 인증하기
const certifyingChallenge = async (req, res) => {
  const { challengeId } = req.params;
  const { imageUrl, certifyingContents } = req.body;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDay = new Date();
  lastDay.setHours(0, 0, 0, 0);
  lastDay.setDate(lastDay.getDate() - 1);

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
  if (challengecertify) {
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

  await challengeCertify.save();

  const filter = {
    contentId: challengeId,
    writerId: res.locals.client.id,
  };

  //인증글 스키마에 이미 참여했으면 1일 누적, 처음이면 1일 시작
  const accumlate = await AccumlateCertifies.findOne(filter);
  if (accumlate) {
    const lastCertify = await ChallengeCertify.findOne({
      challengeId: challengeId,
      writerId: res.locals.client.id,
      dateCreated: lastDay,
    });
    if (lastCertify) {
      await AccumlateCertifies.findOneAndUpdate(filter, {
        $inc: { contentCount: +1 },
      });
    } else {
      await AccumlateCertifies.findOneAndUpdate(filter, {
        $set: { contentCount: 1 },
      });
    }
  } else {
    const accumlatecertifies = new AccumlateCertifies();
    accumlatecertifies.contentId = challengeId;
    accumlatecertifies.writerId = res.locals.client.id;
    accumlatecertifies.writerName = res.locals.client.name;

    await accumlatecertifies.save();
  }
  res.status(httpStatus.CREATED).send();
};

router.post(
  "/complete/:challengeId",
  param("challengeId").not().isEmpty(),
  body("certifyingContents").not().isEmpty(),
  body("imageUrl").not().isEmpty(),
  validation,

  verifyToken,

  asyncWrapper(certifyingChallenge)
);

router.get("/test1", async (req, res) => {
  let date = nowDate();
  res.json({ 날짜: date });
});

//오늘 인증한 해당 챌린지 인증글 조회
const getCertifiedChallenge = async (req, res) => {
  const { challengeId, authorId } = req.query;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() + 1);

  const challenges = await ChallengeCertify.findOne({
    dateCreated: today,
    authorId,
    challengeId,
  });

  res.status(httpStatus.OK).json(challenges);
};

router.get(
  "/challengecertify",
  verifyToken,
  query("challengeId").not().isEmpty(),
  query("authorId").not().isEmpty(),
  validation,
  asyncWrapper(getCertifiedChallenge)
);

//오늘 인증한 해당 챌린지 인증글 조회
const getCertifiedChallenges = async (req, res) => {
  const { challengeId } = req.query;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenges = await ChallengeCertify.find({
    dateCreated: today,
    challengeId: challengeId,
  }).sort({ dateCreated: -1 });

  res.status(httpStatus.OK).json(challenges);
};

router.get(
  "/challengecertifies",
  verifyToken,
  query("challengeId").not().isEmpty(),
  validation,
  asyncWrapper(getCertifiedChallenges)
);

//오늘의 인증글 모두 조회 기능
const getCertifies = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const challenges = await ChallengeCertify.find({
    dateCreated: today,
  });
  res.json(challenges);
};
router.get("/getcertifies", verifyToken, asyncWrapper(getCertifies));

const searchChallenge = async (req, res) => {
  const { name } = req.query;
  const filter = {
    challengeName: {
      $regex: new RegExp(`${name}`),
    },
  };
  
  const challenges = await Challenge.find(filter);

  res.status(httpStatus.OK).send(challenges);
};

router.get(
  "/search",
  verifyToken,
  query("name").not().isEmpty(),
  asyncWrapper(searchChallenge)
);

export default router;
