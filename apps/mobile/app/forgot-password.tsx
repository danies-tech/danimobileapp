import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  return <View className="flex-1 justify-center p-6">
    <Text className="mb-4 text-2xl font-bold">Forgot Password</Text>
    <TextInput value={email} onChangeText={setEmail} className="mb-3 rounded-xl bg-slate-100 p-4" placeholder="Email" />
    <TouchableOpacity className="rounded-xl bg-blue-600 p-4" onPress={async () => setMessage((await api.post('/auth/forgot-password', null, { params: { email } })).data.message)}><Text className="text-center text-white">Send reset link</Text></TouchableOpacity>
    {!!message && <Text className="mt-4">{message}</Text>}
  </View>;
}
