import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { TrendingUp, TrendingDown, ArrowDownUp, Wallet, PiggyBank } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useData } from '@/context/DataContext';
import { formatNumber } from '@/utils/helpers';

export default function ReportScreen() {
  const { year, month } = useLocalSearchParams<{ year: string; month: string }>();
  const { getReport, getMonthData } = useData();

  if (!year || !month) return null;

  const report = getReport(year, month);
  const data = getMonthData(year, month);

  const cards = [
    {
      label: 'Umumiy kirim',
      value: report.totalKirim,
      icon: <TrendingDown size={22} color={Colors.primary} />,
      bg: Colors.primaryLight,
      color: Colors.primary,
      desc: `${data.kirimlar.length} ta mahsulot olindi`,
    },
    {
      label: 'Umumiy sotuv',
      value: report.totalSotuv,
      icon: <TrendingUp size={22} color={Colors.blue} />,
      bg: Colors.blueLight,
      color: Colors.blue,
      desc: `${data.sotuvlar.length} ta sotuv amalga oshdi`,
    },
    {
      label: 'Umumiy foyda',
      value: report.totalFoyda,
      icon: <PiggyBank size={22} color={Colors.accent} />,
      bg: Colors.accentLight,
      color: Colors.accent,
      desc: 'Sotuv - Tannarx',
    },
    {
      label: 'Umumiy xarajat',
      value: report.totalXarajat,
      icon: <Wallet size={22} color={Colors.danger} />,
      bg: Colors.dangerLight,
      color: Colors.danger,
      desc: `${data.xarajatlar.length} ta xarajat`,
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Hisobot — ${month} ${year}`, headerTintColor: Colors.text }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cards.map((c) => (
          <View key={c.label} style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: c.bg }]}>
              {c.icon}
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>{c.label}</Text>
              <Text style={styles.cardDesc}>{c.desc}</Text>
            </View>
            <Text style={[styles.cardValue, { color: c.color }]}>{formatNumber(c.value)}</Text>
          </View>
        ))}

        <View style={styles.resultCard}>
          <ArrowDownUp size={24} color={report.sofFoyda >= 0 ? Colors.success : Colors.danger} />
          <View style={styles.resultInfo}>
            <Text style={styles.resultLabel}>Sof foyda</Text>
            <Text style={styles.resultFormula}>Umumiy foyda − Xarajatlar</Text>
          </View>
          <Text style={[
            styles.resultValue,
            { color: report.sofFoyda >= 0 ? Colors.success : Colors.danger },
          ]}>
            {report.sofFoyda >= 0 ? '+' : ''}{formatNumber(report.sofFoyda)}
          </Text>
        </View>

        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Hisoblash</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Sotuv jami</Text>
            <Text style={styles.breakdownValue}>{formatNumber(report.totalSotuv)} so'm</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>− Kirim (tannarx)</Text>
            <Text style={styles.breakdownValue}>{formatNumber(report.totalKirim)} so'm</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>= Umumiy foyda</Text>
            <Text style={[styles.breakdownValue, { fontWeight: '600' as const }]}>{formatNumber(report.totalFoyda)} so'm</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>− Xarajatlar</Text>
            <Text style={styles.breakdownValue}>{formatNumber(report.totalXarajat)} so'm</Text>
          </View>
          <View style={[styles.breakdownRow, styles.breakdownTotal]}>
            <Text style={styles.breakdownTotalLabel}>= Sof foyda</Text>
            <Text style={[
              styles.breakdownTotalValue,
              { color: report.sofFoyda >= 0 ? Colors.success : Colors.danger },
            ]}>
              {formatNumber(report.sofFoyda)} so'm
            </Text>
          </View>
        </View>
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  resultFormula: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  breakdown: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    color: Colors.text,
  },
  breakdownTotal: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    marginTop: 4,
    paddingTop: 12,
  },
  breakdownTotalLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  breakdownTotalValue: {
    fontSize: 18,
    fontWeight: '800' as const,
  },
});
