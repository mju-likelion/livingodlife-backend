//루틴 정보 스키마
import mongoose from "mongoose";

//루틴 이름, 루틴 내용, 루틴 일정, 루틴 아이디
const routineCertifySchema = new mongoose.Schema({
  // 루틴 아이디
  routineId: {
    type: mongoose.Types.ObjectId,
    required: true, // 필수 항목을 작성하지 않았을 때 출력될 문구
  },

  // 루틴 일정
  routineDate: {
    type: Date,
    required: true,
  },

  client: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
});

const RoutineCertify = mongoose.model("routineCertifies", routineCertifySchema); //모델 이름이 Video임을 선언함
export default RoutineCertify;
