#!/bin/bash

# Navigate to the server directory
cd "$(dirname "$0")"

# Run the server - since we're already in the correct directory, we use the relative path
exec node mcp-openai-filesearch/dist/server-qdrant.js 