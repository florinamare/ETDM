import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../constants/theme';

function ProgressBar({ value, color }) {
  return (
    <View style={bar.track}>
      <View style={[bar.fill, { width: `${value * 100}%`, backgroundColor: color || colors.accent }]} />
    </View>
  );
}

function BuildingCard({ building, isDiscovered, onPress }) {
  const accent = building.accent || colors.accent;
  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: isDiscovered ? `${accent}44` : colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.cardAccent, { backgroundColor: accent, opacity: isDiscovered ? 1 : 0.3 }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTag}>{building.tag}</Text>
            <Text style={[styles.cardName, { opacity: isDiscovered ? 1 : 0.5 }]}>{building.name}</Text>
            <Text style={styles.cardMeta}>
              {building.year} · {building.style} · {building.bearing}
            </Text>
          </View>
          <View style={styles.cardRight}>
            {isDiscovered ? (
              <View style={[styles.badge, { backgroundColor: `${accent}22`, borderColor: `${accent}55` }]}>
                <Ionicons name="checkmark-circle" size={14} color={accent} />
                <Text style={[styles.badgeText, { color: accent }]}>Descoperit</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={12} color={colors.textMuted} />
                <Text style={styles.badgeLocked}>Blocat</Text>
              </View>
            )}
          </View>
        </View>

        {isDiscovered && (
          <View style={styles.cardFooter}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color={accent} />
              <Text style={styles.rating}>{building.rating}</Text>
              <Text style={styles.architect}>· {building.architect}</Text>
            </View>
            <Text style={[styles.more, { color: accent }]}>Ver detalii →</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function DiscoveredScreen({ navigation }) {
  const { buildings, discovered } = useApp();

  const discoveredCount = buildings.filter(b => discovered.includes(b.id)).length;
  const progress = discoveredCount / buildings.length;

  const sorted = [...buildings].sort((a, b) => {
    const aD = discovered.includes(a.id);
    const bD = discovered.includes(b.id);
    if (aD && !bD) return -1;
    if (!aD && bD) return 1;
    return 0;
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerLabel}>◆ PROGRES</Text>
              <Text style={styles.headerTitle}>Descoperite</Text>
              <Text style={styles.headerSub}>Centrul Istoric · Timișoara</Text>
            </View>

            {/* Progress card */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressNum}>
                    {discoveredCount}
                    <Text style={styles.progressTotal}>/{buildings.length}</Text>
                  </Text>
                  <Text style={styles.progressLabel}>clădiri descoperite</Text>
                </View>
                <View style={styles.progressPct}>
                  <Text style={styles.progressPctNum}>{Math.round(progress * 100)}%</Text>
                </View>
              </View>

              <ProgressBar value={progress} color={colors.accent} />

              {progress < 1 && (
                <Text style={styles.progressHint}>
                  {buildings.length - discoveredCount} clădiri rămase de descoperit
                </Text>
              )}
              {progress === 1 && (
                <Text style={[styles.progressHint, { color: colors.accent }]}>
                  🎉 Ai descoperit toate clădirile!
                </Text>
              )}
            </View>

            {/* Achievements */}
            <View style={styles.achievementsRow}>
              {[
                { icon: 'location', label: 'Explorer', unlocked: discoveredCount >= 1 },
                { icon: 'trophy', label: 'Ghid', unlocked: discoveredCount >= 3 },
                { icon: 'ribbon', label: 'Expert', unlocked: discoveredCount >= buildings.length },
              ].map(a => (
                <View key={a.label} style={[styles.achievement, !a.unlocked && styles.achievementLocked]}>
                  <Ionicons name={a.icon} size={20} color={a.unlocked ? colors.accent : colors.textMuted} />
                  <Text style={[styles.achievementLabel, !a.unlocked && { color: colors.textMuted }]}>{a.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>TOATE CLĂDIRILE</Text>
          </View>
        }
        renderItem={({ item }) => (
          <BuildingCard
            building={item}
            isDiscovered={discovered.includes(item.id)}
            onPress={() =>
              discovered.includes(item.id)
                ? navigation.navigate('Detail', { building: item })
                : null
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
}

const bar = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 64,
    paddingBottom: 20,
  },
  headerLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.accent,
    letterSpacing: 2,
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
  progressCard: {
    backgroundColor: colors.panelSolid,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressNum: {
    fontFamily: fonts.display,
    fontSize: 36,
    fontWeight: '800',
    color: colors.accent,
    lineHeight: 40,
  },
  progressTotal: {
    fontSize: 20,
    color: colors.textMuted,
  },
  progressLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  progressPct: {
    backgroundColor: `${colors.accent}15`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressPctNum: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  progressHint: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  achievementsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  achievement: {
    flex: 1,
    backgroundColor: `${colors.accent}10`,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  achievementLocked: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: colors.border,
  },
  achievementLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.panelSolid,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardAccent: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTag: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 3,
  },
  cardName: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  cardMeta: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: 3,
    fontFamily: fonts.body,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 8,
    fontWeight: '600',
  },
  badgeLocked: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 11,
    color: colors.text,
    fontFamily: fonts.body,
    fontWeight: '500',
  },
  architect: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  more: {
    fontFamily: fonts.mono,
    fontSize: 10,
  },
});
