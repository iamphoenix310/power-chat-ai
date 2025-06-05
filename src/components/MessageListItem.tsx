import { Text, View } from 'react-native';

export default function MessageListItem({ messageItem }) {
  const { message, role } = messageItem;
  const isUser = role === 'user';

  return (
    <View
      className={`flex-row mb-3 px-2 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <View
        className={`rounded-2xl p-4 ${isUser && 'bg-[#262626] max-w-[70%]'}`}
      >
        <Text className='text-white'>{messageItem.message}</Text>
      </View>
    </View>
  );
}
