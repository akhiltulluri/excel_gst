const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_FULL_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatDateToMMM_YYYY(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${month}-${year}`;
}

export function parseMonthString(monthStr: string): Date {
  // Handle formats like "May 2020", "May2020", "052020"
  monthStr = monthStr.trim();

  // Try MMYYYY format (e.g., "052020")
  if (/^\d{6}$/.test(monthStr)) {
    const month = parseInt(monthStr.substring(0, 2));
    const year = parseInt(monthStr.substring(2));
    return new Date(year, month - 1);
  }

  // Try "Month YYYY" or "MonthYYYY"
  const parts = monthStr.split(/\s+/);
  let monthName: string;
  let year: number;

  if (parts.length === 2) {
    monthName = parts[0];
    year = parseInt(parts[1]);
  } else {
    // Try to extract month name and year from combined string
    const match = monthStr.match(/([A-Za-z]+)\s*(\d{4})/);
    if (!match) {
      throw new Error(`Cannot parse month string: ${monthStr}`);
    }
    monthName = match[1];
    year = parseInt(match[2]);
  }

  // Find month index
  const monthIndex = MONTH_FULL_NAMES.findIndex(
    m => m.toLowerCase().startsWith(monthName.toLowerCase())
  );

  if (monthIndex === -1) {
    throw new Error(`Invalid month name: ${monthName}`);
  }

  return new Date(year, monthIndex);
}

export function extractMonthFromFilename(filename: string): string {
  // Remove .xlsx extension
  const nameWithoutExt = filename.replace(/\.xlsx$/i, '');
  const date = parseMonthString(nameWithoutExt);
  return formatDateToMMM_YYYY(date);
}

export function extractMonthFromCell(cellValue: string | number): string {
  // Cell format: MMYYYY (e.g., "052020" or 52020)
  const monthCode = cellValue.toString().padStart(6, '0');
  const month = parseInt(monthCode.substring(0, 2));
  const year = parseInt(monthCode.substring(2));
  return formatDateToMMM_YYYY(new Date(year, month - 1));
}
