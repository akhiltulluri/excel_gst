# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:

- **Node.js**: Version 20.19+ or 22.12+
  - Check: `node --version`
  - Install from: https://nodejs.org/

- **npm**: Usually comes with Node.js
  - Check: `npm --version`

## Installation

```bash
# 1. Navigate to the project directory
cd gst-excel-web

# 2. Install dependencies (this may take a few minutes)
npm install
```

## Running the Application

```bash
# Start the development server
npm run dev
```

You should see output like:

```
  VITE v7.3.1  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open your browser and navigate to `http://localhost:3000/`

## Using the Application

### Step 1: Upload Files

1. Click the upload area or drag and drop Excel files (.xlsx)
2. You can upload multiple files at once
3. Files appear in a list with their sizes
4. Click the X button to remove any file

### Step 2: Review Configuration (Optional)

The default configuration works for standard GST files:
- B2B transactions
- B2B (supply Y)
- CDNR Debit notes
- CDNR Credit notes

You can:
- Export the configuration as JSON
- Import a custom configuration
- Reset to default settings
- Toggle month extraction method

### Step 3: Process Files

1. Click the "Process Files" button
2. Watch the progress bar as files are processed
3. The result file will download automatically
4. File name format: `GST_Result_YYYY-MM-DD.xlsx`

### Step 4: Review Results

1. Open the downloaded Excel file
2. Check the "Result" sheet
3. Verify the data is correct

## Testing with Sample Files

If you have sample files in the parent directory:

```bash
# Sample files location (from project root)
../in/tsr/           # TSR format files
../in/wipro2022-23/  # Wipro format files
../in/nirman/        # Nirman format files

# Expected output location
../out/              # Compare your results with these files
```

## Common Issues

### "Node.js version too old" error

**Problem**: You're using Node.js 16.x or older

**Solution**:
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from https://nodejs.org/
```

### Port 3000 already in use

**Problem**: Another application is using port 3000

**Solution**:
```bash
# Kill the process using port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill

# Or specify a different port:
npm run dev -- --port 3001
```

### Build errors

**Problem**: Dependencies not installed or outdated

**Solution**:
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Files not processing

**Problem**: Excel files missing required sheets

**Solution**:
- Ensure files have "B2B" and "CDNR" sheets
- If not using filename for month, ensure "Read me" sheet exists with month in cell E2
- Check browser console (F12) for specific error messages

## Next Steps

1. **Read the full README**: `README.md` for detailed features
2. **Review testing guide**: `TESTING.md` for comprehensive test cases
3. **Check development guide**: `DEVELOPMENT.md` to understand the codebase
4. **Deploy**: `DEPLOYMENT.md` for deployment instructions

## Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

The production files will be in the `dist/` directory.

## Getting Help

If you encounter issues:

1. Check the error message in the browser console (F12)
2. Review the documentation files
3. Verify your Excel files have the correct structure
4. Check Node.js version compatibility

## File Structure Reference

```
gst-excel-web/
├── src/                    # Source code
│   ├── components/         # UI components
│   ├── core/              # Business logic
│   ├── types/             # TypeScript types
│   ├── utils/             # Utilities
│   └── main.ts            # Entry point
├── index.html             # HTML template
├── package.json           # Dependencies
└── README.md             # Main documentation
```

## Configuration File Format

If you want to customize the configuration, here's the JSON structure:

```json
{
  "useFilenameForMonth": false,
  "sheetConfigs": [
    {
      "sheetName": "B2B",
      "heading": "B2B",
      "startColumn": 2,
      "columnMap": {
        "10": "Taxable",
        "11": "IGST",
        "12": "CGST",
        "13": "SGST",
        "14": "Cess"
      },
      "checkMap": {
        "9": "-"
      }
    }
  ]
}
```

Export the current config from the UI to see the full structure.

## Tips for Best Results

1. **Use consistent file formats**: All files should have the same sheet structure
2. **Process in batches**: If you have many files, process 10-20 at a time
3. **Check sample files first**: Test with 1-2 files before processing all
4. **Keep files under 50MB**: Larger files may cause browser performance issues
5. **Use recent Excel format**: .xlsx files only (not .xls)

## Keyboard Shortcuts

While using the application:
- **Drag and drop**: Upload files quickly
- **Ctrl/Cmd + Click**: Select multiple files in file picker
- **F12**: Open browser developer tools for debugging

## Privacy Note

All processing happens entirely in your browser:
- No files are uploaded to any server
- No data leaves your device
- Configuration is stored locally only
- Safe to use with confidential financial data
