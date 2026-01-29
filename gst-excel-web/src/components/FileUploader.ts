import { validateFile } from '../utils/validators';

export class FileUploader {
  private container: HTMLElement;
  private files: File[] = [];
  private onFilesChange: (files: File[]) => void;

  constructor(containerId: string, onFilesChange: (files: File[]) => void) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
    this.onFilesChange = onFilesChange;
    this.render();
    this.attachEventListeners();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-bold">📁 Upload Excel Files</h2>
          <button id="info-toggle" class="text-blue-600 hover:text-blue-800 text-sm" title="Show/Hide Info">
            ℹ️ Info
          </button>
        </div>

        <div id="info-panel" class="hidden mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
          <p class="font-medium text-blue-900 mb-1">📝 File Requirements:</p>
          <ul class="text-blue-800 space-y-1 ml-4 list-disc">
            <li>Format: .xlsx files only (Excel 2007+)</li>
            <li>Size: Max 50MB per file</li>
            <li>Required sheets: B2B, CDNR (or as configured)</li>
            <li>For default config: "Read me" sheet with month in cell E2</li>
          </ul>
          <p class="font-medium text-blue-900 mt-2 mb-1">💡 Tips:</p>
          <ul class="text-blue-800 space-y-1 ml-4 list-disc">
            <li>Upload multiple files at once (Ctrl/Cmd + Click)</li>
            <li>Files will be processed in upload order</li>
            <li>All processing happens in your browser - data stays private!</li>
          </ul>
        </div>

        <div id="drop-zone" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="mt-2 text-sm font-medium text-gray-700">
            📤 Drag and drop Excel files here
          </p>
          <p class="mt-1 text-xs text-gray-500">
            or click to browse files
          </p>
          <p class="mt-2 text-xs text-gray-400">
            Only .xlsx files • Max 50MB each
          </p>
          <input type="file" id="file-input" class="hidden" accept=".xlsx" multiple>
        </div>

        <div id="file-list" class="mt-4 space-y-2"></div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    const dropZone = this.container.querySelector('#drop-zone') as HTMLElement;
    const fileInput = this.container.querySelector('#file-input') as HTMLInputElement;

    // Info toggle
    const infoToggle = this.container.querySelector('#info-toggle');
    const infoPanel = this.container.querySelector('#info-panel');
    infoToggle?.addEventListener('click', () => {
      infoPanel?.classList.toggle('hidden');
    });

    // Click to select files
    dropZone.addEventListener('click', () => {
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        this.addFiles(Array.from(target.files));
      }
    });

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-blue-500', 'bg-blue-50');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-blue-500', 'bg-blue-50');

      if (e.dataTransfer?.files) {
        this.addFiles(Array.from(e.dataTransfer.files));
      }
    });
  }

  private addFiles(newFiles: File[]): void {
    for (const file of newFiles) {
      const validation = validateFile(file);
      if (validation.valid) {
        // Check for duplicates
        if (!this.files.find(f => f.name === file.name)) {
          this.files.push(file);
        }
      } else {
        alert(`${file.name}: ${validation.error}`);
      }
    }
    this.updateFileList();
    this.onFilesChange(this.files);
  }

  private removeFile(index: number): void {
    this.files.splice(index, 1);
    this.updateFileList();
    this.onFilesChange(this.files);
  }

  private updateFileList(): void {
    const fileList = this.container.querySelector('#file-list') as HTMLElement;

    if (this.files.length === 0) {
      fileList.innerHTML = '<p class="text-sm text-gray-500">No files selected</p>';
      return;
    }

    fileList.innerHTML = this.files.map((file, index) => `
      <div class="flex items-center justify-between bg-gray-50 p-3 rounded">
        <div class="flex items-center space-x-3">
          <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <p class="text-sm font-medium text-gray-900">${file.name}</p>
            <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(2)} KB</p>
          </div>
        </div>
        <button
          class="remove-file text-red-500 hover:text-red-700"
          data-index="${index}"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `).join('');

    // Add remove button listeners
    fileList.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
        this.removeFile(index);
      });
    });
  }

  getFiles(): File[] {
    return this.files;
  }

  clear(): void {
    this.files = [];
    this.updateFileList();
    this.onFilesChange(this.files);
  }
}
