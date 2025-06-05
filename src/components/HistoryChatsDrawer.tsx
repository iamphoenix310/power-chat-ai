import {
  DrawerContent,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Text } from 'react-native';
import chatHistory from '@assets/data/chatHistory.json';
import { router, usePathname } from 'expo-router';

export default function HistoryChatsDrawer(props: DrawerContentComponentProps) {
  const pathname = usePathname();

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />

      {chatHistory.map((item) => (
        <DrawerItem
          key={item.id}
          label={item.title}
          inactiveTintColor='white'
          focused={pathname === `/chat/${item.id}`}
          onPress={() => router.push(`/chat/${item.id}`)}
        />
      ))}
    </DrawerContentScrollView>
  );
}
