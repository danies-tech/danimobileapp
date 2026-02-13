import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function Favorites() {
  const token = useAuthStore((s) => s.token);
  const { data = [] } = useQuery({ queryKey: ['favorites'], queryFn: async () => (await api.get('/favorites', { headers: { Authorization: `Bearer ${token}` } })).data });
  return <View className="flex-1 p-4"><Text className="text-2xl font-bold">Favorites</Text><Text>{JSON.stringify(data)}</Text></View>;
}
