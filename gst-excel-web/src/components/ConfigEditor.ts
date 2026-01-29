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

  private columnNumberToLetter(colNum: number): string {
    let letter = '';
    let num = colNum;
    while (num > 0) {
      const remainder = (num - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      num = Math.floor((num - 1) / 26);
    }
    return letter;
  }

  private render(): void {
    const config = this.configManager.getConfig();

    this.container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div class="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b">
          <div class="flex items-center space-x-2">
            <h2 class="text-xl font-bold">Configuration</h2>
            <button id="help-btn" class="text-blue-600 hover:text-blue-800" title="Show Help">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>
          <div class="space-x-2">
            <button id="export-config-btn" class="text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors" title="Download configuration as JSON">
              📥 Export
            </button>
            <button id="import-config-btn" class="text-sm px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors" title="Load configuration from JSON file">
              📤 Import
            </button>
            <button id="reset-config-btn" class="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors" title="Reset to default configuration">
              🔄 Reset
            </button>
          </div>
        </div>

        <!-- Help Panel -->
        <div id="help-panel" class="hidden mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <h3 class="font-bold text-blue-900 mb-2">📖 Configuration Guide</h3>
          <ul class="space-y-2 text-blue-800">
            <li><strong>Sheet Configs:</strong> Define which sheets to process and how to filter/sum data</li>
            <li><strong>Column Map:</strong> Which columns to sum (e.g., Column 10 = Taxable Value)</li>
            <li><strong>Check Map:</strong> Filter conditions (e.g., only rows where Column 9 = "-")</li>
            <li><strong>Column Numbers:</strong> Use Excel column numbers (A=1, B=2, ..., J=10, etc.)</li>
            <li><strong>Start Column:</strong> Where to place results in output (Column 2 = Column B)</li>
          </ul>
        </div>

        <!-- Month Extraction -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div class="flex items-start space-x-3">
            <input
              type="checkbox"
              id="use-filename-checkbox"
              ${config.useFilenameForMonth ? 'checked' : ''}
              class="mt-1 rounded"
            >
            <div class="flex-1">
              <label for="use-filename-checkbox" class="font-medium text-sm cursor-pointer">
                📅 Use filename for month extraction
              </label>
              <p class="text-xs text-gray-600 mt-1">
                ✓ Checked: Extract month from filename (e.g., "May 2020.xlsx")<br>
                ✗ Unchecked: Extract from "Read me" sheet, cell E2 (default for Wipro files)
              </p>
            </div>
          </div>
        </div>

        <!-- Sheet Configurations -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-700">📊 Sheet Configurations</h3>
            <button id="add-config-btn" class="text-sm px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors">
              ➕ Add Config
            </button>
          </div>

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
    const columnMapEntries = Object.entries(config.columnMap).sort((a, b) => Number(a[0]) - Number(b[0]));
    const checkMapEntries = Object.entries(config.checkMap).sort((a, b) => Number(a[0]) - Number(b[0]));

    return `
      <details class="border rounded-lg p-4 bg-white shadow-sm" ${index < 2 ? 'open' : ''}>
        <summary class="cursor-pointer font-medium flex items-center justify-between">
          <span class="flex items-center space-x-2">
            <span class="text-lg">${this.getIconForSheet(config.sheetName)}</span>
            <span>${config.heading}</span>
            <span class="text-xs text-gray-500">(Sheet: ${config.sheetName})</span>
          </span>
          <button class="delete-config text-red-500 hover:text-red-700 px-2" data-index="${index}" title="Delete this configuration">
            🗑️
          </button>
        </summary>

        <div class="mt-4 space-y-4 text-sm">

          <!-- Sheet Name -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-gray-700 font-medium mb-1">
                📄 Excel Sheet Name
                <span class="text-xs text-gray-500 font-normal">(must match exactly)</span>
              </label>
              <input
                type="text"
                value="${config.sheetName}"
                data-index="${index}"
                data-field="sheetName"
                class="config-input w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., B2B, CDNR"
              >
            </div>

            <!-- Heading -->
            <div>
              <label class="block text-gray-700 font-medium mb-1">
                🏷️ Output Heading
                <span class="text-xs text-gray-500 font-normal">(display name)</span>
              </label>
              <input
                type="text"
                value="${config.heading}"
                data-index="${index}"
                data-field="heading"
                class="config-input w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., B2B, CDNR Debit"
              >
            </div>
          </div>

          <!-- Start Column -->
          <div>
            <label class="block text-gray-700 font-medium mb-1">
              📍 Output Start Column
              <span class="text-xs text-gray-500 font-normal">
                (Column ${this.columnNumberToLetter(config.startColumn)} in Excel)
              </span>
            </label>
            <input
              type="number"
              value="${config.startColumn}"
              data-index="${index}"
              data-field="startColumn"
              class="config-input w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              min="1"
              placeholder="e.g., 2, 7, 12"
            >
            <p class="text-xs text-gray-500 mt-1">Where to write results in output file (A=1, B=2, C=3, etc.)</p>
          </div>

          <!-- Column Map -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-gray-700 font-medium">
                ➕ Columns to Sum
                <span class="text-xs text-gray-500 font-normal">(source data columns)</span>
              </label>
              <button class="add-column-map text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded" data-index="${index}">
                ➕ Add Column
              </button>
            </div>
            <div class="space-y-2 column-map-container" data-index="${index}">
              ${columnMapEntries.map(([col, label]) => `
                <div class="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                  <span class="text-xs font-mono text-gray-500 w-12">Col ${col}</span>
                  <span class="text-xs text-gray-500">(${this.columnNumberToLetter(Number(col))})</span>
                  <input
                    type="number"
                    value="${col}"
                    data-index="${index}"
                    data-type="columnMap"
                    data-key="${col}"
                    data-field="key"
                    class="column-map-input w-16 px-2 py-1 border rounded text-sm"
                    min="1"
                    placeholder="10"
                  >
                  <span class="text-gray-500">=</span>
                  <input
                    type="text"
                    value="${label}"
                    data-index="${index}"
                    data-type="columnMap"
                    data-key="${col}"
                    data-field="value"
                    class="column-map-input flex-1 px-2 py-1 border rounded text-sm"
                    placeholder="Label (e.g., Taxable, IGST)"
                  >
                  <button class="remove-column-map text-red-500 hover:text-red-700" data-index="${index}" data-key="${col}">
                    ✕
                  </button>
                </div>
              `).join('')}
            </div>
            <p class="text-xs text-gray-500 mt-1">💡 Which columns contain the values to sum (e.g., Column 10 = Taxable Value)</p>
          </div>

          <!-- Check Map -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-gray-700 font-medium">
                ✓ Filter Conditions
                <span class="text-xs text-gray-500 font-normal">(which rows to include)</span>
              </label>
              <button class="add-check-map text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded" data-index="${index}">
                ➕ Add Condition
              </button>
            </div>
            <div class="space-y-2 check-map-container" data-index="${index}">
              ${checkMapEntries.map(([col, value]) => `
                <div class="flex items-center space-x-2 bg-yellow-50 p-2 rounded">
                  <span class="text-xs font-mono text-gray-500 w-12">Col ${col}</span>
                  <span class="text-xs text-gray-500">(${this.columnNumberToLetter(Number(col))})</span>
                  <input
                    type="number"
                    value="${col}"
                    data-index="${index}"
                    data-type="checkMap"
                    data-key="${col}"
                    data-field="key"
                    class="check-map-input w-16 px-2 py-1 border rounded text-sm"
                    min="1"
                    placeholder="9"
                  >
                  <span class="text-gray-500">must equal</span>
                  <input
                    type="text"
                    value="${value}"
                    data-index="${index}"
                    data-type="checkMap"
                    data-key="${col}"
                    data-field="value"
                    class="check-map-input flex-1 px-2 py-1 border rounded text-sm"
                    placeholder="Value (e.g., -, Y, Debit note)"
                  >
                  <button class="remove-check-map text-red-500 hover:text-red-700" data-index="${index}" data-key="${col}">
                    ✕
                  </button>
                </div>
              `).join('')}
            </div>
            <p class="text-xs text-gray-500 mt-1">💡 Only process rows where these conditions are true (e.g., Column 9 = "-")</p>
          </div>

        </div>
      </details>
    `;
  }

  private getIconForSheet(sheetName: string): string {
    const icons: { [key: string]: string } = {
      'B2B': '📊',
      'CDNR': '📝',
      'B2BA': '📈',
      'CDNRA': '📋'
    };
    return icons[sheetName] || '📄';
  }

  private attachEventListeners(): void {
    // Help button
    const helpBtn = this.container.querySelector('#help-btn');
    const helpPanel = this.container.querySelector('#help-panel');
    helpBtn?.addEventListener('click', () => {
      helpPanel?.classList.toggle('hidden');
    });

    // Use filename checkbox
    const useFilenameCheckbox = this.container.querySelector('#use-filename-checkbox') as HTMLInputElement;
    useFilenameCheckbox?.addEventListener('change', (e) => {
      const config = this.configManager.getConfig();
      config.useFilenameForMonth = (e.target as HTMLInputElement).checked;
      this.onConfigChange();
    });

    // Basic config inputs
    this.container.querySelectorAll('.config-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const index = parseInt(target.dataset.index || '0');
        const field = target.dataset.field || '';
        this.updateConfigField(index, field, target.value);
      });
    });

    // Column map inputs
    this.container.querySelectorAll('.column-map-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const index = parseInt(target.dataset.index || '0');
        const oldKey = target.dataset.key || '';
        const field = target.dataset.field || '';
        this.updateMapEntry(index, 'columnMap', oldKey, field, target.value);
      });
    });

    // Check map inputs
    this.container.querySelectorAll('.check-map-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const index = parseInt(target.dataset.index || '0');
        const oldKey = target.dataset.key || '';
        const field = target.dataset.field || '';
        this.updateMapEntry(index, 'checkMap', oldKey, field, target.value);
      });
    });

    // Add column map button
    this.container.querySelectorAll('.add-column-map').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset.index || '0');
        this.addMapEntry(index, 'columnMap');
      });
    });

    // Add check map button
    this.container.querySelectorAll('.add-check-map').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset.index || '0');
        this.addMapEntry(index, 'checkMap');
      });
    });

    // Remove column map buttons
    this.container.querySelectorAll('.remove-column-map').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const index = parseInt(target.dataset.index || '0');
        const key = target.dataset.key || '';
        this.removeMapEntry(index, 'columnMap', key);
      });
    });

    // Remove check map buttons
    this.container.querySelectorAll('.remove-check-map').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const index = parseInt(target.dataset.index || '0');
        const key = target.dataset.key || '';
        this.removeMapEntry(index, 'checkMap', key);
      });
    });

    // Delete config buttons
    this.container.querySelectorAll('.delete-config').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't trigger details toggle
        const index = parseInt((e.target as HTMLElement).dataset.index || '0');
        if (confirm('Delete this configuration?')) {
          this.deleteConfig(index);
        }
      });
    });

    // Add config button
    const addConfigBtn = this.container.querySelector('#add-config-btn');
    addConfigBtn?.addEventListener('click', () => {
      this.addNewConfig();
    });

    // Export/Import/Reset buttons
    const exportBtn = this.container.querySelector('#export-config-btn');
    exportBtn?.addEventListener('click', () => this.exportConfig());

    const importBtn = this.container.querySelector('#import-config-btn');
    const importInput = this.container.querySelector('#import-file-input') as HTMLInputElement;
    importBtn?.addEventListener('click', () => importInput.click());
    importInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) this.importConfig(file);
    });

    const resetBtn = this.container.querySelector('#reset-config-btn');
    resetBtn?.addEventListener('click', () => {
      if (confirm('Reset configuration to default values?')) {
        this.configManager.resetToDefault();
        this.render();
        this.onConfigChange();
      }
    });
  }

  private updateConfigField(index: number, field: string, value: string): void {
    const config = this.configManager.getConfig();
    const sheetConfig = config.sheetConfigs[index];
    if (!sheetConfig) return;

    if (field === 'startColumn') {
      sheetConfig.startColumn = parseInt(value);
    } else {
      (sheetConfig as any)[field] = value;
    }

    this.onConfigChange();
  }

  private updateMapEntry(index: number, mapType: 'columnMap' | 'checkMap', oldKey: string, field: string, value: string): void {
    const config = this.configManager.getConfig();
    const sheetConfig = config.sheetConfigs[index];
    if (!sheetConfig) return;

    const map = sheetConfig[mapType] as any;

    if (field === 'key') {
      // Changing the key
      const oldValue = map[oldKey];
      delete map[oldKey];
      map[parseInt(value)] = oldValue;
    } else {
      // Changing the value
      const numericValue = /^\d+$/.test(value) ? parseInt(value) : value;
      map[parseInt(oldKey)] = numericValue;
    }

    this.render();
    this.onConfigChange();
  }

  private addMapEntry(index: number, mapType: 'columnMap' | 'checkMap'): void {
    const config = this.configManager.getConfig();
    const sheetConfig = config.sheetConfigs[index];
    if (!sheetConfig) return;

    const map = sheetConfig[mapType] as any;
    const newKey = Math.max(1, ...Object.keys(map).map(Number)) + 1;

    if (mapType === 'columnMap') {
      map[newKey] = 'New Column';
    } else {
      map[newKey] = '-';
    }

    this.render();
    this.onConfigChange();
  }

  private removeMapEntry(index: number, mapType: 'columnMap' | 'checkMap', key: string): void {
    const config = this.configManager.getConfig();
    const sheetConfig = config.sheetConfigs[index];
    if (!sheetConfig) return;

    const map = sheetConfig[mapType] as any;
    delete map[parseInt(key)];

    this.render();
    this.onConfigChange();
  }

  private deleteConfig(index: number): void {
    const config = this.configManager.getConfig();
    config.sheetConfigs.splice(index, 1);
    this.render();
    this.onConfigChange();
  }

  private addNewConfig(): void {
    const config = this.configManager.getConfig();
    config.sheetConfigs.push({
      sheetName: 'NewSheet',
      heading: 'New Configuration',
      startColumn: 2,
      columnMap: { 10: 'Column1' },
      checkMap: { 9: '-' }
    });
    this.render();
    this.onConfigChange();
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
        alert('✅ Configuration imported successfully!');
      } catch (error) {
        alert(`❌ Failed to import configuration: ${error}`);
      }
    };
    reader.readAsText(file);
  }
}
