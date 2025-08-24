# Gemini Summarize

A command line tool that extracts metadata from PDF and EPUB files using Google Gemini AI. The tool can identify the title, author, document type (book/paper/article), and provide a summary of the content.

## Features

- 📄 Supports PDF and EPUB files
- 🤖 Uses Google Gemini AI for intelligent document analysis
- 🔑 Automatic API key management via 1Password
- ⚡ Fast analysis using truncated PDFs (first 3 pages)
- 💾 Smart caching system with file hash validation
- 🧪 Test mode to analyze files from Downloads and Desktop
- 📊 Confidence scores for each extracted field
- 🌐 Works from any directory with proper path resolution
- ⚡ Clean process termination (no hanging)

## Installation

### Local Installation

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

### System-wide Installation

To install the tool system-wide so you can run it from anywhere:

1. **Install to default location** (`/usr/local/bin`):
```bash
./scripts/install.sh
```

2. **Install to custom location** (e.g., `~/bin`):
```bash
./scripts/install.sh ~/bin
```

3. **Make sure the directory is in your PATH** (if using custom location):
```bash
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

After installation, you can run the tool from anywhere:
```bash
gemini-summarize --help
gemini-summarize analyze document.pdf
gemini-summarize test
```

### Uninstall

To remove the system-wide installation:
```bash
rm /usr/local/bin/gemini-summarize  # or wherever you installed it
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
# Basic usage (works from any directory)
gemini-summarize analyze document.pdf
gemini-summarize analyze ~/Downloads/document.pdf
gemini-summarize analyze ../path/to/document.pdf

# Use a specific Gemini model
gemini-summarize analyze document.pdf --model gemini-2.5-flash

# Skip cache and force re-analysis
gemini-summarize analyze document.pdf --no-cache
```

### Test with sample files

The tool can automatically find and test PDF/EPUB files in your Downloads and Desktop folders:

```bash
gemini-summarize test
```

### Manage cache

```bash
# List all cached files
gemini-summarize cache --list

# Clear all cached results
gemini-summarize cache --clear
```

### Test Gemini API connection

```bash
# Test if Gemini API is working
gemini-summarize test-gemini
```

## Output Format

The tool outputs structured metadata with confidence scores:

```
🔍 Analyzing document.pdf with gemini-2.5-flash...
🔑 Fetching Google Gemini API key from 1Password...
📄 Created truncated PDF with 3 pages for faster analysis
📁 Stored at: /path/to/truncated.pdf
🤖 Creating conversation with Gemini...
📎 Adding file attachment...
🏃 Starting Gemini analysis...
✅ Gemini analysis completed successfully
📊 Response metadata: { provider: 'google', model: 'gemini-2.5-flash', tokenUsage: {...} }
📋 Analysis complete:
📖 Title: The Great Gatsby (confidence: 0.95)
👤 Author: F. Scott Fitzgerald (confidence: 0.98)
📄 Type: book (confidence: 0.92)
📝 Summary: A classic American novel about the Jazz Age... (confidence: 0.88)
```

## Supported Models

- `gemini-2.5-flash` (default)
- `gemini-2.5-flash`
- `gemini-1.5-flash`
- Other Gemini models as available

## Cache System

The tool maintains a cache in the `.cache` directory to avoid re-analyzing unchanged files. The cache includes:

- File path
- Extracted metadata
- Timestamp
- File hash (MD5) for change detection

### Cache Behavior

- **Automatic**: Results are cached after each analysis
- **Smart Invalidation**: Files are re-analyzed if their content changes (detected by MD5 hash)
- **Path Resolution**: Works with relative and absolute paths
- **Cross-directory**: Cache works regardless of which directory you run the command from

## Performance Optimizations

- **PDF Truncation**: Only the first 3 pages are sent to Gemini for faster analysis
- **1Password Integration**: API keys are automatically fetched from 1Password
- **Smart Caching**: Results are cached to avoid re-analyzing unchanged files
- **Clean Termination**: Process exits cleanly after completion (no hanging)
- **Path Resolution**: Works from any directory with proper relative path handling

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

## Troubleshooting

### Common Issues

**Tool hangs after analysis:**
- ✅ Fixed! The tool now exits cleanly after completion

**File not found errors:**
- ✅ Fixed! The tool now properly resolves relative paths from any directory
- Use relative paths like `document.pdf` or absolute paths like `~/Downloads/document.pdf`

**1Password not found:**
- Ensure 1Password CLI is installed: `brew install 1password-cli`
- Authenticate with 1Password: `op signin`

**API key not found:**
- Ensure you have a "Google AI Studio Key" item in your 1Password Development vault
- Or set the environment variable: `export GOOGLE_GENERATIVE_AI_API_KEY="your-key"`

**Dependencies not installed:**
- Run `pnpm install` in the project directory
- Ensure you're in the correct project directory when running the tool

## License

MIT
