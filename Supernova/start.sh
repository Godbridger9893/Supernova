#!/usr/bin/env bash
# ==============================================================================
# SUPERNOVA - 1-Click Launch Script for macOS
# ==============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=================================================================="
echo "⚡ Starting SUPERNOVA macOS AI Desktop Assistant..."
echo "=================================================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed or not in PATH."
    exit 1
fi

# Optional Virtual Environment setup
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment (.venv)..."
    python3 -m venv .venv || true
fi

if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "🔍 Checking dependencies..."
    pip install -q -r requirements.txt || true
fi

# Launch Supernova
echo "🚀 Launching SUPERNOVA Core..."
python3 run.py
