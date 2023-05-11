import multer from "multer";
import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import express, { Request, Response } from "express";
const app = express();

const client = new S3Client({
  region: "eu-west-2",
  credentials: {
    accessKeyId: process.env.ACCESSKEY || "",
    secretAccessKey: process.env.SECRET || "",
  },
});

AWS.config.update({
  region: "eu-west-2",
  accessKeyId: process.env.ACCESSKEY || "",
  secretAccessKey: process.env.SECRET || "",
});

const s3 = new AWS.S3();

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

app.post(
  "/uploadpic",
  upload.single("upload"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(404).json("File not found");
      }

      const key = `profilephotos/${uuidv4()}-${file?.originalname}`;

      const command = new PutObjectCommand({
        Bucket: "kuku-s-hair",
        Key: key,
        Body: file?.buffer,
        ContentType: file.mimetype,
      });

      const response = await client.send(command);

      // Generate a public URL for the uploaded object
      const params = {
        Bucket: "kuku-s-hair",
        Key: key,
        Expires: 3600, // URL expiration time in seconds
      };

      const url = await s3.getSignedUrlPromise("getObject", params);

      return res.status(200).json({ url });
    } catch (err: any) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

app.listen(8080, () => {
  console.log("listening ...");
});
