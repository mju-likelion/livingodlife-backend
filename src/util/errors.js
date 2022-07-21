const errors = {
  VALIDATION_ERROR: {
    errorCode: "VALIDATION_ERROR",
    statusCode: 400,
  },

  EMAIL_ALREADY_EXISTS: {
    errorCode: "EMAIL_ALREADY_EXISTS",
    statusCode: 400,
    errorMsg: "이미 존재하는 이메일입니다.",
  },

  EMAIL_DOES_NOT_EXISTS: {
    errorCode: "EMAIL_DOES_NOT_EXISTS",
    statusCode: 400,
    errorMsg: "존재하지 않는 이메일입니다.",
  },

  WRONG_PASSWORD: {
    errorCode: "WRONG_PASSWORD",
    statusCode: 400,
    errorMsg: "잘못된 비밀번호입니다.",
  },

  NAME_ALREADY_EXISTS: {
    errorCode: "NAME_ALREADY_EXISTS",
    statusCode: 400,
    errorMsg: "이미 존재하는 이름입니다.",
  },
  
  TOKEN_EXPIRED: {
    errorCode: "TOKEN_EXPIRED",
    statusCode: 419,
    errorMsg: "토큰이 만료됨",
  },

  INVALID_TOKEN: {
    errorCode: "INVALID_TOKEN",
    statusCode: 401,
    errorMsg: "잘못된 토큰",
  },
};

export default errors;
