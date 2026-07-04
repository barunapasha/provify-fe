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

    const result = await pinata.upload.file(file);

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
