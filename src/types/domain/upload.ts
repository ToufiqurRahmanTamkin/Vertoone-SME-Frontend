export const UPLOAD_FOLDERS = [
  "payment-qr",
  "modules",
  "avatars",
  "products",
  "brands",
  "companies",
  "web",
  "email",
  "general",
  "documents",
  "contracts",
  "signatures",
] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export interface UploadedAsset {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

export interface UploadedDocument {
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  extension: string;
  bytes: number;
}
