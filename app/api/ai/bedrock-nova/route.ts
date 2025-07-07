import { NextRequest, NextResponse } from "next/server";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export async function POST(req: NextRequest) {
  try {
    const { prompt, imageBase64 } = await req.json();

    if (!prompt && !imageBase64) {
      return NextResponse.json(
        { error: "Missing prompt and imageBase64 — at least one is required" },
        { status: 400 }
      );
    }

    const client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "eu-west-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const content: any[] = [];

    if (prompt) {
      content.push({ type: "text", text: prompt });
    }
    if (imageBase64) {
      content.push({
        type: "image_url",
        image_url: { url: `data:image/png;base64,${imageBase64}` },
      });
    }

    const payload = {
      messages: [
        {
          role: "user",
          content,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: "amazon.nova-lite-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = new TextDecoder().decode(response.body);
    const result = JSON.parse(responseBody);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error calling Nova Lite:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
