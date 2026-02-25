import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ShoppingCart, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/context/DataContext';
import { formatNumber } from '@/utils/helpers';

export default function SellScreen() {
  const { year, month } = useLocalSearchParams<{ year: string; month: string }>();
  const router = useRouter();
  const { addSale, warehouse } = useData();

  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const saleTotal = (Number(quantity) || 0) * (Number(salePrice) || 0);
  const whItem = warehouse.find(w => w.productName.toLowerCase() === productName.toLowerCase());
  const costPrice = whItem?.lastCostPrice ?? 0;
  const profit = ((Number(salePrice) || 0) - costPrice) * (Number(quantity) || 0);

  const filteredWarehouse = productName.trim()
    ? warehouse.filter(w => w.productName.toLowerCase().includes(productName.toLowerCase()))
    : warehouse;

  const handleSave = () => {
    if (!productName.trim()) {
      Alert.alert('Xatolik', 'Mahsulot nomini kiriting');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      Alert.alert('Xatolik', 'Miqdorni kiriting');
      return;
    }
    if (!salePrice || Number(salePrice) <= 0) {
      Alert.alert('Xatolik', 'Sotuv narxini kiriting');
      return;
    }
    if (whItem && Number(quantity) > whItem.quantity) {
      Alert.alert('Xatolik', `Omborda faqat ${whItem.quantity} ${whItem.unit} bor`);
      return;
    }

    addSale(productName.trim(), Number(quantity), Number(salePrice));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Sotuv qo\'shish', headerTintColor: Colors.text }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <View style={styles.formHeader}>
              <ShoppingCart size={22} color={Colors.blue} />
              <Text style={styles.formTitle}>Yangi sotuv</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mahsulot nomi</Text>
              <TextInput
                style={styles.input}
                placeholder="Mahsulot qidirish..."
                placeholderTextColor={Colors.textMuted}
                value={productName}
                onChangeText={(t) => { setProductName(t); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                testID="input-sale-product"
              />
              {showSuggestions && filteredWarehouse.length > 0 && (
                <View style={styles.suggestions}>
                  {filteredWarehouse.slice(0, 5).map((w) => (
                    <Pressable
                      key={w.productName}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setProductName(w.productName);
                        setShowSuggestions(false);
                        Haptics.selectionAsync();
                      }}
                    >
                      <Text style={styles.suggestionName}>{w.productName}</Text>
                      <Text style={styles.suggestionQty}>{w.quantity} {w.unit}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {whItem && (
              <View style={styles.whInfo}>
                <Text style={styles.whInfoText}>
                  Omborda: {whItem.quantity} {whItem.unit} | Tannarx: {formatNumber(whItem.lastCostPrice)} so'm
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Miqdor</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                testID="input-sale-quantity"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sotuv narxi (1 birlik, so'm)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={salePrice}
                onChangeText={setSalePrice}
                testID="input-sale-price"
              />
            </View>

            {saleTotal > 0 && (
              <View style={styles.calcBlock}>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>Sotuv jami:</Text>
                  <Text style={styles.calcValue}>{formatNumber(saleTotal)} so'm</Text>
                </View>
                {whItem && (
                  <>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>Tannarx:</Text>
                      <Text style={styles.calcValue}>{formatNumber(costPrice * (Number(quantity) || 0))} so'm</Text>
                    </View>
                    <View style={[styles.calcRow, styles.profitRow]}>
                      <Text style={styles.calcLabel}>Foyda:</Text>
                      <Text style={[styles.profitValue, profit >= 0 ? styles.profitPos : styles.profitNeg]}>
                        {profit >= 0 ? '+' : ''}{formatNumber(profit)} so'm
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            <Pressable style={styles.saveBtn} onPress={handleSave} testID="btn-save-sale">
              <Check size={20} color="#FFF" />
              <Text style={styles.saveBtnText}>Sotuvni saqlash</Text>
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
    marginBottom: 20,
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
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestions: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden' as const,
  },
  suggestionItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  suggestionQty: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  whInfo: {
    backgroundColor: Colors.blueLight,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  whInfoText: {
    fontSize: 13,
    color: Colors.blue,
    fontWeight: '500' as const,
  },
  calcBlock: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  calcRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  calcLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  calcValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  profitRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  profitValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  profitPos: { color: Colors.success },
  profitNeg: { color: Colors.danger },
  saveBtn: {
    backgroundColor: Colors.blue,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
