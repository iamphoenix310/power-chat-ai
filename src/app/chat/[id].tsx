import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ChatInput from '@/components/ChatInput';

import chatHistory from '@assets/data/chatHistory.json';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();

  const chat = chatHistory.find((chat) => chat.id === id);

  const handleSend = (message) => {
    console.log('Sending: ', message);
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
      <View className='flex-1'>
        <Text>Messages</Text>
      </View>

      <ChatInput onSend={handleSend} isLoading={false} />
    </View>
  );
}
