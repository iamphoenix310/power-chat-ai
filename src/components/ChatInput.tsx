import {
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Alert,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useChatStore } from '@/store/chatStore';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

interface ChatInputProps {
  onSend: (
    message: string,
    imageBase64: string | null,
    isImageGeneration: boolean,
    audioBase64: string | null
  ) => Promise<void>;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [isImageGeneration, setIsImageGeneration] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioPath, setRecordedAudioPath] = useState<string | null>(
    null
  );
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const isWaitingForResponse = useChatStore(
    (state) => state.isWaitingForResponse
  );

  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleCovertAudio = async () => {
    console.log('CHECK recordedAudioPath: ', recordedAudioPath);
    if (!recordedAudioPath) return null;

    return FileSystem.readAsStringAsync(recordedAudioPath, {
      encoding: FileSystem.EncodingType.Base64,
    });
  };

  const handleSend = async () => {
    setMessage('');
    setImageBase64(null);
    setRecordedAudioPath(null);

    try {
      const audioBase64 = await handleCovertAudio();
      await onSend(message, imageBase64, isImageGeneration, audioBase64);
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

  // Recording logic

  const startRecording = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();

      if (!granted) {
        Alert.alert(
          'Permission not granted',
          'Please grant permission to record audio'
        );
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Recording error', 'Please try again');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();

      if (audioRecorder.uri) {
        setRecordedAudioPath(audioRecorder.uri);
      }
      setIsRecording(false);
    } catch (error) {
      Alert.alert('Error stopping the rocording');
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

        <View className='flex-row  items-center px-4 gap-2'>
          <MaterialCommunityIcons
            onPress={pickImage}
            name='plus'
            size={24}
            color='white'
          />

          <MaterialCommunityIcons
            name='palette'
            color={isImageGeneration ? 'royalblue' : 'gray'}
            size={24}
            onPress={() => setIsImageGeneration(!isImageGeneration)}
          />

          {!!message || imageBase64 || recordedAudioPath ? (
            <MaterialCommunityIcons
              name='arrow-up-circle'
              size={30}
              color='white'
              className='ml-auto'
              disabled={isWaitingForResponse}
              onPress={handleSend}
            />
          ) : (
            <Pressable
              onPress={isRecording ? stopRecording : startRecording}
              className='bg-white p-2 rounded-full flex-row gap-1 ml-auto'
            >
              <MaterialCommunityIcons
                name='account-voice'
                size={15}
                color='black'
              />
              <Text className='text-black text-sm'>
                {isRecording ? 'Recording...' : 'Voice'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
