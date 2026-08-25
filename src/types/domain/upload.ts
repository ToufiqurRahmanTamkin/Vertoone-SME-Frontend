export const UPLOAD_FOLDERS = ["payment-qr", "modules", "avatars", "general"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export interface UploadedAsset {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}
