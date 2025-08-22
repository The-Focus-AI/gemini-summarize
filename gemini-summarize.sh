#!/bin/bash

# gemini-summarize - Extract metadata from PDF and EPUB files using Google Gemini
# This script can be copied to /usr/local/bin or any directory in your PATH

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if we're running from the project directory or from PATH
if [[ -f "$SCRIPT_DIR/package.json" ]]; then
    # Running from project directory
    PROJECT_DIR="$SCRIPT_DIR"
else
    # Running from PATH, need to find the project directory
    # Look for common locations
    POSSIBLE_PATHS=(
        "$HOME/The-Focus-AI/gemini-summarize"
        "$HOME/Projects/gemini-summarize"
        "$HOME/gemini-summarize"
        "/opt/gemini-summarize"
    )
    
    PROJECT_DIR=""
    for path in "${POSSIBLE_PATHS[@]}"; do
        if [[ -f "$path/package.json" ]]; then
            PROJECT_DIR="$path"
            break
        fi
    done
    
    if [[ -z "$PROJECT_DIR" ]]; then
        echo "❌ Error: Could not find gemini-summarize project directory."
        echo "Please set the GEMINI_SUMMARIZE_DIR environment variable to point to the project directory."
        echo "Example: export GEMINI_SUMMARIZE_DIR=\"/path/to/gemini-summarize\""
        exit 1
    fi
fi

# Check if dependencies are installed
if [[ ! -d "$PROJECT_DIR/node_modules" ]]; then
    echo "❌ Error: Dependencies not installed. Please run 'pnpm install' in $PROJECT_DIR"
    exit 1
fi

# Check if the source file exists
if [[ ! -f "$PROJECT_DIR/src/index.ts" ]]; then
    echo "❌ Error: Source file not found at $PROJECT_DIR/src/index.ts"
    exit 1
fi

# Run the tool using tsx
# Change to project directory but preserve original working directory for file resolution
ORIGINAL_PWD="$PWD"
cd "$PROJECT_DIR"

# Pass the original working directory as an environment variable
export ORIGINAL_PWD

exec npx tsx src/index.ts "$@"
