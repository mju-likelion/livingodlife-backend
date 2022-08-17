//친구 정보 스키마
import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
  // 본인
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  // 친구들
  friends: [mongoose.Schema.Types.ObjectId],
});

const Friend = mongoose.model("friends", friendSchema);
export default Friend;
