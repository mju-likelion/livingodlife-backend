import { Router } from "express";
import httpStatus from "http-status";
import { v4 } from "uuid";
import upload, { getGetUrl, getPutUrl, getUrl } from "../util/multer";
import File from "../models/file";

const router = Router();

router.get("/", async (req, res) => {
  const key = v4();

  const url = getGetUrl(key);
  res.status(httpStatus.OK).json({ url, key });
});

router.put("/", async (req, res) => {
  const key = v4();

  const url = getPutUrl(key);
  res.status(httpStatus.OK).json({ url, key });
});

export default router;
