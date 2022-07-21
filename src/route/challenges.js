import e, { Router, Request, Response } from "express";
import { body } from "express-validator";
import httpStatus from "http-status";

import validation from "../middleware/validation";
import asyncWrapper from "../util/asyncWrapper";
import APIError from "../util/apiError";
import errors from "../util/errors";
import Challenge from "../models/challenge";
import { ChallengeCertify } from "../models/challengeCertify";

import { verifyToken } from "../middleware/verifyTK";

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

//테스트
router.get("/test", verifyToken, async (req, res) => {
  let allChallenges = await Challenge.find();
  res.send(allChallenges);
});

export default router;
