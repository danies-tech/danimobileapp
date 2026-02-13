import { useState } from 'react';
import { Switch, Text, View } from 'react-native';

export default function SettingsScreen() {
  const [dark, setDark] = useState(false);
  return <View className={`flex-1 p-4 ${dark ? 'bg-slate-900' : 'bg-white'}`}>
    <Text className={`text-2xl font-bold ${dark ? 'text-white' : ''}`}>Settings</Text>
    <View className="mt-4 flex-row items-center justify-between">
      <Text className={dark ? 'text-white' : ''}>Dark Theme</Text>
      <Switch value={dark} onValueChange={setDark} />
    </View>
    <Text className={`mt-6 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>About: Restaurant App MVP</Text>
    <Text className={dark ? 'text-slate-200' : 'text-slate-700'}>Contact: support@restaurant.app</Text>
  </View>;
}
