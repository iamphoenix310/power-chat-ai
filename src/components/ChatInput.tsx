import {
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    setMessage('');

    try {
      await onSend(message);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View
        className='bg-[#262626] rounded-t-2xl'
        style={{ paddingBottom: insets.bottom }}
      >
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder='Ask anything...'
          placeholderTextColor='gray'
          multiline
          className='pt-6 pb-2 px-4 text-white'
        />

        <View className='flex-row justify-between items-center px-4'>
          <MaterialCommunityIcons name='plus' size={24} color='white' />

          {!!message ? (
            <MaterialCommunityIcons
              name='arrow-up-circle'
              size={30}
              color='white'
              className='ml-auto'
              disabled={isLoading}
              onPress={handleSend}
            />
          ) : (
            <View className='bg-white p-2 rounded-full flex-row gap-1'>
              <MaterialCommunityIcons
                name='account-voice'
                size={15}
                color='black'
              />
              <Text className='text-black text-sm'>Voice</Text>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
