import { Router, Request, Response } from "express";
import { body, param } from "express-validator";
import httpStatus from "http-status";

import validation from "../middleware/validation";
import asyncWrapper from "../util/asyncWrapper";
import APIError from "../util/apiError";
import errors from "../util/errors";
import Challenge from "../models/challenge";

import { verifyToken } from "../middleware/verifyTK";
import { Mongoose, Types } from "mongoose";

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

  res.status(httpStatus.NO_CONTENT).send();
};

router.post(
  "/:challengeId",

  param("challengeId").exists(),
  validation,

  verifyToken,
  asyncWrapper(participateChallenge)
);

/**
 *
 * @param {Request} req
 * @param {Response} res
 */

//챌린지 탈퇴
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

//테스트
router.get("/test", verifyToken, async (req, res) => {
  let allChallenges = await Challenge.find();
  res.send(allChallenges);
});

export default router;
