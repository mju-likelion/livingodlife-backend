import { Router, Request, Response } from "express";
import { body, param, query } from "express-validator";
import httpStatus, { NO_CONTENT } from "http-status";

import validation from "../middleware/validation";
import asyncWrapper from "../util/asyncWrapper";
import APIError from "../util/apiError";
import errors from "../util/errors";

import Challenge from "../models/challenge";
import like from "../models/like";
import comment from "../models/comment";

import { verifyToken } from "../middleware/verifyTK";
import mongoose, { Mongoose, Types } from "mongoose";
import { getUrl } from "../util/multer";
import ChallengeCertify from "../models/challengeCertify";
import Comment from "../models/comment";

const router = Router();

//좋아요 눌렀을때 post, 유저아이디, 컨텐츠아이디 받아오기
const addLike = async (req, res) => {
    const { contentId } = req.params;
    const clientId = res.local.client.id;

    if (await ChallengeCertify.exists({ challengeName }) && await Comment.exists({}) ) {
        throw new APIError(
          errors.CHALLENGE_ALREADY_EXISTS.statusCode,
          errors.CHALLENGE_ALREADY_EXISTS.errorCode,
          errors.CHALLENGE_ALREADY_EXISTS.errorMsg
        );
      }
    //챌린지 인증글에 해당 아이디가 존재하는지 검색
    let contentList = ChallengeCertify.findOne({_id : contentId})
    //챌린지 인증글에 해당 아이디가 존재한다면
    if (contentList) {

    } 
}
router.post(
    "/:contentId",
    verifyToken,
    param("contentId").exists(),
    validation,
    asyncWrapper(addLike)
)
//해당 인증글 좋아요 개수 확인 get, 컨텐츠 아이디 검색으로 좋아요 갯수 카운트

//좋아요 취소 delete 유저아이디, 컨텐츠아이디 받아오기

export default router;
