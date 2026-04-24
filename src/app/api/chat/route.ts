import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import fs from 'fs';
import path from 'path';

let cachedDocs: string | null = null;

function getGoogleProvider() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  return createGoogleGenerativeAI({ apiKey });
}

async function getContext() {
  if (!cachedDocs) {
    const lorePath = path.join(process.cwd(), 'data', 'hxh_lore.txt');
    const teamPath = path.join(process.cwd(), 'data', 'team_info.txt');
    let text = '';
    
    if (fs.existsSync(lorePath)) {
      text += 'HUNTER X HUNTER LORE:\n' + fs.readFileSync(lorePath, 'utf8') + '\n\n';
    }
    if (fs.existsSync(teamPath)) {
      text += 'TEAM INFO:\n' + fs.readFileSync(teamPath, 'utf8') + '\n\n';
    }

    cachedDocs = text;
  }
  return cachedDocs;
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const contextStr = await getContext();

    const systemPrompt = `You are a specialized Hunter x Hunter and Team Information chatbot.
You must ONLY answer questions related to:
1. Hunter x Hunter (the anime/manga)
2. Information about the team members who built this bot.

If a user asks about anything else (e.g., other anime, coding questions, general knowledge), politely decline and state your domain limitations (that you only know about HxH and your team).

Here is the context retrieved for the user's query:
<context>
${contextStr}
</context>

Respond to the user based on this context and your knowledge of Hunter x Hunter. Be friendly, slightly enthusiastic (like Gon), and use markdown for formatting if needed.
`;

    const google = getGoogleProvider();

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error('streamText error:', error);
        return error instanceof Error ? error.message : String(error);
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
