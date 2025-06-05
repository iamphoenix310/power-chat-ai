import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View className='flex-1 bg-white dark:bg-black items-center justify-center'>
      <Text className='text-3xl text-black dark:text-white font-bold'>
        Hello world
      </Text>
      <StatusBar style='auto' />
    </View>
  );
}
