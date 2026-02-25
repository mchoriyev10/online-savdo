import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, ShieldCheck, Warehouse } from 'lucide-react-native';
import { useRef } from 'react';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

function AnimatedCard({ onPress, children, delay }: { onPress: () => void; children: React.ReactNode; delay: number }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const scaleDown = useRef(new Animated.Value(1)).current;

  Animated.parallel([
    Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, tension: 60, friction: 8 }),
    Animated.timing(opacity, { toValue: 1, delay, duration: 400, useNativeDriver: true }),
  ]).start();

  const handlePressIn = () => {
    Animated.spring(scaleDown, { toValue: 0.95, useNativeDriver: true, tension: 100, friction: 10 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleDown, { toValue: 1, useNativeDriver: true, tension: 100, friction: 10 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: Animated.multiply(scale, scaleDown) }], opacity }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSeller = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/seller' as never);
  };

  const handleAdmin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/admin-login' as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Warehouse size={36} color={Colors.primary} strokeWidth={2.2} />
        </View>
        <Text style={styles.title}>Biznes Boshqaruv</Text>
        <Text style={styles.subtitle}>Ombor, sotuv va xarajatlarni boshqaring</Text>
      </View>

      <View style={styles.cards}>
        <AnimatedCard onPress={handleSeller} delay={100}>
          <View style={styles.sellerCard}>
            <View style={styles.cardIconContainer}>
              <Package size={32} color={Colors.primary} strokeWidth={1.8} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Sotuvchi Paneli</Text>
              <Text style={styles.cardDesc}>Mahsulot kirimi va xarajat qo'shish</Text>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard onPress={handleAdmin} delay={250}>
          <View style={styles.adminCard}>
            <View style={[styles.cardIconContainer, styles.adminIcon]}>
              <ShieldCheck size={32} color="#FFF" strokeWidth={1.8} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, styles.adminCardTitle]}>Admin Panel</Text>
              <Text style={[styles.cardDesc, styles.adminCardDesc]}>Hisobot, sotuv va boshqaruv</Text>
            </View>
            <View style={styles.cardArrow}>
              <Text style={[styles.arrowText, styles.adminArrow]}>→</Text>
            </View>
          </View>
        </AnimatedCard>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Standart parol: 1234</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center' as const,
    marginTop: 40,
    marginBottom: 50,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  cards: {
    gap: 16,
  },
  sellerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  adminCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  adminIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  adminCardTitle: {
    color: '#FFF',
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  adminCardDesc: {
    color: 'rgba(255,255,255,0.75)',
  },
  cardArrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 22,
    color: Colors.textMuted,
    fontWeight: '300' as const,
  },
  adminArrow: {
    color: 'rgba(255,255,255,0.6)',
  },
  footer: {
    position: 'absolute' as const,
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center' as const,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});