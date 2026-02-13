import { useQuery } from '@tanstack/react-query';
import { Text, TouchableOpacity, View } from 'react-native';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function OrdersScreen() {
  const token = useAuthStore((s) => s.token);
  const role = useAuthStore((s) => s.role);
  const { data: orders = [], refetch } = useQuery({ queryKey: ['orders'], queryFn: async () => (await api.get('/orders', { headers: { Authorization: `Bearer ${token}` } })).data, refetchInterval: 6000 });

  return <View className="flex-1 p-4">
    <Text className="mb-3 text-2xl font-bold">Order Tracking</Text>
    {orders.map((order: any) => <View className="mb-2 rounded-xl bg-slate-100 p-3" key={order.id}>
      <Text className="font-semibold">Order #{order.id} • {order.status}</Text>
      <Text>Total ${order.total.toFixed(2)}</Text>
      <Text>Timeline: Placed → Accepted → Preparing → Ready → Completed</Text>
      {role === 'admin' && <View className="mt-2 flex-row gap-2">{['Accepted','Preparing','Ready','Completed'].map((s) => <TouchableOpacity key={s} onPress={async () => { await api.patch(`/orders/${order.id}/status`, { status: s }, { headers: { Authorization: `Bearer ${token}` } }); refetch(); }}><Text className="text-blue-600">{s}</Text></TouchableOpacity>)}</View>}
    </View>)}
  </View>;
}
