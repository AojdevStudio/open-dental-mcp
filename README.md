# OpenDental MCP

A Model Context Protocol (MCP) integration for OpenDental that serves as both a developer integration platform and a practice intelligence solution for dental practices.

## Overview

The OpenDental MCP platform is a comprehensive solution that bridges the gap between AI assistants and OpenDental's practice management software. It serves two primary audiences:

### 1. Developer Integration Platform

A comprehensive resource for developers working on integrations with OpenDental, providing:

- Structured API documentation with searchable code examples
- Database schema references and relationship mapping
- Integration guides and best practices
- AI-assisted development tools for faster implementation
- Semantic search through technical documentation
- Code snippet generation for common integration patterns

### 2. Practice Intelligence Platform for Non-Technical Users

An accessible interface for dental office staff that allows them to:

- Interact with practice data using natural language queries
- Generate custom analytics and reports without SQL knowledge
- Access business intelligence insights for practice optimization
- Analyze patient flow and identify improvement opportunities
- Detect patterns in insurance claims and billing to improve efficiency
- Assist with treatment planning and patient follow-up tracking

## Features

- **Natural Language Queries**: Ask questions about OpenDental in plain English
- **Semantic Documentation Search**: Find relevant information across the entire OpenDental ecosystem
- **Vector Store Management**: Create and manage knowledge bases for OpenDental documentation
- **API Documentation**: Access structured API references and database schema information
- **Analytics Generation**: Create reports and insights from practice data
- **Billing Optimization**: Identify patterns in claims and billing processes
- **Patient Management Tools**: Streamline patient registration and appointment scheduling

## Prerequisites

- Node.js 16+
- OpenAI API key
- OpenAI Assistant configured for file search
- OpenDental documentation files (PDFs, text)
- Optional: OpenDental database access for direct analytics (requires additional configuration)

## Setup

1. Clone this repository:
```
git clone [repository-url]
cd open-dental-mcp
```

2. Install dependencies:
```
cd mcp-openai-filesearch
npm install
```

3. Create a `.env` file with the following variables:
```
OPENAI_API_KEY=your_openai_api_key
ASSISTANT_ID=your_assistant_id
OPENDENTAL_VECTOR_STORE_ID=your_vector_store_id
```

4. Build the project:
```
npm run build
```

## Usage

### Start the MCP Server

```
npm start
```

### For Developers

Developers can use the platform to:

- Query the OpenDental database schema and relationships
- Generate sample code for common integration patterns
- Understand API endpoints and required parameters
- Troubleshoot integration issues with context-aware assistance
- Access comprehensive documentation on service interfaces

Example developer queries:
- "Show me the database schema for patient records"
- "Generate a code sample for retrieving appointment data using the API"
- "Explain the relationship between the patient table and the appointment table"

### For Dental Practice Staff

Non-technical users can leverage the platform to:

- Generate reports on practice performance
- Analyze patient demographics and treatment patterns
- Optimize scheduling and reduce no-shows
- Improve billing workflows and insurance claim success rates
- Track treatment plan follow-ups and patient recall management

Example staff queries:
- "How do I add a new patient?"
- "What are the steps to schedule an appointment?"
- "Show me patients who are overdue for hygiene appointments"
- "Generate a report of outstanding insurance claims over 30 days"
- "What was our production last month compared to the previous year?"

## Configuration

Adjust settings in the `.env` file:

- `OPENAI_API_KEY`: Your OpenAI API key
- `ASSISTANT_ID`: ID of your OpenAI Assistant configured for file search
- `OPENDENTAL_VECTOR_STORE_ID`: ID of the vector store containing OpenDental docs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 