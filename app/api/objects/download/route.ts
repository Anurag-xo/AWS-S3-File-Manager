// app/api/objects/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { serverLogger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return new NextResponse("Key is required", { status: 400 });
  }

  serverLogger.log(`Generating download URL for key: "${key}"`);

  try {
    const s3Client = new S3Client({});
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.redirect(url);
  } catch (error) {
    serverLogger.error("Error generating download URL", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}