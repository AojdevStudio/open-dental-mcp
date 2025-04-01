import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Start the server process
  console.log("Starting MCP server...");
  const serverProcess = spawn("node", ["dist/server-qdrant.js"], {
    cwd: path.resolve(__dirname, ".."),
    stdio: ["pipe", "pipe", "pipe"]
  });

  // Log server process output
  serverProcess.stdout.on("data", (data) => {
    console.log(`Server stdout: ${data}`);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`Server stderr: ${data}`);
  });

  // Setup client
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/server-qdrant.js"],
    cwd: path.resolve(__dirname, ".."),
    stderr: "inherit"
  });

  try {
    // Connect to the server
    const client = new Client({
      name: "test-client",
      version: "1.0.0"
    });
    await client.connect(transport);
    console.log("Connected to server");

    // Test query
    const testQueries = [
      "How do I create an appointment in Open Dental?",
      "What are the main database tables in Open Dental?",
      "How do insurance claims work in Open Dental?"
    ];

    for (const query of testQueries) {
      console.log(`\n----- Testing query: "${query}" -----`);
      
      try {
        // Call the query_vector_store tool
        const result = await client.send({
          method: "call_tool",
          params: {
            name: "query_vector_store",
            parameters: {
              query,
              limit: 3
            }
          }
        });

        console.log("Result:");
        console.log(result?.content?.[0]?.text || "No result content");
      } catch (error) {
        console.error(`Error with query "${query}":`, error);
      }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Clean up
    console.log("\nShutting down...");
    serverProcess.kill();
  }
}

main().catch(console.error);