import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../constants/theme';
import { recognizeBuilding } from '../services/api';

const { width, height } = Dimensions.get('window');

function CornerBrackets({ color, size = 22, thickness = 2 }) {
  const corners = [
    { top: 0, left: 0, borderTopWidth: thickness, borderLeftWidth: thickness },
    { top: 0, right: 0, borderTopWidth: thickness, borderRightWidth: thickness },
    { bottom: 0, left: 0, borderBottomWidth: thickness, borderLeftWidth: thickness },
    { bottom: 0, right: 0, borderBottomWidth: thickness, borderRightWidth: thickness },
  ];
  return (
    <>
      {corners.map((style, i) => (
        <View key={i} style={[{ position: 'absolute', width: size, height: size, borderColor: color }, style]} />
      ))}
    </>
  );
}

function ScanningOverlay({ visible, accent }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinRevAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })).start();
      Animated.loop(Animated.timing(spinRevAnim, { toValue: 1, duration: 1600, easing: Easing.linear, useNativeDriver: true })).start();
      Animated.timing(progressAnim, { toValue: 1, duration: 1800, useNativeDriver: false }).start();
    } else {
      spinAnim.setValue(0);
      spinRevAnim.setValue(0);
      progressAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const rotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateRev = spinRevAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={scan.overlay}>
      <View style={scan.spinner}>
        <Animated.View style={[scan.ring, { transform: [{ rotate }], borderColor: accent, borderTopColor: 'transparent', shadowColor: accent }]} />
        <Animated.View style={[scan.innerRing, { transform: [{ rotate: rotateRev }], borderColor: `${accent}55`, borderBottomColor: 'transparent' }]} />
        <Ionicons name="camera" size={28} color={accent} />
      </View>
      <Text style={[scan.label, { color: accent }]}>ANALIZARE...</Text>
      <Text style={scan.sub}>Compar cu 4.230 de clădiri</Text>
      <View style={scan.progressTrack}>
        <Animated.View style={[scan.progressFill, { width: progressWidth, backgroundColor: accent, shadowColor: accent }]} />
      </View>
    </View>
  );
}

