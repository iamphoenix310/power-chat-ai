import { Text, View, Image, Pressable } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message } from '@/types/types';
import { markdownStyles } from '@/utils/markdown';

interface MessageListItemProps {
  messageItem: Message;
  onQuestionPress?: (question: string) => void;
}

export default function MessageListItem({
  messageItem,
  onQuestionPress,
}: MessageListItemProps) {
  const { message, role, image, relatedQuestions } = messageItem;
  const isUser = role === 'user';

  return (
    <View className={`mb-3 px-2 ${isUser ? 'items-end' : 'items-start'}`}>
      {!!image && (
        <Image
          source={{ uri: image }}
          className={`${
            isUser ? 'w-40 h-40' : 'w-full aspect-square'
          } rounded-lg mb-2`}
          resizeMode='cover'
        />
      )}

      {!!message && (
        <View
          className={`rounded-2xl p-4 py-1 ${
            isUser ? 'bg-[#262626] max-w-[70%]' : 'bg-neutral-900 max-w-[85%]'
          }`}
        >
          <Markdown style={markdownStyles}>{message}</Markdown>
        </View>
      )}

      {!isUser && relatedQuestions?.length ? (
        <View className='mt-2 w-full max-w-[80%]'>
          <Text className='text-gray-400 text-xs font-semibold mb-1'>
            Related questions
          </Text>
          <View className='space-y-1'>
            {relatedQuestions.map((q, idx) => {
              const display = q.length > 80 ? `${q.slice(0, 77)}...` : q;
              return (
                <Pressable
                  key={idx}
                  onPress={() => onQuestionPress?.(q)}
                  className='bg-[#262626] rounded-lg p-2'
                >
                  <Text className='text-gray-300 text-sm'>{display}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}
