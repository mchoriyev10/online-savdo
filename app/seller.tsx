import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, Alert, Animated,
} from 'react-native';
import { Stack } from 'expo-router';
import { Package, Receipt, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/context/DataContext';
import { formatNumber } from '@/utils/helpers';

type Tab = 'kirim' | 'xarajat';

export default function SellerScreen() {
  const { addKirim, addExpense } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('kirim');

  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');

  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;

  const total = (Number(quantity) || 0) * (Number(price) || 0);

  const showSuccessMessage = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSuccess(false));
  };

  const handleSaveKirim = () => {
    if (!productName.trim()) {
      Alert.alert('Xatolik', 'Mahsulot nomini kiriting');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      Alert.alert('Xatolik', 'Miqdorni kiriting');
      return;
    }
    if (!price || Number(price) <= 0) {
      Alert.alert('Xatolik', 'Narxni kiriting');
      return;
    }

    addKirim(productName.trim(), Number(quantity), unit, Number(price));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSuccessMessage();
    setProductName('');
    setQuantity('');
    setPrice('');
  };

  const handleSaveExpense = () => {
    if (!expenseName.trim()) {
      Alert.alert('Xatolik', 'Xarajat nomini kiriting');
      return;
    }
    if (!expenseAmount || Number(expenseAmount) <= 0) {
      Alert.alert('Xatolik', 'Summani kiriting');
      return;
    }

    addExpense(expenseName.trim(), Number(expenseAmount));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSuccessMessage();
    setExpenseName('');
    setExpenseAmount('');
  };

  const units = ['kg', 'dona', 'litr', 'metr'];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sotuvchi Paneli', headerTintColor: Colors.primary }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.tabBar}>
            <Pressable
              style={[styles.tab, activeTab === 'kirim' && styles.activeTab]}
              onPress={() => { setActiveTab('kirim'); Haptics.selectionAsync(); }}
              testID="tab-kirim"
            >
              <Package size={18} color={activeTab === 'kirim' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'kirim' && styles.activeTabText]}>Mahsulot kirimi</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'xarajat' && styles.activeTab]}
              onPress={() => { setActiveTab('xarajat'); Haptics.selectionAsync(); }}
              testID="tab-xarajat"
            >
              <Receipt size={18} color={activeTab === 'xarajat' ? Colors.accent : Colors.textMuted} />
              <Text style={[styles.tabText, activeTab === 'xarajat' && styles.activeTabText]}>Xarajat</Text>
            </Pressable>
          </View>

          {activeTab === 'kirim' ? (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Yangi mahsulot kirimi</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mahsulot nomi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masalan: Olma"
                  placeholderTextColor={Colors.textMuted}
                  value={productName}
                  onChangeText={setProductName}
                  testID="input-product-name"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex]}>
                  <Text style={styles.label}>Miqdor</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                    testID="input-quantity"
                  />
                </View>
                <View style={styles.unitSelector}>
                  <Text style={styles.label}>Birlik</Text>
                  <View style={styles.unitRow}>
                    {units.map(u => (
                      <Pressable
                        key={u}
                        style={[styles.unitChip, unit === u && styles.activeUnit]}
                        onPress={() => { setUnit(u); Haptics.selectionAsync(); }}
                      >
                        <Text style={[styles.unitText, unit === u && styles.activeUnitText]}>{u}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>1 {unit} narxi (so'm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                  testID="input-price"
                />
              </View>

              {total > 0 && (
                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>Jami:</Text>
                  <Text style={styles.totalValue}>{formatNumber(total)} so'm</Text>
                </View>
              )}

              <Pressable style={styles.saveBtn} onPress={handleSaveKirim} testID="btn-save-kirim">
                <Check size={20} color="#FFF" />
                <Text style={styles.saveBtnText}>Saqlash</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>Yangi xarajat</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Xarajat nomi</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masalan: Transport"
                  placeholderTextColor={Colors.textMuted}
                  value={expenseName}
                  onChangeText={setExpenseName}
                  testID="input-expense-name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Summa (so'm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  testID="input-expense-amount"
                />
              </View>

              <Pressable style={[styles.saveBtn, styles.expenseBtn]} onPress={handleSaveExpense} testID="btn-save-expense">
                <Check size={20} color="#FFF" />
                <Text style={styles.saveBtnText}>Saqlash</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {showSuccess && (
        <Animated.View style={[styles.successBanner, { opacity: successOpacity }]}>
          <Check size={20} color="#FFF" />
          <Text style={styles.successText}>Muvaffaqiyatli saqlandi!</Text>
        </Animated.View>
      )}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  tabBar: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    borderRadius: 11,
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  activeTabText: {
    color: Colors.primary,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 20,
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
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  unitSelector: {
    flex: 1,
  },
  unitRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeUnit: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  unitText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  activeUnitText: {
    color: Colors.primary,
  },
  totalBox: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.primaryDark,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    marginTop: 4,
  },
  expenseBtn: {
    backgroundColor: Colors.accent,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  successBanner: {
    position: 'absolute' as const,
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: Colors.success,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  successText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
