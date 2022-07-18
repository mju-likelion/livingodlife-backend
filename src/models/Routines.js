//루틴 정보 스키마
import mongoose from "mongoose";

//루틴 이름, 루틴 내용, 루틴 일정, 루틴 아이디
const RoutinesSchema = new mongoose.Schema({
  RoutineName: {
    type: String,
    required: "Name is required" // 필수 항목을 작성하지 않았을 때 출력될 문구
  },
  RoutineContents: {
    type: String,
    required: "contents is required"
  },
  RoutinePlan: {
    type: Date,
    default: Date.now
  },
  RoutineID: {
    type: Number,
  },
  Clients: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clients" // Comment 모델의 객체 ID를 가져옴으로써 데이터를 연결함
  }
});

const model = mongoose.model("Routines", RoutinesSchema); //모델 이름이 Video임을 선언함
export default model;