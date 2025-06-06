import { Text, View, Image } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message } from '@/types/types';
import { markdownStyles } from '@/utils/markdown';

interface MessageListItemProps {
  messageItem: Message;
}

export default function MessageListItem({ messageItem }: MessageListItemProps) {
  const { message, role, image } = messageItem;
  const isUser = role === 'user';

  return (
    <View className={`mb-3 px-2 ${isUser ? 'items-end' : 'items-start'}`}>
      {!!image && (
        <Image
          source={{ uri: image }}
          className='w-40 h-40 rounded-lg mb-2'
          resizeMode='cover'
        />
      )}

      {!!message && (
        <View
          className={`rounded-2xl p-4 py-1 ${
            isUser && 'bg-[#262626] max-w-[70%]'
          }`}
        >
          <Markdown style={markdownStyles}>{message}</Markdown>
        </View>
      )}
    </View>
  );
}
