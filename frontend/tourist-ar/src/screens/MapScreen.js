import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../constants/theme';

const BUCHAREST_REGION = {
  latitude: 44.4359,
  longitude: 26.0981,
  latitudeDelta: 0.018,
  longitudeDelta: 0.018,
};

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f1218' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8492a6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1f2c' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e2535' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1f2c' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2a3548' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0e18' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a1f2c' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#5EFCCF' }] },
];

function BuildingPin({ building, isDiscovered, isActive, onPress }) {
  const accent = building.accent || colors.accent;
  const size = isActive ? 18 : 12;

  return (
    <TouchableOpacity onPress={onPress} style={pin.wrapper}>
      <View
        style={[
          pin.outer,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderColor: accent,
            backgroundColor: `${accent}22`,
            opacity: isDiscovered ? 1 : 0.55,
          },
        ]}
      >
        <View
          style={[
            pin.inner,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isDiscovered ? accent : 'transparent',
              borderWidth: isDiscovered ? 0 : 1.5,
              borderColor: accent,
            },
          ]}
        />
      </View>
      {isActive && (
        <View style={[pin.label, { borderColor: `${accent}55` }]}>
          <Text style={[pin.labelText, { color: accent }]}>{building.shortName}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function MapScreen({ navigation }) {
  const { buildings, discovered, activeBuilding, setActiveBuilding } = useApp();
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const mapRef = useRef(null);

  const handleMarkerPress = (building) => {
    setSelectedBuilding(building);
    setActiveBuilding(building);
    mapRef.current?.animateToRegion(
      {
        latitude: building.coordinates.lat,
        longitude: building.coordinates.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      600
    );
  };

  const discoveredCount = buildings.filter(b => discovered.includes(b.id)).length;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={BUCHAREST_REGION}
        customMapStyle={MAP_STYLE}
        showsUserLocation
        showsCompass={false}
        showsPointsOfInterest={false}
      >
        {buildings.map(b => (
          <Marker
            key={b.id}
            coordinate={{ latitude: b.coordinates.lat, longitude: b.coordinates.lng }}
            onPress={() => handleMarkerPress(b)}
          >
            <BuildingPin
              building={b}
              isDiscovered={discovered.includes(b.id)}
              isActive={selectedBuilding?.id === b.id}
              onPress={() => handleMarkerPress(b)}
            />
          </Marker>
        ))}
      </MapView>

      {/* Top HUD */}
      <View style={styles.hud}>
        <View style={styles.hudBox}>
          <Ionicons name="map" size={14} color={colors.accent} />
          <View>
            <Text style={styles.hudTitle}>Hartă AR</Text>
            <Text style={styles.hudSub}>București · Centrul Vechi</Text>
          </View>
        </View>
        <View style={styles.hudStats}>
          <Text style={styles.hudStatNum}>{discoveredCount}</Text>
          <Text style={styles.hudStatLabel}>/{buildings.length} descoperite</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.legendText}>Descoperit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.accent, opacity: 0.55 }]} />
          <Text style={styles.legendText}>Nedescoperit</Text>
        </View>
      </View>

      {/* Selected building card */}
      {selectedBuilding && (
        <View style={styles.infoCard}>
          <View style={[styles.infoAccentBar, { backgroundColor: selectedBuilding.accent }]} />
          <View style={styles.infoContent}>
            <View style={styles.infoHeader}>
              <View>
                <Text style={styles.infoTag}>{selectedBuilding.tag}</Text>
                <Text style={styles.infoName}>{selectedBuilding.name}</Text>
                <Text style={styles.infoMeta}>{selectedBuilding.year} · {selectedBuilding.style}</Text>
              </View>
              {discovered.includes(selectedBuilding.id) && (
                <View style={[styles.badge, { backgroundColor: `${selectedBuilding.accent}22`, borderColor: `${selectedBuilding.accent}55` }]}>
                  <Text style={[styles.badgeText, { color: selectedBuilding.accent }]}>✓ Descoperit</Text>
                </View>
              )}
            </View>

            <View style={styles.infoFooter}>
              <View style={styles.distRow}>
                <Ionicons name="location" size={12} color={colors.textMuted} />
                <Text style={styles.dist}>{selectedBuilding.distance}</Text>
              </View>
              <TouchableOpacity
                style={[styles.detailBtn, { backgroundColor: selectedBuilding.accent }]}
                onPress={() => navigation.navigate('Detail', { building: selectedBuilding })}
              >
                <Text style={styles.detailBtnText}>Detalii</Text>
                <Ionicons name="chevron-forward" size={14} color="#042" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.closeCardBtn} onPress={() => setSelectedBuilding(null)}>
            <Ionicons name="close" size={16} color={colors.textDim} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const pin = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  inner: {},
  label: {
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  labelText: {
    fontFamily: fonts.mono,
    fontSize: 8,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  hud: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  hudBox: {
    backgroundColor: 'rgba(7,8,12,0.88)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  hudTitle: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  hudSub: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  hudStats: {
    backgroundColor: 'rgba(7,8,12,0.88)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  hudStatNum: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  hudStatLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
  },
  legend: {
    position: 'absolute',
    top: 130,
    right: 16,
    backgroundColor: 'rgba(7,8,12,0.88)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textDim,
  },
  infoCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: colors.panelSolid,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  infoAccentBar: {
    width: 4,
  },
  infoContent: {
    flex: 1,
    padding: 14,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoTag: {
    fontFamily: fonts.mono,
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 3,
  },
  infoName: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  infoMeta: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: 2,
    fontFamily: fonts.body,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    fontWeight: '600',
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dist: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  detailBtnText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#042',
  },
  closeCardBtn: {
    padding: 14,
    justifyContent: 'flex-start',
  },
});
