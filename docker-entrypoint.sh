#!/bin/sh
set -e

# Generate config.json from environment variables at runtime
CONFIG_FILE="/usr/share/nginx/html/assets/config/config.json"
TEMPLATE_FILE="/tmp/config.template.json"

echo "Generating runtime configuration..."

# Use environment variables or defaults
MSAL_CLIENT_ID="${MSAL_CLIENT_ID:-YOUR_CLIENT_ID}"
MSAL_AUTHORITY="${MSAL_AUTHORITY:-https://login.microsoftonline.com/common}"
MSAL_REDIRECT_URI="${MSAL_REDIRECT_URI:-http://localhost:4200}"

# Create config.json from template
cat > "$CONFIG_FILE" <<EOF
{
  "msalConfig": {
    "auth": {
      "clientId": "$MSAL_CLIENT_ID",
      "authority": "$MSAL_AUTHORITY",
      "redirectUri": "$MSAL_REDIRECT_URI"
    },
    "cache": {
      "cacheLocation": "localStorage",
      "storeAuthStateInCookie": false
    }
  },
  "protectedResources": {
    "graphApi": {
      "endpoint": "https://graph.microsoft.com/v1.0/me",
      "scopes": ["user.read"]
    }
  }
}
EOF

echo "Configuration generated successfully:"
cat "$CONFIG_FILE"

# Start nginx
echo "Starting nginx..."
exec nginx -g "daemon off;"
