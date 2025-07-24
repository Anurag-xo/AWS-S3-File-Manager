// app/api/objects/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import { serverLogger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { fileName, fileType, prefix } = await req.json();

  if (!fileName || !fileType) {
    return new NextResponse("File name and type are required", {
      status: 400,
    });
  }

  const key = `${prefix || ""}${uuidv4()}-${fileName}`;

  serverLogger.log(`Generating presigned URL for: "${key}"`);

  try {
    const s3Client = new S3Client({});
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: key,
      Conditions: [
        ["content-length-range", 0, 10485760], // up to 10 MB
        ["starts-with", "$Content-Type", fileType],
      ],
      Fields: {
        "Content-Type": fileType,
      },
      Expires: 600, // 10 minutes
    });

    return NextResponse.json({ url, fields });
  } catch (error) {
    serverLogger.error("Error creating presigned URL", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}