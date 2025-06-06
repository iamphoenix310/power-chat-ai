import { View, Text } from 'react-native';
import ChatInput from '@/components/ChatInput';
import { router } from 'expo-router';

import { useChatStore } from '@/store/chatStore';
import { createAIImage, getTextResponse } from '@/services/chatService';

export default function HomeScreen() {
  const createNewChat = useChatStore((state) => state.createNewChat);
  const addNewMessage = useChatStore((state) => state.addNewMessage);

  const setIsWaitingForResponse = useChatStore(
    (state) => state.setIsWaitingForResponse
  );

  const handleSend = async (
    message: string,
    imageBase64: string | null,
    isImageGeneration: boolean
  ) => {
    setIsWaitingForResponse(true);
    const newChatId = createNewChat(message.slice(0, 50));
    addNewMessage(newChatId, {
      id: Date.now().toString(),
      role: 'user',
      message,
      ...(imageBase64 && { image: imageBase64 }),
    });
    router.push(`/chat/${newChatId}`);

    try {
      let data;
      if (isImageGeneration) {
        data = await createAIImage(message);
      } else {
        data = await getTextResponse(message, imageBase64);
      }

      const aiResponseMessage = {
        id: Date.now().toString(),
        message: data.responseMessage,
        responseId: data.responseId,
        image: data.image,
        role: 'assistant' as const,
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
      <View className='flex-1'>
        <Text className='text-3xl  font-bold'>Home 123</Text>
      </View>

      <ChatInput onSend={handleSend} />
    </View>
  );
}
