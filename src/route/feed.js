import { Router, Request, Response } from "express";
import httpStatus from "http-status";
import verifyToken from "../middleware/verifyTK";
import Challenge from "../models/challenge";
import ChallengeCertify from "../models/challengeCertify";
import asyncWrapper from "../util/asyncWrapper";

const router = Router();

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getFeed = async (req, res) => {
  const { id } = res.locals.client;

  const challengeIds = (
    await Challenge.find({
      clients: {
        $in: [id],
      },
    })
  ).map((doc) => doc.id);

  const certifyItems = [];

  let today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const challengeId of challengeIds) {
    const challengeCertifies = await ChallengeCertify.find({
      challengeId,
      dateCreated: today,
    });

    certifyItems.push(challengeCertifies);
  }

  const certifies = [].concat(...certifyItems);

  res.status(httpStatus.OK).json(certifies);
};

router.get("/", verifyToken, asyncWrapper(getFeed));

export default router;
