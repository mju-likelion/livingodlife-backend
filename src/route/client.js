import e, { Router, Request, Response } from "express";
import { body, param } from "express-validator";
import httpStatus from "http-status";
import crypto from "crypto";

import asyncWrapper from "../util/asyncWrapper";
import validation from "../middleware/validation";
import Client from "../models/client";
import APIError from "../util/apiError";
import errors from "../util/errors";

import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/verifyTK";

const router = Router();

// 회원가입

// 이런식으로 함수 위에 @param 을 작성해두면,
// 코드 작성할 때 자동완성의 도움을 받을 수 있습니다.

// 또 미들웨어를 async 함수로 선언하면,
// express 가 에러처리를 하지 못해서
// asyncWrapper 로 묶어줘야 함

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const postClient = async (req, res) => {
  const { email, password, name } = req.body;

  // 이메일이 존재하는지 확인
  if (await Client.exists({ email })) {
    // 흐름때문에 에러 처리를, throw new APIError 하는 방향으로 합니다
    throw new APIError(
      errors.EMAIL_ALREADY_EXISTS.statusCode,
      errors.EMAIL_ALREADY_EXISTS.errorCode,
      errors.EMAIL_ALREADY_EXISTS.errorMsg
    );
  }

  // 이름이 존재하는지 확인
  if (await Client.exists({ name })) {
    throw new APIError(
      errors.NAME_ALREADY_EXISTS.statusCode,
      errors.NAME_ALREADY_EXISTS.errorCode,
      errors.NAME_ALREADY_EXISTS.errorMsg
    );
  }

  // 비밀번호 sha256 해시걸기
  // 로그인 할때도 해시 암호화가 된 비밀번호와 비교해야 합니다
  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const client = new Client();
  client.email = email;
  client.name = name;
  client.password = hashedPassword;

  //body에서 받아온 고객 정보를 데이터베이스에 저장.
  await client.save();

  // 보통 생성시에 httpStatus 를 CREATED 로 전송합니다
  res.status(httpStatus.CREATED).json({ id: client.id });
};

// body("field").exists() 로
// body 에 있는 필드의 존재 여부를 체크할 수 있습니다
// validation 미들웨어를 붙여줘야 에러처리가 가능합니다

router.post(
  "/",

  body("email").exists(),
  body("password").exists(),
  body("name").exists(),
  validation,

  asyncWrapper(postClient)
);

//로그인

/*
/login 으로 접속 -> checkLogIn 함수 -> 이메일 존재 확인 -> 입력한 비밀번호 암호화 -> 이메일, 비밀번호 일치하는지 확인 -> 로그인시 로그인성공메세지
*/

const checkLogIn = async (req, res) => {
  const { email, password } = req.body;
  // 이메일이 존재하는지 확인
  if (!(await Client.exists({ email }))) {
    throw new APIError(
      errors.EMAIL_DOES_NOT_EXISTS.statusCode,
      errors.EMAIL_DOES_NOT_EXISTS.errorCode,
      errors.EMAIL_DOES_NOT_EXISTS.errorMsg
    );
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  let clientcheck = await Client.findOne({
    email: email,
    password: hashedPassword,
  });

  if (!clientcheck) {
    throw new APIError(
      errors.WRONG_PASSWORD.statusCode,
      errors.WRONG_PASSWORD.errorCode,
      errors.WRONG_PASSWORD.errorMsg
    );
  } else {
    const token = jwt.sign(
      {
        id: clientcheck.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10h",
        issuer: "nodebird",
      }
    );

    return res.json({
      token,
    });
  }
};
router.put(
  "/",
  body("email").exists(),
  body("password").exists(),
  validation,
  asyncWrapper(checkLogIn)
);

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
const getClient = async (req, res) => {
  const { id } = req.params;

  const client = await Client.findById(id);

  if (!client) {
    throw new APIError(
      errors.CLIENT_NOT_EXISTS.statusCode,
      errors.CLIENT_NOT_EXISTS.errorCode,
      errors.CLIENT_NOT_EXISTS.errorMsg
    );
  }

  res.status(httpStatus.OK).json({ client });
};

router.get("/:id", param("id"), validation, asyncWrapper(getClient));

const getClientByName = async (req, res) => {
  const { name } = req.params;

  const client = await Client.findOne({ name });

  if (!client) {
    throw new APIError(
      errors.CLIENT_NOT_EXISTS.statusCode,
      errors.CLIENT_NOT_EXISTS.errorCode,
      errors.CLIENT_NOT_EXISTS.errorMsg
    );
  }

  res.status(httpStatus.OK).json({ client });
};

router.get(
  "/name/:name",
  param("name"),
  validation,
  asyncWrapper(getClientByName)
);

//테스트
router.get("/test", verifyToken, (req, res) => {
  res.json(req.decoded);
});

export default router;
