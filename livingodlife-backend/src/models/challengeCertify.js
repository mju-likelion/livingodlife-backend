//챌린지 인증 글 정보 스키마
import mongoose from "mongoose";

//이미지 경로, 내용, 고객ID 챌린지ID, 누적
const certifyingChallengesSchema = new mongoose.Schema({
  // 이미지 주소(키값 넣기) 
  imageUrl: {
    type: String,
  },

  // 글
  certifyingContents: {
    type: String,
  },

  // 글 작성자 아이디
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "clients",
  },
  
  //글 작성자 이름
  authorName: {
    type: String,
  },

  //작성 날짜
  dateCreated: {
    type: Date,
  },

  //챌린지 아이디
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "challenges"
  },
});

const ChallengeCertify = mongoose.model(
  "challengeCertifies",
  certifyingChallengesSchema
);
export default ChallengeCertify;
