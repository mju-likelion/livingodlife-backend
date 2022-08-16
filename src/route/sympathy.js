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
import Like from "../models/like";

const router = Router();

//post 유저아이디, 컨텐츠아이디 받아오기 좋아요 눌렀을때 안눌러져있을때는 객체 생성, 눌러져있는 상태에서 눌렀을때는 삭제 
const addLike = async (req, res) => {
    const { contentId } = req.params;
    const clientId = res.locals.client.id;

    //좋아요 여부 확인
    const likeCheck = await Like.findOne(
        {
            clientId: clientId,
            contentId: contentId,
        }
    );

    //좋아요가 눌러져 있는 경우 좋아요 취소(delete)
    if (likeCheck) { 
        await Like.deleteOne(
            {
                clientId: clientId,
                contentId: contentId
            }
        )
        res.status(httpStatus.OK).send();
    } else {
        //없으면 좋아요 누르기
        const like = new Like();
        like.clientId = clientId;
        like.contentId = contentId;
        like.name = res.locals.client.name;
        await like.save();

        res.status(httpStatus.OK).send();
    }
};
router.post(
    "/:contentId",
    verifyToken,
    param("contentId").exists(),
    validation,
    asyncWrapper(addLike)
);

//해당 인증글 좋아요 개수 확인 get, 컨텐츠 아이디 검색으로 좋아요 갯수 카운트

const countLike = async (req, res) => {
    //contentId로 검색해서 리스트에 저장한 후 리스트의 길이 리턴하기
    const { contentId } = req.params;
    const likeList = await Like.find( { contentId: contentId } );
    let count = Object.keys(likeList).length;
    res.status(httpStatus.OK).json(
        {
            "likeCount": count
        }
    );
};

router.put(
    "/count/:contentId",
    param("contentId").exists(),
    validation,
    asyncWrapper(countLike)
);

//누가 좋아요 눌렀는지 리스트 검색
const whoPressedLike = async(req, res) => { 
    const { contentId } = req.params;
    const likeList = await Like.find( { contentId: contentId }, { _id: false, contentId: false, clientId: false, __v: false } );
    res.status(httpStatus.OK).json(likeList);
}

router.put(
    "/:contentId",
    param("contentId").exists(),
    validation,
    asyncWrapper(whoPressedLike)
)

export default router;