function AROverlayCard({ building, onTap, onVoice }) {
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (building) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
    }
  }, [building]);

  if (!building) return null;
  const accent = building.accent || colors.accent;

  return (
    <Animated.View style={[card.container, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      {/* leader line dot */}
      <View style={[card.leaderDot, { backgroundColor: accent, shadowColor: accent }]} />

      <TouchableOpacity onPress={onTap} activeOpacity={0.9}>
        <View style={[card.box, { borderColor: `${accent}44`, shadowColor: accent }]}>
          <CornerBrackets color={accent} size={10} thickness={1.2} />

          <View style={card.meta}>
            <View style={card.statusRow}>
              <View style={[card.dot, { backgroundColor: accent, shadowColor: accent }]} />
              <Text style={[card.statusText, { color: accent }]}>Recunoscut</Text>
            </View>
            <View style={card.bars}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={[card.bar, { backgroundColor: i < 7 ? accent : 'rgba(255,255,255,0.15)', height: 4 + i }]} />
              ))}
            </View>
          </View>

          <Text style={card.name}>{building.name}</Text>
          <Text style={card.tag}>{building.tag}</Text>

          <View style={card.stats}>
            {[
              { label: 'AN', val: building.year },
              { label: 'STIL', val: building.style },
              { label: 'DIST', val: building.distance },
            ].map(s => (
              <View key={s.label} style={card.stat}>
                <Text style={card.statLabel}>{s.label}</Text>
                <Text style={card.statVal}>{s.val}</Text>
              </View>
            ))}
          </View>

          <View style={card.footer}>
            <Text style={card.rating}>★ {building.rating} · arhit. {building.architect}</Text>
            <Text style={[card.more, { color: accent }]}>DETALII →</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function DistantMarker({ building, style, onTap }) {
  const accent = building.accent || colors.accent;
  return (
    <TouchableOpacity style={[marker.container, style]} onPress={onTap}>
      <View style={[marker.pill, { borderColor: `${accent}66` }]}>
        <View style={[marker.dot, { backgroundColor: accent, shadowColor: accent }]} />
        <Text style={marker.name}>{building.shortName}</Text>
        <Text style={marker.dist}>· {building.distance}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ARViewScreen({ navigation }) {
  const { buildings, activeBuilding, setActiveBuilding, addDiscovered, discovered } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanState, setScanState] = useState('idle'); // idle | scanning | recognized | error
  const [recognizedBuilding, setRecognizedBuilding] = useState(activeBuilding);
  const cameraRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(1)).current;

  const accent = recognizedBuilding?.accent || colors.accent;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, { toValue: 1.3, duration: 2000, useNativeDriver: true }),
        Animated.timing(rippleAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleScan = async () => {
    if (scanning) return;
    setScanning(true);
    setScanState('scanning');

    try {
      let building = null;

      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
        const res = await recognizeBuilding(photo.base64);
        building = res.data?.building;
      }

      if (!building) {
        // Demo fallback: cycle through buildings
        const idx = buildings.findIndex(b => b.id === recognizedBuilding?.id);
        building = buildings[(idx + 1) % buildings.length];
      }

      if (building) {
        setRecognizedBuilding(building);
        setActiveBuilding(building);
        addDiscovered(building.id);
        setScanState('recognized');
      } else {
        setScanState('error');
        Alert.alert('Nerecunoscut', 'Clădire nerecunoscută. Încearcă din nou.');
        setScanState('idle');
      }
    } catch {
      // Demo fallback
      const idx = buildings.findIndex(b => b.id === recognizedBuilding?.id);
      const building = buildings[(idx + 1) % buildings.length];
      setRecognizedBuilding(building);
      setActiveBuilding(building);
      addDiscovered(building.id);
      setScanState('recognized');
    } finally {
      setScanning(false);
    }
  };

  const otherBuildings = buildings.filter(b => b.id !== recognizedBuilding?.id).slice(0, 3);
  const markerPositions = [
    { position: 'absolute', top: height * 0.15, left: 24 },
    { position: 'absolute', top: height * 0.22, right: 24 },
    { position: 'absolute', top: height * 0.35, left: 40 },
  ];

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permContainer]}>
        <StatusBar style="light" />
        <Ionicons name="camera-outline" size={64} color={colors.accent} />
        <Text style={styles.permTitle}>Acces la cameră necesar</Text>
        <Text style={styles.permSub}>AR Tourist folosește camera pentru a recunoaște clădirile.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Acordă acces la cameră</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Camera */}
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {/* AR grid overlay */}
      <View style={styles.gridOverlay} pointerEvents="none" />

      {/* Scan line */}
      <View style={styles.scanLineContainer} pointerEvents="none">
        <Animated.View style={[styles.scanLine, { backgroundColor: accent, shadowColor: accent }]} />
      </View>

      {/* Top HUD */}
      <View style={styles.hud}>
        <View style={styles.hudLeft}>
          <Animated.View style={[styles.hudDot, { backgroundColor: accent, shadowColor: accent }]} />
          <View>
            <Text style={[styles.hudMode, { color: accent }]}>AR ACTIV</Text>
            <Text style={styles.hudLocation}>Centrul Istoric · Timișoara</Text>
          </View>
        </View>
        <View style={styles.hudRight}>
          <Ionicons name="compass" size={14} color={accent} />
          <Text style={styles.hudCompass}>{recognizedBuilding?.bearing || 'N'} · 42°</Text>
        </View>
      </View>

      {/* Distant markers */}
      {!scanning && otherBuildings.map((b, i) => (
        <DistantMarker
          key={b.id}
          building={b}
          style={markerPositions[i] || markerPositions[0]}
          onTap={() => { setRecognizedBuilding(b); setActiveBuilding(b); }}
        />
      ))}

      {/* Reticle */}
      {!scanning && (
        <Animated.View style={[styles.reticle, { transform: [{ scale: pulseAnim }] }]}>
          <CornerBrackets color={accent} size={18} thickness={1.5} />
          <View style={[styles.reticleDot, { backgroundColor: accent, shadowColor: accent }]} />
        </Animated.View>
      )}

      {/* AR Card */}
      {!scanning && (
        <AROverlayCard
          building={recognizedBuilding}
          onTap={() => navigation.navigate('Detail', { building: recognizedBuilding })}
          onVoice={() => navigation.navigate('Voice', { building: recognizedBuilding })}
        />
      )}

      {/* Scanning overlay */}
      <ScanningOverlay visible={scanning} accent={accent} />

      {/* Building dots selector */}
      <View style={styles.dotsRow}>
        {buildings.map(b => (
          <TouchableOpacity
            key={b.id}
            onPress={() => { setRecognizedBuilding(b); setActiveBuilding(b); }}
            style={[
              styles.buildingDot,
              {
                backgroundColor: b.id === recognizedBuilding?.id ? b.accent : 'rgba(255,255,255,0.25)',
                width: b.id === recognizedBuilding?.id ? 24 : 6,
                shadowColor: b.accent,
                shadowOpacity: b.id === recognizedBuilding?.id ? 0.8 : 0,
              },
            ]}
          />
        ))}
      </View>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.sideBtn}
          onPress={() => navigation.navigate('Voice', { building: recognizedBuilding })}
        >
          <Ionicons name="mic" size={18} color={accent} />
          <Text style={styles.sideBtnText}>Întreabă AI</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleScan} disabled={scanning} style={styles.scanBtn}>
          <Animated.View style={[styles.scanBtnInner, { borderColor: accent, shadowColor: accent }]}>
            <View style={[styles.scanBtnCore, { backgroundColor: accent, shadowColor: accent }]} />
            {!scanning && (
              <Animated.View
                style={[styles.ripple, { borderColor: accent, transform: [{ scale: rippleAnim }], opacity: rippleAnim.interpolate({ inputRange: [1, 1.3], outputRange: [0.4, 0] }) }]}
              />
            )}
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideBtn}>
          <Ionicons name="bookmark-outline" size={16} color={colors.textDim} />
          <Text style={[styles.sideBtnText, { color: colors.textDim }]}>Salvează</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const scan = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  spinner: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ring: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  innerRing: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 3,
  },
  sub: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: 6,
    fontFamily: fonts.body,
  },
  progressTrack: {
    width: 160,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});

