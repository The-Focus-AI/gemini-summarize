# Gemini Summarize

A command line tool that extracts metadata from PDF and EPUB files using Google Gemini AI. The tool can identify the title, author, document type (book/paper/article), and provide a summary of the content.

## Features

- 📄 Supports PDF and EPUB files
- 🤖 Uses Google Gemini AI for intelligent document analysis
- 🔑 Automatic API key management via 1Password
- ⚡ Fast analysis using truncated PDFs (first 3 pages)
- 💾 Caching system to avoid re-analyzing unchanged files
- 🧪 Test mode to analyze files from Downloads and Desktop
- 📊 Confidence scores for each extracted field

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-summarize
```

2. Install dependencies:
```bash
pnpm install
```

3. Build the project:
```bash
pnpm build
```

## Setup

The tool automatically fetches the Google Gemini API key from 1Password. Make sure you have:

1. **1Password CLI installed** and authenticated
2. **A "Google AI Studio Key" item** in your 1Password Development vault containing the API key

Alternatively, you can set the API key as an environment variable:

```bash
export GOOGLE_GENERATIVE_AI_API_KEY="your-api-key-here"
```

## Usage

### Analyze a single file

```bash
# Basic usage
pnpm start analyze path/to/document.pdf

# Use a specific Gemini model
pnpm start analyze path/to/document.pdf --model gemini-2.5-flash

# Skip cache and force re-analysis
pnpm start analyze path/to/document.pdf --no-cache
```

### Test with sample files

The tool can automatically find and test PDF/EPUB files in your Downloads and Desktop folders:

```bash
pnpm start test
```

### Manage cache

```bash
# List all cached files
pnpm start cache --list

# Clear all cached results
pnpm start cache --clear
```

## Output Format

The tool outputs structured metadata with confidence scores:

```
📖 Title: The Great Gatsby (confidence: 0.95)
👤 Author: F. Scott Fitzgerald (confidence: 0.98)
📄 Type: book (confidence: 0.92)
📝 Summary: A classic American novel about the Jazz Age... (confidence: 0.88)
```

## Supported Models

- `gemini-2.0-flash` (default)
- `gemini-2.5-flash`
- `gemini-1.5-flash`
- Other Gemini models as available

## Cache System

The tool maintains a cache in the `.cache` directory to avoid re-analyzing unchanged files. The cache includes:

- File path
- Extracted metadata
- Timestamp
- File hash (MD5) for change detection

## Development

```bash
# Run in development mode
pnpm dev analyze path/to/document.pdf

# Build for production
pnpm build
```

## Requirements

- Node.js 18+
- Google Gemini API key
- PDF or EPUB files to analyze

## License

MIT
