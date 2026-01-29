import * as XLSX from 'xlsx';
import { SheetConfig } from '../types/config.types';
import { ExcelReader } from './ExcelReader';

export class ExcelProcessor {
  /**
   * Check if a row matches all conditions in the checkMap
   * Replicates Python's check() function
   */
  static checkRowConditions(
    sheet: XLSX.WorkSheet,
    rowIndex: number,
    checkMap: { [col: number]: string | number }
  ): boolean {
    return Object.entries(checkMap).every(([col, expectedValue]) => {
      const cellValue = ExcelReader.getCellValue(sheet, rowIndex, parseInt(col));

      // Handle null/undefined values
      if (cellValue === null || cellValue === undefined) {
        return expectedValue === null || expectedValue === undefined;
      }

      // Handle string comparison (case-insensitive)
      if (typeof expectedValue === 'string' && typeof cellValue === 'string') {
        return cellValue.trim() === expectedValue.trim();
      }

      return cellValue === expectedValue;
    });
  }

  /**
   * Filter rows based on check conditions
   * Replicates Python's selectRows() function
   */
  static filterRows(
    sheet: XLSX.WorkSheet,
    checkMap: { [col: number]: string | number }
  ): number[] {
    // Get the actual maximum row with data (not just the reported range)
    const maxRow = ExcelReader.getActualMaxRow(sheet);
    const matchingRows: number[] = [];

    // Start from row 1 to check ALL rows (matches Python behavior)
    // The Python code checks all rows including headers
    for (let row = 1; row <= maxRow; row++) {
      if (this.checkRowConditions(sheet, row, checkMap)) {
        matchingRows.push(row);
      }
    }

    return matchingRows;
  }

  /**
   * Sum values in a specific column for given rows
   * Replicates Python's getSumOfRowValues() function
   */
  static sumColumnValues(
    sheet: XLSX.WorkSheet,
    rows: number[],
    column: number
  ): number {
    return rows.reduce((sum, rowIndex) => {
      const cellValue = ExcelReader.getCellValue(sheet, rowIndex, column);
      const numValue = parseFloat(cellValue) || 0;
      return sum + numValue;
    }, 0);
  }

  /**
   * Process a single workbook with a specific sheet configuration
   */
  static processSheetConfig(
    workbook: XLSX.WorkBook,
    config: SheetConfig
  ): number[] {
    const sheet = ExcelReader.getSheet(workbook, config.sheetName);
    const matchingRows = this.filterRows(sheet, config.checkMap);

    // Calculate sums for each column in the columnMap
    const values: number[] = [];
    const sortedColumns = Object.keys(config.columnMap)
      .map(Number)
      .sort((a, b) => a - b);

    for (const col of sortedColumns) {
      const sum = this.sumColumnValues(sheet, matchingRows, col);
      // Round to 2 decimal places to match Python behavior
      const rounded = Math.round(sum * 100) / 100;
      values.push(rounded);
    }

    return values;
  }

  /**
   * Process all sheet configurations for a single workbook
   */
  static processWorkbook(
    workbook: XLSX.WorkBook,
    sheetConfigs: SheetConfig[]
  ): { [heading: string]: number[] } {
    const results: { [heading: string]: number[] } = {};

    for (const config of sheetConfigs) {
      try {
        results[config.heading] = this.processSheetConfig(workbook, config);
      } catch (error) {
        console.error(`Error processing ${config.heading}:`, error);
        // Fill with zeros if processing fails
        results[config.heading] = new Array(Object.keys(config.columnMap).length).fill(0);
      }
    }

    return results;
  }
}