const card = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  leaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  box: {
    width: 264,
    backgroundColor: 'rgba(8,11,18,0.88)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  statusText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bars: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'flex-end',
    height: 12,
  },
  bar: {
    width: 3,
    borderRadius: 1,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },
  tag: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: 2,
    fontFamily: fonts.body,
  },
  stats: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 7,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 7,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  statVal: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: fonts.body,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  rating: {
    fontSize: 11,
    color: colors.text,
    fontFamily: fonts.body,
  },
  more: {
    fontSize: 10,
    fontFamily: fonts.mono,
  },
});

const marker = StyleSheet.create({
  container: {
    zIndex: 8,
  },
  pill: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  name: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.text,
  },
  dist: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  permContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  permTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  permSub: {
    fontSize: 14,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  permBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.accent,
    borderRadius: 14,
  },
  permBtnText: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    color: '#042',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
  },
  scanLineContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  scanLine: {
    height: 2,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  hud: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  hudLeft: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hudDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  hudMode: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  hudLocation: {
    fontSize: 10,
    color: colors.textDim,
    marginTop: 1,
    fontFamily: fonts.body,
  },
  hudRight: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hudCompass: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.text,
  },
  reticle: {
    position: 'absolute',
    top: '52%',
    alignSelf: 'center',
    marginTop: -50,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
    pointerEvents: 'none',
  },
  reticleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  dotsRow: {
    position: 'absolute',
    bottom: 168,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 15,
  },
  buildingDot: {
    height: 6,
    borderRadius: 3,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  actionBar: {
    position: 'absolute',
    bottom: 88,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 15,
  },
  sideBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sideBtnText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  scanBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  scanBtnCore: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  ripple: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
  },
});
