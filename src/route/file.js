import { Router } from "express";
import httpStatus from "http-status";
import { v4 } from "uuid";
import { getGetUrl, getPutUrl } from "../util/multer";


const router = Router();

router.get("/:key", async (req, res) => {
  const { key } = req.params;

  const url = getGetUrl(key);
  res.status(httpStatus.OK).json({ url, key });
});

router.put("/", async (req, res) => {
  const key = v4();

  const url = getPutUrl(key);
  res.status(httpStatus.OK).json({ url, key });
});

export default router;
