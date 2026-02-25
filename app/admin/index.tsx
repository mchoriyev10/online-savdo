import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, FlatList,
} from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import {
  Calendar, ChevronRight, Settings, BarChart3, Lock, Warehouse,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useData } from '@/context/DataContext';
import { formatNumber, getAllMonthNames, getMonthIndex, isCurrentYear, getCurrentMonth, getCurrentYear } from '@/utils/helpers';

export default function AdminDashboard() {
  const router = useRouter();
  const { getYears, getMonths, getReport, warehouse } = useData();
  const [expandedYear, setExpandedYear] = useState<string | null>(getCurrentYear());
  const [, setRefresh] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefresh(r => r + 1);
    }, [])
  );

  const years = getYears();

  const handleYearToggle = (year: string) => {
    Haptics.selectionAsync();
    setExpandedYear(expandedYear === year ? null : year);
  };

  const handleMonthPress = (year: string, month: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/admin/month?year=${year}&month=${month}` as never);
  };

  const handleReport = (year: string, month: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/admin/report?year=${year}&month=${month}` as never);
  };

  const renderYear = (year: string) => {
    const isCurrent = isCurrentYear(year);
    const months = getMonths(year);
    const currentMonth = getCurrentMonth();
    const isExpanded = expandedYear === year;

    const allMonthsForYear = isCurrent
      ? getAllMonthNames().filter((m) => {
          const mIdx = getMonthIndex(m);
          const currentIdx = getMonthIndex(currentMonth);
          return mIdx <= currentIdx || months.includes(m);
        })
      : months;

    const sortedMonths = allMonthsForYear.sort((a, b) => getMonthIndex(b) - getMonthIndex(a));

    return (
      <View key={year} style={styles.yearBlock}>
        <Pressable style={styles.yearHeader} onPress={() => handleYearToggle(year)}>
          <View style={styles.yearLeft}>
            <Calendar size={20} color={isCurrent ? Colors.primary : Colors.textSecondary} />
            <Text style={[styles.yearText, isCurrent && styles.currentYearText]}>{year}</Text>
            {isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Joriy</Text>
              </View>
            )}
            {!isCurrent && (
              <View style={styles.lockedBadge}>
                <Lock size={12} color={Colors.textMuted} />
              </View>
            )}
          </View>
          <ChevronRight
            size={20}
            color={Colors.textMuted}
            style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
          />
        </Pressable>

        {isExpanded && (
          <View style={styles.monthsList}>
            {sortedMonths.map((month) => {
              const report = getReport(year, month);
              const hasData = report.totalKirim > 0 || report.totalSotuv > 0 || report.totalXarajat > 0;
              const isCurrentM = isCurrent && month === currentMonth;

              return (
                <Pressable
                  key={month}
                  style={[styles.monthItem, isCurrentM && styles.currentMonthItem]}
                  onPress={() => handleMonthPress(year, month)}
                >
                  <View style={styles.monthLeft}>
                    <Text style={[styles.monthText, isCurrentM && styles.currentMonthText]}>
                      {month}
                    </Text>
                    {hasData && (
                      <Text style={styles.monthSummary}>
                        Kirim: {formatNumber(report.totalKirim)} | Sotuv: {formatNumber(report.totalSotuv)}
                      </Text>
                    )}
                    {!hasData && (
                      <Text style={styles.monthEmpty}>Ma'lumot yo'q</Text>
                    )}
                  </View>
                  <View style={styles.monthRight}>
                    {hasData && (
                      <Pressable
                        style={styles.reportBtn}
                        onPress={() => handleReport(year, month)}
                        hitSlop={8}
                      >
                        <BarChart3 size={16} color={Colors.primary} />
                      </Pressable>
                    )}
                    <ChevronRight size={18} color={Colors.textMuted} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const totalWarehouse = warehouse.reduce((s, w) => s + w.quantity, 0);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Admin Panel',
          headerTintColor: Colors.text,
          headerRight: () => (
            <Pressable onPress={() => router.push('/admin/settings' as never)} hitSlop={10}>
              <Settings size={22} color={Colors.textSecondary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.warehouseCard}>
          <View style={styles.whIcon}>
            <Warehouse size={22} color={Colors.primary} strokeWidth={1.8} />
          </View>
          <View style={styles.whInfo}>
            <Text style={styles.whTitle}>Ombor</Text>
            <Text style={styles.whCount}>{warehouse.length} mahsulot, {formatNumber(totalWarehouse)} birlik</Text>
          </View>
          <Pressable
            style={styles.whBtn}
            onPress={() => { Haptics.selectionAsync(); router.push('/admin/warehouse' as never); }}
          >
            <Text style={styles.whBtnText}>Ko'rish</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Yillar</Text>
        {years.map(renderYear)}
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
  warehouseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  whIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  whInfo: {
    flex: 1,
    marginLeft: 12,
  },
  whTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  whCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  whBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  whBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  yearBlock: {
    marginBottom: 12,
  },
  yearHeader: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  yearLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  currentYearText: {
    color: Colors.primary,
  },
  currentBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  lockedBadge: {
    opacity: 0.5,
  },
  monthsList: {
    marginTop: 4,
    marginLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.borderLight,
    paddingLeft: 16,
  },
  monthItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  currentMonthItem: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  monthLeft: {
    flex: 1,
  },
  monthText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  currentMonthText: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  monthSummary: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  monthEmpty: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic' as const,
  },
  monthRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  reportBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
});