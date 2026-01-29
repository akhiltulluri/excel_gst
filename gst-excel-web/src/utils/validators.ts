import { MAX_FILE_SIZE } from './constants';

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!file.name.endsWith('.xlsx')) {
    return { valid: false, error: 'Only .xlsx files are supported' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` };
  }

  return { valid: true };
}

export function validateSheet(workbook: any, sheetName: string): boolean {
  return workbook.SheetNames.includes(sheetName);
}
