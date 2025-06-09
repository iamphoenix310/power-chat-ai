import { View, Text } from 'react-native';
import ChatInput from '@/components/ChatInput';
import { router } from 'expo-router';

import { useChatStore } from '@/store/chatStore';
import {
  createAIImage,
  getSpeechResponse,
  getTextResponse,
  type ChatResponse,
} from '@/services/chatService';
import type { Message } from '@/types/types';

export default function HomeScreen() {
  const createNewChat = useChatStore((state) => state.createNewChat);
  const addNewMessage = useChatStore((state) => state.addNewMessage);

  const setIsWaitingForResponse = useChatStore(
    (state) => state.setIsWaitingForResponse
  );

  const handleSend = async (
    message: string,
    imageBase64: string | null,
    isImageGeneration: boolean,
    audioBase64: string | null
  ) => {
    if (!message.trim() && !audioBase64 && !isImageGeneration) return;

    setIsWaitingForResponse(true);
    const newChatId = createNewChat(message.slice(0, 50) || 'New Chat');

    if (!audioBase64) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        message,
        ...(imageBase64 ? { image: imageBase64 } : {}),
      };
      addNewMessage(newChatId, userMessage);
    }

    router.push(`/chat/${newChatId}`);

    try {
      let data: ChatResponse | { image: string };

      if (audioBase64) {
        data = await getSpeechResponse(audioBase64);
        const userVoiceMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          message: data.transcribedMessage,
        };
        addNewMessage(newChatId, userVoiceMessage);
      } else if (isImageGeneration) {
        data = await createAIImage(message);
      } else {
        data = await getTextResponse(message, imageBase64);
      }

      const aiResponseMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        message: 'responseMessage' in data ? data.responseMessage : '',
        responseId: 'responseId' in data ? data.responseId : undefined,
        image: 'image' in data ? data.image : undefined,
        relatedQuestions: 'relatedQuestions' in data ? data.relatedQuestions : undefined,
      };

      addNewMessage(newChatId, aiResponseMessage);

      console.log(data);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  return (
    <View className='flex-1 justify-center'>
      <View className='flex-1 items-center justify-center'>
        <Text className='text-3xl font-bold'>Home 123</Text>
      </View>
      <ChatInput onSend={handleSend} />
    </View>
  );
}
