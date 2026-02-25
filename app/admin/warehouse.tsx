import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Package, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/context/DataContext';
import { formatNumber } from '@/utils/helpers';

export default function WarehouseScreen() {
  const { warehouse } = useData();

  const sorted = [...warehouse].sort((a, b) => a.productName.localeCompare(b.productName));

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Ombor', headerTintColor: Colors.text }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color={Colors.textMuted} strokeWidth={1.2} />
            <Text style={styles.emptyTitle}>Ombor bo'sh</Text>
            <Text style={styles.emptyDesc}>Sotuvchi mahsulot kiritganda ombor to'ladi</Text>
          </View>
        ) : (
          sorted.map((item) => (
            <View key={item.productName} style={styles.item}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemCost}>Tannarx: {formatNumber(item.lastCostPrice)} so'm/{item.unit}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={[
                  styles.itemQty,
                  item.quantity <= 0 && styles.zeroQty,
                ]}>
                  {item.quantity}
                </Text>
                <Text style={styles.itemUnit}>{item.unit}</Text>
                {item.quantity <= 0 && (
                  <AlertCircle size={14} color={Colors.danger} style={styles.warnIcon} />
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center' as const,
  },
  item: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  itemCost: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  itemRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  itemQty: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  zeroQty: {
    color: Colors.danger,
  },
  itemUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  warnIcon: {
    marginLeft: 4,
  },
});