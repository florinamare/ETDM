import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts } from '../constants/theme';
import { askQuestion } from '../services/api';

const DEMO_FLOWS = [
  { q: 'Când a fost construit?', a: null }, // filled dynamically
  { q: 'Cine l-a proiectat?', a: null },
];

function WaveBar({ height, delay, color }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: height, duration: 300 + delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.2, duration: 300 + delay, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        width: 4,
        height: 44,
        borderRadius: 2,
        backgroundColor: color || colors.accent,
        transform: [{ scaleY: anim }],
      }}
    />
  );
}

function ThinkingDots() {
  const dots = [0, 1, 2].map(i => useRef(new Animated.Value(1)).current);
  useEffect(() => {
    dots.forEach((d, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(d, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(d, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, opacity: d }} />
      ))}
    </View>
  );
}

export default function VoiceScreen({ navigation, route }) {
  const building = route.params?.building;
  const [phase, setPhase] = useState('idle'); // idle | listening | thinking | answering
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(1)).current;
  const ripple2 = useRef(new Animated.Value(1)).current;
  const answerText = useRef('');

  const demoAnswer = building
    ? `${building.name} a fost construit în ${building.year}, în stil ${building.style}. Arhitectul ${building.architect} a creat această capodoperă arhitecturală. ${building.facts?.[0] || ''}`
    : '';

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  useEffect(() => {
    if (phase === 'thinking') {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else {
      spinAnim.setValue(0);
    }

    if (phase === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(ripple1, { toValue: 1.5, duration: 2000, useNativeDriver: true }),
          Animated.timing(ripple1, { toValue: 1, duration: 0, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.delay(800),
          Animated.timing(ripple2, { toValue: 1.5, duration: 2000, useNativeDriver: true }),
          Animated.timing(ripple2, { toValue: 1, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    } else {
      ripple1.setValue(1);
      ripple2.setValue(1);
    }
  }, [phase]);

  const startListening = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setPhase('listening');
      setQuestion('');
      setAnswer('');

      // Simulate typing the demo question
      const demo = DEMO_FLOWS[0].q;
      let i = 0;
      const typeInterval = setInterval(() => {
        setQuestion(demo.slice(0, i));
        i++;
        if (i > demo.length) clearInterval(typeInterval);
      }, 45);

      setTimeout(() => stopListening(rec), 3000);
    } catch {
      // Fallback: skip real recording
      setPhase('listening');
      setQuestion('');
      const demo = DEMO_FLOWS[0].q;
      let i = 0;
      const typeInterval = setInterval(() => {
        setQuestion(demo.slice(0, i));
        i++;
        if (i > demo.length) clearInterval(typeInterval);
      }, 45);
      setTimeout(() => processQuestion(demo), 3500);
    }
  };

  const stopListening = async (rec) => {
    try {
      await rec?.stopAndUnloadAsync();
      setRecording(null);
    } catch {}
    const q = DEMO_FLOWS[0].q;
    processQuestion(q);
  };

  const processQuestion = async (q) => {
    setPhase('thinking');

    try {
      if (building) {
        const res = await askQuestion(building.id, q);
        const text = res.data?.answer || demoAnswer;
        setTimeout(() => typeAnswer(text), 1200);

        if (res.data?.audioUrl) {
          const { sound: snd } = await Audio.Sound.createAsync({ uri: res.data.audioUrl });
          setSound(snd);
          await snd.playAsync();
        }
      } else {
        setTimeout(() => typeAnswer(demoAnswer), 1200);
      }
    } catch {
      setTimeout(() => typeAnswer(demoAnswer), 1200);
    }
  };

  const typeAnswer = (text) => {
    setPhase('answering');
    let i = 0;
    const iv = setInterval(() => {
      setAnswer(text.slice(0, i));
      i += 2;
      if (i > text.length) clearInterval(iv);
    }, 20);
  };

  const waveHeights = [0.6, 1.2, 0.8, 1.6, 1.1, 0.9, 1.4, 0.7, 1.3, 0.9, 0.6];

  const spinDeg = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Backdrop */}
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.headerLabel}>
              <Ionicons name="sparkles" size={11} color={colors.accent} />
              <Text style={styles.headerLabelText}>GHID AI · GEMINI</Text>
            </View>
            <Text style={styles.headerTitle}>
              Despre {building?.shortName || 'Clădire'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={14} color={colors.textDim} />
          </TouchableOpacity>
        </View>

        {/* Visualizer */}
        <View style={styles.visualizer}>
          {phase === 'listening' && (
            <>
              <Animated.View style={[styles.rippleRing, { transform: [{ scale: ripple1 }], opacity: ripple1.interpolate({ inputRange: [1, 1.5], outputRange: [0.4, 0] }) }]} />
              <Animated.View style={[styles.rippleRing, { transform: [{ scale: ripple2 }], opacity: ripple2.interpolate({ inputRange: [1, 1.5], outputRange: [0.4, 0] }) }]} />
              <View style={styles.waveBars}>
                {waveHeights.map((h, i) => (
                  <WaveBar key={i} height={h} delay={i * 50} color={colors.accent} />
                ))}
              </View>
            </>
          )}

          {phase === 'thinking' && (
            <View style={styles.thinkingContainer}>
              <Animated.View style={[styles.thinkingRing, { transform: [{ rotate: spinDeg }], borderColor: colors.accent }]} />
              <Ionicons name="sparkles" size={26} color={colors.accent} />
            </View>
          )}

          {phase === 'answering' && (
            <View style={styles.answeringCircle}>
              <View style={styles.answerBars}>
                {[0.5, 1.2, 0.8, 1.4, 0.7].map((h, i) => (
                  <WaveBar key={i} height={h} delay={i * 80} color={colors.accent} />
                ))}
              </View>
            </View>
          )}

          {phase === 'idle' && (
            <TouchableOpacity style={styles.idleCircle} onPress={startListening}>
              <Ionicons name="mic" size={36} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status */}
        <Text style={styles.status}>
          {phase === 'idle' && 'Apasă pentru a vorbi'}
          {phase === 'listening' && 'ASCULT...'}
          {phase === 'thinking' && 'GÂNDESC...'}
          {phase === 'answering' && '◉ RĂSPUND · ro-RO-AlinaNeural'}
        </Text>

        <ScrollView style={styles.conversation} showsVerticalScrollIndicator={false}>
          {/* Question bubble */}
          {question.length > 0 && (
            <View style={styles.bubble}>
              <Text style={styles.bubbleRole}>TU</Text>
              <Text style={styles.questionText}>
                {question}
                {phase === 'listening' && <Text style={styles.cursor}>▌</Text>}
              </Text>
            </View>
          )}

          {/* Answer bubble */}
          {(phase === 'thinking' || phase === 'answering') && (
            <View style={[styles.bubble, styles.answerBubble]}>
              <View style={styles.bubbleRoleRow}>
                <Ionicons name="sparkles" size={10} color={colors.accent} />
                <Text style={[styles.bubbleRole, { color: colors.accent }]}>AI</Text>
              </View>
              <View style={styles.answerContent}>
                {phase === 'thinking' ? (
                  <ThinkingDots />
                ) : (
                  <Text style={styles.answerText}>
                    {answer}
                    {answer.length < demoAnswer.length && (
                      <Text style={styles.cursor}>▌</Text>
                    )}
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Controls */}
        <View style={styles.controls}>
          {phase === 'idle' ? (
            <TouchableOpacity style={styles.startBtn} onPress={startListening}>
              <Ionicons name="mic" size={20} color="#042" />
              <Text style={styles.startBtnText}>Pornește asistentul vocal</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={() => { setPhase('idle'); setQuestion(''); setAnswer(''); }}>
              <Ionicons name="stop" size={18} color={colors.danger} />
              <Text style={[styles.startBtnText, { color: colors.danger }]}>Oprește</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: 'rgba(12,17,25,0.99)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 40,
    maxHeight: '85%',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  headerLabelText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualizer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    position: 'relative',
  },
  rippleRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: `${colors.accent}33`,
  },
  waveBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 68,
  },
  thinkingContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thinkingRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderTopColor: 'transparent',
  },
  answeringCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.accent}22`,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerBars: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
  idleCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.accent}15`,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    textAlign: 'center',
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.accent,
    letterSpacing: 2,
    marginBottom: 18,
  },
  conversation: {
    paddingHorizontal: 20,
    maxHeight: 200,
    marginBottom: 12,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    minHeight: 60,
  },
  answerBubble: {
    backgroundColor: `${colors.accent}10`,
    borderColor: `${colors.accent}33`,
  },
  bubbleRole: {
    fontFamily: fonts.mono,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  bubbleRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  questionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontFamily: fonts.body,
    minHeight: 20,
  },
  answerContent: {
    minHeight: 40,
  },
  answerText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  cursor: {
    color: colors.accent,
  },
  controls: {
    paddingHorizontal: 20,
  },
  startBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  startBtnText: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    color: '#042',
  },
  stopBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,139,0.1)',
    borderWidth: 1,
    borderColor: `${colors.danger}44`,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
