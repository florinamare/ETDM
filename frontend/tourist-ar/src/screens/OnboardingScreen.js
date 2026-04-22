import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useCameraPermissions } from 'expo-camera';
import { useApp } from '../context/AppContext';
import { colors, fonts } from '../constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Privește clădirile.\nAflă povestea.',
    sub: 'Îndreaptă camera către orice monument din oraș și descoperă instant istoria lui.',
    kind: 'ar',
  },
  {
    title: 'Întreabă cu vocea.\nRăspunde cu AI.',
    sub: 'Ghid vocal inteligent care îți răspunde în română despre orice clădire recunoscută.',
    kind: 'voice',
  },
  {
    title: 'Colecționează\nTimișoara.',
    sub: 'Deblochează clădiri pe hartă, urmărește-ți progresul și împarte descoperirile.',
    kind: 'collect',
  },
];

function ARIllust() {
  const pulse = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={illust.container}>
      <View style={illust.phoneFrame}>
        <Animated.View style={[illust.reticle, { transform: [{ scale: pulse }] }]} />
      </View>
      <View style={illust.card}>
        <Text style={illust.cardLabel}>RECUNOSCUT</Text>
        <Text style={illust.cardName}>Opera</Text>
        <Text style={illust.cardMeta}>1875 · Baroc Vienez</Text>
        <View style={illust.cardBar} />
      </View>
      {['tl', 'tr', 'bl', 'br'].map(pos => (
        <View key={pos} style={[illust.corner, illust[pos]]} />
      ))}
    </View>
  );
}

function VoiceIllust() {
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(scale1, { toValue: 1.4, duration: 2000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(scale2, { toValue: 1.4, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={illust.container}>
      <Animated.View style={[illust.ripple, { transform: [{ scale: scale1 }], opacity: scale1.interpolate({ inputRange: [1, 1.4], outputRange: [0.4, 0] }) }]} />
      <Animated.View style={[illust.ripple, { transform: [{ scale: scale2 }], opacity: scale2.interpolate({ inputRange: [1, 1.4], outputRange: [0.4, 0] }) }]} />
      <View style={illust.micCircle}>
        {[0.6, 1.2, 0.8, 1.5, 1, 0.7, 1.3, 0.5].map((h, i) => (
          <View key={i} style={[illust.bar, { transform: [{ scaleY: h }] }]} />
        ))}
      </View>
      <View style={illust.bubble}>
        <Text style={illust.bubbleText}>„Când a fost construit?"</Text>
      </View>
    </View>
  );
}

function CollectIllust() {
  const buildingNames = ['Catedrala', 'Opera', 'Castelul', 'Dom-ul'];
  const accents = ['#FFB26B', '#8BD3FF', '#B8F0C2', '#E1B9FF'];
  const positions = [
    { top: 20, left: 10 },
    { top: 60, left: 120 },
    { top: 130, left: 15 },
    { top: 175, left: 110 },
  ];
  return (
    <View style={[illust.container, { height: 260 }]}>
      {buildingNames.map((name, i) => (
        <View
          key={name}
          style={[
            illust.buildingCard,
            {
              top: positions[i].top,
              left: positions[i].left,
              borderColor: `${accents[i]}55`,
              shadowColor: accents[i],
            },
          ]}
        >
          <Text style={[illust.cardLabel, { color: accents[i] }]}>DEBLOCAT</Text>
          <Text style={illust.cardName}>{name}</Text>
        </View>
      ))}
    </View>
  );
}

function PermissionDialog({ onGrant, onDeny }) {
  return (
    <Modal transparent animationType="fade">
      <View style={perm.overlay}>
        <View style={perm.dialog}>
          <Text style={perm.title}>„AR Tourist" dorește acces la cameră</Text>
          <Text style={perm.body}>
            Camera este folosită pentru a recunoaște clădirile în timp real și a afișa informații AR deasupra lor.
          </Text>
          <Text style={perm.body}>
            De asemenea, microfonul permite utilizarea asistentului vocal.
          </Text>
          <View style={perm.divider} />
          <View style={perm.row}>
            <TouchableOpacity style={perm.btn} onPress={onDeny}>
              <Text style={perm.btnText}>Nu permite</Text>
            </TouchableOpacity>
            <View style={perm.vDivider} />
            <TouchableOpacity style={perm.btn} onPress={onGrant}>
              <Text style={[perm.btnText, { fontWeight: '700' }]}>Permite</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [showPerm, setShowPerm] = useState(false);
  const { markOnboarded } = useApp();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const goToMain = () => {
    markOnboarded();
    navigation.replace('Main');
  };

  const next = () => {
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      setShowPerm(true);
    }
  };

  const handleGrant = async () => {
    setShowPerm(false);
    await requestCameraPermission();
    goToMain();
  };

  const current = SLIDES[step];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i <= step && styles.dotActive, i === step && styles.dotCurrent]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={goToMain}>
          <Text style={styles.skip}>Omite</Text>
        </TouchableOpacity>
      </View>

      {/* Illustration */}
      <View style={styles.illustArea}>
        {current.kind === 'ar' && <ARIllust />}
        {current.kind === 'voice' && <VoiceIllust />}
        {current.kind === 'collect' && <CollectIllust />}
      </View>

      {/* Text */}
      <View style={styles.copyArea}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.sub}>{current.sub}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={next} activeOpacity={0.85}>
        <Text style={styles.buttonText}>
          {step < SLIDES.length - 1 ? 'Continuă' : 'Acordă permisiuni'}
        </Text>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>

      {showPerm && <PermissionDialog onGrant={handleGrant} onDeny={() => setShowPerm(false)} />}
    </View>
  );
}

