// Simple REST server for MCP tools
const http = require('http');
const { spawn } = require('child_process');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');

// Load environment variables from .env
require('dotenv').config();

const PORT = 3000;

// Start the MCP server process
const startMcpServer = () => {
  console.log('Starting MCP server process...');
  const nodeProcess = spawn('node', ['dist/server-qdrant.js'], {
    stdio: ['pipe', 'pipe', 'pipe'] // stdin, stdout, stderr
  });

  nodeProcess.stdout.on('data', (data) => {
    console.log(`MCP stdout: ${data}`);
  });

  nodeProcess.stderr.on('data', (data) => {
    console.error(`MCP stderr: ${data}`);
  });

  nodeProcess.on('close', (code) => {
    console.log(`MCP server process exited with code ${code}`);
  });

  return nodeProcess;
};

// Create an HTTP server
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/mcp-tools') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { tool_name, params } = JSON.parse(body);
        console.log(`Received request for tool: ${tool_name}`);
        console.log(`Params: ${JSON.stringify(params)}`);

        // Execute the tool on the MCP server (normally would call methods)
        // For now, just return a mock response
        const response = {
          success: true,
          tool_name,
          content: [{ type: "text", text: `Executed ${tool_name} with params ${JSON.stringify(params)}` }],
          data: {
            fileId: "file_mock_123456",
            vectorStoreId: process.env.OPENDENTAL_VECTOR_STORE_ID
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        console.error('Error processing request:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`REST API server listening on port ${PORT}`);
  console.log(`MCP vector store ID: ${process.env.OPENDENTAL_VECTOR_STORE_ID}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
