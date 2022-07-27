//챌린지 누적 정보 스키마
import mongoose from "mongoose";

const accumlateChallengesSchema = new mongoose.Schema({
    //챌린지 아이디
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "challenges"
    },
    
    // 누적 정보
    challengeCount: {
      type: Number,
      default: 1,
    },
  
    // 글 작성자 아이디
    writerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
    },
  
    // 글 작성자 이름
    writerName: {
      type: String
    },
  });

  const AccumlateCertifies = mongoose.model(
    "accumlateCertifies",
    accumlateChallengesSchema
  );
  export default AccumlateCertifies;
  