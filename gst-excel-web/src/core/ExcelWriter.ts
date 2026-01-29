import * as XLSX from 'xlsx';
import { SheetConfig } from '../types/config.types';
import { SECONDARY_HEADERS } from '../utils/constants';

export interface OutputRowData {
  month: string;
  results: { [heading: string]: number[] };
}

export class ExcelWriter {
  /**
   * Create the output Excel file with formatted data
   */
  static createOutputWorkbook(
    dataRows: OutputRowData[],
    sheetConfigs: SheetConfig[]
  ): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    const worksheet: any = {};

    // Create header rows
    this.writeHeaders(worksheet, sheetConfigs);

    // Write data rows starting from row 3
    let currentRow = 3;
    for (const rowData of dataRows) {
      this.writeDataRow(worksheet, currentRow, rowData, sheetConfigs);
      currentRow++;
    }

    // Set column widths
    const colCount = this.calculateTotalColumns(sheetConfigs);
    worksheet['!cols'] = Array(colCount).fill({ width: 12 });

    // Set the range
    const lastCol = XLSX.utils.encode_col(colCount - 1);
    const lastRow = currentRow - 1;
    worksheet['!ref'] = `A1:${lastCol}${lastRow}`;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Result');
    return workbook;
  }

  /**
   * Write the header rows (row 1: primary headers, row 2: secondary headers)
   */
  private static writeHeaders(worksheet: any, sheetConfigs: SheetConfig[]): void {
    // Row 1: "Month" header
    this.setCellValue(worksheet, 1, 1, 'Month');

    // Row 1: Primary headers (merged cells for each config)
    let currentCol = 2;
    for (const config of sheetConfigs) {
      const numCols = Object.keys(config.columnMap).length;

      // Set the primary header in the first column of the section
      this.setCellValue(worksheet, 1, currentCol, config.heading);

      // Add merge information for primary headers
      if (!worksheet['!merges']) {
        worksheet['!merges'] = [];
      }

      if (numCols > 1) {
        worksheet['!merges'].push({
          s: { r: 0, c: currentCol - 1 },
          e: { r: 0, c: currentCol + numCols - 2 }
        });
      }

      currentCol += numCols;
    }

    // Row 2: Secondary headers
    currentCol = 2;
    for (const config of sheetConfigs) {
      const sortedColumns = Object.keys(config.columnMap)
        .map(Number)
        .sort((a, b) => a - b);

      for (const col of sortedColumns) {
        const label = config.columnMap[col];
        this.setCellValue(worksheet, 2, currentCol, label);
        currentCol++;
      }
    }
  }

  /**
   * Write a single data row
   */
  private static writeDataRow(
    worksheet: any,
    row: number,
    rowData: OutputRowData,
    sheetConfigs: SheetConfig[]
  ): void {
    // Column 1: Month
    this.setCellValue(worksheet, row, 1, rowData.month);

    // Data columns
    let currentCol = 2;
    for (const config of sheetConfigs) {
      const values = rowData.results[config.heading] || [];

      for (const value of values) {
        this.setCellValue(worksheet, row, currentCol, value, true);
        currentCol++;
      }
    }
  }

  /**
   * Set a cell value with optional number formatting
   */
  private static setCellValue(
    worksheet: any,
    row: number,
    col: number,
    value: any,
    isNumber: boolean = false
  ): void {
    const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 });

    if (isNumber) {
      worksheet[cellAddress] = {
        t: 'n',
        v: value,
        z: '0.00'
      };
    } else {
      worksheet[cellAddress] = {
        t: 's',
        v: value
      };
    }
  }

  /**
   * Calculate total number of columns needed
   */
  private static calculateTotalColumns(sheetConfigs: SheetConfig[]): number {
    let total = 1; // Month column
    for (const config of sheetConfigs) {
      total += Object.keys(config.columnMap).length;
    }
    return total;
  }

  /**
   * Export workbook to file
   */
  static exportToFile(workbook: XLSX.WorkBook, filename: string): void {
    XLSX.writeFile(workbook, filename);
  }
}
