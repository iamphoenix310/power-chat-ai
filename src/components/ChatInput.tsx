import {
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface ChatInputProps {
  onSend: (message: string, imageBase64: string | null) => Promise<void>;
  isLoading?: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');

  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleSend = async () => {
    setMessage('');
    setImageBase64(null);

    try {
      await onSend(message, imageBase64);
    } catch (error) {
      console.log(error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
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
        {imageBase64 && (
          <ImageBackground
            source={{ uri: imageBase64 }}
            className='w-16 h-16 mx-3 mt-2'
            imageClassName='rounded-lg'
          >
            <AntDesign
              onPress={() => setImageBase64(null)}
              name='closecircle'
              size={15}
              color='white'
              className='absolute right-1 top-1'
            />
          </ImageBackground>
        )}
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder='Ask anything...'
          placeholderTextColor='gray'
          multiline
          className='pt-6 pb-2 px-4 text-white'
        />

        <View className='flex-row justify-between items-center px-4'>
          <MaterialCommunityIcons
            onPress={pickImage}
            name='plus'
            size={24}
            color='white'
          />

          {!!message || imageBase64 ? (
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
