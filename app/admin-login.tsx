import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/context/DataContext';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { verifyPassword } = useData();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = () => {
    if (verifyPassword(password)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setError(false);
      router.replace('/admin' as never);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(true);
      shake();
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerTransparent: true, headerTintColor: Colors.primary }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <ShieldCheck size={40} color={Colors.primary} strokeWidth={1.8} />
          </View>
          <Text style={styles.title}>Admin kirish</Text>
          <Text style={styles.subtitle}>Parolni kiriting</Text>

          <Animated.View style={[styles.inputWrap, error && styles.inputError, { transform: [{ translateX: shakeAnim }] }]}>
            <Lock size={20} color={error ? Colors.danger : Colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Parol"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(false); }}
              onSubmitEditing={handleLogin}
              autoFocus
              testID="input-admin-password"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
              {showPassword ? <EyeOff size={20} color={Colors.textMuted} /> : <Eye size={20} color={Colors.textMuted} />}
            </Pressable>
          </Animated.View>

          {error && <Text style={styles.errorText}>Parol noto'g'ri</Text>}

          <Pressable style={styles.loginBtn} onPress={handleLogin} testID="btn-admin-login">
            <Text style={styles.loginBtnText}>Kirish</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center' as const,
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    alignSelf: 'center' as const,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginTop: 6,
    marginBottom: 32,
  },
  inputWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center' as const,
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});