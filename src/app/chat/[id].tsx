import { View, Text, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ChatInput from '@/components/ChatInput';
import MessageListItem from '@/components/MessageListItem';
import { useRef, useEffect } from 'react';

import { useChatStore } from '@/store/chatStore';
import {
  getTextResponse,
  createAIImage,
  getSpeechResponse,
  type ChatResponse,
} from '@/services/chatService';
import type { Message } from '@/types/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();

  const flatListRef = useRef<FlatList | null>(null);

  const chat = useChatStore((state) =>
    state.chatHistory.find((chat) => chat.id === id)
  );

  const setIsWaitingForResponse = useChatStore(
    (state) => state.setIsWaitingForResponse
  );
  const isWaitingForResponse = useChatStore(
    (state) => state.isWaitingForResponse
  );

  const addNewMessage = useChatStore((state) => state.addNewMessage);

  const handleQuestionPress = async (question: string) => {
    await handleSend(question, null, false, null);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeout);
  }, [chat?.messages]);

  const handleSend = async (
    message: string,
    imageBase64: string | null,
    isImageGeneration: boolean,
    audioBase64: string | null
  ) => {
    if (!chat) return;

    setIsWaitingForResponse(true);

    try {
      let data: ChatResponse | { image: string };

      if (audioBase64) {
        data = await getSpeechResponse(audioBase64, chat.messages.findLast((m) => m.responseId)?.responseId);
        const myMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          message: data.transcribedMessage,
        };
        addNewMessage(chat.id, myMessage);
      } else if (isImageGeneration) {
        data = await createAIImage(message);
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          message,
          ...(imageBase64 ? { image: imageBase64 } : {}),
        };
        addNewMessage(chat.id, userMessage);
      } else {
        // Normal text flow
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          message,
          ...(imageBase64 ? { image: imageBase64 } : {}),
        };
        addNewMessage(chat.id, userMessage);

        const previousResponseId = chat.messages.findLast((m) => m.responseId)?.responseId;
        data = await getTextResponse(message, imageBase64, previousResponseId);
      }

      // Safely build assistant message
      const aiResponseMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        message: 'responseMessage' in data ? data.responseMessage : '',
        responseId: 'responseId' in data ? data.responseId : undefined,
        relatedQuestions: 'relatedQuestions' in data ? data.relatedQuestions : undefined,
        image: 'image' in data ? data.image : undefined,
      };

      addNewMessage(chat.id, aiResponseMessage);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  if (!chat) {
    return (
      <View>
        <Text>Chat {id} not found</Text>
      </View>
    );
  }

  return (
    <View className='flex-1'>
      <FlatList
        ref={flatListRef}
        data={chat.messages}
        renderItem={({ item }) => (
          <MessageListItem
            messageItem={item}
            onQuestionPress={handleQuestionPress}
          />
        )}
        ListFooterComponent={() =>
          isWaitingForResponse && (
            <Text className='text-gray-400 px-6 mb-4 animate-pulse'>
              Waiting for response...
            </Text>
          )
        }
      />

      <ChatInput onSend={handleSend} />
    </View>
  );
}
