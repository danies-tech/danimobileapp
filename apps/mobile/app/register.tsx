import { useRouter } from 'expo-router';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';

const schema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) });

export default function RegisterScreen() {
  const router = useRouter();
  const { setValue, handleSubmit, watch } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '' } });
  const submit = async (values: z.infer<typeof schema>) => { await api.post('/auth/register', values); router.replace('/login'); };

  return <View className="flex-1 justify-center bg-slate-100 p-6">
    <Text className="mb-6 text-3xl font-bold">Create account</Text>
    <TextInput className="mb-3 rounded-xl bg-white p-4" placeholder="Name" value={watch('name')} onChangeText={(v) => setValue('name', v)} />
    <TextInput className="mb-3 rounded-xl bg-white p-4" placeholder="Email" autoCapitalize="none" value={watch('email')} onChangeText={(v) => setValue('email', v)} />
    <TextInput className="mb-3 rounded-xl bg-white p-4" placeholder="Password" secureTextEntry value={watch('password')} onChangeText={(v) => setValue('password', v)} />
    <TouchableOpacity className="rounded-xl bg-slate-900 p-4" onPress={handleSubmit(submit)}><Text className="text-center text-white">Sign up</Text></TouchableOpacity>
  </View>;
}
