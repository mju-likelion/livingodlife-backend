//챌린지 정보 스키마
import mongoose from "mongoose";

//챌린지 아이디, 챌린지 이름, 챌린지 내용, 챌린지 카테고리
const challengesSchema = new mongoose.Schema({
  challengeName: {
    // 챌린지 이름
    type: String,
    required: true,
  },

  challengeCategory: {
    // 챌린지 카테고리
    type: String,
    default: "기본", //아무것도 지정하지 않았을때 카테고리 기본으로 지정
  },
  // 챌린지 참여자들
  clients: [mongoose.Schema.Types.ObjectId],
});

const Challenge = mongoose.model("challenges", challengesSchema);
export default Challenge;
