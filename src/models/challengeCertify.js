//챌린지 인증 글 정보 스키마
import mongoose from "mongoose";

//이미지 경로, 내용, 고객ID 챌린지ID, 누적
const certifyingChallengesSchema = new mongoose.Schema({
  // 이미지 주소
  imageUrl: {
    type: String,
    default: "기본 이미지 경로로 나중에 수정",
  },

  // 글
  certifyingContents: {
    type: String,
  },

  // 글 작성자
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clients",
  },

  // 누적 정보 -> 랭킹
  accumulate: {
    type: Number,
    default: 0,
  },
});

const ChallengeCertify = mongoose.model(
  "challengeCertifies",
  certifyingChallengesSchema
);
export default ChallengeCertify;
