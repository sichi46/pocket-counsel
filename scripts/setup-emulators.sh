#!/bin/bash

# Firebase Emulators Setup Script
echo "🎯 Setting up Firebase Emulators for Pocket Counsel..."

# Create firebase.json if it doesn't exist
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found. Please run firebase init first."
    exit 1
fi

# Update firebase.json to include emulators configuration
cat > firebase.json << 'EOF'
{
  "hosting": {
    "public": "apps/web/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
EOF

echo "✅ Firebase emulators configured!"
echo ""
echo "🎮 Available emulator commands:"
echo "   firebase emulators:start          # Start all emulators"
echo "   firebase emulators:start --only hosting,functions,firestore  # Start specific emulators"
echo "   firebase emulators:start --import ./emulator-data  # Start with imported data"
echo "   firebase emulators:export ./emulator-data          # Export emulator data"
echo ""
echo "🌐 Emulator URLs:"
echo "   - Emulator UI: http://localhost:4000"
echo "   - Hosting: http://localhost:5000"
echo "   - Functions: http://localhost:5001"
echo "   - Firestore: http://localhost:8080"
echo "   - Auth: http://localhost:9099"
echo ""
echo "📝 Next steps:"
echo "   1. Run: firebase emulators:start"
echo "   2. Open: http://localhost:4000 (Emulator UI)"
echo "   3. Test your app at: http://localhost:5000" 