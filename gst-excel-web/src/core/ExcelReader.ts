import * as XLSX from 'xlsx';
import { extractMonthFromFilename, extractMonthFromCell } from '../utils/dateUtils';
import { validateSheet } from '../utils/validators';

export class ExcelReader {
  static async readFile(file: File): Promise<XLSX.WorkBook> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook);
        } catch (error) {
          reject(new Error(`Failed to read file: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  static extractMonth(
    workbook: XLSX.WorkBook,
    filename: string,
    useFilename: boolean
  ): string {
    if (useFilename) {
      return extractMonthFromFilename(filename);
    }

    // Extract from "Read me" sheet, cell E2 (column 5, row 2)
    if (!validateSheet(workbook, 'Read me')) {
      throw new Error('Sheet "Read me" not found in workbook');
    }

    const sheet = workbook.Sheets['Read me'];
    const cellAddress = 'E2'; // Column E (5), Row 2
    const cell = sheet[cellAddress];

    if (!cell || !cell.v) {
      throw new Error('Month value not found in cell E2 of "Read me" sheet');
    }

    return extractMonthFromCell(cell.v);
  }

  static getSheet(workbook: XLSX.WorkBook, sheetName: string): XLSX.WorkSheet {
    if (!validateSheet(workbook, sheetName)) {
      throw new Error(`Sheet "${sheetName}" not found in workbook`);
    }
    return workbook.Sheets[sheetName];
  }

  static getCellValue(sheet: XLSX.WorkSheet, row: number, col: number): any {
    const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });
    const cell = sheet[cellAddress];
    return cell ? cell.v : null;
  }

  static getRange(sheet: XLSX.WorkSheet): XLSX.Range | undefined {
    return sheet['!ref'] ? XLSX.utils.decode_range(sheet['!ref']) : undefined;
  }

  /**
   * Get the actual maximum row with data in the sheet
   * SheetJS's !ref can be unreliable, so we scan for actual data
   */
  static getActualMaxRow(sheet: XLSX.WorkSheet, sampleColumn: number = 1): number {
    // Start with the reported range
    const reportedRange = this.getRange(sheet);
    let maxRow = reportedRange ? reportedRange.e.r + 1 : 1000;

    // Scan beyond the reported range to find actual data
    // Check up to 100,000 rows or until we find 1000 consecutive empty rows
    const MAX_SCAN = 100000;
    const EMPTY_ROW_THRESHOLD = 1000;
    let consecutiveEmptyRows = 0;

    for (let row = 1; row <= MAX_SCAN; row++) {
      // Check if any cell in this row has data
      let hasData = false;

      // Check multiple columns to be sure (columns 1-15 should cover most data)
      for (let col = 1; col <= 15; col++) {
        const cellValue = this.getCellValue(sheet, row, col);
        if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
          hasData = true;
          maxRow = row;
          break;
        }
      }

      if (hasData) {
        consecutiveEmptyRows = 0;
      } else {
        consecutiveEmptyRows++;
        if (consecutiveEmptyRows >= EMPTY_ROW_THRESHOLD) {
          // We've hit 1000 empty rows in a row, probably at the end
          break;
        }
      }
    }

    return maxRow;
  }
}
