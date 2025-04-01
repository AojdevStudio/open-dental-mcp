import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(projectRoot, '.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

const PORT = 3000;

// Initialize OpenAI client (used only for embeddings)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || `http://${process.env.QDRANT_HOST || 'localhost'}:${process.env.QDRANT_PORT || '6333'}`
});

// Qdrant collection name
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'open_dental_docs';

// Helper function to generate embeddings
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Create an HTTP server
const server = http.createServer(async (req, res) => {
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

        let response;

        if (tool_name === 'query_vector_store') {
          const { query, limit = 5, filter_type } = params;
          
          // Generate embedding for the query
          const embedding = await generateEmbedding(query);
          
          // Prepare filter if a type is specified
          let filter = undefined;
          if (filter_type) {
            filter = {
              must: [
                {
                  key: "metadata.type",
                  match: {
                    value: filter_type
                  }
                }
              ]
            };
          }
          
          // Search Qdrant
          const searchResult = await qdrantClient.search(COLLECTION_NAME, {
            vector: embedding,
            limit: limit,
            filter: filter,
            with_payload: true
          });
          
          if (!searchResult || searchResult.length === 0) {
            response = {
              content: [{ type: "text", text: "I couldn't find any relevant information in the OpenDental documentation." }]
            };
          } else {
            // Prepare the response
            let responseText = "Here's what I found in the OpenDental documentation:\n\n";
            
            // Add each result
            searchResult.forEach((result, index) => {
              // Handle different payload structures
              const payload = result.payload as Record<string, any>;
              const metadata = (payload?.metadata || {}) as Record<string, any>;
              
              const title = payload?.title || 
                          metadata?.title || 
                          "Untitled Section";
              
              const type = payload?.type || 
                          metadata?.type || 
                          "Unknown";
              
              const text = payload?.text || 
                          payload?.content || 
                          "No content available";
              
              const score = result.score.toFixed(2);
              
              responseText += `## ${index + 1}. ${title} (${type}, Score: ${score})\n\n`;
              responseText += `${text}\n\n`;
            });
            
            response = {
              content: [{ type: "text", text: responseText }],
              data: { results: searchResult }
            };
          }
        } else if (tool_name === 'list_collections') {
          const collections = await qdrantClient.getCollections();
          response = {
            content: [{ 
              type: "text", 
              text: `Available Qdrant Collections:\n${collections.collections.map(c => `- ${c.name}`).join('\n') || 'None found.'}`
            }]
          };
        } else {
          response = {
            content: [{ type: "text", text: `Unsupported tool: ${tool_name}` }],
            isError: true
          };
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error: any) {
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
  console.log(`Using Qdrant collection: ${COLLECTION_NAME}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});