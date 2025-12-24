# 🔑 API Keys Configuration Guide

## 📋 Required API Keys for LingoLancers

### 🎯 **Essential Keys (Required for Core Features)**

#### 1. Azure OpenAI API Key
- **Purpose**: Powers the AI conversations and workflows
- **Get it from**: https://portal.azure.com → Azure OpenAI Service
- **Required**: YES (core functionality won't work without it)

#### 2. Azure Speech Services Key  
- **Purpose**: Voice input/output functionality
- **Get it from**: https://portal.azure.com → Speech Services
- **Required**: YES (for voice features)

#### 3. Gemini API Key
- **Purpose**: AI image generation and processing
- **Get it from**: https://makersuite.google.com/app/apikey
- **Required**: For AI image features

### 🔧 **Optional Keys (For Enhanced Features)**

#### 4. SERP API Key
- **Purpose**: Travel search and research features
- **Get it from**: https://serpapi.com/
- **Required**: For travel planning features

#### 5. Deepgram API Key
- **Purpose**: Alternative voice service
- **Get it from**: https://console.deepgram.com/
- **Required**: Optional (Azure Speech is primary)

## 🚀 **Quick Setup Options**

### Option 1: Minimal Setup (Core Features Only)
```bash
# Edit .env file with just these keys:
nano .env

# Add your keys:
AZURE_OPENAI_API_KEY=sk-your-actual-key-here
AZURE_SPEECH_KEY=your-actual-speech-key-here
AZURE_SPEECH_REGION=eastus
```

### Option 2: Full Setup (All Features)
```bash
# Add all API keys to .env file
AZURE_OPENAI_API_KEY=sk-your-actual-key-here
AZURE_SPEECH_KEY=your-actual-speech-key-here
AZURE_SPEECH_REGION=eastus
GEMINI_API_KEY=your-gemini-key-here
SERP_API_KEY=your-serp-key-here
```

## 📝 **How to Edit .env File**

### Method 1: Using nano (Terminal)
```bash
nano .env
# Edit the keys, then press Ctrl+X, Y, Enter to save
```

### Method 2: Using VS Code
```bash
code .env
# Edit and save normally
```

### Method 3: Using any text editor
```bash
open .env
# Edit with your preferred editor
```

## 🎯 **What to Replace**

Replace these placeholder values:
- `your_azure_openai_api_key_here` → Your actual Azure OpenAI key
- `your_azure_speech_key_here` → Your actual Azure Speech key  
- `your_azure_region_here` → Your Azure region (e.g., `eastus`)
- `your_gemini_api_key_here` → Your actual Gemini API key

## ⚡ **Quick Test Setup**

If you want to test Docker deployment without all APIs:
```bash
# Minimal working configuration
AZURE_OPENAI_API_KEY=test_key_for_docker_test
AZURE_SPEECH_KEY=test_key_for_docker_test
AZURE_SPEECH_REGION=eastus
GEMINI_API_KEY=test_key_for_docker_test
SERP_API_KEY=test_key_for_docker_test
```

**Note**: With test keys, the system will start but AI features won't work properly.

## 🚀 **After Adding Keys**

Once you've added your API keys:
```bash
# Run the startup script again
./start-production.sh
```

The script will:
1. ✅ Detect .env file exists
2. 🔨 Build Docker containers (3-5 minutes first time)
3. 🚀 Start all services
4. 🌐 Open at http://localhost:3000

## 🆘 **Don't Have API Keys Yet?**

### Get Azure OpenAI Access:
1. Visit: https://portal.azure.com
2. Create Azure OpenAI resource
3. Get API key from Keys and Endpoint section

### Get Azure Speech Key:
1. Visit: https://portal.azure.com  
2. Create Speech Services resource
3. Get key from Keys and Endpoint section

### Get Gemini API Key:
1. Visit: https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy the key

## 🎯 **Ready to Continue?**

After adding your API keys, run:
```bash
./start-production.sh
```

The system will build and start automatically!