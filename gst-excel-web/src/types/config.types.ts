export interface ColumnMap {
  [columnNumber: number]: string;
}

export interface CheckMap {
  [columnNumber: number]: string | number;
}

export interface SheetConfig {
  sheetName: string;
  columnMap: ColumnMap;
  checkMap: CheckMap;
  startColumn: number;
  heading: string;
}

export interface AppConfig {
  useFilenameForMonth: boolean;
  sheetConfigs: SheetConfig[];
}

export interface ProcessedResult {
  month: string;
  values: { [key: string]: number };
}
