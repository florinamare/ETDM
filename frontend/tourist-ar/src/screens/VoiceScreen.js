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
  TextInput,
  Alert,
} from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts } from '../constants/theme';
import { askAIVoice, transcribeAudio } from '../services/api';

// ─── Animații ────────────────────────────────────────────────────────────────

function WaveBar({ height, delay, color }) {
  const anim = useRef(new Animated.Value(0.3)).current;
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
  const d0 = useRef(new Animated.Value(1)).current;
  const d1 = useRef(new Animated.Value(1)).current;
  const d2 = useRef(new Animated.Value(1)).current;
  const dots = [d0, d1, d2];

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
        <Animated.View
          key={i}
          style={{
            width: 6, height: 6, borderRadius: 3,
            backgroundColor: colors.accent, opacity: d,
          }}
        />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VoiceScreen({ navigation, route }) {
  const building = route.params?.building;

  // 'idle' | 'listening' | 'transcribing' | 'thinking' | 'answering'
  const [phase, setPhase] = useState('idle');
  const [inputText, setInputText] = useState('');
  const [currentQ, setCurrentQ] = useState('');
  const [currentA, setCurrentA] = useState('');
  const [history, setHistory] = useState([]); // { role, content }[]

  const recordingRef = useRef(null);
  const playerRef = useRef(null);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(1)).current;
  const ripple2 = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  // cleanup la demontare
  useEffect(() => {
    return () => {
      playerRef.current?.remove();
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  // animații per fază
  useEffect(() => {
    if (phase === 'thinking' || phase === 'transcribing') {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }

    if (phase === 'listening') {
      Animated.loop(Animated.sequence([
        Animated.timing(ripple1, { toValue: 1.5, duration: 2000, useNativeDriver: true }),
        Animated.timing(ripple1, { toValue: 1, duration: 0, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.delay(800),
        Animated.timing(ripple2, { toValue: 1.5, duration: 2000, useNativeDriver: true }),
        Animated.timing(ripple2, { toValue: 1, duration: 0, useNativeDriver: true }),
      ])).start();
    } else {
      ripple1.setValue(1);
      ripple2.setValue(1);
    }
  }, [phase]);

  // scroll jos la fiecare mesaj nou
  useEffect(() => {
    if (history.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [history]);

  // ─── Înregistrare voce ─────────────────────────────────────────────────────

  const startListening = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permisiune necesară', 'Acordă acces la microfon din Setări pentru a folosi vocea.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setPhase('listening');
    } catch (e) {
      console.warn('Failed to start recording:', e?.message);
      Alert.alert('Eroare microfon', 'Nu am putut porni înregistrarea. Încearcă din nou.');
      setPhase('idle');
    }
  };

  const stopListening = async () => {
    let audioUri = null;
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        audioUri = recordingRef.current.getURI();
        recordingRef.current = null;
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      }
    } catch (e) {
      console.warn('Failed to stop recording:', e?.message);
    }
    setPhase('transcribing');

    if (audioUri) {
      await doTranscribe(audioUri);
    } else {
      setPhase('idle');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const doTranscribe = async (audioUri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Fișierul de înregistrare nu a fost creat: ' + audioUri);
      }
      const b64 = await FileSystem.readAsStringAsync(audioUri, { encoding: 'base64' });
      const res = await transcribeAudio(b64, 'audio/mp4');
      const text = res.data?.text?.trim() || '';
      if (text) {
        setInputText(text);
      } else {
        Alert.alert('Transcriere eșuată', 'Nu am înțeles ce ai spus. Încearcă din nou sau scrie întrebarea.');
      }
    } catch (e) {
      console.warn('STT transcription failed:', e?.message);
      Alert.alert('Eroare transcriere', 'Verifică că GEMINI_API_KEY este setat în backend.');
    }
    setPhase('idle');
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // ─── Trimitere întrebare ───────────────────────────────────────────────────

  const handleSend = () => {
    const q = inputText.trim();
    if (!q) return;
    setInputText('');
    processQuestion(q);
  };

  const processQuestion = async (q) => {
    setCurrentQ(q);
    setCurrentA('');
    setPhase('thinking');

    const recentHistory = history.slice(-6);

    try {
      const res = await askAIVoice(q, building, recentHistory);
      const answer = res.data?.answer || buildFallbackAnswer(q);

      // Redă TTS dacă există
      if (res.data?.audio_b64) {
        playTTS(res.data.audio_b64).catch(() => {});
      }

      typeAnswer(answer, () => {
        setHistory(prev => [
          ...prev,
          { role: 'user', content: q },
          { role: 'assistant', content: answer },
        ]);
        setCurrentQ('');
        setCurrentA('');
        setPhase('idle');
      });
    } catch {
      const fallback = buildFallbackAnswer(q);
      typeAnswer(fallback, () => {
        setHistory(prev => [
          ...prev,
          { role: 'user', content: q },
          { role: 'assistant', content: fallback },
        ]);
        setCurrentQ('');
        setCurrentA('');
        setPhase('idle');
      });
    }
  };

  // ─── TTS playback ──────────────────────────────────────────────────────────

  const playTTS = async (audio_b64) => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      const fileUri = `${FileSystem.cacheDirectory}tts_response.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, audio_b64, {
        encoding: 'base64',
      });

      playerRef.current?.remove();
      const player = createAudioPlayer({ uri: fileUri });
      playerRef.current = player;
      player.play();
    } catch (e) {
      console.warn('TTS playback error:', e);
    }
  };

  // ─── Typing animation ──────────────────────────────────────────────────────

  const typeAnswer = (text, onComplete) => {
    setPhase('answering');
    setCurrentA('');
    let i = 0;
    const iv = setInterval(() => {
      i += 3;
      setCurrentA(text.slice(0, i));
      if (i >= text.length) {
        setCurrentA(text);
        clearInterval(iv);
        if (onComplete) onComplete();
      }
    }, 18);
  };

  // ─── Fallback local ────────────────────────────────────────────────────────

  const buildFallbackAnswer = (q) => {
    if (!building) return 'Selectează mai întâi o clădire din camera AR.';
    const lq = q.toLowerCase();
    if (lq.includes('construit') || lq.includes('când') || /\ban\b/.test(lq)) {
      return `${building.name} a fost construit în ${building.year}. ${building.facts?.[0] || ''}`;
    }
    if (lq.includes('arhitect') || lq.includes('cine') || lq.includes('proiectat')) {
      return `${building.name} a fost proiectat de ${building.architect} în stil ${building.style}.`;
    }
    if (lq.includes('stil') || lq.includes('arhitectur')) {
      return `${building.name} este construit în stil ${building.style}. ${building.facts?.[0] || ''}`;
    }
    return `${building.name}: ${building.blurb || building.facts?.[0] || 'informații indisponibile momentan.'}`;
  };

  // ─── Oprire ────────────────────────────────────────────────────────────────

  const handleStop = () => {
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }
    playerRef.current?.pause();
    setPhase('idle');
    setCurrentQ('');
    setCurrentA('');
  };

  // ─── UI ────────────────────────────────────────────────────────────────────

  const waveHeights = [0.6, 1.2, 0.8, 1.6, 1.1, 0.9, 1.4, 0.7, 1.3, 0.9, 0.6];
  const spinDeg = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const isInputPhase = phase === 'idle' || phase === 'listening';
  const isProcessing = phase === 'thinking' || phase === 'answering' || phase === 'transcribing';

  const statusLabel = {
    idle: 'Scrie întrebarea sau apasă microfon',
    listening: 'ASCULT... apasă ■ când ai terminat de vorbit',
    transcribing: 'TRANSCRIERE VOCALĂ...',
    thinking: 'GÂNDESC...',
    answering: '◉ RĂSPUND · ro-RO-AlinaNeural',
  }[phase];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Backdrop tap to close */}
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheet}
      >
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
              Despre {building?.shortName || 'clădire'}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={14} color={colors.textDim} />
          </TouchableOpacity>
        </View>

        {/* Vizualizator */}
        <View style={styles.visualizer}>
          {phase === 'listening' && (
            <>
              <Animated.View style={[styles.rippleRing, {
                transform: [{ scale: ripple1 }],
                opacity: ripple1.interpolate({ inputRange: [1, 1.5], outputRange: [0.4, 0] }),
              }]} />
              <Animated.View style={[styles.rippleRing, {
                transform: [{ scale: ripple2 }],
                opacity: ripple2.interpolate({ inputRange: [1, 1.5], outputRange: [0.4, 0] }),
              }]} />
              <View style={styles.waveBars}>
                {waveHeights.map((h, i) => (
                  <WaveBar key={i} height={h} delay={i * 50} color={colors.accent} />
                ))}
              </View>
            </>
          )}

          {(phase === 'thinking' || phase === 'transcribing') && (
            <View style={styles.thinkingContainer}>
              <Animated.View style={[styles.thinkingRing, {
                transform: [{ rotate: spinDeg }],
                borderColor: colors.accent,
              }]} />
              <Ionicons
                name={phase === 'transcribing' ? 'mic' : 'sparkles'}
                size={26}
                color={colors.accent}
              />
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
        <Text style={styles.status}>{statusLabel}</Text>

        {/* Conversație — tot istoricul rămâne vizibil */}
        <ScrollView
          ref={scrollRef}
          style={styles.conversation}
          showsVerticalScrollIndicator={false}
        >
          {history.map((msg, idx) => (
            <View key={idx} style={[styles.bubble, msg.role === 'assistant' && styles.answerBubble]}>
              {msg.role === 'user' ? (
                <>
                  <Text style={styles.bubbleRole}>TU</Text>
                  <Text style={styles.questionText}>{msg.content}</Text>
                </>
              ) : (
                <>
                  <View style={styles.bubbleRoleRow}>
                    <Ionicons name="sparkles" size={10} color={colors.accent} />
                    <Text style={[styles.bubbleRole, { color: colors.accent }]}>AI</Text>
                  </View>
                  <Text style={styles.answerText}>{msg.content}</Text>
                </>
              )}
            </View>
          ))}

          {/* Întrebarea curentă (în procesare) */}
          {currentQ.length > 0 && (
            <View style={styles.bubble}>
              <Text style={styles.bubbleRole}>TU</Text>
              <Text style={styles.questionText}>{currentQ}</Text>
            </View>
          )}

          {/* Răspunsul curent (thinking / answering) */}
          {isProcessing && (
            <View style={[styles.bubble, styles.answerBubble]}>
              <View style={styles.bubbleRoleRow}>
                <Ionicons name="sparkles" size={10} color={colors.accent} />
                <Text style={[styles.bubbleRole, { color: colors.accent }]}>AI</Text>
              </View>
              <View style={styles.answerContent}>
                {phase === 'thinking' || phase === 'transcribing' ? (
                  <ThinkingDots />
                ) : (
                  <Text style={styles.answerText}>
                    {currentA}
                    <Text style={styles.cursor}>▌</Text>
                  </Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Controale */}
        <View style={styles.controls}>
          {isInputPhase ? (
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Scrie întrebarea ta..."
                placeholderTextColor={colors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                editable={phase === 'idle'}
                multiline={false}
              />
              {phase === 'idle' ? (
                <>
                  <TouchableOpacity style={styles.micBtn} onPress={startListening}>
                    <Ionicons name="mic" size={18} color={colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                  >
                    <Ionicons
                      name="send"
                      size={16}
                      color={inputText.trim() ? '#042' : colors.textMuted}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                // Buton stop înregistrare
                <TouchableOpacity style={styles.stopMicBtn} onPress={stopListening}>
                  <Ionicons name="stop" size={18} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
              <Ionicons name="stop" size={18} color={colors.danger} />
              <Text style={[styles.btnText, { color: colors.danger }]}>Oprește</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Stiluri ──────────────────────────────────────────────────────────────────

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
    maxHeight: '88%',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 8,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4,
  },
  headerLabelText: {
    fontFamily: fonts.mono, fontSize: 10, color: colors.accent, letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 15, color: colors.text, fontWeight: '600', fontFamily: fonts.body,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  visualizer: {
    height: 110, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, position: 'relative',
  },
  rippleRing: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    borderWidth: 1.5, borderColor: `${colors.accent}33`,
  },
  waveBars: {
    flexDirection: 'row', alignItems: 'center', gap: 4, height: 68,
  },
  thinkingContainer: {
    width: 80, height: 80, alignItems: 'center', justifyContent: 'center',
  },
  thinkingRing: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderTopColor: 'transparent',
  },
  answeringCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: `${colors.accent}22`,
    borderWidth: 2, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  answerBars: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  idleCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: `${colors.accent}15`,
    borderWidth: 1.5, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  status: {
    textAlign: 'center', fontFamily: fonts.mono, fontSize: 10,
    color: colors.accent, letterSpacing: 1.5, marginBottom: 14,
    paddingHorizontal: 20,
  },
  conversation: {
    paddingHorizontal: 20,
    maxHeight: 260,
    marginBottom: 12,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: 14, marginBottom: 10,
  },
  answerBubble: {
    backgroundColor: `${colors.accent}10`,
    borderColor: `${colors.accent}33`,
  },
  bubbleRole: {
    fontFamily: fonts.mono, fontSize: 9,
    color: colors.textMuted, letterSpacing: 1.5, marginBottom: 6,
  },
  bubbleRoleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6,
  },
  questionText: {
    fontSize: 14, color: colors.text, lineHeight: 20, fontFamily: fonts.body,
  },
  answerContent: { minHeight: 30 },
  answerText: {
    fontSize: 14, color: colors.text, lineHeight: 22, fontFamily: fonts.body,
  },
  cursor: { color: colors.accent },
  controls: { paddingHorizontal: 20 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, paddingHorizontal: 12, height: 52,
  },
  textInput: {
    flex: 1, color: colors.text,
    fontFamily: fonts.body, fontSize: 14, height: '100%',
  },
  micBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${colors.accent}15`,
    borderWidth: 1, borderColor: `${colors.accent}44`,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.08)' },
  stopMicBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,107,139,0.15)',
    borderWidth: 1, borderColor: `${colors.danger}44`,
    alignItems: 'center', justifyContent: 'center',
  },
  stopBtn: {
    height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,107,139,0.1)',
    borderWidth: 1, borderColor: `${colors.danger}44`,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
  },
  btnText: { fontFamily: fonts.body, fontSize: 15, fontWeight: '600' },
});
