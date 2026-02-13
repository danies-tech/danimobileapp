import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export default function LoginScreen() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const { setValue, handleSubmit, watch } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const { data } = await api.post('/auth/login', values);
    setAuth(data.access_token, values.email.includes('admin') ? 'admin' : 'customer');
    router.replace('/(tabs)/home');
  };

  return (
    <View className="flex-1 justify-center bg-slate-950 p-6">
      <Text className="mb-6 text-3xl font-bold text-white">Welcome back</Text>
      <TextInput className="mb-3 rounded-xl bg-white p-4" placeholder="Email" autoCapitalize="none" onChangeText={(v) => setValue('email', v)} value={watch('email')} />
      <TextInput className="mb-3 rounded-xl bg-white p-4" placeholder="Password" secureTextEntry onChangeText={(v) => setValue('password', v)} value={watch('password')} />
      <TouchableOpacity className="rounded-xl bg-emerald-500 p-4" onPress={handleSubmit(onSubmit)}>
        <Text className="text-center font-semibold text-white">Login</Text>
      </TouchableOpacity>
      <TouchableOpacity className="mt-3" onPress={() => router.push('/register')}><Text className="text-center text-slate-200">Create account</Text></TouchableOpacity>
      <TouchableOpacity className="mt-2" onPress={() => router.push('/forgot-password')}><Text className="text-center text-slate-400">Forgot password?</Text></TouchableOpacity>
    </View>
  );
}
