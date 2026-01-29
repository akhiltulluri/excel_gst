import { AppConfig } from '../types/config.types';

// Default configuration based on config.py and cli.py
export const DEFAULT_CONFIG: AppConfig = {
  useFilenameForMonth: false,
  sheetConfigs: [
    {
      sheetName: 'B2B',
      heading: 'B2B',
      startColumn: 2,
      columnMap: {
        10: 'Taxable',
        11: 'IGST',
        12: 'CGST',
        13: 'SGST',
        14: 'Cess'
      },
      checkMap: {
        9: '-'
      }
    },
    {
      sheetName: 'B2B',
      heading: 'B2B (supply Y)',
      startColumn: 7,
      columnMap: {
        10: 'Taxable',
        11: 'IGST',
        12: 'CGST',
        13: 'SGST',
        14: 'Cess'
      },
      checkMap: {
        9: '-',
        8: 'Y'
      }
    },
    {
      sheetName: 'CDNR',
      heading: 'CDNR Debit',
      startColumn: 12,
      columnMap: {
        11: 'Taxable',
        12: 'IGST',
        13: 'CGST',
        14: 'SGST',
        15: 'Cess'
      },
      checkMap: {
        10: '-',
        3: 'Debit note'
      }
    },
    {
      sheetName: 'CDNR',
      heading: 'CDNR Credit',
      startColumn: 17,
      columnMap: {
        11: 'Taxable',
        12: 'IGST',
        13: 'CGST',
        14: 'SGST',
        15: 'Cess'
      },
      checkMap: {
        10: '-',
        3: 'Credit note'
      }
    }
  ]
};

export const SECONDARY_HEADERS = ['Value', 'IGST', 'CGST', 'SGST', 'Cess'];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
