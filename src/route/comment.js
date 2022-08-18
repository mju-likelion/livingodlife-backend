import { Router, Request, Response } from "express";
import { body, param, query } from "express-validator";
import httpStatus, { NO_CONTENT } from "http-status";

import validation from "../middleware/validation";
import asyncWrapper from "../util/asyncWrapper";
import APIError from "../util/apiError";
import errors from "../util/errors";

import comment from "../models/comment";

import { verifyToken } from "../middleware/verifyTK";
import mongoose, { Mongoose, Types } from "mongoose";
import Comment from "../models/comment";

const router = Router();

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const leaveComment = async(req,res) => {
    const { contentId } = req.params;
    const { content } = req.body;

    const comment = new Comment();
    comment.clientId = res.locals.client.id;
    comment.contentId = contentId;
    comment.content = content;
    comment.name = res.locals.client.name;
    await comment.save();
    
    res.status(httpStatus.OK).send();

};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const deleteComment = async(req,res) => {
    const { commentId } = req.params;
    const commentInfo = await Comment.findOne({ _id: commentId });
    if(!commentInfo) { 
        throw new APIError(
            errors.COMMENT_NOT_EXISTS.statusCode,
            errors.COMMENT_NOT_EXISTS.errorCode,
            errors.COMMENT_NOT_EXISTS.errorMsg
          );
    }
    await Comment.deleteOne({ _id: commentId });
    res.status(httpStatus.OK).send();
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
 const getComment = async(req,res) => {
    const { contentId } = req.params
    const commentInfo = await Comment.find(
        { contentId: contentId },
        { _id: false, contentId: false, clientId: false, __v: false}
    );
    res.status(httpStatus.OK).json(commentInfo);
};

router.post(
    "/:contentId",
    param("contentId").exists(),
    body("content").exists(),
    validation,
    verifyToken,
    asyncWrapper(leaveComment)
);//댓글 달기

router.delete(
    "/:commentId",
    param("commentId").exists(),
    validation,
    verifyToken,
    asyncWrapper(deleteComment)
);//댓글 삭제하기

// router.put(
//     "/revise"
// );//댓글 수정하기

router.get(
    "/getcomment/:contentId",
    param("contentId").exists(),
    validation,
    verifyToken,
    asyncWrapper(getComment)
);//댓글 조회하기

export default router;
