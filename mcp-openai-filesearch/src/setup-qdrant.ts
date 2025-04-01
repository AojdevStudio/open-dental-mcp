import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.resolve(projectRoot, '.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || `http://${process.env.QDRANT_HOST || 'localhost'}:${process.env.QDRANT_PORT || '6333'}`
});

// Qdrant collection name
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || 'open_dental_docs';

async function main() {
  try {
    // Check if collection exists
    console.log(`Checking if collection "${COLLECTION_NAME}" exists...`);
    const collections = await qdrantClient.getCollections();
    const collectionNames = collections.collections.map(c => c.name);
    
    if (collectionNames.includes(COLLECTION_NAME)) {
      console.log(`Collection "${COLLECTION_NAME}" already exists.`);
      
      // Get collection info
      const collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
      console.log("Collection info:");
      console.log(`- Vector size: ${collectionInfo.config?.params?.vectors?.size || "Unknown"}`);
      console.log(`- Distance: ${collectionInfo.config?.params?.vectors?.distance || "Unknown"}`);
      console.log(`- Vectors count: ${collectionInfo.vectors_count ?? 0}`);
      
      // Check for vectors
      if ((collectionInfo.vectors_count ?? 0) > 0) {
        console.log("\nCollection is ready to use with MCP server.");
        
        // Sample a few points
        console.log("\nSampling a few points to verify structure:");
        const sample = await qdrantClient.scroll(COLLECTION_NAME, {
          limit: 2,
          with_payload: true,
          with_vector: false
        });
        
        if (sample.points.length > 0) {
          console.log("Payload structure example:");
          console.log(JSON.stringify(sample.points[0].payload, null, 2));
        } else {
          console.log("No points found to sample.");
        }
      } else {
        console.log("\nWarning: Collection exists but has no vectors!");
        console.log("Please make sure your data is loaded before using the MCP server.");
      }
    } else {
      console.log(`Collection "${COLLECTION_NAME}" does not exist!`);
      console.log("Please create the collection and load your data before using the MCP server.");
      console.log("\nTo create a collection with vector size 1536 (for OpenAI embeddings):");
      console.log(`
const client = new QdrantClient({ 
  url: "${process.env.QDRANT_URL || `http://${process.env.QDRANT_HOST || 'localhost'}:${process.env.QDRANT_PORT || '6333'}`}" 
});
await client.createCollection("${COLLECTION_NAME}", { 
  vectors: { size: 1536, distance: "Cosine" }
});
      `);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main().catch(console.error);