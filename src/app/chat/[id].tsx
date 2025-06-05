import { View, Text, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ChatInput from '@/components/ChatInput';
import MessageListItem from '@/components/MessageListItem';

import chatHistory from '@assets/data/chatHistory.json';

import { useChatStore } from '@/store/chatStore';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();

  const chat = useChatStore((state) =>
    state.chatHistory.find((chat) => chat.id === id)
  );

  const addNewMessage = useChatStore((state) => state.addNewMessage);

  const handleSend = async (message: string) => {
    if (!chat) return;

    addNewMessage(chat.id, {
      id: Date.now().toString(),
      role: 'user',
      message,
    });
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
        data={chat.messages}
        renderItem={({ item }) => <MessageListItem messageItem={item} />}
      />

      <ChatInput onSend={handleSend} isLoading={false} />
    </View>
  );
}
