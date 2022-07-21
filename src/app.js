import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://livingodlife:FnjzDCcLuSholnnX@cluster0.rvzulm5.mongodb.net/?retryWrites=true&w=majority"
);

import express from "express";

const app = express();
app.use(express.json());

import client from "./route/client";

import dotenv from "dotenv";
dotenv.config();

//회원가입,로그인
app.use("/client", client);

//챌린지 생성
import challenges from "./route/challenges";
app.use("/challenge", challenges);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).send(err);
});

export default app;
