#!/bin/bash

# Install script for gemini-summarize
# Installs the tool to a directory in your PATH

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Default install location
INSTALL_DIR="/usr/local/bin"
SCRIPT_NAME="gemini-summarize"

# Show help if requested
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Usage: $0 [install_directory]"
    echo ""
    echo "Installs gemini-summarize to a directory in your PATH"
    echo ""
    echo "Arguments:"
    echo "  install_directory    Directory to install to (default: /usr/local/bin)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Install to /usr/local/bin"
    echo "  $0 ~/bin             # Install to ~/bin"
    echo "  $0 /opt/gemini       # Install to /opt/gemini"
    echo ""
    echo "Note: Make sure the install directory exists and is writable"
    exit 0
fi

# Check if user wants to install to a different location
if [[ "$1" != "" ]]; then
    INSTALL_DIR="$1"
fi

echo "🔧 Installing gemini-summarize to $INSTALL_DIR..."

# Check if install directory exists and is writable
if [[ ! -d "$INSTALL_DIR" ]]; then
    echo "❌ Error: Install directory $INSTALL_DIR does not exist"
    echo "Please create it first or specify a different location:"
    echo "  sudo mkdir -p $INSTALL_DIR"
    echo "  sudo chown \$USER:\$USER $INSTALL_DIR"
    exit 1
fi

if [[ ! -w "$INSTALL_DIR" ]]; then
    echo "❌ Error: Install directory $INSTALL_DIR is not writable"
    echo "Please make it writable:"
    echo "  sudo chown \$USER:\$USER $INSTALL_DIR"
    exit 1
fi

# Copy the shell script to the install directory
cp "$PROJECT_DIR/gemini-summarize.sh" "$INSTALL_DIR/$SCRIPT_NAME"
chmod +x "$INSTALL_DIR/$SCRIPT_NAME"

echo "✅ Installed gemini-summarize to $INSTALL_DIR/$SCRIPT_NAME"
echo ""
echo "🚀 You can now run the tool from anywhere:"
echo "   gemini-summarize --help"
echo "   gemini-summarize analyze file.pdf"
echo "   gemini-summarize test"
echo ""
echo "📦 Make sure to install dependencies first:"
echo "   cd $PROJECT_DIR && pnpm install"
echo ""
echo "🔧 If you need to uninstall:"
echo "   rm $INSTALL_DIR/$SCRIPT_NAME"
