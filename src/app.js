import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://livingodlife:FnjzDCcLuSholnnX@cluster0.rvzulm5.mongodb.net/?retryWrites=true&w=majority"
);

import express from "express";

const app = express();
app.use(express.json());

import client from "./route/client";

//회원가입,로그인
import dotenv from "dotenv";
dotenv.config();
app.use("/client", client);

app.use((err, req, res, next) => {
  res.status(err.statusCode).send(err);
});

export default app;
