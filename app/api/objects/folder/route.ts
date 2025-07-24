// app/api/objects/folder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { serverLogger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const s3Client = new S3Client({});
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { prefix, folderName } = await req.json();

  if (!folderName) {
    return new NextResponse("Folder name is required", { status: 400 });
  }

  const key = `${prefix || ""}${folderName}/`;

  serverLogger.log(`Creating folder with key: "${key}"`);

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: "",
    });

    await s3Client.send(command);

    return new NextResponse(null, { status: 201 });
  } catch (error) {
    serverLogger.error("Error creating folder in S3", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}