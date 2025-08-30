#!/usr/bin/env python3
"""
Simple Python test runner for Pocket Counsel Vector Search
This can be run on any platform without shell scripts
"""

import os
import sys
import subprocess
import platform

def check_python():
    """Check if Python is available and has required packages"""
    print("🔍 Checking Python environment...")
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} detected")
    
    # Check required packages
    required_packages = ['vertexai', 'google.cloud.aiplatform', 'google.cloud.storage']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package} is available")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package} is missing")
    
    if missing_packages:
        print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing_packages)
            print("✅ Packages installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install packages: {e}")
            return False
    
    return True

def check_gcloud_auth():
    """Check if user is authenticated with Google Cloud"""
    print("\n🔐 Checking Google Cloud authentication...")
    
    try:
        # Check if gcloud is available
        result = subprocess.run(['gcloud', 'auth', 'list', '--filter=status:ACTIVE', '--format=value(account)'], 
                              capture_output=True, text=True, check=True)
        
        if result.stdout.strip():
            print(f"✅ Authenticated as: {result.stdout.strip()}")
            return True
        else:
            print("❌ Not authenticated with Google Cloud")
            return False
            
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ gcloud CLI not found or not working")
        print("   Please install Google Cloud SDK and run: gcloud auth login")
        return False

def set_environment():
    """Set environment variables for the test"""
    print("\n📋 Setting environment variables...")
    
    # Set default values
    env_vars = {
        'GOOGLE_CLOUD_PROJECT': 'pocket-counsel',
        'VERTEX_AI_LOCATION': 'us-central1',
        'VERTEX_AI_INDEX_ID': '849546455294148608'
    }
    
    # Check if already set
    for var, default_value in env_vars.items():
        current_value = os.environ.get(var, default_value)
        if var in os.environ:
            print(f"   {var}: {current_value} (from environment)")
        else:
            print(f"   {var}: {current_value} (default)")
            os.environ[var] = current_value
    
    return env_vars

def run_test():
    """Run the vector search test"""
    print("\n🧪 Running Vector Search Test...")
    print("=" * 50)
    
    # Change to scripts directory
    script_dir = os.path.join(os.path.dirname(__file__), 'scripts')
    if os.path.exists(script_dir):
        os.chdir(script_dir)
    
    # Run the test script
    test_script = "test_vector_search.py"
    if not os.path.exists(test_script):
        print(f"❌ Test script not found: {test_script}")
        return False
    
    try:
        # Import and run the test
        sys.path.insert(0, os.getcwd())
        from test_vector_search import main
        main()
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Pocket Counsel Vector Search Test Runner")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("scripts/test_vector_search.py"):
        print("❌ Error: Please run this script from the project root directory")
        print(f"   Current directory: {os.getcwd()}")
        print(f"   Expected: scripts/test_vector_search.py")
        return 1
    
    # Check Python environment
    if not check_python():
        return 1
    
    # Check Google Cloud authentication
    if not check_gcloud_auth():
        print("\n💡 To authenticate with Google Cloud:")
        print("   1. Install Google Cloud SDK")
        print("   2. Run: gcloud auth login")
        print("   3. Run: gcloud config set project pocket-counsel")
        return 1
    
    # Set environment variables
    env_vars = set_environment()
    
    # Run the test
    success = run_test()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("📄 Check the generated results file for detailed information")
        return 0
    else:
        print("\n❌ Test failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
