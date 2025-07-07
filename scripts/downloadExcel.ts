import ExcelJS, { CellHyperlinkValue } from "exceljs";
import JSZip from "jszip";
import { readFileSync } from "fs";
import { franc } from "franc-min";

export interface ParsedLine {
  sheetName: string;
  rowNumber: number;
  text: string;
  urls: string[];
}

function getExcelColumnLetter(colNumber: number): string {
  let letter = "";
  while (colNumber > 0) {
    const mod = (colNumber - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    colNumber = Math.floor((colNumber - mod) / 26);
  }
  return letter;
}

export async function parseExcel(filepath: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filepath);

  const parsedLines: ParsedLine[] = [];

  workbook.eachSheet((sheet) => {
    sheet.eachRow((row, rowNumber) => {
      let rowText = "";
      const urls: string[] = [];

      row.eachCell((cell, colNumber) => {
        let val = "";
        let url = "";

        if (
          cell.type === ExcelJS.ValueType.Hyperlink &&
          typeof cell.value === "object" &&
          cell.value !== null &&
          "text" in cell.value &&
          "hyperlink" in cell.value
        ) {
          const hyperlinkValue = cell.value as CellHyperlinkValue;
          val = hyperlinkValue.text?.toString() || "";
          url = hyperlinkValue.hyperlink || "";
        } else if (cell.value !== null && cell.value !== undefined) {
          val = String(cell.value).trim();
        }

        if (val) {
          rowText += val + " ";
        }

        if (url) {
          urls.push(url);
        }
      });

      rowText = rowText.trim();

      if (rowText) {
        // Вытаскиваем ссылки из текста тоже
        const textUrls = Array.from(
          rowText.matchAll(/https?:\/\/[^\s]+/g),
          (m) => m[0]
        );
        const allUrls = Array.from(new Set([...urls, ...textUrls]));

        parsedLines.push({
          sheetName: sheet.name,
          rowNumber,
          text: rowText,
          urls: allUrls,
        });
      }
    });
  });

  // Убираем дубликаты по тексту
  const uniqueLines = [
    ...new Map(parsedLines.map((b) => [b.text, b])).values(),
  ];

  // Embedded images
  const zipData = Buffer.from(readFileSync(filepath));
  const zip = await JSZip.loadAsync(zipData);

  const imagesBase64: string[] = [];

  const mediaFolder = zip.folder("xl/media");

  if (mediaFolder) {
    const files = Object.keys(mediaFolder.files);
    for (const filename of files) {
      const file = mediaFolder.file(filename);
      if (file) {
        const content = await file.async("base64");
        if (content) {
          const ext = filename.split(".").pop();
          const mimeType =
            ext === "jpeg" || ext === "jpg"
              ? "image/jpeg"
              : ext === "png"
              ? "image/png"
              : "application/octet-stream";

          imagesBase64.push(`data:${mimeType};base64,${content}`);
        }
      }
    }
  }

  // Определяем язык на основе всей формулы
  const combinedText = uniqueLines.map((l) => l.text).join(" ");
  let userLanguage = "English"; // Default fallback

  if (combinedText) {
    const detectedLangCode = franc(combinedText, { minLength: 10 });
    if (detectedLangCode === "rus") {
      userLanguage = "Russian";
    } else if (detectedLangCode === "eng") {
      userLanguage = "English";
    } else {
      userLanguage = "English";
    }
  }

  console.log("✅ Parsed Lines:", uniqueLines);
  console.log("✅ Embedded Images:", imagesBase64);
  console.log("✅ Detected Language:", userLanguage);

  // ✅ Возвращаем formulaLanguage вместо userLanguage
  return {
    parsedLines: uniqueLines,
    imagesBase64,
    formulaLanguage: userLanguage === "Russian" ? "ru" : "en",
  };
}
