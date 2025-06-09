import { generateObject, generateText } from 'ai';
import { relatedSchema } from './schema/related';
import { getModel, getToolCallModel, isToolCallSupported } from './registry'; // you will reuse these
import { type CoreMessage } from 'ai';

export async function generateRelatedQuestions(messages: CoreMessage[], model: string) {
  const lastUserMessages = messages.slice(-1).map(m => ({
    ...m,
    role: 'user'
  })) as CoreMessage[];

  const systemPrompt = `You are a helpful assistant. Based on the user's input, generate exactly 3 short, focused follow-up questions. Keep them under 15 words each. Respond in JSON format as { "object": "related", "data": ["q1", "q2", "q3"] }`;

  const supportsToolCall = isToolCallSupported(model);
  const currentModel = supportsToolCall ? getModel(model) : getToolCallModel(model);

  try {
    if (supportsToolCall) {
      return await generateObject({
        model: currentModel,
        system: systemPrompt,
        messages: lastUserMessages,
        schema: relatedSchema
      });
    }
  } catch (err) {
    console.warn(`Tool call failed for ${model}, falling back.`);
  }

  // fallback to raw text
  const result = await generateText({
    model: currentModel,
    system: systemPrompt,
    messages: lastUserMessages
  });

  const text = result.text || '';
  const lines = text
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^- /, '').trim())
    .filter(Boolean);

  return {
    object: 'related',
    data: lines.slice(0, 3)
  };
}
