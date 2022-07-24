//챌린지 누적 정보 스키마
import mongoose from "mongoose";

const accumlateChallengesSchema = new mongoose.Schema({
    //챌린지 아이디
    challengeId: [mongoose.Schema.Types.ObjectId],
    
    // 누적 정보
    challengeCount: {
      type: String,
    },
  
    // 글 작성자
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clients",
    },
  
  });

  const AccumlateCertifies = mongoose.model(
    "accumlateCertifies",
    accumlateChallengesSchema
  );
  export default AccumlateCertifies;
  