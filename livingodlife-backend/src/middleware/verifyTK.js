import { verify } from "jsonwebtoken";
import Client from "../models/client";
import APIError from "../util/apiError";
import asyncWrapper from "../util/asyncWrapper";
import errors from "../util/errors";

export function verifyToken(req, res, next) {
  const origin = async (req, res, next) => {
    try {
      //위변조, 만료되지 않은경우 토큰값을 디코딩하여 저장?
      const { id } = verify(req.headers.authorization, process.env.JWT_SECRET);
      const client = await Client.findById(id);

      res.locals.client = client;

      return next();
    } catch (error) {
      //헤더 혹은 페이로드가 위변조 되었는지, 토큰의 유효기간이 초과되었는지 확인
      if (error.name === "TokenExpiredError") {
        // 유효기간 초과
        throw new APIError(
          errors.TOKEN_EXPIRED.statusCode,
          errors.TOKEN_EXPIRED.errorCode,
          errors.TOKEN_EXPIRED.errorMsg
        );
      }
      throw new APIError(
        errors.INVALID_TOKEN.statusCode,
        errors.INVALID_TOKEN.errorCode,
        errors.INVALID_TOKEN.errorMsg
      );
    }
  };

  asyncWrapper(origin)(req, res, next);
}

export default verifyToken;
