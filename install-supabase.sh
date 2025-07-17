#!/bin/bash

# Supabase CLI Installation Script for Linux

echo "Installing Supabase CLI..."

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

# Download the latest release
echo "Downloading Supabase CLI..."
wget -q https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz

# Extract the archive
echo "Extracting..."
tar xzf supabase_linux_amd64.tar.gz

# Move to user's local bin (no sudo required)
mkdir -p ~/.local/bin
mv supabase ~/.local/bin/

# Clean up
cd -
rm -rf $TEMP_DIR

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo ""
    echo "⚠️  Please add ~/.local/bin to your PATH by adding this line to your ~/.bashrc or ~/.zshrc:"
    echo ""
    echo "    export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
    echo "Then run: source ~/.bashrc"
else
    echo "✅ Supabase CLI installed successfully!"
    echo ""
    echo "Version: $(~/.local/bin/supabase --version)"
fi

echo ""
echo "After adding to PATH, verify installation with: supabase --version"