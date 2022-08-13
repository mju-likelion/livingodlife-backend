import AWS from "aws-sdk";

const bucketName = process.env.bucket;

AWS.config.update({
  signatureVersion: "v4",
  region: "ap-northeast-2",
});

const s3 = new AWS.S3();

export const getPutUrl = (key) => {
  const url = s3.getSignedUrl("putObject", {
    Bucket: bucketName,
    Key: key,
    Expires: 1000,
  });

  return url;
};

export const getGetUrl = (key) => {
  const url = s3.getSignedUrl("getObject", {
    Bucket: bucketName,
    Key: key,
    Expires: 100,
  });

  return url;
};

export default upload;
