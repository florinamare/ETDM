import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../constants/theme';

export default function SplashScreen({ navigation }) {
  const { hasOnboarded } = useApp();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinRevAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.timing(spinRevAnim, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(() => {
      if (hasOnboarded === null) return;
      navigation.replace(hasOnboarded ? 'Main' : 'Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [hasOnboarded]);

  const spinDeg = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinRevDeg = spinRevAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Rotating rings */}
        <View style={styles.ringContainer}>
          <Animated.View style={[styles.ringOuter, { transform: [{ rotate: spinDeg }] }]} />
          <Animated.View style={[styles.ringInner, { transform: [{ rotate: spinRevDeg }] }]} />

          <Animated.View style={[styles.logoBox, { transform: [{ scale: pulseAnim }] }]}>
            {/* Building icon */}
            <View style={styles.logoIcon}>
              <View style={styles.iconTopBar} />
              <View style={styles.iconBody} />
            </View>
          </Animated.View>
        </View>

        <Text style={styles.title}>AR TOURIST</Text>
        <Text style={styles.subtitle}>SMART GUIDE · v1.0</Text>
      </Animated.View>

      <View style={styles.statusRow}>
        <Animated.View style={[styles.statusDot, { opacity: dotAnim }]} />
        <Text style={styles.statusText}>INIȚIALIZARE SISTEM</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  ringContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  ringOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  ringInner: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
    borderTopColor: colors.accent,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  logoIcon: {
    alignItems: 'center',
    gap: 4,
  },
  iconTopBar: {
    width: 24,
    height: 4,
    backgroundColor: '#042',
    borderRadius: 2,
  },
  iconBody: {
    width: 32,
    height: 22,
    backgroundColor: '#042',
    borderRadius: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 3,
    opacity: 0.75,
  },
  statusRow: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  statusText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
  },
});
