import mongoose from "mongoose";

mongoose.connect(
  "mongodb+srv://livingodlife:FnjzDCcLuSholnnX@cluster0.rvzulm5.mongodb.net/?retryWrites=true&w=majority"
);

import express from "express";

const app = express();

app.listen(80, () => {
  console.log("Server open at 80");
});
