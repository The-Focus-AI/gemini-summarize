import { spawn } from 'child_process';

export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private cachedKey: string | null = null;

  private constructor() {}

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  async getGeminiApiKey(): Promise<string> {
    // First check if already cached
    if (this.cachedKey) {
      return this.cachedKey;
    }

    // Check environment variable first
    const envKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (envKey) {
      this.cachedKey = envKey;
      return envKey;
    }

    // Try to get from 1Password
    try {
      console.log('🔑 Fetching Google Gemini API key from 1Password...');
      const key = await this.getFrom1Password();
      this.cachedKey = key;
      return key;
    } catch (error) {
      console.error('❌ 1Password error:', error);
      throw new Error(
        'Google Gemini API key not found. Please either:\n' +
        '1. Set GOOGLE_GENERATIVE_AI_API_KEY environment variable, or\n' +
        '2. Ensure you have a "Google AI Studio Key" item in your 1Password Development vault\n' +
        `3. Original error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async getFrom1Password(): Promise<string> {
    return new Promise((resolve, reject) => {
      const op = spawn('op', [
        'item', 'get', 'Google AI Studio Key',
        '--vault', 'Development',
        '--format', 'json'
      ], {
        stdio: ['inherit', 'pipe', 'pipe'] // Allow interactive input, pipe output
      });

      let stdout = '';
      let stderr = '';

      op.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      op.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      op.on('close', (code) => {
        if (code === 0) {
          try {
            const item = JSON.parse(stdout);
            // Look for the API key in the notes field
            if (item.fields) {
              for (const field of item.fields) {
                if (field.id === 'notesPlain' && field.value) {
                  resolve(field.value.trim());
                  return;
                }
              }
            }
            reject(new Error('API key not found in 1Password item'));
          } catch (parseError) {
            reject(new Error(`Failed to parse 1Password response: ${parseError}`));
          }
        } else {
          reject(new Error(`1Password command failed: ${stderr}`));
        }
      });

      op.on('error', (error) => {
        reject(new Error(`Failed to execute 1Password command: ${error.message}`));
      });
    });
  }

  clearCache(): void {
    this.cachedKey = null;
  }
}
