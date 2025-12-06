#!/bin/sh

# Generate runtime config file
cat <<EOF > /usr/share/nginx/html/config.js
window.ENV = {
  VITE_API_URL: "${VITE_API_URL:-http://localhost:3000/api}"
};
EOF

echo "Runtime config generated:"
cat /usr/share/nginx/html/config.js

# Execute the CMD (nginx)
exec "$@"