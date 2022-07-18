//챌린지 인증 글 정보 스키마
import mongoose from "mongoose";

//이미지 경로, 내용, 고객ID 챌린지ID, 누적
const CertifyingChallengesSchema = new mongoose.Schema({
  ImageUrl: {
    type: String,
    default: '기본 이미지 경로로 나중에 수정'
  },
  CertifyingContents: {
    type: String,
  },
  Clients: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clients" // Clients 모델의 객체 ID를 가져옴으로써 데이터를 연결함
  },
  accumulate: {
    type: Number, //누적 정보, 나중에 랭킹기능에 사용
    default: 0
  },

});

const model = mongoose.model("CertifyingChallenges", CertifyingChallengesSchema);
export default model;