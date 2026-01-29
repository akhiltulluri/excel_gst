import './styles/main.css';
import { FileUploader } from './components/FileUploader';
import { ConfigEditor } from './components/ConfigEditor';
import { ProcessButton } from './components/ProcessButton';
import { ResultsView } from './components/ResultsView';
import { ConfigManager } from './core/ConfigManager';
import { ExcelReader } from './core/ExcelReader';
import { ExcelProcessor } from './core/ExcelProcessor';
import { ExcelWriter, OutputRowData } from './core/ExcelWriter';

class App {
  private fileUploader: FileUploader;
  private configManager: ConfigManager;
  private configEditor: ConfigEditor;
  private processButton: ProcessButton;
  private resultsView: ResultsView;

  constructor() {
    this.configManager = new ConfigManager();

    this.fileUploader = new FileUploader('file-uploader', (files) => {
      this.updateProcessButtonState();
    });

    this.configEditor = new ConfigEditor('config-editor', this.configManager, () => {
      // Config changed
    });

    this.processButton = new ProcessButton('process-button', async () => {
      await this.processFiles();
    });

    this.resultsView = new ResultsView('results-view');

    this.updateProcessButtonState();
  }

  private updateProcessButtonState(): void {
    const files = this.fileUploader.getFiles();
    this.processButton.setEnabled(files.length > 0);
  }

  private async processFiles(): Promise<void> {
    const files = this.fileUploader.getFiles();
    if (files.length === 0) {
      throw new Error('No files selected');
    }

    const config = this.configManager.getConfig();
    const outputRows: OutputRowData[] = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.processButton.showProgress(
        i + 1,
        files.length,
        `Processing ${file.name} (${i + 1}/${files.length})`
      );

      try {
        // Read the workbook
        const workbook = await ExcelReader.readFile(file);

        // Extract month
        const month = ExcelReader.extractMonth(
          workbook,
          file.name,
          config.useFilenameForMonth
        );

        // Process all sheet configurations
        const results = ExcelProcessor.processWorkbook(workbook, config.sheetConfigs);

        outputRows.push({
          month,
          results
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : error}`);
      }

      // Small delay to prevent UI freezing
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Keep rows in the order files were uploaded (matches Python CLI behavior)
    // The Python version doesn't sort, it processes files in the order given

    // Generate output Excel file
    this.processButton.showProgress(files.length, files.length, 'Generating output file...');

    const outputWorkbook = ExcelWriter.createOutputWorkbook(outputRows, config.sheetConfigs);

    // Generate filename with current date
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filename = `GST_Result_${dateStr}.xlsx`;

    // Export to file
    ExcelWriter.exportToFile(outputWorkbook, filename);

    this.processButton.hideProgress();
    this.resultsView.showSuccess(filename);
  }

  private parseMonthToDate(monthStr: string): Date {
    // Parse "MMM-YYYY" format
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [month, year] = monthStr.split('-');
    const monthIndex = months.indexOf(month);
    return new Date(parseInt(year), monthIndex);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
