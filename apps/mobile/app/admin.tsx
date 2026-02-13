import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function AdminScreen() {
  const token = useAuthStore((s) => s.token);
  const [name, setName] = useState('');
  const { data: categories = [], refetch } = useQuery({ queryKey: ['admin-categories'], queryFn: async () => (await api.get('/admin/categories', { headers: { Authorization: `Bearer ${token}` } })).data });
  const { data: analytics } = useQuery({ queryKey: ['analytics'], queryFn: async () => (await api.get('/admin/analytics', { headers: { Authorization: `Bearer ${token}` } })).data });
  const createCategory = useMutation({ mutationFn: async () => api.post('/admin/categories', { name }, { headers: { Authorization: `Bearer ${token}` } }), onSuccess: () => { setName(''); refetch(); }});

  return <View className="flex-1 p-4">
    <Text className="text-2xl font-bold">Admin</Text>
    <Text>Orders today: {analytics?.total_orders_today ?? 0}</Text>
    <Text>Revenue: ${analytics?.revenue_today ?? 0}</Text>
    <TextInput className="my-3 rounded bg-slate-100 p-3" placeholder="New category" value={name} onChangeText={setName} />
    <TouchableOpacity className="rounded bg-black p-3" onPress={() => createCategory.mutate()}><Text className="text-center text-white">Create Category</Text></TouchableOpacity>
    {categories.map((c: any) => <Text key={c.id} className="mt-2">• {c.name}</Text>)}
  </View>;
}
