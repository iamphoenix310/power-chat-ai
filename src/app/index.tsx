import { View, Text } from 'react-native';
import ChatInput from '@/components/ChatInput';
import { router } from 'expo-router';

import { useChatStore } from '@/store/chatStore';

export default function HomeScreen() {
  const createNewChat = useChatStore((state) => state.createNewChat);
  const addNewMessage = useChatStore((state) => state.addNewMessage);

  const handleSend = async (message: string) => {
    const newChatId = createNewChat(message.slice(0, 50));
    addNewMessage(newChatId, {
      id: Date.now().toString(),
      role: 'user',
      message,
    });
    router.push(`/chat/${newChatId}`);

    try {
      const response = await fetch('/api/chat');
      const data = await response.json();

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
