import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient'; // Замена
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore, type RepeatDay } from "@/stores/user-store";
import { useNavigation } from '@react-navigation/native'; // Новый импорт
import { ChevronLeft, Music2, BedDouble, AlarmClock } from "lucide-react-native";
import { trigger } from 'react-native-haptic-feedback'; // Замена Haptics
import Sound from 'react-native-sound'; // Новая lib для аудио

const COLORS = {
  bg: "#0A0A0F",
  text: "#FFFFFF",
  sub: "#A7A7B3",
  stroke: "#2A2A36",
  primary: "#8B5CF6",
  grad: ["#0A0A0F", "#1A1A2E", "#16213E"],
};
const RADIUS = 16;
const ITEM_H = 46;
const VISIBLE_COUNT = 5;
const RINGTONES = {
  polaris: {
    title: "Polaris",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/41/Alarm_clock_test_sound.ogg/Alarm_clock_test_sound.ogg.mp3",
  },
  sunrise: {
    title: "Sunrise",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/96/Alarm_beep.ogg/Alarm_beep.ogg.mp3",
  },
  ocean: {
    title: "Ocean",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/44/Short_beep.ogg/Short_beep.ogg.mp3",
  },
  "soft-bells": {
    title: "Soft Bells",
    url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/26/Alarm_tone.ogg/Alarm_tone.ogg.mp3",
  },
};

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map((v) => Number.parseInt(v, 10));
  return (h % 24) * 60 + (m % 60);
}

