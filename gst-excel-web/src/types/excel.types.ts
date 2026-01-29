import * as XLSX from 'xlsx';

export interface FileData {
  file: File;
  workbook: XLSX.WorkBook | null;
  month: string;
  error?: string;
}

export interface ProcessedSheetData {
  heading: string;
  values: number[];
  startColumn: number;
}

export interface OutputRow {
  month: string;
  data: ProcessedSheetData[];
}
