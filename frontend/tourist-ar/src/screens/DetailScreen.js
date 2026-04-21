import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../constants/theme';

function StatBox({ label, value, accent }) {
  return (
    <View style={[stat.box, { borderColor: `${accent}33` }]}>
      <Text style={stat.label}>{label}</Text>
      <Text style={[stat.value, { color: accent }]}>{value}</Text>
    </View>
  );
}

export default function DetailScreen({ navigation, route }) {
  const building = route.params?.building;
  const { discovered, addDiscovered } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  }, []);

  if (!building) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={20} color={colors.textDim} />
        </TouchableOpacity>
        <Text style={styles.errorText}>Clădire negăsită.</Text>
      </View>
    );
  }

  const accent = building.accent || colors.accent;
  const isDiscovered = discovered.includes(building.id);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Gradient header */}
      <Animated.View
        style={[styles.heroGradient, { opacity: fadeAnim, backgroundColor: `${accent}18` }]}
      />

      {/* Back / close */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-down" size={22} color={colors.textDim} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Tag + badge */}
          <View style={styles.topRow}>
            <View style={[styles.tagBadge, { backgroundColor: `${accent}20`, borderColor: `${accent}55` }]}>
              <Text style={[styles.tagText, { color: accent }]}>{building.tag}</Text>
            </View>
            {isDiscovered && (
              <View style={[styles.tagBadge, { backgroundColor: `${accent}20`, borderColor: `${accent}55` }]}>
                <Ionicons name="checkmark-circle" size={12} color={accent} />
                <Text style={[styles.tagText, { color: accent }]}>Descoperit</Text>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={styles.buildingName}>{building.name}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatBox label="AN" value={building.year} accent={accent} />
            <StatBox label="STIL" value={building.style} accent={accent} />
            <StatBox label="DIST" value={building.distance} accent={accent} />
            <StatBox label="NOTA" value={`★ ${building.rating}`} accent={accent} />
          </View>

          {/* Architect */}
          <View style={[styles.architectRow, { borderColor: `${accent}22` }]}>
            <View style={[styles.architectIcon, { backgroundColor: `${accent}20` }]}>
              <Ionicons name="person" size={16} color={accent} />
            </View>
            <View>
              <Text style={styles.architectLabel}>Arhitect</Text>
              <Text style={styles.architectName}>{building.architect}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: accent }]}>◆ DESCRIERE</Text>
            <Text style={styles.blurb}>{building.blurb}</Text>
          </View>

          {/* Facts */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: accent }]}>◆ FAPTE INTERESANTE</Text>
            {building.facts?.map((fact, i) => (
              <View key={i} style={[styles.factRow, { borderColor: `${accent}22` }]}>
                <View style={[styles.factNum, { backgroundColor: `${accent}20` }]}>
                  <Text style={[styles.factNumText, { color: accent }]}>{i + 1}</Text>
                </View>
                <Text style={styles.factText}>{fact}</Text>
              </View>
            ))}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: accent }]}
              onPress={() => navigation.navigate('Voice', { building })}
            >
              <Ionicons name="mic" size={18} color="#042" />
              <Text style={styles.primaryBtnText}>Întreabă AI despre {building.shortName}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                addDiscovered(building.id);
              }}
            >
              <Ionicons
                name={isDiscovered ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isDiscovered ? accent : colors.textDim}
              />
              <Text style={[styles.secondaryBtnText, isDiscovered && { color: accent }]}>
                {isDiscovered ? 'Salvat' : 'Salvează'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const stat = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 7,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  backBtn: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    zIndex: 100,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
  },
  errorText: {
    color: colors.textDim,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: 100,
  },
  scrollContent: {
    paddingTop: 72,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  topRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buildingName: {
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 16,
    lineHeight: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  architectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 24,
  },
  architectIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  architectLabel: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  architectName: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 12,
  },
  blurb: {
    fontSize: 15,
    color: colors.textDim,
    lineHeight: 24,
    fontFamily: fonts.body,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
    borderLeftWidth: 2,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  factNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  factNumText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: '700',
  },
  factText: {
    flex: 1,
    fontSize: 13,
    color: colors.textDim,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryBtnText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: '#042',
  },
  secondaryBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryBtnText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDim,
  },
});
