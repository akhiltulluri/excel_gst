import { AppConfig } from '../types/config.types';
import { DEFAULT_CONFIG } from '../utils/constants';

export class ConfigManager {
  private config: AppConfig;

  constructor(config?: AppConfig) {
    this.config = config || JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  getConfig(): AppConfig {
    return this.config;
  }

  setConfig(config: AppConfig): void {
    this.config = config;
  }

  resetToDefault(): void {
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  exportToJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importFromJSON(jsonString: string): void {
    try {
      const parsed = JSON.parse(jsonString);
      if (this.validateConfig(parsed)) {
        this.config = parsed;
      } else {
        throw new Error('Invalid configuration structure');
      }
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error}`);
    }
  }

  private validateConfig(config: any): boolean {
    if (!config || typeof config !== 'object') return false;
    if (typeof config.useFilenameForMonth !== 'boolean') return false;
    if (!Array.isArray(config.sheetConfigs)) return false;

    for (const sheetConfig of config.sheetConfigs) {
      if (!sheetConfig.sheetName || typeof sheetConfig.sheetName !== 'string') return false;
      if (!sheetConfig.heading || typeof sheetConfig.heading !== 'string') return false;
      if (typeof sheetConfig.startColumn !== 'number') return false;
      if (!sheetConfig.columnMap || typeof sheetConfig.columnMap !== 'object') return false;
      if (!sheetConfig.checkMap || typeof sheetConfig.checkMap !== 'object') return false;
    }

    return true;
  }
}
