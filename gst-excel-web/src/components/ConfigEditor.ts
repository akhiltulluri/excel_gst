import { ConfigManager } from '../core/ConfigManager';
import { SheetConfig } from '../types/config.types';

export class ConfigEditor {
  private container: HTMLElement;
  private configManager: ConfigManager;
  private onConfigChange: () => void;

  constructor(containerId: string, configManager: ConfigManager, onConfigChange: () => void) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
    this.configManager = configManager;
    this.onConfigChange = onConfigChange;
    this.render();
  }

  private render(): void {
    const config = this.configManager.getConfig();

    this.container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">Configuration</h2>
          <div class="space-x-2">
            <button id="export-config-btn" class="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">
              Export
            </button>
            <button id="import-config-btn" class="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">
              Import
            </button>
            <button id="reset-config-btn" class="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded">
              Reset
            </button>
          </div>
        </div>

        <div class="mb-4">
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="use-filename-checkbox"
              ${config.useFilenameForMonth ? 'checked' : ''}
              class="rounded"
            >
            <span class="text-sm">Use filename for month extraction</span>
          </label>
        </div>

        <div class="space-y-4">
          <h3 class="font-semibold text-sm text-gray-700">Sheet Configurations</h3>
          <div id="sheet-configs" class="space-y-3">
            ${config.sheetConfigs.map((sc, index) => this.renderSheetConfig(sc, index)).join('')}
          </div>
        </div>

        <input type="file" id="import-file-input" class="hidden" accept=".json">
      </div>
    `;

    this.attachEventListeners();
  }

  private renderSheetConfig(config: SheetConfig, index: number): string {
    return `
      <details class="border rounded-lg p-4" open>
        <summary class="cursor-pointer font-medium text-sm">${config.heading}</summary>
        <div class="mt-3 space-y-3 text-sm">
          <div>
            <label class="block text-gray-600 mb-1">Sheet Name</label>
            <input
              type="text"
              value="${config.sheetName}"
              readonly
              class="w-full px-3 py-1 border rounded bg-gray-50"
            >
          </div>
          <div>
            <label class="block text-gray-600 mb-1">Heading</label>
            <input
              type="text"
              value="${config.heading}"
              readonly
              class="w-full px-3 py-1 border rounded bg-gray-50"
            >
          </div>
          <div>
            <label class="block text-gray-600 mb-1">Start Column</label>
            <input
              type="number"
              value="${config.startColumn}"
              readonly
              class="w-full px-3 py-1 border rounded bg-gray-50"
            >
          </div>
          <div>
            <label class="block text-gray-600 mb-1">Column Map</label>
            <pre class="text-xs bg-gray-50 p-2 rounded overflow-auto">${JSON.stringify(config.columnMap, null, 2)}</pre>
          </div>
          <div>
            <label class="block text-gray-600 mb-1">Check Map</label>
            <pre class="text-xs bg-gray-50 p-2 rounded overflow-auto">${JSON.stringify(config.checkMap, null, 2)}</pre>
          </div>
        </div>
      </details>
    `;
  }

  private attachEventListeners(): void {
    // Use filename checkbox
    const useFilenameCheckbox = this.container.querySelector('#use-filename-checkbox') as HTMLInputElement;
    useFilenameCheckbox?.addEventListener('change', (e) => {
      const config = this.configManager.getConfig();
      config.useFilenameForMonth = (e.target as HTMLInputElement).checked;
      this.onConfigChange();
    });

    // Export button
    const exportBtn = this.container.querySelector('#export-config-btn');
    exportBtn?.addEventListener('click', () => {
      this.exportConfig();
    });

    // Import button
    const importBtn = this.container.querySelector('#import-config-btn');
    const importInput = this.container.querySelector('#import-file-input') as HTMLInputElement;
    importBtn?.addEventListener('click', () => {
      importInput.click();
    });

    importInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.importConfig(file);
      }
    });

    // Reset button
    const resetBtn = this.container.querySelector('#reset-config-btn');
    resetBtn?.addEventListener('click', () => {
      if (confirm('Reset configuration to default values?')) {
        this.configManager.resetToDefault();
        this.render();
        this.onConfigChange();
      }
    });
  }

  private exportConfig(): void {
    const json = this.configManager.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gst-config.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  private importConfig(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        this.configManager.importFromJSON(json);
        this.render();
        this.onConfigChange();
        alert('Configuration imported successfully');
      } catch (error) {
        alert(`Failed to import configuration: ${error}`);
      }
    };
    reader.readAsText(file);
  }
}
