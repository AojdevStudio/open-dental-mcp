// Suppress Node.js experimental warnings
process.removeAllListeners('warning');

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { QdrantClient } from "@qdrant/js-client-rest";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// More robust .env loading
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(projectRoot, '.env');
console.error(`Attempting to load .env from: ${envPath}`);
dotenv.config({ path: envPath });

// --- Environment Variable Checks ---
if (!process.env.OPENAI_API_KEY) {
  console.error("FATAL: OPENAI_API_KEY environment variable is not set.");
  process.exit(1);
}

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

// MCP Server initialization
const server = new McpServer({
  name: "qdrant-search",
  version: "1.0.0",
  capabilities: {
    tools: { /* Schema will be added by the MCP SDK */ },
    resources: { /* Schema will be added by the MCP SDK */ },
  }
});

console.error(`MCP Server 'qdrant-search' initializing with collection: ${COLLECTION_NAME}`);

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

// Query Qdrant Tool
server.tool(
  "query_vector_store",
  {
    query: z.string().describe("The question to ask about OpenDental documentation."),
    limit: z.number().optional().describe("Maximum number of results to return (default: 5)."),
    filter_type: z.string().optional().describe("Filter by document type (api, database, manual, relationship)."),
  },
  async ({ query, limit = 5, filter_type }) => {
    try {
      console.error(`Querying Qdrant collection "${COLLECTION_NAME}" with: "${query}"`);
      
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
      console.error(`Searching with filter: ${JSON.stringify(filter)}`);
      const searchResult = await qdrantClient.search(COLLECTION_NAME, {
        vector: embedding,
        limit: limit,
        filter: filter,
        with_payload: true
      });
      
      console.error(`Found ${searchResult.length} results`);
      
      if (!searchResult || searchResult.length === 0) {
        return {
          content: [{ 
            type: "text", 
            text: "I couldn't find any relevant information in the OpenDental documentation. Please try rephrasing your question or providing more details." 
          }]
        };
      }
      
      // Prepare the response
      let responseText = "Here's what I found in the OpenDental documentation:\n\n";
      
      // Add each result
      searchResult.forEach((result, index) => {
        // Handle different payload structures that might exist in your Qdrant collection
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
      
      return {
        content: [{ type: "text", text: responseText }],
        data: { results: searchResult }
      };
      
    } catch (error: any) {
      console.error("Error querying Qdrant:", error);
      return {
        content: [{ type: "text", text: `Error querying OpenDental documentation: ${error.message}` }],
        isError: true
      };
    }
  }
);

// List collections resource
server.resource(
  "list_collections",
  "qdrant://collections",
  async (uri) => {
    try {
      const collections = await qdrantClient.getCollections();
      return {
        contents: [{
          uri: uri.href,
          mimeType: "text/plain",
          text: `Available Qdrant Collections:\n${collections.collections.map(c => `- ${c.name}`).join('\n') || 'None found.'}`
        }]
      };
    } catch (error: any) {
      console.error("Error listing collections:", error);
      return { 
        contents: [{ 
          uri: uri.href, 
          mimeType: "text/plain", 
          text: `Error listing collections: ${error.message}` 
        }] 
      };
    }
  }
);

// Collection info resource
server.resource(
  "collection_info",
  "qdrant://collections/{collectionName}",
  async (uri) => {
    // Extract collectionName from the URI path
    const urlParts = uri.pathname.split('/');
    const collectionName = urlParts[urlParts.length - 1];
    
    if (!collectionName) {
      return { 
        contents: [{ 
          uri: uri.href, 
          mimeType: "text/plain", 
          text: "Error: collectionName parameter is missing in URI." 
        }] 
      };
    }
    
    try {
      const collectionInfo = await qdrantClient.getCollection(collectionName);
      const vectorSize = collectionInfo.config?.params?.vectors?.size || "Unknown";
      const distance = collectionInfo.config?.params?.vectors?.distance || "Unknown";
      const vectorsCount = collectionInfo.vectors_count ?? "Unknown"; 
      
      return {
        contents: [{
          uri: uri.href,
          mimeType: "text/plain",
          text: `Collection ${collectionName} Info:\n` +
                `Vector size: ${vectorSize}\n` + 
                `Distance: ${distance}\n` +
                `Vectors count: ${vectorsCount}`
        }]
      };
    } catch (error: any) {
      console.error(`Error getting collection ${collectionName}:`, error);
      return { 
        contents: [{ 
          uri: uri.href, 
          mimeType: "text/plain", 
          text: `Error getting collection info: ${error.message}` 
        }] 
      };
    }
  }
);

// Start server
async function startServer() {
  try {
    const transport = new StdioServerTransport();
    console.error("Connecting transport...");
    await server.connect(transport);
    console.error(`MCP Server 'qdrant-search' is running and connected via stdio.`);
  } catch (error) {
    console.error("Failed to start or connect MCP server:", error);
    process.exit(1);
  }
}

startServer();