import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export async function testBedrockConnection() {
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const command = new InvokeModelCommand({
    modelId: "amazon.titan-text-lite-v1",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      inputText: "Hello from Titan!",
      textGenerationConfig: {
        temperature: 0.5,
        maxTokenCount: 100,
      },
    }),
  });

  const response = await client.send(command);
  const responseBody = new TextDecoder().decode(response.body);
  console.log("🟢 Bedrock Titan Response:", responseBody);

  return JSON.parse(responseBody);
}
