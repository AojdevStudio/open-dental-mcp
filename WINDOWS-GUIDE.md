# OpenDental MCP Server - Windows User Guide

This guide will help you set up and run the OpenDental MCP Server on your Windows computer with minimal technical knowledge required.

## What You'll Need Before Starting

1. **Node.js**: A software platform that runs JavaScript
2. **Python**: A programming language that some of our scripts use
3. **Qdrant**: A vector database for storing and searching documentation
4. **OpenAI API Key**: A special key that allows our software to create text embeddings (not for storage)

## Step 1: Install Required Software

### Installing Node.js
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Click the button that says "LTS" (Long Term Support) to download the installer
3. Run the installer file you downloaded
4. Click "Next" through the installation steps, accepting the default options
5. Click "Finish" when installation is complete

### Installing Python
1. Go to [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/)
2. Click on the latest Python 3 release (e.g., "Python 3.10.X")
3. Scroll down and click on "Windows installer (64-bit)"
4. Run the installer file you downloaded
5. **IMPORTANT**: Check the box that says "Add Python to PATH" at the bottom of the first screen
6. Click "Install Now"
7. Click "Close" when installation is complete

### Installing Qdrant
There are two ways to install Qdrant:

#### Option A: Using Docker (Recommended if you're familiar with Docker)
1. Download and install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop
3. Open Command Prompt (Win + R, type `cmd`, press Enter)
4. Run these commands:
```
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```
5. Keep this Command Prompt window open while using the MCP server

#### Option B: Standalone Qdrant
1. Go to [https://github.com/qdrant/qdrant/releases](https://github.com/qdrant/qdrant/releases)
2. Download the latest Windows release (e.g., `qdrant-x.x.x-windows-x86_64.zip`)
3. Extract the ZIP file to a location on your computer (e.g., `C:\Qdrant`)
4. Open Command Prompt (Win + R, type `cmd`, press Enter)
5. Navigate to the extracted folder:
```
cd C:\path\to\extracted\qdrant\folder
```
6. Start Qdrant:
```
qdrant.exe
```
7. Keep this Command Prompt window open while using the MCP server

## Step 2: Download the OpenDental MCP Server

1. Download the OpenDental MCP Server files as a ZIP file
2. Right-click on the ZIP file and select "Extract All..."
3. Choose a location where you want to extract the files (e.g., `C:\OpenDental-MCP`)
4. Click "Extract"

## Step 3: Set Up Your OpenAI API Key

1. Go to [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. Sign in to your OpenAI account (or create one if you don't have it)
3. Click "Create new secret key"
4. Give your key a name (e.g., "OpenDental MCP")
5. Copy the key (it will look like a long string of letters and numbers)

## Step 4: Configure the Server

1. Open the folder where you extracted the files
2. Navigate to the `mcp-openai-filesearch` folder
3. Right-click in the empty space and select "New" > "Text Document"
4. Name the file `.env` (including the dot at the beginning)
   - If Windows warns you about changing the file extension, click "Yes"
5. Right-click on the `.env` file and select "Edit" or "Open with" > "Notepad"
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

1. Press `Win + R` on your keyboard to open the Run dialog
2. Type `cmd` and press Enter to open Command Prompt
3. Navigate to your extracted folder by typing:
```
cd C:\path\to\your\extracted\folder\mcp-openai-filesearch
```
   - Replace `C:\path\to\your\extracted\folder` with the actual path where you extracted the files
4. Install the required dependencies by typing:
```
npm install
```
5. Wait for the installation to complete (this may take a few minutes)
6. Build the server by typing:
```
npm run build
```
7. Wait for the build to complete
8. Set up the Qdrant collection by typing:
```
npm run setup:qdrant
```
9. Wait for the setup to complete

## Step 6: Setting Up Client Configuration

If you want to use this server with Cursor or another MCP client:

1. Create a file named `mcp.json` in the `.cursor` folder of your project
   - If the `.cursor` folder doesn't exist, create it
2. Open the `mcp.json` file in Notepad or any text editor
3. Add the following content to the file:
```json
{
  "mcpServers": {
    "OpenDental-MCP": {
      "command": "node",
      "args": [
        "C:\\path\\to\\your\\extracted\\folder\\mcp-openai-filesearch\\dist\\server-qdrant.js"
      ],
      "transport": "stdio",
      "description": "Qdrant-based MCP server for OpenDental docs."
    }
  }
}
```
4. Replace `C:\\path\\to\\your\\extracted\\folder` with the actual path where you extracted the files
   - Make sure to use double backslashes (`\\`) in the path
5. Save and close the file
6. Restart your MCP client (like Cursor) to detect the new server configuration

## Step 7: Start the Server

1. In the same Command Prompt window, type:
```
npm run start:qdrant
```
2. You should see some messages indicating that the server has started
3. Keep this window open as long as you want the server to run

## Step 8: Test the Server

1. Open a new Command Prompt window (Win + R, type `cmd`, press Enter)
2. Navigate to your extracted folder by typing:
```
cd C:\path\to\your\extracted\folder\mcp-openai-filesearch
```
3. Run a test query by typing:
```
npm run test:qdrant
```
4. You should see a response from the server with information from the OpenDental documentation

## Troubleshooting

### If You See "npm is not recognized as an internal or external command"
- Make sure you installed Node.js correctly
- Try restarting your computer and then try again

### If You See "python is not recognized as an internal or external command"
- Make sure you checked "Add Python to PATH" during Python installation
- Try using `py` instead of `python` in the commands
- Try restarting your computer and then try again

### If the Server Can't Start Due to a "Port Already in Use" Error
1. In the Command Prompt, type:
```
netstat -ano | findstr :3000
```
2. Note the number in the last column (this is the process ID)
3. Type:
```
taskkill /PID [the process ID] /F
```
4. Try starting the server again

### If You Can't Connect to Qdrant
1. Make sure Qdrant is running in another Command Prompt window
2. Check if the Qdrant port is available:
```
netstat -ano | findstr :6333
```
3. If you're using Docker, make sure Docker Desktop is running
4. Try restarting Qdrant

### If Your MCP Client Can't Find the Server
1. Check that your `mcp.json` file has the correct path to the server
2. Verify that you're using double backslashes (`\\`) in the path
3. Make sure the server is actually built and the file exists at the path you specified
4. Try restarting your MCP client to reload the configuration

### If You See API Key Errors
- Double-check that you've correctly copied your OpenAI API key into the `.env` file
- Make sure there are no extra spaces or characters in the `.env` file

## Getting Help

If you encounter issues that aren't covered in this guide, please contact your system administrator or the development team for assistance. 