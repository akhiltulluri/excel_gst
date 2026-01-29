# Development Guide

## Project Structure

```
gst-excel-web/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── src/
│   ├── components/             # UI components
│   │   ├── FileUploader.ts     # File upload with drag-and-drop
│   │   ├── ConfigEditor.ts     # Visual configuration editor
│   │   ├── ProcessButton.ts    # Processing trigger and progress
│   │   └── ResultsView.ts      # Results display and download
│   ├── core/                   # Core business logic
│   │   ├── ExcelReader.ts      # Excel file reading
│   │   ├── ExcelProcessor.ts   # Row filtering and calculations
│   │   ├── ExcelWriter.ts      # Output file generation
│   │   └── ConfigManager.ts    # Configuration management
│   ├── types/                  # TypeScript type definitions
│   │   ├── config.types.ts     # Configuration interfaces
│   │   └── excel.types.ts      # Excel data types
│   ├── utils/                  # Utility functions
│   │   ├── constants.ts        # Default configuration
│   │   ├── dateUtils.ts        # Date parsing and formatting
│   │   └── validators.ts       # Input validation
│   ├── styles/
│   │   └── main.css           # Tailwind CSS styles
│   └── main.ts                # Application entry point
├── index.html                 # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Dependencies and scripts
```

## Architecture Overview

### Data Flow

```
File Upload → Excel Reading → Processing → Output Generation → Download
     ↓            ↓              ↓              ↓              ↓
FileUploader  ExcelReader  ExcelProcessor  ExcelWriter  FileSaver
```

### Component Responsibilities

**FileUploader**
- Handles drag-and-drop and file selection
- Validates file types and sizes
- Manages file list state
- Emits file changes to parent

**ConfigEditor**
- Displays current configuration
- Allows export/import of JSON configs
- Manages month extraction toggle
- Resets to default configuration

**ProcessButton**
- Triggers file processing
- Shows progress updates
- Displays error messages
- Manages processing state

**ResultsView**
- Shows success message
- Displays result filename
- Provides reset functionality

### Core Logic

**ExcelReader**
- Reads Excel files using SheetJS
- Extracts month from "Read me" sheet or filename
- Provides sheet and cell access methods

**ExcelProcessor**
- Implements row filtering logic (replicates Python `check()`)
- Sums column values for matching rows
- Processes multiple sheet configurations

**ExcelWriter**
- Creates output workbook structure
- Writes header rows (merged cells)
- Formats numbers and cells
- Exports to Excel file

**ConfigManager**
- Manages application configuration state
- Validates configuration structure
- Handles import/export as JSON

## Key Algorithms

### Row Filtering (ExcelProcessor.ts:26-46)

Replicates Python's `check()` function:

```typescript
static checkRowConditions(
  sheet: XLSX.WorkSheet,
  rowIndex: number,
  checkMap: { [col: number]: string | number }
): boolean {
  return Object.entries(checkMap).every(([col, expectedValue]) => {
    const cellValue = ExcelReader.getCellValue(sheet, rowIndex, parseInt(col));
    // Compare cell value with expected value
    return cellValue === expectedValue;
  });
}
```

### Column Summing (ExcelProcessor.ts:67-76)

Replicates Python's `getSumOfRowValues()`:

```typescript
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
```

### Month Extraction (ExcelReader.ts:28-52)

Supports two modes:

1. **From "Read me" sheet**: Cell E2 (format: MMYYYY)
2. **From filename**: Parses filename like "May 2020.xlsx"

## Development Workflow

### Setup

```bash
# Clone the repository
git clone [repository-url]
cd gst-excel-web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Edit files in `src/`
   - Hot reload will update the browser automatically

3. **Test your changes**
   - Upload sample Excel files
   - Process and verify output
   - Check browser console for errors

4. **Type check**
   ```bash
   npm run build
   # or just type check without building
   npx tsc --noEmit
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions:
  - PascalCase for classes and types
  - camelCase for functions and variables
  - UPPER_CASE for constants
- Add JSDoc comments for public methods
- Keep functions small and focused

### Adding a New Sheet Configuration

