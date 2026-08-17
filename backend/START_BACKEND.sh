#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Backend Setup...${NC}"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo -e "${BLUE}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo -e "${BLUE}⬇️  Installing dependencies...${NC}"
pip install -r requirements.txt

# Configure ports
echo -e "${BLUE}🔌 Configuring ports...${NC}"
python3 port_config.py

# Start server
echo -e "${GREEN}✨ Starting server...${NC}"
python3 -m src.main
