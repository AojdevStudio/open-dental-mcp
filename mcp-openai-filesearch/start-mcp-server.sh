#!/bin/bash

# Navigate to the server directory
cd "$(dirname "$0")/mcp-openai-filesearch"

# Run the server - since we're already in the correct directory, we use the relative path
exec node dist/server.js 