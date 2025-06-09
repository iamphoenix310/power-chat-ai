// lib/registry.ts
import { createOpenAI, openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { groq } from '@ai-sdk/groq';
import { deepseek } from '@ai-sdk/deepseek';
import { createOllama } from 'ollama-ai-provider';
import {
  createProviderRegistry,
  extractReasoningMiddleware,
  wrapLanguageModel
} from 'ai';

export const registry = createProviderRegistry({
  openai,
  google,
  anthropic,
  groq,
  deepseek,
  ollama: createOllama({
    baseURL: `${process.env.OLLAMA_BASE_URL}/api`
  })
});

export function getModel(model: string) {
  const [provider, ...modelNameParts] = model.split(':');
  const modelName = modelNameParts.join(':');

  if (model.includes('ollama')) {
    const ollama = createOllama({ baseURL: `${process.env.OLLAMA_BASE_URL}/api` });

    if (model.includes('deepseek-r1')) {
      return wrapLanguageModel({
        model: ollama(modelName),
        middleware: extractReasoningMiddleware({ tagName: 'think' })
      });
    }

    return ollama(modelName, { simulateStreaming: true });
  }

  if (provider === 'groq' && model.includes('deepseek-r1')) {
    return wrapLanguageModel({
      model: groq(modelName),
      middleware: extractReasoningMiddleware({ tagName: 'think' })
    });
  }

  return registry.languageModel(model as Parameters<typeof registry.languageModel>[0]);
}

export function getToolCallModel(model?: string) {
  const [provider, ...modelNameParts] = model?.split(':') ?? [];
  const modelName = modelNameParts.join(':');

  switch (provider) {
    case 'deepseek':
      return getModel('deepseek:deepseek-chat');
    case 'groq':
      return getModel('groq:llama-3.1-8b-instant');
    case 'google':
      return getModel('google:gemini-2.0-flash');
    case 'ollama':
      return getModel(`ollama:${process.env.NEXT_PUBLIC_OLLAMA_TOOL_CALL_MODEL || modelName}`);
    default:
      return getModel('openai:gpt-4o-mini');
  }
}

export function isToolCallSupported(model?: string) {
  const [provider, ...modelNameParts] = model?.split(':') ?? [];
  const modelName = modelNameParts.join(':');

  if (provider === 'ollama' || provider === 'google') return false;
  if (modelName?.includes('deepseek')) return false;

  return true;
}
