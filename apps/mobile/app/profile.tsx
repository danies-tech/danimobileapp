import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function Profile() {
  const token = useAuthStore((s) => s.token);
  const { data } = useQuery({ queryKey: ['me'], queryFn: async () => (await api.get('/me', { headers: { Authorization: `Bearer ${token}` } })).data });
  return <View className="flex-1 p-4"><Text className="text-2xl font-bold">Profile</Text><Text>{data?.name}</Text><Text>{data?.phone}</Text></View>;
}
