# OpenDental MCP Server - macOS User Guide

This guide will help you set up and run the OpenDental MCP Server on your Mac with minimal technical knowledge required.

## What You'll Need Before Starting

1. **Node.js**: A software platform that runs JavaScript
2. **Python**: A programming language that some of our scripts use (macOS already comes with Python installed)
3. **Qdrant**: A vector database for storing and searching documentation
4. **OpenAI API Key**: A special key that allows our software to create text embeddings (not for storage)

## Step 1: Install Required Software

### Installing Node.js
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Click the button that says "LTS" (Long Term Support) to download the installer
3. Open the downloaded file (it should be a .pkg file)
4. Follow the installation instructions, clicking "Continue" and "Install" as prompted
5. You may need to enter your Mac password to authorize the installation
6. Click "Close" when the installation is complete

### Verifying Python Installation
1. Open Terminal (you can find it in Applications > Utilities > Terminal)
2. Type the following command and press Enter:
```
python3 --version
```
3. You should see a message showing the Python version (e.g., "Python 3.9.6")
4. If you don't see a Python version, you may need to install it from [python.org](https://www.python.org/downloads/macos/)

### Installing Qdrant
There are two ways to install Qdrant:

#### Option A: Using Docker (Recommended)
1. Download and install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop
3. Open Terminal (Applications > Utilities > Terminal)
4. Run these commands:
```
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```
5. Keep this Terminal window open while using the MCP server

#### Option B: Using Homebrew
1. If you don't have Homebrew installed, install it by running this command in Terminal:
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
2. Install Qdrant using Homebrew:
```
brew install qdrant/qdrant/qdrant
```
3. Start Qdrant:
```
qdrant
```
4. Keep this Terminal window open while using the MCP server

## Step 2: Download the OpenDental MCP Server

1. Download the OpenDental MCP Server files as a ZIP file
2. Find the ZIP file in your Downloads folder
3. Double-click the ZIP file to extract it
4. Move the extracted folder to a location where you want to keep it (e.g., your Documents folder)

## Step 3: Set Up Your OpenAI API Key

1. Go to [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. Sign in to your OpenAI account (or create one if you don't have it)
3. Click "Create new secret key"
4. Give your key a name (e.g., "OpenDental MCP")
5. Copy the key (it will look like a long string of letters and numbers)

## Step 4: Configure the Server

1. Open the folder where you extracted the files
2. Navigate to the `mcp-openai-filesearch` folder
3. Right-click (or Control-click) in the empty space and select "New File"
   - If you don't see this option, open TextEdit, create a new file, and save it in the `mcp-openai-filesearch` folder
4. Name the file `.env` (including the dot at the beginning)
5. Open the `.env` file in a text editor
6. Paste the following into the file:
```
OPENAI_API_KEY=your_openai_api_key
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=open_dental_docs
```
7. Replace `your_openai_api_key` with the API key you copied earlier
8. Save and close the file

## Step 5: Install Dependencies and Build the Server

1. Open Terminal (Applications > Utilities > Terminal)
2. Navigate to your extracted folder by typing:
```
cd /path/to/your/extracted/folder/mcp-openai-filesearch
```
   - Replace `/path/to/your/extracted/folder` with the actual path where you extracted the files
   - Tip: You can drag the folder from Finder into Terminal to automatically insert the path
3. Install the required dependencies by typing:
```
npm install
```
4. Wait for the installation to complete (this may take a few minutes)
5. Build the server by typing:
```
npm run build
```
6. Wait for the build to complete
7. Set up the Qdrant collection by typing:
```
npm run setup:qdrant
```
8. Wait for the setup to complete

## Step 6: Setting Up Client Configuration

If you want to use this server with Cursor or another MCP client:

1. Find the path to your Node.js binary by typing this in Terminal:
```
which node
```
2. Make note of the output (e.g., `/usr/local/bin/node` or `/opt/homebrew/bin/node`)
3. Create a folder named `.cursor` in your project directory if it doesn't already exist
4. Create a file named `mcp.json` in the `.cursor` folder
5. Open the `mcp.json` file in a text editor and add the following content:
```json
{
  "mcpServers": {
    "OpenDental-MCP": {
      "command": "/path/to/node",
      "args": [
        "/path/to/your/extracted/folder/mcp-openai-filesearch/dist/server-qdrant.js"
      ],
      "transport": "stdio",
      "description": "Qdrant-based MCP server for OpenDental docs."
    }
  }
}
```
6. Replace `/path/to/node` with the path you noted in step 2
7. Replace `/path/to/your/extracted/folder` with the actual path where you extracted the files
8. Save and close the file
9. Restart your MCP client (like Cursor) to detect the new server configuration

## Step 7: Start the Server

1. In the same Terminal window, type:
```
npm run start:qdrant
```
2. You should see some messages indicating that the server has started
3. Keep this window open as long as you want the server to run

## Step 8: Test the Server

1. Open a new Terminal window (Cmd + N)
2. Navigate to your extracted folder by typing:
```
cd /path/to/your/extracted/folder/mcp-openai-filesearch
```
3. Run a test query by typing:
```
npm run test:qdrant
```
4. You should see a response from the server with information from the OpenDental documentation

## Troubleshooting

### If You See "npm: command not found"
- Make sure you installed Node.js correctly
- Try restarting your computer and then try again
- You may need to reinstall Node.js

### If Python Gives You an Error
- Try using `python3` instead of `python` in all commands
- If you still have issues, you may need to install Python manually from [python.org](https://www.python.org/downloads/macos/)

### If the Server Can't Start Due to a "Port Already in Use" Error
1. In Terminal, type:
```
lsof -i :3000
```
2. Note the number in the PID column
3. Type:
```
kill -9 [the PID number]
```
4. Try starting the server again

### If You Can't Connect to Qdrant
1. Make sure Qdrant is running in another Terminal window
2. Check if the Qdrant port is available:
```
lsof -i :6333
```
3. If you're using Docker, make sure Docker Desktop is running
4. If you installed with Homebrew, try restarting Qdrant

### If Your MCP Client Can't Find the Server
1. Check that your `mcp.json` file has the correct paths
2. Verify that both the path to Node.js and the path to the server file are correct
3. Make sure the server is actually built and the file exists at the path you specified
4. Try restarting your MCP client to reload the configuration

### If You See API Key Errors
- Double-check that you've correctly copied your OpenAI API key into the `.env` file
- Make sure there are no extra spaces or characters in the `.env` file
- Make sure the file is named exactly `.env` (with the dot at the beginning)

## Getting Help

If you encounter issues that aren't covered in this guide, please contact your system administrator or the development team for assistance. 