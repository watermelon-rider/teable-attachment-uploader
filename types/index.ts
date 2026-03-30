export interface TeableConfig {
  baseUrl: string;
  baseId: string;
  tableId?: string;
  token: string;
}

export interface TeableField {
  id: string;
  name: string;
  type: string;
  isComputed?: boolean;
}

export interface TeableTable {
  id: string;
  name: string;
}

export interface TeableRecord {
  id: string;
  fields: Record<string, unknown>;
}

export interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'matched';
  errorMsg?: string;
  excelInfo?: { rows: number; hasImages: boolean };
}

export interface ExcelData {
  fileName: string;
  sheets: string[];
  currentSheet: string;
  workbook: unknown;
  currentData: unknown[][];
  images: Record<string, { path: string; blob: Blob }>;
  imageColIndex: number;
}

export type UploadMode = 'create' | 'update';
export type MainTab = 'attachment' | 'excel';
