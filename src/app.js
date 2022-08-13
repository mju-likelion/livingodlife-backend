import mongoose from "mongoose";
import cors from "cors";

mongoose.connect(
  "mongodb+srv://livingodlife:FnjzDCcLuSholnnX@cluster0.rvzulm5.mongodb.net/?retryWrites=true&w=majority"
);

import express, { application } from "express";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

import client from "./route/client";

import dotenv from "dotenv";
dotenv.config();

//회원가입,로그인
app.use("/client", client);

//챌린지 생성
import challenges from "./route/challenges";
app.use("/challenge", challenges);

import routines from "./route/routine";
app.use("/routine", routines);

import friends from "./route/friend";
app.use("/friend", friends);

import file from "./route/file";
app.use("/file", file);

import sympathy from "./route/sympathy";
app.use("/sympathy", sympathy);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).send(err);
});

export default app;
