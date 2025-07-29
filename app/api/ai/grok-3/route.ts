import { NextRequest, NextResponse } from "next/server";
import { createServerClientForApi } from "@/lib/supabase/server";
import { parseExcel } from "@/scripts/downloadExcel";
import { randomUUID } from "crypto";
import { detectUserLanguage } from "@/scripts/detectUserLanguage";
import { STANDARD_PROMPTS } from "@/scripts/constants";
import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { existsSync, writeFileSync } from "fs";
import { Readable } from "stream";

// Функция очистки текста от # и *
function sanitizeText(text: string): string {
  return text
    .replace(/[#*]/g, "")
    .trim();
}

const s3 = new S3Client({
  region: process.env.MY_AWS_REGION!,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
  },
});

async function ensureExcelFileExists() {
  const tmpPath = "/tmp/file.xlsx";

  if (existsSync(tmpPath)) {
    console.log("Excel file already exists in /tmp. Skipping download.");
    return;
  }

  console.log("Excel file missing. Downloading from S3...");

  const command = new GetObjectCommand({
    Bucket: "profiling-formulas",
    Key: "(Project Profiling).xlsx",
  });

  const response = await s3.send(command);

  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }

  const buffer = Buffer.concat(chunks);

  writeFileSync(tmpPath, buffer);

  console.log("Excel file downloaded to /tmp/file.xlsx");
}

export async function POST(req: NextRequest) {
  const traceId = randomUUID();

  try {
    const {
      profileId,
      prompt,
      imageBase64,
      profiling,
      userLanguage: userLangFromRequest,
    } = await req.json();

    if (!profileId) {
      return NextResponse.json(
        { error: "Missing profileId" },
        { status: 400 }
      );
    }

    const supabase = await createServerClientForApi();

    let messages: any[] = [];

    if (profiling) {
      // ✅ НЕ загружаем историю чата в профайлинге

      const excelFilePath = "/tmp/file.xlsx";

      await ensureExcelFileExists();

      const {
        parsedLines,
        imagesBase64,
        formulaLanguage,
      } = await parseExcel(excelFilePath);

      // ✅ Выбор языка: приоритет userLangFromRequest → formulaLanguage → en
      const userLanguage = userLangFromRequest || formulaLanguage || "en";

      const allFormulaText = parsedLines
        .map(
          (l) =>
            `Sheet: ${l.sheetName}\nRow: ${l.rowNumber}\n${l.text}`
        )
        .join("\n\n");

      const standardPrompt = STANDARD_PROMPTS.profiling.trim();

      const fullSystemPrompt = [
        `INSTRUCTION:`,
        `- Always answer strictly in ${userLanguage}.`,
        `- Do not answer in any other language.`,
        `- Even if previous context or formula is in Russian, ignore that and answer only in ${userLanguage}.`,
        ``,
        `--- START OF FORMULA ---`,
        allFormulaText,
        `--- END OF FORMULA ---`,
        ``,
        `NOTE:`,
        `- The formula above is written in Russian.`,
        `- However, always reply in ${userLanguage}, regardless of the formula language.`,
         ``,
        `--- START OF INSTRUCTIONS ---`,
        standardPrompt,
        `--- END OF INSTRUCTIONS ---`,
      ].join("\n\n");

      messages.push({
        role: "system",
        content: fullSystemPrompt,
      });

      for (const img of imagesBase64) {
        messages.push({
          role: "system",
          content: {
            type: "image_url",
            image_url: {
              url: img,
              detail: "high",
            },
          },
        });
      }

      const { error: insertSystemError } = await supabase
        .from("chat_messages")
        .insert([
          {
            id: randomUUID(),
            user_id: null,
            profile_id: profileId,
            profile_name: null,
            role: "system",
            type: "system_marker",
            content: JSON.stringify({
              marker: "profiling_formula_reference",
              formula_version: "v1",
            }),
            timestamp: Date.now(),
          },
        ]);

      if (insertSystemError) {
        console.error(
          `[${traceId}] Failed to save system_marker:`,
          insertSystemError
        );
      }
    } else {
      // ✅ Обычный режим — грузим историю чата

      const since = Date.now() - 12 * 60 * 60 * 1000;

      const { data: historyRows, error: historyError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("profile_id", profileId)
        .gt("timestamp", since)
        .order("timestamp", { ascending: true });

      if (historyError) {
        console.error(`[${traceId}] Error loading history:`, historyError);
        return NextResponse.json(
          { error: "Failed to load chat history" },
          { status: 500 }
        );
      }

      for (const row of historyRows || []) {
        let parsedContent = row.content;
        try {
          const parsed = JSON.parse(row.content);
          if (typeof parsed === "object" && parsed?.text) {
            parsedContent = parsed.text;
          }
        } catch {
          // оставляем как есть
        }

        messages.push({
          role: row.role,
          content: parsedContent,
        });
      }

      // ✅ Детектим язык
      const userLanguage = userLangFromRequest
       || (prompt?.trim() ? detectUserLanguage(prompt, "en") : "en");

      messages.unshift({
        role: "system",
        content: `
INSTRUCTION:
- Always answer strictly in ${userLanguage}.
- Do not answer in any other language.
- Even if previous context is in Russian, ignore that and answer only in ${userLanguage}.
        `.trim(),
      });
    }

    const userContent: any[] = [];

    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${imageBase64}`,
          detail: "high",
        },
      });
    }

    if (prompt?.trim()) {
      userContent.push({
        type: "text",
        text: prompt.trim(),
      });
    }

    if (userContent.length > 0) {
      messages.push({
        role: "user",
        content: userContent,
      });
    }
       
    const grokResponse = await fetch(
      "https://api.x.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "grok-2-vision-latest",
          messages,
          temperature: 0.3,
          max_tokens: 2000,
          stream: false,
        }),
      }
    );

    const contentType =
      grokResponse.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await grokResponse.json();

      if (!grokResponse.ok) {
        console.error(`[${traceId}] Grok error:`, data);
        return NextResponse.json(
          { error: data?.error || "Grok API error" },
          { status: 500 }
        );
      }
    } else {
      const text = await grokResponse.text();
      console.error(
        `[${traceId}] Grok returned non-JSON:`,
        text
      );
      return NextResponse.json(
        {
          error: `Grok returned unexpected response: ${text.slice(
            0,
            300
          )}`,
        },
        { status: 500 }
      );
    }

    const aiText =
      data.choices?.[0]?.message?.content ||
      "No response from Grok.";

    const cleanText = sanitizeText(aiText);

    const { error: insertError } = await supabase
      .from("chat_messages")
      .insert([
        {
          id: randomUUID(),
          profile_id: profileId,
          role: "assistant",
          type: "text",
          content: JSON.stringify({ text: cleanText }),
          timestamp: Date.now(),
        },
      ]);

    if (insertError) {
      console.error(
        `[${traceId}] Error saving AI message:`,
        insertError
      );
      return NextResponse.json(
        {
          error: "Failed to save AI message to Supabase.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: cleanText });
  } catch (err: any) {
    console.error(`[${traceId}] Unexpected error:`, err);
    return NextResponse.json(
      { error: err.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
