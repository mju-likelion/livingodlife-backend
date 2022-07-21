import { verify } from 'jsonwebtoken';
import APIError from '../util/apiError';
import errors from "../util/errors";

export function verifyToken(req, res, next) {
  try {//위변조, 만료되지 않은경우 토큰값을 디코딩하여 저장?
    req.decoded = verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (error) { //헤더 혹은 페이로드가 위변조 되었는지, 토큰의 유효기간이 초과되었는지 확인
    if (error.name === 'TokenExpiredError') { // 유효기간 초과
      throw new APIError(
        errors.TOKEN_EXPIRED.statusCode,
        errors.TOKEN_EXPIRED.errorCode,
        result
      );
    }
    throw new APIError(
        errors.INVALID_TOKEN.statusCode,
        errors.INVALID_TOKEN.errorCode,
        result
      );
  }
}

export default verifyToken;
