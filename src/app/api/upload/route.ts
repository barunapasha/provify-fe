import { NextRequest, NextResponse } from "next/server";
import { pinata } from "@/lib/pinata";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert Web API File to Pinata-compatible FileObject
    const arrayBuffer = await file.arrayBuffer();
    const pinataFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      arrayBuffer: async () => arrayBuffer,
    };

    const result = await pinata.upload.file(pinataFile);

    return NextResponse.json({
      uri: `ipfs://${result.IpfsHash}`,
      cid: result.IpfsHash,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file to IPFS" },
      { status: 500 }
    );
  }
}
