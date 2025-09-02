import { stat, readFile } from 'node:fs/promises';
import PdfParse from 'pdf-parse'; 'pdf-parse/lib/pdf-parse.js';


export interface TFileExtractOpts {
  maxBytes?: number;     // guardrail, default 25 MB
  pdfParse?: Parameters<typeof PdfParse>[1]; // pass-through pdf-parse options
}

/**
 * Extract all text from a local PDF file.
 */
export async function extractPdfTextFromFile(
  filePath: string,
  opts: TFileExtractOpts = {}
): Promise<string> {
  const { maxBytes = 25 * 1024 * 1024, pdfParse: pdfParseOpts = {} } = opts;

  const info = await stat(filePath);
  if (!info.isFile()) throw new Error(`Not a file: ${filePath}`);
  if (info.size > maxBytes) throw new Error(`PDF too large: ${info.size} bytes`);

  const buf = await readFile(filePath);
  const result = await PdfParse(buf, pdfParseOpts);
  return result.text;
}