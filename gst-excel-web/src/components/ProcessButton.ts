export class ProcessButton {
  private container: HTMLElement;
  private onProcess: () => Promise<void>;
  private isProcessing: boolean = false;

  constructor(containerId: string, onProcess: () => Promise<void>) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
    this.onProcess = onProcess;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Process Files</h2>

        <button
          id="process-btn"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          ${this.isProcessing ? 'disabled' : ''}
        >
          ${this.isProcessing ? 'Processing...' : 'Process Files'}
        </button>

        <div id="progress-container" class="mt-4 hidden">
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div id="progress-bar" class="bg-blue-600 h-2.5 rounded-full transition-all" style="width: 0%"></div>
          </div>
          <p id="progress-text" class="text-sm text-gray-600 mt-2 text-center"></p>
        </div>

        <div id="error-container" class="mt-4 hidden">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800" id="error-text"></p>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const processBtn = this.container.querySelector('#process-btn');
    processBtn?.addEventListener('click', async () => {
      await this.handleProcess();
    });
  }

  private async handleProcess(): Promise<void> {
    this.setProcessing(true);
    this.hideError();

    try {
      await this.onProcess();
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      this.setProcessing(false);
    }
  }

  setProcessing(processing: boolean): void {
    this.isProcessing = processing;
    const processBtn = this.container.querySelector('#process-btn') as HTMLButtonElement;
    if (processBtn) {
      processBtn.disabled = processing;
      processBtn.textContent = processing ? 'Processing...' : 'Process Files';
    }
  }

  showProgress(current: number, total: number, message: string): void {
    const progressContainer = this.container.querySelector('#progress-container') as HTMLElement;
    const progressBar = this.container.querySelector('#progress-bar') as HTMLElement;
    const progressText = this.container.querySelector('#progress-text') as HTMLElement;

    progressContainer.classList.remove('hidden');
    const percentage = Math.round((current / total) * 100);
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = message;
  }

  hideProgress(): void {
    const progressContainer = this.container.querySelector('#progress-container') as HTMLElement;
    progressContainer.classList.add('hidden');
  }

  showError(message: string): void {
    const errorContainer = this.container.querySelector('#error-container') as HTMLElement;
    const errorText = this.container.querySelector('#error-text') as HTMLElement;

    errorContainer.classList.remove('hidden');
    errorText.textContent = message;
  }

  hideError(): void {
    const errorContainer = this.container.querySelector('#error-container') as HTMLElement;
    errorContainer.classList.add('hidden');
  }

  setEnabled(enabled: boolean): void {
    const processBtn = this.container.querySelector('#process-btn') as HTMLButtonElement;
    if (processBtn && !this.isProcessing) {
      processBtn.disabled = !enabled;
    }
  }
}
