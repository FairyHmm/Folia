import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import PdfWorker from "pdfjs-dist/build/pdf.worker?worker";
import { MIME_MAP } from "./constants";

if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerPort) {
  pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();
}

// Parsing Strategy Implementations
async function parsePdf(fileData) {
  const arrayBuffer = await fileData.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pageNumbers = Array.from({ length: pdf.numPages }, (_, i) => i + 1);
  const pagePromises = pageNumbers.map(async (pageNum) => {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    return content.items.map((item) => item.str).join(" ");
  });
  const pagesText = await Promise.all(pagePromises);
  return pagesText.join("\n");
}

async function parseDocx(fileData) {
  const arrayBuffer = await fileData.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function parsePlainText(fileData) {
  return fileData.text();
}

// Parser Runner Mapping
const PARSERS = {
  pdf: parsePdf,
  docx: parseDocx,
  text: parsePlainText,
};

// Main Orchestrator
export default async function extractTextFromFile(fileData, mimeType) {
  try {
    const parserKey = MIME_MAP[mimeType];
    const parse = PARSERS[parserKey];

    if (!parse)
      throw new Error(`Unsupported file type for extraction: ${mimeType}`);

    return await parse(fileData);
  } catch (error) {
    console.error("Extraction engine failure:", error.message);
    throw error;
  }
}
