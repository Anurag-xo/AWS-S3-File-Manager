// app/api/objects/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { serverLogger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";

// The AWS SDK automatically finds credentials from the environment.
export async function GET(req: NextRequest) {
  const s3Client = new S3Client({});
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const prefix = searchParams.get("prefix") || "";
  const cursor = searchParams.get("cursor") || undefined;

  serverLogger.log(`Fetching objects for prefix: "${prefix}"`, { cursor });

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/",
      ContinuationToken: cursor,
    });

    const { Contents, CommonPrefixes, NextContinuationToken } =
      await s3Client.send(command);

    const files = (Contents || []).map((file) => ({
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
      type: "file",
    }));

    const folders = (CommonPrefixes || []).map((folder) => ({
      key: folder.Prefix,
      type: "folder",
    }));

    return NextResponse.json({
      files: [...folders, ...files],
      nextCursor: NextContinuationToken,
    });
  } catch (error) {
    serverLogger.error("Error fetching objects from S3", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const s3Client = new S3Client({});
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { key } = await req.json();

  if (!key) {
    return new NextResponse("Key is required", { status: 400 });
  }

  serverLogger.log(`Deleting object with key: "${key}"`);

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    serverLogger.error("Error deleting object from S3", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
