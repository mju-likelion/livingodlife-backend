import { Router, Request, Response } from "express";
import { body } from "express-validator";
import Friend from "../models/friend";
import httpStatus from "http-status";
import Client from "../models/client";
import APIError from "../util/apiError";
import errors from "../util/errors";
import validation from "../middleware/validation";
import verifyToken from "../middleware/verifyTK";
import asyncWrapper from "../util/asyncWrapper";

const router = Router();

//친구 추가
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const addFriend = async (req, res) => {
  const { friend } = req.body;
  const clientId = res.locals.client.id;

  if (clientId === friend) {
    throw new APIError(
      errors.NOT_FRIEND_ME.statusCode,
      errors.NOT_FRIEND_ME.errorCode,
      errors.NOT_FRIEND_ME.errorMsg
    );
  }

  if (!(await Client.findById(friend))) {
    throw new APIError(
      errors.CLIENT_NOT_EXISTS.statusCode,
      errors.CLIENT_NOT_EXISTS.errorCode,
      errors.CLIENT_NOT_EXISTS.errorMsg
    );
  }

  //만약 friend 스키마에 해당 유저가 존재 하지 않을경우 해당 유저아이디로 새로운 객체 생성
  if (!(await Friend.exists({ owner: clientId }))) {
    await Friend.create({ owner: clientId, friends: [] });
  }

  const friendInstance = await Friend.findOne({ owner: clientId });
  if (friendInstance.friends.find((id) => id.equals(friend))) {
    throw new APIError(
      errors.ALREADY_FRIEND.statusCode,
      errors.ALREADY_FRIEND.errorCode,
      errors.ALREADY_FRIEND.errorMsg
    );
  }

  await Friend.findOneAndUpdate(
    { owner: clientId },
    { $push: { friends: friend } }
  );

  res.status(httpStatus.NO_CONTENT).send();
};

router.post(
  "/",
  body("friend").exists(),
  validation,
  verifyToken,
  asyncWrapper(addFriend)
);

//친구 삭제
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const removeFriend = async (req, res) => {
  const { friend } = req.body;
  const clientId = res.locals.client.id;

  if (!(await Friend.exists({ owner: clientId }))) {
    throw new APIError(
      errors.INVALID_ERROR.statusCode,
      errors.INVALID_ERROR.errorCode,
      errors.INVALID_ERROR.errorMsg
    );
  }

  const friendInstance = await Friend.findOne({ owner: friend });
  if (!friendInstance.friends.find((id) => id.equals(friend))) {
    throw new APIError(
      errors.ALREADY_NOT_FRIEND.statusCode,
      errors.ALREADY_NOT_FRIEND.errorCode,
      errors.ALREADY_NOT_FRIEND.errorMsg
    );
  }

  await Friend.findOneAndUpdate(
    { owner: friend },
    {
      $pull: {
        friends: friend,
      },
    }
  );

  res.status(httpStatus.NO_CONTENT).send();
};

router.delete(
  "/",
  body("friend").exists(),
  validation,
  verifyToken,
  asyncWrapper(removeFriend)
);

//친구 목록 조회
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getFriends = async (req, res) => {
  const clientId = res.locals.client.id;

  if (!(await Friend.exists({ owner: clientId }))) {
    await Friend.create({ owner: clientId, friends: [] });
  }
  
  //해당 클라이언트의 객체 정보를 받아옴.
  const friendInstance = await Friend.findOne({ owner: clientId });

  res.status(httpStatus.OK).json({
    friends: friendInstance.friends,
  });
};

router.get("/", verifyToken, asyncWrapper(getFriends));

export default router;
