import serverless from "serverless-http";
import app from "./app";

exports.handler = serverless(app);
