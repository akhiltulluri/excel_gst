export class ResultsView {
  private container: HTMLElement;
  private hasResult: boolean = false;
  private resultFilename: string = '';

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = element;
    this.render();
  }

  private render(): void {
    if (!this.hasResult) {
      this.container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">Results</h2>
          <p class="text-sm text-gray-500">Process files to see results here</p>
        </div>
      `;
    } else {
      this.container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">Results</h2>

          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div class="flex items-center space-x-2">
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-green-800 font-medium">Processing completed successfully!</p>
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-sm text-gray-700">
              Your result file has been generated and downloaded automatically.
            </p>

            <div class="bg-gray-50 p-3 rounded">
              <p class="text-xs text-gray-600">Filename</p>
              <p class="text-sm font-mono">${this.resultFilename}</p>
            </div>

            <button
              id="reset-btn"
              class="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Process New Files
            </button>
          </div>
        </div>
      `;

      this.attachEventListeners();
    }
  }

  private attachEventListeners(): void {
    const resetBtn = this.container.querySelector('#reset-btn');
    resetBtn?.addEventListener('click', () => {
      this.reset();
      // Trigger page reload to reset everything
      window.location.reload();
    });
  }

  showSuccess(filename: string): void {
    this.hasResult = true;
    this.resultFilename = filename;
    this.render();
  }

  reset(): void {
    this.hasResult = false;
    this.resultFilename = '';
    this.render();
  }
}
