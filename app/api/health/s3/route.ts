// app/api/health/s3/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { serverLogger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const s3Client = new S3Client({});
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    return NextResponse.json(
      {
        status: "error",
        message: "S3_BUCKET_NAME environment variable is not set.",
      },
      { status: 500 }
    );
  }

  try {
    const command = new HeadBucketCommand({
      Bucket: bucketName,
    });
    await s3Client.send(command);
    return NextResponse.json({
      status: "ok",
      message: "Successfully connected to S3 bucket.",
    });
  } catch (error) {
    serverLogger.error("Error connecting to S3 bucket", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to S3 bucket. Check credentials and permissions.",
      },
      { status: 500 }
    );
  }
}
