import google.generativeai as genai
import os

# Configure Gemini
GEMINI_API_KEY = 'AIzaSyBqgIlp8oVXm5HxWMcPalsDX3n15MOLuaE'
genai.configure(api_key=GEMINI_API_KEY)

print("Testing Gemini API...")

# List available models
print("\nAvailable models:")
try:
    for m in genai.list_models():
        print(f"  - {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")

# Test with a simple prompt using gemini-1.5-flash
print("\nTesting text generation...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("What is plant disease detection? Answer in one sentence.")
    print(f"Response: {response.text}")
    print("✅ Gemini API is working!")
except Exception as e:
    print(f"❌ Error: {e}")