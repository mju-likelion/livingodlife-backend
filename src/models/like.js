//좋아요 정보 스키마
//챌린지 인증글 좋아요 정보, 댓글 좋아요 정보 저장예정.
import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  // 좋아요 누른사람
  clientId: {
    type: mongoose.Schema.Types.ObjectId,    
    required: true,
  },
  //컨텐츠 아이디(챌린지 인증글, 댓글)
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },

});

const Like = mongoose.model("like", likeSchema);
export default Like;
