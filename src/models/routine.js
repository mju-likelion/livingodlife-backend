//루틴 정보 스키마
import mongoose from "mongoose";

//루틴 이름, 루틴 내용, 루틴 일정, 루틴 아이디
const routineSchema = new mongoose.Schema({
  // 루틴 이름
  routineName: {
    type: String,
    required: true, // 필수 항목을 작성하지 않았을 때 출력될 문구
  },

  // 루틴 내용
  routineContents: {
    type: String,
    required: true,
  },

  // 루틴 일정
  routinePlan: {
    type: Date,
    required: true,
  },

  routineType: {
    type: Date,
    required: true
  }

  // 루틴에 참여하고 있는 사람들
  routineClients: [mongoose.Schema.Types.ObjectId],
});

const Routine = mongoose.model("routines", routineSchema); //모델 이름이 Video임을 선언함
export default Routine;
