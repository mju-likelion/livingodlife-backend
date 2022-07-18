//챌린지 정보 스키마
import mongoose from "mongoose";

//챌린지 아이디, 챌린지 이름, 챌린지 내용, 챌린지 카테고리
const ChallengesSchema = new mongoose.Schema({
  ChallengeID: {
    type: Number,
  },
  ChallengeName: {
    type: String,
    required: "Name is required"
  },
  ChallengeContents: {
    type: String,
    required: "Contents is required"
  },
  ChallengeCategory: {
    type: String,
    default:'기본' //아무것도 지정하지 않았을때 카테고리 기본으로 지정 
  },
  Clients: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clients" // Clients 모델의 객체 ID를 가져옴으로써 데이터를 연결함
  }
});

const model = mongoose.model("Challenges", ChallengesSchema);
export default model;