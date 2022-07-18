//고객 정보 스키마

import mongoose from "mongoose";
//이메일, 비밀번호, 엑세스 토큰, 이름, 생년월일
const ClientsSchema = new mongoose.Schema({
    email: {
      type: String,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
    },
    AccessToken: {
      type: String,
    },
    Name: {
      type: String,
    },
    DateOfBirth: {
      type: Date,
      default: Date.now
    },
  });
  
  const model = mongoose.model("Clients", ClientsSchema); //모델 이름이 Clients임을 선언함
  export default model;