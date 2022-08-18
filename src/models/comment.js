//댓글 정보 스키마
//챌린지 인증글 댓글 저장예정
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  //댓글 단사람 아이디
  clientId: {
    type: mongoose.Schema.Types.ObjectId,    
    
  },
  //컨텐츠 아이디(챌린지 인증글)
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  //댓글 내용
  content: {
    type: String,
  },
  name: {
    type: String,
  }
});

const Comment = mongoose.model("comment", commentSchema);
export default Comment;
