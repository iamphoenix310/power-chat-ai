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
    if (!audioBase64) {
      addNewMessage(chat.id, {
        id: Date.now().toString(),
        role: 'user',
        message,
        ...(imageBase64 && { image: imageBase64 }),
      });
    }

    const previousResponseId = chat.messages.findLast(
      (message) => message.responseId
    )?.responseId;

    try {
      let data: ChatResponse | { image: string };
      if (audioBase64) {
        data = await getSpeechResponse(audioBase64, previousResponseId);
        const myMessage = {
          id: Date.now().toString(),
          role: 'user' as const,
          message: data.transcribedMessage,
        };
        addNewMessage(chat.id, myMessage);
      } else if (isImageGeneration) {
        data = await createAIImage(message);
      } else {
        data = await getTextResponse(message, imageBase64, previousResponseId);
      }

      const aiResponseMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        ...("responseMessage" in data && {
          message: data.responseMessage,
          responseId: data.responseId,
          relatedQuestions: data.relatedQuestions,
        }),
        ...("image" in data && { image: data.image }),
      } as Message;

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
