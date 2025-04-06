#!/usr/bin/env python3
"""
Setup script to ensure Ollama is installed and the required models are available.
This script will:
1. Check if Ollama is installed and running
2. Pull the required models if they're not already available
"""

import os
import subprocess
import sys
import time
import requests
import platform
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("setup_ollama")

# These are the exact model names used by Ollama
REQUIRED_MODELS = ["gemma:2b", "phi3:mini"]
OLLAMA_URL = "http://localhost:11434"

def print_step(message):
    """Print a step message with formatting."""
    logger.info(message)
    print(f"\n{'='*80}\n{message}\n{'='*80}")

def check_ollama_installed():
    """Check if Ollama is installed on the system."""
    print_step("Checking if Ollama is installed...")
    
    try:
        if platform.system() == "Windows":
            result = subprocess.run(["where", "ollama"], capture_output=True, text=True)
        else:
            result = subprocess.run(["which", "ollama"], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Ollama is installed")
            logger.info(f"Ollama found at: {result.stdout.strip()}")
            return True
        else:
            print("❌ Ollama is not installed")
            logger.warning("Ollama executable not found in PATH")
            return False
    except Exception as e:
        print(f"❌ Error checking Ollama installation: {e}")
        logger.error(f"Error checking Ollama installation: {e}")
        return False

def install_ollama():
    """Install Ollama based on the platform."""
    print_step("Installing Ollama...")
    
    system = platform.system().lower()
    logger.info(f"Installing Ollama on {system}")
    
    if system == "linux":
        print("Installing Ollama on Linux...")
        try:
            # Use a safer approach for Linux installation
            download_cmd = ["curl", "-fsSL", "https://ollama.com/install.sh", "-o", "ollama_install.sh"]
            subprocess.run(download_cmd, check=True)
            
            # Make executable
            subprocess.run(["chmod", "+x", "ollama_install.sh"], check=True)
            
            # Run the installer
            install_cmd = ["bash", "ollama_install.sh"]
            subprocess.run(install_cmd, check=True)
            
            # Clean up
            subprocess.run(["rm", "ollama_install.sh"], check=True)
            
            print("✅ Ollama installed successfully")
            logger.info("Ollama installation completed successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to install Ollama: {e}")
            logger.error(f"Failed to install Ollama: {e}")
            print("Please visit https://ollama.com/ and follow the manual installation instructions")
            return False
    elif system == "darwin":  # macOS
        print("Installing Ollama on macOS...")
        print("Please download and install from: https://ollama.com/download/mac")
        print("After installation, run this script again.")
        logger.info("Directed user to manual macOS installation")
        return False
    elif system == "windows":
        print("Installing Ollama on Windows...")
        print("Please download and install from: https://ollama.com/download/windows")
        print("After installation, run this script again.")
        logger.info("Directed user to manual Windows installation")
        return False
    else:
        print(f"❌ Unsupported platform: {system}")
        logger.warning(f"Unsupported platform: {system}")
        print("Please visit https://ollama.com/ and follow the manual installation instructions")
        return False

def check_ollama_running():
    """Check if Ollama server is running."""
    print_step("Checking if Ollama server is running...")
    
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama server is running")
            logger.info("Ollama server is running")
            return True
        else:
            print(f"❌ Ollama server returned unexpected status code: {response.status_code}")
            logger.warning(f"Ollama server returned unexpected status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Ollama server is not running")
        logger.warning("Ollama server is not running (connection error)")
        return False
    except Exception as e:
        print(f"❌ Error checking Ollama server: {e}")
        logger.error(f"Error checking Ollama server: {e}")
        return False

def start_ollama():
    """Start the Ollama server."""
    print_step("Starting Ollama server...")
    
    try:
        # Use subprocess.Popen to start in background
        if platform.system() == "Windows":
            subprocess.Popen(["ollama", "serve"], creationflags=subprocess.CREATE_NEW_CONSOLE)
            logger.info("Started Ollama server on Windows")
        else:
            log_file = open("ollama_server.log", "w")
            subprocess.Popen(
                ["ollama", "serve"], 
                stdout=log_file, 
                stderr=log_file, 
                start_new_session=True
            )
            logger.info("Started Ollama server on Unix-like system")
        
        # Wait for server to start
        print("Waiting for Ollama server to start...")
        for i in range(15):  # Try for 15 seconds
            time.sleep(1)
            print(f"  Checking... ({i+1}/15)", end="\r")
            try:
                response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=2)
                if response.status_code == 200:
                    print("\n✅ Ollama server started successfully")
                    logger.info("Ollama server started successfully")
                    return True
            except:
                pass
        
        print("\n❌ Timed out waiting for Ollama server to start")
        logger.warning("Timed out waiting for Ollama server to start")
        return False
    except Exception as e:
        print(f"❌ Error starting Ollama server: {e}")
        logger.error(f"Error starting Ollama server: {e}")
        return False

