import { Result, validationResult } from "express-validator";
import APIError from "../util/apiError";
import errors from "../util/errors";

const validation = (req, res, next) => {
  const result = validationResult(req);

  if (result.errors.length > 0) {
    throw new APIError(
      errors.VALIDATION_ERROR.statusCode,
      errors.VALIDATION_ERROR.errorCode,
      result
    );
  } else {
    next();
  }
};

export default validation;
