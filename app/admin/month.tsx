import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import {
  Package, ShoppingCart, Receipt, Trash2, Plus, BarChart3,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/context/DataContext';
import { formatNumber, isCurrentYear, isCurrentMonth } from '@/utils/helpers';
import { KirimItem, SaleItem, ExpenseItem } from '@/types';

type SectionTab = 'kirim' | 'sotuv' | 'xarajat';

export default function MonthDetailScreen() {
  const { year, month } = useLocalSearchParams<{ year: string; month: string }>();
  const router = useRouter();
  const { getMonthData, deleteKirim, deleteSale, deleteExpense, getReport } = useData();
  const [activeSection, setActiveSection] = useState<SectionTab>('kirim');
  const [, setRefresh] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefresh(r => r + 1);
    }, [])
  );

  if (!year || !month) return null;

  const data = getMonthData(year, month);
  const report = getReport(year, month);
  const canEdit = isCurrentYear(year) && isCurrentMonth(month);

  const handleDelete = (type: SectionTab, id: string) => {
    if (!canEdit) {
      Alert.alert('Ruxsat yo\'q', 'Faqat joriy oy ma\'lumotlarini o\'chirish mumkin');
      return;
    }
    Alert.alert('O\'chirish', 'Rostdan o\'chirmoqchimisiz?', [
      { text: 'Bekor', style: 'cancel' },
      {
        text: 'O\'chirish', style: 'destructive', onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          if (type === 'kirim') deleteKirim(year, month, id);
          else if (type === 'sotuv') deleteSale(year, month, id);
          else deleteExpense(year, month, id);
        },
      },
    ]);
  };

  const renderKirim = (item: KirimItem) => (
    <View key={item.id} style={styles.listItem}>
      <View style={styles.listItemLeft}>
        <Text style={styles.listDate}>{item.date}</Text>
        <Text style={styles.listName}>{item.productName}</Text>
        <Text style={styles.listDetail}>
          {item.quantity} {item.unit} × {formatNumber(item.price)} = {formatNumber(item.total)} so'm
        </Text>
      </View>
      {canEdit && (
        <Pressable style={styles.deleteBtn} onPress={() => handleDelete('kirim', item.id)} hitSlop={8}>
          <Trash2 size={16} color={Colors.danger} />
        </Pressable>
      )}
    </View>
  );

  const renderSale = (item: SaleItem) => (
    <View key={item.id} style={styles.listItem}>
      <View style={styles.listItemLeft}>
        <Text style={styles.listDate}>{item.date}</Text>
        <Text style={styles.listName}>{item.productName}</Text>
        <Text style={styles.listDetail}>
          {item.quantity} dona × {formatNumber(item.salePrice)} = {formatNumber(item.saleTotal)} so'm
        </Text>
        <Text style={[styles.listProfit, item.profit >= 0 ? styles.profitPositive : styles.profitNegative]}>
          Foyda: {formatNumber(item.profit)} so'm
        </Text>
      </View>
      {canEdit && (
        <Pressable style={styles.deleteBtn} onPress={() => handleDelete('sotuv', item.id)} hitSlop={8}>
          <Trash2 size={16} color={Colors.danger} />
        </Pressable>
      )}
    </View>
  );

  const renderExpense = (item: ExpenseItem) => (
    <View key={item.id} style={styles.listItem}>
      <View style={styles.listItemLeft}>
        <Text style={styles.listDate}>{item.date}</Text>
        <Text style={styles.listName}>{item.name}</Text>
        <Text style={styles.listExpenseAmount}>{formatNumber(item.amount)} so'm</Text>
      </View>
      {canEdit && (
        <Pressable style={styles.deleteBtn} onPress={() => handleDelete('xarajat', item.id)} hitSlop={8}>
          <Trash2 size={16} color={Colors.danger} />
        </Pressable>
      )}
    </View>
  );

  const sections: { key: SectionTab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'kirim', label: 'Olindi', icon: <Package size={16} color={activeSection === 'kirim' ? Colors.primary : Colors.textMuted} />, count: data.kirimlar.length },
    { key: 'sotuv', label: 'Sotildi', icon: <ShoppingCart size={16} color={activeSection === 'sotuv' ? Colors.blue : Colors.textMuted} />, count: data.sotuvlar.length },
    { key: 'xarajat', label: 'Xarajat', icon: <Receipt size={16} color={activeSection === 'xarajat' ? Colors.danger : Colors.textMuted} />, count: data.xarajatlar.length },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: `${month} ${year}`,
          headerTintColor: Colors.text,
          headerRight: () => (
            <View style={styles.headerRight}>
              <Pressable
                style={styles.headerBtn}
                onPress={() => router.push(`/admin/report?year=${year}&month=${month}` as never)}
                hitSlop={8}
              >
                <BarChart3 size={20} color={Colors.primary} />
              </Pressable>
              {canEdit && (
                <Pressable
                  style={styles.headerBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/admin/sell?year=${year}&month=${month}` as never);
                  }}
                  hitSlop={8}
                >
                  <Plus size={20} color={Colors.primary} />
                </Pressable>
              )}
            </View>
          ),
        }}
      />

      <View style={styles.quickStats}>
        <View style={[styles.statItem, { backgroundColor: Colors.primaryLight }]}>
          <Text style={[styles.statValue, { color: Colors.primary }]}>{formatNumber(report.totalKirim)}</Text>
          <Text style={styles.statLabel}>Kirim</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: Colors.blueLight }]}>
          <Text style={[styles.statValue, { color: Colors.blue }]}>{formatNumber(report.totalSotuv)}</Text>
          <Text style={styles.statLabel}>Sotuv</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: report.sofFoyda >= 0 ? Colors.successLight : Colors.dangerLight }]}>
          <Text style={[styles.statValue, { color: report.sofFoyda >= 0 ? Colors.success : Colors.danger }]}>
            {formatNumber(report.sofFoyda)}
          </Text>
          <Text style={styles.statLabel}>Sof foyda</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        {sections.map(s => (
          <Pressable
            key={s.key}
            style={[styles.sectionTab, activeSection === s.key && styles.activeSectionTab]}
            onPress={() => { setActiveSection(s.key); Haptics.selectionAsync(); }}
          >
            {s.icon}
            <Text style={[
              styles.sectionTabText,
              activeSection === s.key && (
                s.key === 'kirim' ? styles.activeGreen :
                s.key === 'sotuv' ? styles.activeBlue : styles.activeRed
              ),
            ]}>
              {s.label} ({s.count})
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {activeSection === 'kirim' && (
          data.kirimlar.length === 0
            ? <Text style={styles.emptyText}>Kirimlar yo'q</Text>
            : [...data.kirimlar].reverse().map(renderKirim)
        )}
        {activeSection === 'sotuv' && (
          data.sotuvlar.length === 0
            ? <Text style={styles.emptyText}>Sotuvlar yo'q</Text>
            : [...data.sotuvlar].reverse().map(renderSale)
        )}
        {activeSection === 'xarajat' && (
          data.xarajatlar.length === 0
            ? <Text style={styles.emptyText}>Xarajatlar yo'q</Text>
            : [...data.xarajatlar].reverse().map(renderExpense)
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
  headerRight: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  quickStats: {
    flexDirection: 'row' as const,
    padding: 16,
    gap: 8,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500' as const,
  },
  tabBar: {
    flexDirection: 'row' as const,
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 10,
    borderRadius: 9,
    gap: 4,
  },
  activeSectionTab: {
    backgroundColor: Colors.background,
  },
  sectionTabText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  activeGreen: { color: Colors.primary },
  activeBlue: { color: Colors.blue },
  activeRed: { color: Colors.danger },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  listItemLeft: {
    flex: 1,
  },
  listDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  listName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  listDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  listProfit: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  profitPositive: {
    color: Colors.success,
  },
  profitNegative: {
    color: Colors.danger,
  },
  listExpenseAmount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.dangerLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    paddingVertical: 40,
    fontStyle: 'italic' as const,
  },
});