# Testing Guide

## Prerequisites

- Node.js version 20.19+ or 22.12+ (required for Vite 7)
- npm or yarn package manager

## Running the Application

### Development Mode

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Test Cases

### 1. File Upload

**Test 1.1: Valid Excel File**
- Upload a valid .xlsx file from `../in/tsr/` directory
- Expected: File appears in the file list with green checkmark

**Test 1.2: Invalid File Type**
- Try to upload a .xls or .pdf file
- Expected: Error message "Only .xlsx files are supported"

**Test 1.3: Large File**
- Upload a file larger than 50MB
- Expected: Error message about file size limit

**Test 1.4: Multiple Files**
- Upload multiple files at once
- Expected: All valid files appear in the list

**Test 1.5: Remove File**
- Click the X button on a file in the list
- Expected: File is removed from the list

### 2. Configuration

**Test 2.1: Default Configuration**
- Load the application
- Expand all configuration sections
- Expected: 4 sheet configurations visible (B2B, B2B supply Y, CDNR Debit, CDNR Credit)

**Test 2.2: Export Configuration**
- Click "Export" button
- Expected: JSON file downloads with current configuration

**Test 2.3: Import Configuration**
- Export current config
- Click "Import" and select the exported file
- Expected: Configuration loads successfully

**Test 2.4: Reset Configuration**
- Modify the "Use filename" checkbox
- Click "Reset"
- Expected: Confirmation dialog, then configuration reverts to default

**Test 2.5: Month Extraction Toggle**
- Toggle "Use filename for month extraction" checkbox
- Process files and verify month extraction method

### 3. Processing

**Test 3.1: Process Single File**
- Upload one file from `../in/tsr/`
- Click "Process Files"
- Expected: Progress bar shows, result file downloads

**Test 3.2: Process Multiple Files**
- Upload 3-5 files from `../in/tsr/`
- Click "Process Files"
- Expected: Progress updates for each file, single result file downloads

**Test 3.3: Month from Read Me Sheet**
- Ensure "Use filename" is unchecked
- Process a file
- Expected: Month extracted from "Read me" sheet cell E2

**Test 3.4: Month from Filename**
- Check "Use filename" checkbox
- Upload file named like "May 2020.xlsx"
- Process files
- Expected: Month extracted from filename

**Test 3.5: Error Handling - Missing Sheet**
- Upload a file without "B2B" or "CDNR" sheet
- Process files
- Expected: Error message displayed

**Test 3.6: Error Handling - Missing Read Me**
- Ensure "Use filename" is unchecked
- Upload a file without "Read me" sheet
- Process files
- Expected: Error message about missing sheet

### 4. Output Verification

**Test 4.1: Compare with Python Output**
- Use the same input files from `../in/tsr/`
- Process with web app
- Compare output with `../out/` files
- Expected: Values match exactly

**Test 4.2: Output Structure**
- Open the generated Excel file
- Expected structure:
  - Row 1: Month header + merged primary headers (B2B, B2B supply Y, etc.)
  - Row 2: Secondary headers (Value, IGST, CGST, SGST, Cess repeated)
  - Row 3+: Data rows with months in chronological order

**Test 4.3: Number Formatting**
- Check values in output file
- Expected: Numbers formatted with 2 decimal places

**Test 4.4: Month Sorting**
- Process files with different months (e.g., Jan 2020, Mar 2020, Feb 2020)
- Expected: Output rows sorted chronologically (Jan, Feb, Mar)

### 5. Browser Compatibility

**Test 5.1: Chrome**
- Test all features in Chrome
- Expected: All features work

**Test 5.2: Firefox**
- Test all features in Firefox
- Expected: All features work

**Test 5.3: Safari**
- Test all features in Safari
- Expected: All features work

**Test 5.4: Edge**
- Test all features in Edge
- Expected: All features work

### 6. Edge Cases

**Test 6.1: Empty File List**
- Don't upload any files
- Try to click "Process Files"
- Expected: Button is disabled

**Test 6.2: Process Then Upload More**
- Process some files
- Upload additional files
- Expected: Can start new processing session

**Test 6.3: Large Batch**
- Upload 20+ files
- Process files
- Expected: Progress indicator shows, no browser freeze

**Test 6.4: Special Characters in Filename**
- Upload file with special characters in name
- Process files
- Expected: Handles gracefully

## Manual Calculation Verification

To verify the calculations are correct:

1. Open an input Excel file manually
2. Open the "B2B" sheet
3. Filter rows where column 9 = "-"
4. Sum column 10 (Taxable), 11 (IGST), 12 (CGST), 13 (SGST), 14 (Cess)
5. Compare with values in the output file for that month under "B2B"
6. Repeat for other configurations (B2B supply Y, CDNR, etc.)

## Known Limitations

- Node.js 16.x won't work with Vite 7 (requires 20.19+ or 22.12+)
- Files larger than 50MB may cause performance issues
- Browser must have JavaScript enabled
- Requires modern browser with ES2020 support

## Troubleshooting

### Build Fails
- Check Node.js version: `node --version`
- Upgrade if needed: `nvm install 20` or download from nodejs.org

### TypeScript Errors
- Run type checking: `npm run build` or `tsc --noEmit`
- Check for missing dependencies: `npm install`

### Runtime Errors
- Check browser console for error messages
- Verify Excel file structure matches expected format
- Ensure "Read me", "B2B", and "CDNR" sheets exist
