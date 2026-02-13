import { useMutation } from '@tanstack/react-query';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';

export default function CartScreen() {
  const token = useAuthStore((s) => s.token);
  const { items, note, mode, updateQty, removeItem, setNote, setMode, clear } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = mode === 'delivery' ? 3.5 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + delivery + tax;

  const createOrder = useMutation({
    mutationFn: async () => api.post('/orders', { mode, note, items }, { headers: { Authorization: `Bearer ${token}` } }),
    onSuccess: () => clear(),
  });

  return <View className="flex-1 p-4">
    {items.map((item) => (
      <View key={item.menu_item_id} className="mb-2 rounded-xl bg-slate-100 p-3">
        <Text className="font-semibold">{item.name}</Text>
        <View className="mt-2 flex-row gap-2">
          <TouchableOpacity onPress={() => updateQty(item.menu_item_id, item.quantity - 1)}><Text>-</Text></TouchableOpacity>
          <Text>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQty(item.menu_item_id, item.quantity + 1)}><Text>+</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => removeItem(item.menu_item_id)}><Text className="text-red-600">Remove</Text></TouchableOpacity>
        </View>
      </View>
    ))}
    <View className="my-3 flex-row gap-2">
      <TouchableOpacity className={`rounded px-3 py-2 ${mode === 'delivery' ? 'bg-black' : 'bg-slate-200'}`} onPress={() => setMode('delivery')}><Text className={mode === 'delivery' ? 'text-white' : ''}>Delivery</Text></TouchableOpacity>
      <TouchableOpacity className={`rounded px-3 py-2 ${mode === 'pickup' ? 'bg-black' : 'bg-slate-200'}`} onPress={() => setMode('pickup')}><Text className={mode === 'pickup' ? 'text-white' : ''}>Pickup</Text></TouchableOpacity>
    </View>
    <TextInput placeholder="Kitchen note" className="mb-3 rounded-xl bg-slate-100 p-3" value={note} onChangeText={setNote} />
    <Text>Subtotal: ${subtotal.toFixed(2)}</Text><Text>Delivery: ${delivery.toFixed(2)}</Text><Text>Tax: ${tax.toFixed(2)}</Text><Text className="font-bold">Total: ${total.toFixed(2)}</Text>
    <TouchableOpacity className="mt-3 rounded-xl bg-emerald-600 p-4" onPress={() => createOrder.mutate()}><Text className="text-center text-white">Place mock payment order</Text></TouchableOpacity>
  </View>;
}
