# GST Excel Consolidator - Web Version

A browser-based TypeScript application for consolidating GST Excel files. Process multiple Excel files entirely in your browser - no data leaves your device.

## Features

- **Client-side Processing**: All processing happens in your browser, ensuring data privacy
- **Visual Configuration**: Easy-to-use interface for managing sheet configurations
- **Drag & Drop**: Simple file upload with drag-and-drop support
- **Multiple Files**: Process multiple Excel files at once
- **Customizable**: Export and import custom configurations
- **Zero Installation**: No software installation required

## Quick Start

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Build

```bash
npm run preview
```

## How to Use

1. **Upload Files**: Drag and drop or click to select Excel files (.xlsx)
2. **Configure**: Review and adjust the configuration if needed
3. **Process**: Click "Process Files" to consolidate the data
4. **Download**: The result file will be automatically downloaded

## Configuration

The application uses a default configuration based on the original Python script:

- **B2B**: Standard B2B transactions
- **B2B (supply Y)**: B2B transactions with supply type Y
- **CDNR Debit**: Credit/Debit notes (Debit)
- **CDNR Credit**: Credit/Debit notes (Credit)

You can export the current configuration or import a custom one using the buttons in the Configuration panel.

## Month Extraction

The application can extract the month from two sources:

1. **Read me sheet** (default): Reads from cell E2 in the "Read me" sheet (format: MMYYYY)
2. **Filename**: Extracts from the filename (e.g., "May 2020.xlsx")

Toggle this option in the Configuration panel.

## Deployment

### GitHub Pages

The repository includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

1. Go to repository Settings > Pages
2. Set Source to "GitHub Actions"
3. Push to the main/master branch
4. The site will be deployed automatically

### Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Deploy

## Browser Compatibility

Works on modern browsers (Chrome, Firefox, Safari, Edge) with JavaScript enabled.

## File Size Limits

Recommended maximum file size: 50MB per file

## Technical Stack

- **Framework**: Vite + TypeScript
- **Styling**: Tailwind CSS
- **Excel Processing**: SheetJS (xlsx)
- **File Export**: FileSaver.js

## License

ISC
