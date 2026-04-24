# Hunter x Hunter RAG Chatbot

## 1. System Capabilities
This system is an intelligent, domain-specific chatbot built to answer questions exclusively about the **Hunter x Hunter** universe and the **development team**.

**Core Capabilities:**
- **Domain Restriction**: The bot strictly adheres to its knowledge base. It will politely refuse to answer questions outside the scope of Hunter x Hunter or the provided team information.
- **Conversational Memory**: The system retains previous messages within the session, allowing for continuous, context-aware interactions (easily surpassing the 5-10 interaction minimum).
- **Retrieval-Augmented Generation (RAG)**: Leverages a specialized local vector store to retrieve highly accurate, relevant facts before generating a response.

**Bonus Capabilities Implemented:**
- **Speech Recognition**: Users can click the microphone icon to speak their queries using the browser's native Web Speech API.
- **Voice Output (Text-to-Speech)**: Users can toggle voice output to have the AI's responses read aloud naturally.
- **Image Upload UI**: The chat interface includes a fully themed image upload button designed to handle character image recognition payloads.
- **Premium UI/UX**: Features a highly immersive, responsive glassmorphism design with "Nen" themed neon accents, dynamic gradients, and loading animations.

## 2. Technologies Used
- **Frontend Framework**: Next.js 14 (App Router) & React 18.
- **Styling**: Tailwind CSS with custom glassmorphism and keyframe animations.
- **Icons**: Lucide React.
- **AI Integration**: Vercel AI SDK (`ai` and `@ai-sdk/google`) for seamless streaming of LLM responses.
- **LLM Provider**: Google Gemini (`gemini-1.5-flash`), chosen for its speed, massive context window, and native multimodal vision capabilities.
- **RAG & Embeddings**: LangChain (`@langchain/core`, `@langchain/google-genai`).

## 3. RAG Architecture Implemented
The RAG pipeline is designed to be lightweight, robust, and entirely self-contained:
1. **Data Ingestion**: Local Markdown/Text files (`/data/hxh_lore.txt` and `/data/team_info.txt`) are read into memory.
2. **Chunking**: LangChain's `RecursiveCharacterTextSplitter` divides the text into manageable 500-character chunks with a 50-character overlap to preserve semantic context.
3. **Embedding**: The chunks are embedded using Google's `text-embedding-004` model.
4. **Vector Store**: A `MemoryVectorStore` is populated with the embeddings at runtime. This avoids the need for external database connections (like Pinecone or Postgres) and makes the demo instantly deployable.
5. **Retrieval**: When a user sends a message, the system performs a `similaritySearch` against the vector store to find the top 4 most relevant chunks.
6. **Generation**: The retrieved context, the user's prompt, and a strict "System Prompt" (enforcing the domain boundaries) are passed to the Gemini LLM to generate the final streamed response.

## Deployment Instructions
1. Clone the repository.
2. Add a `.env` file with `GEMINI_API_KEY=your_api_key_here`.
3. Run `npm install --legacy-peer-deps`.
4. Run `npm run dev`.