1. Update `src/utils/constants.ts`:
   ```typescript
   {
     sheetName: 'NewSheet',
     heading: 'New Sheet Display Name',
     startColumn: 22,  // Next available column
     columnMap: {
       5: 'Column1',
       6: 'Column2',
       // ... more columns
     },
     checkMap: {
       4: 'expected value'
     }
   }
   ```

2. Update output structure in `ExcelWriter.ts` if needed

3. Test with sample files

### Modifying the UI

All components are in `src/components/`:

- Use Tailwind CSS classes for styling
- Maintain responsive design (mobile-friendly)
- Follow existing patterns for consistency
- Keep accessibility in mind (labels, ARIA attributes)

### Adding New Features

Example: Add a preview feature

1. Create new component: `src/components/DataPreview.ts`
2. Add preview logic to `ExcelProcessor.ts`
3. Update `main.ts` to integrate component
4. Add UI element in `index.html`
5. Update `main.css` if needed
6. Test thoroughly

## Testing

### Manual Testing

See `TESTING.md` for comprehensive test cases.

### Unit Testing (Future)

To add unit tests:

```bash
# Install testing libraries
npm install --save-dev vitest @vitest/ui

# Add test script to package.json
"scripts": {
  "test": "vitest"
}

# Create test files
# src/core/__tests__/ExcelProcessor.test.ts
```

### Integration Testing

Test the full workflow:
1. Upload sample files from `../in/tsr/`
2. Process with default configuration
3. Compare output with `../out/` files
4. Verify calculations match Python version

## Debugging

### Browser DevTools

1. Open browser DevTools (F12)
2. Check Console for errors
3. Use Network tab to verify file loading
4. Use Sources tab to set breakpoints

### Common Issues

**Files not processing**
- Check browser console for errors
- Verify Excel file structure (sheets exist)
- Check cell formats (E2 in "Read me" should be MMYYYY)

**Incorrect calculations**
- Add console.logs in `ExcelProcessor.ts`
- Verify checkMap conditions
- Compare filtered rows with manual Excel filtering

**UI not updating**
- Check event listeners are attached
- Verify state changes trigger re-renders
- Check CSS classes are applied

### Adding Debug Logging

```typescript
// In ExcelProcessor.ts
const matchingRows = this.filterRows(sheet, config.checkMap);
console.log(`Found ${matchingRows.length} matching rows for ${config.heading}`);
console.log('Rows:', matchingRows);
```

## Performance Optimization

### Current Optimizations

1. **Async processing with delays**
   ```typescript
   await new Promise(resolve => setTimeout(resolve, 10));
   ```
   Prevents UI freezing

2. **Sequential file processing**
   Manages memory usage

3. **Vite code splitting**
   Automatic via dynamic imports

### Future Optimizations

- Use Web Workers for heavy processing
- Implement virtual scrolling for large file lists
- Add file processing queue with priority
- Cache parsed workbooks if reprocessing

## Dependencies

### Core Dependencies

- **xlsx** (0.18.5): Excel file reading and writing
- **file-saver** (2.0.5): File download functionality

### Build Dependencies

- **vite** (7.3.1): Build tool and dev server
- **typescript** (5.9.3): Type checking and compilation
- **tailwindcss** (4.1.18): CSS framework
- **postcss** (8.5.6): CSS processing
- **autoprefixer** (10.4.23): CSS vendor prefixing

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update xlsx

# Update all packages
npm update

# Test after updates
npm run build
npm run dev
```

## Build Configuration

### Vite Config (vite.config.ts)

- `base: './'`: Use relative paths for static hosting
- `outDir: 'dist'`: Build output directory
- `sourcemap: false`: Disable source maps in production

### TypeScript Config (tsconfig.json)

- `target: ES2020`: Modern JavaScript features
- `strict: true`: Strict type checking
- `moduleResolution: node`: Node-style module resolution

### Tailwind Config (tailwind.config.js)

- Scans HTML and TS files for class usage
- Purges unused styles in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

Include in your PR:
- Description of changes
- Test cases covered
- Screenshots (if UI changes)
- Breaking changes (if any)

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [SheetJS Documentation](https://docs.sheetjs.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