def get_available_models():
    """Get list of models already available in Ollama."""
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            models = [model['name'] for model in response.json().get('models', [])]
            logger.info(f"Available models: {models}")
            return models
        logger.warning(f"Failed to get models, status code: {response.status_code}")
        return []
    except Exception as e:
        logger.error(f"Error getting available models: {e}")
        return []

def model_exists(model_name, available_models):
    """Check if a model exists, handling different naming formats."""
    if model_name in available_models:
        return True
        
    # Handle variations in naming (e.g., gemma:2b might appear as gemma2:b)
    normalized_name = model_name.replace(':', '').replace('-', '').lower()
    for available in available_models:
        normalized_available = available.replace(':', '').replace('-', '').lower()
        if normalized_name == normalized_available:
            logger.info(f"Model {model_name} matches available model {available}")
            return True
            
    return False

def pull_model(model_name):
    """Pull a model using the Ollama CLI."""
    print(f"Pulling model {model_name}...")
    logger.info(f"Pulling model {model_name}")
    
    try:
        process = subprocess.Popen(
            ["ollama", "pull", model_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        
        # Print output in real-time
        for line in iter(process.stdout.readline, ''):
            print(line.strip())
            if not line:
                break
        
        process.wait()
        
        if process.returncode == 0:
            print(f"✅ Successfully pulled {model_name}")
            logger.info(f"Successfully pulled {model_name}")
            return True
        else:
            print(f"❌ Failed to pull {model_name}")
            logger.error(f"Failed to pull {model_name}, return code: {process.returncode}")
            return False
    except Exception as e:
        print(f"❌ Error pulling model {model_name}: {e}")
        logger.error(f"Error pulling model {model_name}: {e}")
        return False

def main():
    """Main function to set up Ollama and required models."""
    print_step("Setting up Ollama for the Banking Data Product Builder")
    logger.info("Starting Ollama setup")
    
    # Check if Ollama is installed
    if not check_ollama_installed():
        if not install_ollama():
            print("Please install Ollama manually and run this script again.")
            logger.error("Ollama installation failed")
            sys.exit(1)
    
    # Check if Ollama server is running
    if not check_ollama_running():
        if not start_ollama():
            print("Please start Ollama server manually and run this script again.")
            print("You can start it by running 'ollama serve' in a terminal.")
            logger.error("Failed to start Ollama server")
            sys.exit(1)
    
    # Get available models
    print_step("Checking available models...")
    available_models = get_available_models()
    print(f"Currently available models: {', '.join(available_models) if available_models else 'None'}")
    
    # Check for models with possible naming variations
    models_to_pull = []
    for required_model in REQUIRED_MODELS:
        if not model_exists(required_model, available_models):
            models_to_pull.append(required_model)
    
    if not models_to_pull:
        print("✅ All required models are already available!")
        logger.info("All required models are already available")
    else:
        print_step(f"Pulling {len(models_to_pull)} required models...")
        logger.info(f"Need to pull {len(models_to_pull)} models: {models_to_pull}")
        for model in models_to_pull:
            if not pull_model(model):
                print(f"❌ Failed to pull {model}. You may need to manually pull it later with 'ollama pull {model}'")
                
                # Try an alternative model name if the original fails
                if ":" in model:
                    alt_model = model.replace(":", "")
                    print(f"Trying alternative model name: {alt_model}")
                    logger.info(f"Trying alternative model name: {alt_model}")
                    if not pull_model(alt_model):
                        print(f"❌ Also failed to pull alternative model name {alt_model}")
                        logger.error(f"Failed to pull alternative model name {alt_model}")
    
    # Final check with refreshed model list
    print_step("Setup complete!")
    available_models = get_available_models()
    
    # Check if all required models are available (including variations)
    all_available = all(model_exists(model, available_models) for model in REQUIRED_MODELS)
    
    if all_available:
        print("✅ All required models are now available!")
        logger.info("All required models are now available")
        print("\nYou can now run the Flask app with: python web.py")
    else:
        missing = [model for model in REQUIRED_MODELS if not model_exists(model, available_models)]
        print(f"⚠️ Some required models are still missing: {', '.join(missing)}")
        logger.warning(f"Some required models are still missing: {missing}")
        print("\nYou can try to pull them manually with:")
        for model in missing:
            print(f"  ollama pull {model}")
            # Suggest alternative model name
            if ":" in model:
                alt_model = model.replace(":", "")
                print(f"  or try: ollama pull {alt_model}")
    
    print("\nRecommended Next Steps:")
    print("1. Run the Flask app: python web.py")
    print("2. In another terminal, start the React app: cd llama-web && npm run dev")
    logger.info("Setup script completed")

if __name__ == "__main__":
    main() 