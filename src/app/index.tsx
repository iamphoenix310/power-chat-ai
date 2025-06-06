import { View, Text } from 'react-native';
import ChatInput from '@/components/ChatInput';
import { router } from 'expo-router';

import { useChatStore } from '@/store/chatStore';

export default function HomeScreen() {
  const createNewChat = useChatStore((state) => state.createNewChat);
  const addNewMessage = useChatStore((state) => state.addNewMessage);

  const handleSend = async (message: string, imageBase64: string | null) => {
    const newChatId = createNewChat(message.slice(0, 50));
    addNewMessage(newChatId, {
      id: Date.now().toString(),
      role: 'user',
      message,
      ...(imageBase64 && { image: imageBase64 }),
    });
    router.push(`/chat/${newChatId}`);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message, imageBase64 }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      const aiResponseMessage = {
        id: Date.now().toString(),
        message: data.responseMessage,
        responseId: data.responseId,
        role: 'assistant' as const,
      };

      addNewMessage(newChatId, aiResponseMessage);

      console.log(data);
    } catch (error) {
      console.error('Chat error:', error);
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
