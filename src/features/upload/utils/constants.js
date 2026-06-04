import { MIME_TYPES } from "@mantine/dropzone";

export const ACCEPTED_MIME = [
  // Documents
  MIME_TYPES.pdf,
  MIME_TYPES.docx,

  // Richtext
  "text/rtf",
  "text/richtext",
  "application/rtf",

  // Plain text
  "text/plain",
  "text/markdown",
  "text/x-markdown",
];

export const MIME_MAP = {
  // Documents
  [MIME_TYPES.pdf]: "pdf",
  [MIME_TYPES.docx]: "docx",

  // Richtext
  "text/rtf": "text",
  "text/richtext": "text",
  "application/rtf": "text",

  // Plain Text
  "text/plain": "text",
  "text/markdown": "text",
  "text/x-markdown": "text",
};

export const MAX_SIZE = 20 * 1024 * 1024; // 20MB