function toHHMM(total) {
  const t = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(t / 60);
  const m = t % 60;
  const hh = h < 10 ? `0${h}` : `${h}`;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${hh}:${mm}`;
}

function duration(bed, wake) {
  const d = (wake - bed + 24 * 60) % (24 * 60);
  return d === 0 ? 24 * 60 : d;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("SleepSettings error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg }}>
          <Text style={{ color: COLORS.text }}>Что-то пошло не так. Перезайдите на экран.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);

export default function SleepSettingsScreen() {
  const { profile, sleepPlan, setSleepPlan } = useUserStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation(); // Для навигации
  const [bed, setBed] = useState(() => toMinutes(sleepPlan.bedTime));
  const [wake, setWake] = useState(() => toMinutes(sleepPlan.wakeTime));
  const [days, setDays] = useState(sleepPlan.repeatDays);
  const [enabled, setEnabled] = useState(sleepPlan.enabled);
  const [ringtone, setRingtone] = useState(sleepPlan.ringtoneId ?? "polaris");
  const [showMelodies, setShowMelodies] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const soundRef = useRef(null);

  const tLang = profile?.language ?? "ru";
  const t = useMemo(() => {
    const map = {
      ru: {
        title: "Настройка сна",
        bed: "Сон",
        wake: "Подъём",
        alarmForWake: "Будильник для пробуждения",
        selectMelody: "Выбрать мелодию",
        cancel: "Отмена",
        done: "Готово",
        daysShort: ["П", "В", "С", "Ч", "П", "С", "В"],
        sleepDuration: "Время сна: {{h}} ч {{m}} мин",
        melodyTitle: "Мелодия",
      },
      en: {
        title: "Sleep settings",
        bed: "Bed",
        wake: "Wake",
        alarmForWake: "Alarm for wake",
        selectMelody: "Select melody",
        cancel: "Cancel",
        done: "Done",
        daysShort: ["M", "T", "W", "T", "F", "S", "S"],
        sleepDuration: "Sleep: {{h}}h {{m}}m",
        melodyTitle: "Ringtone",
      },
      uk: {
        title: "Налаштування сну",
        bed: "Сон",
        wake: "Пробудження",
        alarmForWake: "Будильник для пробудження",
        selectMelody: "Обрати мелодію",
        cancel: "Відміна",
        done: "Готово",
        daysShort: ["П", "В", "С", "Ч", "П", "С", "Н"],
        sleepDuration: "Сон: {{h}} год {{m}} хв",
        melodyTitle: "Мелодія",
      },
    };
    return map[tLang];
  }, [tLang]);

  const durMin = duration(bed, wake);
  const durH = Math.floor(durMin / 60);
  const durM = durMin % 60;

  const toggleDay = (d) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)));
  };

  const bedH = Math.floor(bed / 60);
  const bedM = bed % 60;
  const wakeH = Math.floor(wake / 60);
  const wakeM = wake % 60;

  const onSelectBed = useCallback(
    (h, m) => {
      const minutesVal = (h % 24) * 60 + (m % 60);
      setBed(minutesVal);
      setSleepPlan({ bedTime: toHHMM(minutesVal) });
    },
    [setSleepPlan],
  );

  const onSelectWake = useCallback(
    (h, m) => {
      const minutesVal = (h % 24) * 60 + (m % 60);
      setWake(minutesVal);
      setSleepPlan({ wakeTime: toHHMM(minutesVal) });
    },
    [setSleepPlan],
  );

  const stopPreview = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop(() => {
        soundRef.current.release();
        soundRef.current = null;
        setPlayingId(null);
      });
    }
  }, []);

  const togglePreview = useCallback(
    (id) => {
      setPreviewError(null);
      if (playingId === id) {
        stopPreview();
        return;
      }
      stopPreview();
      const src = RINGTONES[id]?.url;
      if (!src) {
        setPreviewError("Аудио недоступно");
        return;
      }
      const sound = new Sound(src, null, (error) => {
        if (error) {
          console.log("failed to load the sound", error);
          setPreviewError("Не удалось воспроизвести. Попробуйте снова.");
          return;
        }
        soundRef.current = sound;
        setPlayingId(id);
        sound.play((success) => {
          if (success) {
            stopPreview();
          } else {
            console.log("playback failed due to audio decoding errors");
            stopPreview();
          }
        });
      });
    },
    [playingId, stopPreview],
  );

  useEffect(() => {
    if (interactionCount > 0) return;
    const incomingBed = toMinutes(sleepPlan.bedTime);
    const incomingWake = toMinutes(sleepPlan.wakeTime);
    if (incomingBed !== bed) setBed(incomingBed);
    if (incomingWake !== wake) setWake(incomingWake);
  }, [sleepPlan.bedTime, sleepPlan.wakeTime, interactionCount]);

  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, [stopPreview]);

  return (
    <ErrorBoundary>
      <View style={{ flex: 1, backgroundColor: COLORS.bg }} testID="sleep-settings-root">
        <LinearGradient colors={COLORS.grad} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} testID="go-back">
                <ChevronLeft size={22} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{t.title}</Text>
              <View style={{ width: 40 }} />
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 0,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={interactionCount === 0}
              keyboardShouldPersistTaps="handled"
            >
              <Card>
                <SectionTitle icon={<BedDouble size={16} color={COLORS.text} />} title={t.bed} />
                <View style={styles.wheelsRow}>
                  <Wheel
                    value={bedH}
                    range={hours}
                    onChange={(v) => onSelectBed(v, bedM)}
                    onInteractStart={() => setInteractionCount((c) => c + 1)}
                    onInteractEnd={() => setInteractionCount((c) => Math.max(0, c - 1))}
                    testID="wheel-bed-hours"
                  />
                  <Text style={styles.colon}>:</Text>
                  <Wheel
                    value={bedM}
                    range={minutes}
                    onChange={(v) => onSelectBed(bedH, v)}
                    onInteractStart={() => setInteractionCount((c) => c + 1)}
                    onInteractEnd={() => setInteractionCount((c) => Math.max(0, c - 1))}
                    testID="wheel-bed-minutes"
                  />
                </View>
                <View style={{ height: 12 }} />
                <SectionTitle icon={<AlarmClock size={16} color={COLORS.text} />} title={t.wake} />
                <View style={styles.wheelsRow}>
                  <Wheel
                    value={wakeH}
                    range={hours}
                    onChange={(v) => onSelectWake(v, wakeM)}
                    onInteractStart={() => setInteractionCount((c) => c + 1)}
                    onInteractEnd={() => setInteractionCount((c) => Math.max(0, c - 1))}
                    testID="wheel-wake-hours"
                  />
                  <Text style={styles.colon}>:</Text>
                  <Wheel
                    value={wakeM}
                    range={minutes}
                    onChange={(v) => onSelectWake(wakeH, v)}
                    onInteractStart={() => setInteractionCount((c) => c + 1)}
                    onInteractEnd={() => setInteractionCount((c) => Math.max(0, c - 1))}
                    testID="wheel-wake-minutes"
                  />
                </View>
                <Text style={styles.duration}>
                  {t.sleepDuration.replace("{{h}}", String(durH)).replace("{{m}}", String(durM))}
                </Text>
              </Card>
              <Card>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardTitle}>{t.alarmForWake}</Text>
                  <Switch
                    value={enabled}
                    onValueChange={setEnabled}
                    trackColor={{ false: "#374151", true: COLORS.primary }}
                    thumbColor={enabled ? "#FFFFFF" : "#9CA3AF"}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.melodyBtn, { borderColor: COLORS.primary }]}
                  activeOpacity={0.9}
                  onPress={() => setShowMelodies((s) => !s)}
                  testID="open-melodies"
                >
                  <Music2 size={16} color={COLORS.primary} />
                  <Text style={[styles.melodyText, { color: COLORS.text }]}>{t.selectMelody}</Text>
                  <View style={styles.ringtoneValue}>
                    <Text style={styles.ringtoneText}>
                      {t.melodyTitle}: {ringtone}
                    </Text>
                  </View>
                </TouchableOpacity>
                {showMelodies ? (
                  <View style={styles.melodyList}>
                    {Object.keys(RINGTONES).map((r) => {
                      const isPlaying = playingId === r;
                      const label = RINGTONES[r]?.title ?? r;
                      return (
                        <View key={r} style={styles.melodyItem}>
                          <Text style={styles.melodyItemText}>{label}</Text>
                          <View style={{ flexDirection: "row", gap: 10, marginLeft: "auto" }}>
                            <TouchableOpacity
                              onPress={() => togglePreview(r)}
                              style={[styles.footerBtn, styles.footerBtnGhost, { height: 36, paddingHorizontal: 12, flex: undefined }]}
                              activeOpacity={0.9}
                              testID={`play-${r}`}
                            >
                              <Text style={[styles.footerBtnText, { fontSize: 14 }]}>{isPlaying ? "Пауза" : "Плей"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => {
                                setRingtone(r);
                                setShowMelodies(false);
                                stopPreview();
                              }}
                              style={[styles.footerBtn, { height: 36, paddingHorizontal: 12, flex: undefined }]}
                              activeOpacity={0.9}
                              testID={`select-${r}`}
                            >
                              <Text style={[styles.footerBtnText, { fontSize: 14 }]}>Выбрать</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                    {previewError ? (
                      <Text style={{ color: "#FFB4B4", marginTop: 8, fontSize: 12 }}>{previewError}</Text>
                    ) : null}
                  </View>
                ) : null}
              </Card>
              <Card>
                <Text style={styles.cardTitle}>Дни</Text>
                <View style={styles.daysFrame}>
                  {t.daysShort.map((d, index) => {
                    const idx = index;
                    const isActive = days.includes(idx);
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => toggleDay(idx)}
                        style={[styles.dayCell, isActive && styles.dayCellActive]}
                        activeOpacity={0.85}
                        testID={`day-${index}`}
                      >
                        <Text style={[styles.dayLetter, isActive && styles.dayLetterActive]}>{d}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.footerBtn, styles.footerBtnGhost]}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.9}
                  testID="cancel"
                >
                  <Text style={styles.footerBtnText}>{t.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.footerBtn]}
                  onPress={() => {
                    setSleepPlan({
                      bedTime: toHHMM(bed),
                      wakeTime: toHHMM(wake),
                      repeatDays: days,
                      enabled,
                      ringtoneId: ringtone,
                    });
                    navigation.goBack();
                  }}
                  activeOpacity={0.9}
                  testID="done"
                >
                  <Text style={styles.footerBtnText}>{t.done}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </ErrorBoundary>
  );
}

type WheelProps = {
  value: number
  range: number[]
  onChange: (v: number) => void
  onInteractStart?: () => void
  onInteractEnd?: () => void
  testID?: string
}

function Wheel({ value, range, onChange, onInteractStart, onInteractEnd, testID }: WheelProps) {
  const scrollY = useRef(new Animated.Value(0)).current
  const scrollRef = useRef<ScrollView | null>(null)
  const PADDING = (ITEM_H * (VISIBLE_COUNT - 1)) / 2
  useEffect(() => {
    const y = value * ITEM_H
    scrollRef.current?.scrollTo({ y, animated: false })
  }, [value])
  const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)
  const snapToNearest = (y: number) => {
    const rawIndex = Math.round(y / ITEM_H)
    const actualIndex = clamp(rawIndex, 0, range.length - 1)
    const next = range[actualIndex]
    if (next !== value) {
      onChange(next)
      if (Platform.OS !== "web") Haptics.selection().catch(() => {})
    }
    const targetY = actualIndex * ITEM_H
    scrollRef.current?.scrollTo({ y: targetY, animated: true })
  }
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e?.nativeEvent?.contentOffset?.y ?? 0
    snapToNearest(y)
  }
  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e?.nativeEvent?.contentOffset?.y ?? 0
    snapToNearest(y)
  }
  const renderItem = (item: number, index: number) => {
    const display = String(item).padStart(2, "0")
    const inputRange = [(index - 1) * ITEM_H, index * ITEM_H, (index + 1) * ITEM_H]
    const opacity = scrollY.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: "clamp" })
    const scale = scrollY.interpolate({ inputRange, outputRange: [0.9, 1.06, 0.9], extrapolate: "clamp" })
    return (
      <Animated.View key={`w-${index}`} style={[styles.wheelItem, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.wheelText}>{display}</Text>
      </Animated.View>
    )
  }
  return (
    <View style={styles.wheelWrap} testID={testID}>
      <Animated.ScrollView
        ref={(r) => {
          scrollRef.current = (r as unknown as ScrollView) ?? null
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        onScrollEndDrag={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          onScrollEndDrag(e)
          onInteractEnd && onInteractEnd?.()
        }}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          onMomentumEnd(e)
          onInteractEnd && onInteractEnd?.()
        }}
        scrollEventThrottle={16}
        onScrollBeginDrag={onInteractStart}
        onMomentumScrollBegin={onInteractStart}
        nestedScrollEnabled
        removeClippedSubviews
        overScrollMode="never"
        contentContainerStyle={{ paddingVertical: PADDING }}
      >
        {range.map((it, idx) => renderItem(it, idx))}
      </Animated.ScrollView>
      <View pointerEvents="none" style={styles.wheelHighlight} />
      <LinearGradient
        colors={["rgba(10,10,15,0.95)", "transparent", "transparent", "rgba(10,10,15,0.95)"]}
        style={styles.wheelFade}
      />
    </View>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionIcon}>{icon}</View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  headerTitle: { color: COLORS.text, fontSize: 16, fontWeight: "700" },
  card: {
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "rgba(31,41,55,0.7)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginRight: 8,
  },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: "700" },
  wheelsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  colon: { color: COLORS.text, fontSize: 28, fontWeight: "800" },
  wheelWrap: {
    width: 100,
    height: ITEM_H * VISIBLE_COUNT,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: "rgba(10,10,15,0.7)",
  },
  wheelItem: { height: ITEM_H, alignItems: "center", justifyContent: "center" },
  wheelText: { color: COLORS.text, fontSize: 24, fontWeight: "800", textAlign: "center" },
  wheelHighlight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: (ITEM_H * (VISIBLE_COUNT - 1)) / 2,
    height: ITEM_H,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: (COLORS.primary + "55") as unknown as string,
  },
  wheelFade: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  duration: { marginTop: 14, fontSize: 14, color: COLORS.sub, textAlign: "center" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: "600", marginBottom: 12 },
  melodyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  melodyText: { fontSize: 14 },
  ringtoneValue: { marginLeft: "auto" },
  ringtoneText: { color: COLORS.sub, fontSize: 12 },
  melodyList: { marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.stroke, overflow: "hidden" },
  melodyItem: { paddingHorizontal: 12, paddingVertical: 12, backgroundColor: "rgba(31,41,55,0.5)" },
  melodyItemText: { color: COLORS.text, fontSize: 14 },
  daysFrame: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.stroke,
    borderRadius: 14,
    padding: 8,
    gap: 8,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(31,41,55,0.5)",
    borderWidth: 1,
    borderColor: COLORS.stroke,
  },
  dayCellActive: { backgroundColor: "rgba(139,92,246,0.25)", borderColor: COLORS.primary },
  dayLetter: { color: COLORS.sub, fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  dayLetterActive: { color: COLORS.text },
  footer: {
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: Math.max(34, 16),
    flexDirection: "row",
    gap: 12,
  },
  footerBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  footerBtnGhost: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  footerBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
})
