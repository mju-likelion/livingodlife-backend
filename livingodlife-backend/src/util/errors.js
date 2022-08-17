const errors = {
  VALIDATION_ERROR: {
    errorCode: "VALIDATION_ERROR",
    statusCode: 400,
  },

  NOT_FRIEND_ME: {
    errorCode: "NOT_FRIEND_ME",
    statusCode: 400,
    errorMsg: "스스로를 친구로 추가할 수 없습니다.",
  },

  CLIENT_NOT_EXISTS: {
    errorCode: "CLIENT_NOT_EXISTS",
    statusCode: 404,
    errorMsg: "존재하지 않는 유저입니다.",
  },

  INVALID_ERROR: {
    errorCode: "INVALID_ERROR",
    statusCode: 400,
    errorMsg: "INVALID ERROR",
  },

  ALREADY_FRIEND: {
    errorCode: "ALREADY_FRIEND",
    statusCode: 400,
    errorMsg: "이미 친구입니다.",
  },

  ALREADY_NOT_FRIEND: {
    errorCode: "ALREADY_NOT_FRIEND",
    statusCode: 400,
    errorMsg: "친구가 아닙니다.",
  },

  EMAIL_ALREADY_EXISTS: {
    errorCode: "EMAIL_ALREADY_EXISTS",
    statusCode: 400,
    errorMsg: "이미 존재하는 이메일입니다.",
  },

  EMAIL_DOES_NOT_EXISTS: {
    errorCode: "EMAIL_DOES_NOT_EXISTS",
    statusCode: 404,
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
    errorMsg: "토큰이 만료되었습니다.",
  },

  INVALID_TOKEN: {
    errorCode: "INVALID_TOKEN",
    statusCode: 401,
    errorMsg: "잘못된 토큰이 기입되었습니다.",
  },

  CHALLENGE_ALREADY_EXISTS: {
    errorCode: "CHALLENGE_ALREADY_EXISTS",
    statusCode: 400,
    errorMsg: "이미 존재하는 챌린지입니다.",
  },

  CHALLENGE_NOT_EXISTS: {
    errorCode: "CHALLENGE_NOT_EXISTS",
    statusCode: 404,
    errorMsg: "존재하지 않은 챌린지입니다.",
  },

  CHALLENGE_ALREADY_PARTICIPATED: {
    errorCode: "CHALLENGE_ALREADY_PARTICIPATED",
    statusCode: 400,
    errorMsg: "이미 참여하고 있는 챌린지입니다.",
  },

  CHALLENGE_ALREADY_NOT_PARTICIPATED: {
    errorCode: "CHALLENGE_ALREADY_NOT_PARTICIPATED",
    statusCode: 400,
    errorMsg: "이미 참여하고 있지 않는 챌린지입니다.",
  },

  ROUTINE_NOT_EXISTS: {
    errorCode: "ROUTINE_NOT_EXISTS",
    statusCode: 404,
    errorMsg: "존재하지 않는 루틴입니다",
  },

  ROUTINE_NAME_ALREADY_EXISTS: {
    errorCode: "ROUTINE_NAME_ALREADY_EXISTS",
    statusCode: 400,
    errorMsg: "이미 존재하는 루틴 이름입니다",
  },

  ROUTINE_ALREADY_PARTICIPATE: {
    errorCode: "ROUTINE_ALREADY_PARTICIPATE",
    statusCode: 400,
    errorMsg: "이미 참가하고 있는 루틴입니다",
  },

  ROUTINE_ALREADY_NOT_PARTICIPATE: {
    errorCode: "ROUTINE_ALREADY_NOT_PARTICIPATE",
    statusCode: 400,
    errorMsg: "이미 참가하고 있지 않는 루틴입니다",
  },

  ROUTINE_ALREADY_COMPLETED: {
    errorCode: "ROUTINE_ALREADY_COMPLETED",
    statusCode: 400,
    errorMsg: "이미 완료한 루틴입니다",
  },

  ALREADY_ATHENTICATED: {
    errorCode: "ALREADY_ATHENTICATED",
    statusCode: 400,
    errorMsg: "이미 인증되었습니다.",
  },
  ALREADY_SELECTED: {
    errorCode: "ALEADY_SELECTED",
    statusCode: 400,
    errorMsg: "이미 좋아요가 눌러져 있습니다."
  },
  ALREADY_CANCELLED: {
    errorCode: "ALREADY_CANCELLED",
    statusCode: 400,
    errorMsg: "이미 좋아요가 취소되어 있습니다."
  },
};

export default errors;