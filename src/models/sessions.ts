import { Schema, model } from "mongoose";
import { sessionSchemaType } from "./types";

const sessionSchema = new Schema(
  {
    attachmentId: String,
    conversationId: String,
    businessId: String,
    messageId: String,

    // File metadata
    fileName: String,
    fileType: String,
    fileSize: Number,
    mimeType: String,

    // Storage
    storageProvider: String, // 's3', 'cloudflare_r2'
    storagePath: String,
    publicUrl: {
      type: String,
      default: null,
    },

    // Security
    uploadedBy: String,
    uploadedByType: String, // 'customer', 'agent'
    scanStatus: String, // 'pending', 'clean', 'infected'
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

export const SessionsModel = model<sessionSchemaType>(
  "Sessions",
  sessionSchema,
);
