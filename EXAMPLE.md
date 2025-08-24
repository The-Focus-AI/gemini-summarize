# Example Usage

## Setup

The tool automatically fetches the Google Gemini API key from 1Password:

1. **1Password CLI**: Make sure you have `op` command installed and authenticated
2. **API Key**: Ensure you have a "Google AI Studio Key" item in your 1Password Development vault

Alternatively, you can set the API key manually:
```bash
export GOOGLE_GENERATIVE_AI_API_KEY="your-api-key-here"
```

## Usage Examples

### Analyze a single file
```bash
# Analyze a PDF file
pnpm start analyze ~/Downloads/document.pdf

# Analyze an EPUB file
pnpm start analyze ~/Desktop/book.epub

# Use a specific Gemini model
pnpm start analyze document.pdf --model gemini-2.5-flash

# Skip cache and force re-analysis
pnpm start analyze document.pdf --no-cache
```

### Test with sample files
```bash
# This will automatically find PDF/EPUB files in Downloads and Desktop
pnpm start test
```

### Manage cache
```bash
# List all cached files
pnpm start cache --list

# Clear all cached results
pnpm start cache --clear
```

## Expected Output

When you run the tool successfully, you'll see output like this:

```
🔍 Analyzing document.pdf with gemini-2.5-flash...
🔑 Fetching Google Gemini API key from 1Password...
📄 Created truncated PDF with 3 pages for faster analysis
📋 Analysis complete:
📖 Title: The Great Gatsby (confidence: 0.95)
👤 Author: F. Scott Fitzgerald (confidence: 0.98)
📄 Type: book (confidence: 0.92)
📝 Summary: A classic American novel about the Jazz Age... (confidence: 0.88)
```

## Performance Optimizations

- **PDF Truncation**: For PDF files, only the first 3 pages are sent to Gemini for faster analysis
- **1Password Integration**: API keys are automatically fetched from 1Password
- **Caching**: Results are cached to avoid re-analyzing unchanged files

## Cache Behavior

- The tool automatically caches results in `.cache/document-cache.json`
- If you analyze the same file again, it will use cached results
- If the file has changed (detected by MD5 hash), it will re-analyze
- Use `--no-cache` to force re-analysis
