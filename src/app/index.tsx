import { View, Text } from 'react-native';
import ChatInput from '@/components/ChatInput';

export default function HomeScreen() {
  const handleSend = (message) => {
    console.log('Sending: ', message);
  };

  return (
    <View className='flex-1 justify-center'>
      <View className='flex-1'>
        <Text className='text-3xl  font-bold'>Home 123</Text>
      </View>

      <ChatInput onSend={handleSend} isLoading={false} />
    </View>
  );
}
