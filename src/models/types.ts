import { Helpers } from "../types";
import { Document, ObjectId } from "mongoose";

export type FindInfoParams = {
  orderBy?: string;
  sort?: "ASC" | "DESC";
  size?: number;
  page?: number;
  gSearch?: string;
  filter?: Record<string, any>;
  status?: string;
  option?: string;
  startDate?: string;
  endDate?: string;
};

export type usersSchemaType = Document &
  Helpers.Timestamps & {
    _id?: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    companyId?: string;
    name?: string;
    picture?: string;
    address?: string;
    country?: string;
    role: string;
    roles?: string[];
    lastLogin?: Date;
    isActive?: boolean;
  };

export type sessionSchemaType = Document &
  Helpers.Timestamps & {
    attachmentId: string;
    conversationId: string;
    businessId: string;
    messageId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    mimeType: string;
    storageProvider: string;
    storagePath: string;
    publicUrl: string | null;
    uploadedBy: string;
    uploadedByType: string;
    scanStatus: string;
  };
