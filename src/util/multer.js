import AWS from "aws-sdk";

const bucketName = process.env.bucket;

AWS.config.update({
  signatureVersion: "v4",
  region: "ap-northeast-2",
});

/*
var credentials = new AWS.SharedIniFileCredentials({ profile: "default" });
AWS.config.credentials = credentials;
*/

import { v4 } from "uuid";
import File from "../models/file";

const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3client = new S3Client();

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3client,
    bucket: bucketName,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const key = v4() + "/" + file.originalname;
      cb(null, key);
    },
  }),
});

export const getUrl = async (key) => {
  const file = await File.findOne({ key });

  const url = s3.getSignedUrl("getObject", {
    Bucket: bucketName,
    Key: key,
    Expires: 100,
  });

  return url;
};

export default upload;
