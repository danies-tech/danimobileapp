import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api, MenuItem } from '@/lib/api';
import { useCartStore } from '@/store/cart';

export default function HomeScreen() {
  const [q, setQ] = useState('');
  const addItem = useCartStore((s) => s.addItem);
  const { data: items = [] } = useQuery<MenuItem[]>({
    queryKey: ['menu', q],
    queryFn: async () => (await api.get('/menu-items', { params: { q } })).data,
  });

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <Text className="text-2xl font-bold">Restaurant App</Text>
      <Text className="mb-3 text-slate-500">Open 9AM - 10PM • Premium Kitchen • ★ 4.8</Text>
      <TextInput className="mb-3 rounded-xl bg-white p-3" placeholder="Search menu items" value={q} onChangeText={setQ} />
      <FlatList data={items} keyExtractor={(item) => `${item.id}`} renderItem={({ item }) => (
        <View className="mb-3 rounded-2xl bg-white p-4">
          <Text className="text-lg font-semibold">{item.name}</Text>
          <Text className="mb-2 text-slate-500">{item.description}</Text>
          <View className="flex-row items-center justify-between">
            <Text className="font-bold">${item.price.toFixed(2)}</Text>
            <TouchableOpacity className="rounded-lg bg-emerald-500 px-4 py-2" onPress={() => addItem({ menu_item_id: item.id, name: item.name, price: item.price })}>
              <Text className="text-white">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )} />
    </View>
  );
}
