import mongoose from "mongoose";
//모델들 여기에 임포트하는거 맞나요??
import "./models/Challenges";
import "./models/Clients";
import "./models/Routines";
import "./models/CertifyingChallenges";

mongoose.connect(
  "mongodb+srv://livingodlife:FnjzDCcLuSholnnX@cluster0.rvzulm5.mongodb.net/?retryWrites=true&w=majority"
);

import express from "express";

const app = express();

app.listen(80, () => {
  console.log("Server open at 80");
});