const illust = StyleSheet.create({
  container: {
    width: 260,
    height: 260,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    position: 'absolute',
    top: 20,
    left: 80,
    right: 80,
    bottom: 20,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: 22,
    backgroundColor: 'rgba(14,24,34,1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticle: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  card: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 120,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: `${colors.accent}44`,
    borderRadius: 10,
    padding: 10,
  },
  cardLabel: {
    fontFamily: fonts.mono,
    fontSize: 7,
    color: colors.accent,
    letterSpacing: 1,
  },
  cardName: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginTop: 3,
  },
  cardMeta: {
    fontSize: 9,
    color: colors.textDim,
    marginTop: 3,
  },
  cardBar: {
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginTop: 6,
    width: '80%',
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
  },
  tl: { top: 25, left: 85, borderTopWidth: 2, borderLeftWidth: 2, borderColor: colors.accent, borderTopLeftRadius: 3 },
  tr: { top: 25, right: 85, borderTopWidth: 2, borderRightWidth: 2, borderColor: colors.accent, borderTopRightRadius: 3 },
  bl: { bottom: 25, left: 85, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: colors.accent, borderBottomLeftRadius: 3 },
  br: { bottom: 25, right: 85, borderBottomWidth: 2, borderRightWidth: 2, borderColor: colors.accent, borderBottomRightRadius: 3 },
  ripple: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: `${colors.accent}55`,
  },
  micCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: `${colors.accent}22`,
    borderWidth: 1.5,
    borderColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  bar: {
    width: 3,
    height: 32,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  bubble: {
    position: 'absolute',
    bottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  bubbleText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textDim,
  },
  buildingCard: {
    position: 'absolute',
    width: 90,
    backgroundColor: colors.panelSolid,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});

const perm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: 'rgba(30,30,36,0.98)',
    borderRadius: 14,
    padding: 22,
    width: '100%',
    maxWidth: 290,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    color: colors.textDim,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 18,
  },
  row: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    color: '#0A84FF',
    fontFamily: fonts.body,
  },
  vDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 72,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 3,
    width: 18,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  dotCurrent: {
    width: 28,
  },
  skip: {
    color: colors.textDim,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  illustArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyArea: {
    marginBottom: 28,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
    marginBottom: 14,
  },
  sub: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textDim,
    fontFamily: fonts.body,
  },
  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#042',
  },
  arrow: {
    fontSize: 18,
    color: '#042',
    fontWeight: '600',
  },
});
