import { Router } from "express";
import httpStatus from "http-status";
import { v4 } from "uuid";
import upload, { getUrl } from "../util/multer";
import File from "../models/file";

const router = Router();

router.post("/", upload.single("image"), async (req, res) => {
  const fname = req.file.originalname;

  const file = new File({
    key: req.file.key,
    filename: fname,
  });

  await file.save();

  res.status(httpStatus.OK).send({
    key: req.file.key,
    url: await getUrl(req.file.key),
  });
});

export default router;
