import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Lock, KeyRound, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/context/DataContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { verifyPassword, changePassword } = useData();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (!oldPassword.trim()) {
      Alert.alert('Xatolik', 'Eski parolni kiriting');
      return;
    }
    if (!verifyPassword(oldPassword)) {
      Alert.alert('Xatolik', 'Eski parol noto\'g\'ri');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!newPassword.trim() || newPassword.length < 4) {
      Alert.alert('Xatolik', 'Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Xatolik', 'Parollar mos kelmaydi');
      return;
    }

    changePassword(newPassword);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Muvaffaqiyat', 'Parol o\'zgartirildi', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sozlamalar', headerTintColor: Colors.text }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <View style={styles.formHeader}>
              <KeyRound size={22} color={Colors.accent} />
              <Text style={styles.formTitle}>Parolni o'zgartirish</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Eski parol</Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Eski parolni kiriting"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  testID="input-old-password"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Yangi parol</Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Yangi parolni kiriting"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  testID="input-new-password"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parolni tasdiqlash</Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Yangi parolni qayta kiriting"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  testID="input-confirm-password"
                />
              </View>
            </View>

            <Pressable style={styles.saveBtn} onPress={handleChangePassword} testID="btn-change-password">
              <Check size={20} color="#FFF" />
              <Text style={styles.saveBtnText}>Parolni o'zgartirish</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
