import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions,
  PanResponder, GestureResponderEvent,
} from 'react-native';
import LinearGradient from '@/components/Gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/user-store';
import {
  UserRound, ChevronRight, Globe, Timer, Hourglass, AlarmClock, BedDouble
} from 'lucide-react-native';
import * as nav from '@/utils/router';
import Svg, { Circle, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import * as Haptics from '@/utils/haptics';

const DIAL_STROKE = 16 as const;
const TAP_MOVE_THRESHOLD_DEG = 1.25 as const;
const TOUCH_BAND: number = DIAL_STROKE / 2 + 20;
const MIN_GAP_MIN = 1 as const;
const STEP_MIN = 5 as const;

const COLORS = {
  bg: '#0A0A0F', text: '#FFFFFF', sub: '#A7A7B3', stroke: '#2A2A36', primary: '#8B5CF6',
  grad: ['#0A0A0F', '#1A1A2E', '#16213E'] as const,
};
const RADIUS = 16 as const;
const HEADER_H = 56 as const;
const CARD_SPACING = 20 as const;

const DIAL_SIZE = Math.min(360, Math.max(260, Math.round(Dimensions.get('window').width * 0.78))) as number;
const HANDLE_ICON_BOX = 48 as const;

const normMin = (m:number)=> ((m % 1440) + 1440) % 1440;
const floor5  = (m:number)=> Math.floor(m / STEP_MIN) * STEP_MIN;
const ceil5   = (m:number)=> Math.ceil(m / STEP_MIN) * STEP_MIN;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(v => parseInt(v, 10));
  return (h % 24) * 60 + (m % 60);
}
function toHHMM(total: number): string {
  const t = normMin(total);
  const h = Math.floor(t / 60), m = t % 60;
  return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
}
function duration(bed: number, wake: number): number {
  const d = (wake - bed + 1440) % 1440;
  return d === 0 ? 1440 : d;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.log('[ErrorBoundary]', error);
  }
  render() {
    if (this.state.hasError) {
      return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} testID="error-boundary"><Text style={{ color: '#fff' }}>Something went wrong</Text></View>;
    }
    return this.props.children as React.ReactElement;
  }
}

export default function HomeScreen() {
  const { profile, sleepPlan, setSleepPlan } = useUserStore();

  const [bed, setBedState]   = useState<number>(() => toMinutes(sleepPlan.bedTime));
  const [wake, setWakeState] = useState<number>(() => toMinutes(sleepPlan.wakeTime));
  const bedRef  = useRef(bed);
  const wakeRef = useRef(wake);
  const setBed  = (v:number)=>{ bedRef.current = v; setBedState(v); };
  const setWake = (v:number)=>{ wakeRef.current = v; setWakeState(v); };

  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  useEffect(() => {
    if (isDraggingRef.current) return;
    setBed(toMinutes(sleepPlan.bedTime));
    setWake(toMinutes(sleepPlan.wakeTime));
  }, [sleepPlan.bedTime, sleepPlan.wakeTime]);

  const tLang = profile?.language ?? 'ru';
  const t = useMemo(() => ({
    ru: { sleepDuration:'Время сна: {{h}} ч {{m}} мин', scheduleTitle:'Расписание сна', bed:'Сон', wake:'Подъём', stopwatch:'Секундомер', timer:'Таймер', worldTime:'Мир', talk:'Поговорить с Monday' },
    en: { sleepDuration:'Sleep duration: {{h}}h {{m}}m',  scheduleTitle:'Sleep schedule',  bed:'Bed', wake:'Wake', stopwatch:'Stopwatch', timer:'Timer', worldTime:'World', talk:'Talk to Monday' },
    uk: { sleepDuration:'Час сну: {{h}} год {{m}} хв',   scheduleTitle:'Розклад сну',     bed:'Сон', wake:'Пробудження', stopwatch:'Секундомір', timer:'Таймер', worldTime:'Світ', talk:'Поспілкуватись з Monday' },
  } as const)[tLang], [tLang]);

  const durMin = useMemo(() => duration(bed, wake), [bed, wake]);
  const durH = Math.floor(durMin / 60), durM = durMin % 60;

  const center = useMemo(() => ({ x: DIAL_SIZE / 2, y: DIAL_SIZE / 2 }), []);
  const radius = useMemo(() => (DIAL_SIZE - DIAL_STROKE) / 2, []);

  const minGapMin = useMemo(() => {
    const arcPerMin = (2 * Math.PI * radius) / 1440;
    const visualPx = HANDLE_ICON_BOX + DIAL_STROKE + 6; // add slight safety buffer to avoid any overlap
    const minutes = Math.ceil(visualPx / arcPerMin);
    return Math.max(MIN_GAP_MIN, minutes);
  }, [radius]);

  const minutesToAngle = useCallback((min:number)=> (min / 1440) * 360 - 90, []);
  const pointOnCircle  = useCallback((ang:number)=> {
    const rad = (ang * Math.PI) / 180;
    return { x: center.x + radius * Math.cos(rad), y: center.y + radius * Math.sin(rad) };
  }, [center.x, center.y, radius]);
  const degDist = (a:number,b:number)=> Math.abs(((a-b+180)%360)-180);

  const angleFromTouch = useCallback((evt: GestureResponderEvent) => {
    const { locationX, locationY } = evt.nativeEvent;
    const dx = locationX - center.x, dy = locationY - center.y;
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    return (ang + 360) % 360;
  }, [center.x, center.y]);

  const isInRing = useCallback((evt: GestureResponderEvent) => {
    const { locationX, locationY } = evt.nativeEvent;
    const dx = locationX - center.x, dy = locationY - center.y;
    const dist = Math.hypot(dx, dy);
    return Math.abs(dist - radius) <= TOUCH_BAND;
  }, [center.x, center.y, radius]);

  const activeHandleRef = useRef<null|'bed'|'wake'>(null);
  const movedRef    = useRef<boolean>(false);
  const startAngRef = useRef<number>(0);
  const lastShownMinRef = useRef<number>(-1);
  const prevAngRef = useRef<number>(0);
  const dragValueRef = useRef<number>(0);

  const clampWithBarrier = useCallback((which:'bed'|'wake', raw:number) => {
    const bedV  = bedRef.current;
    const wakeV = wakeRef.current;
    const val = normMin(Math.round(raw));
    if (which === 'bed') {
      const gapCW = (wakeV - val + 1440) % 1440;
      if (gapCW <= minGapMin) return normMin(wakeV - minGapMin);
      return val;
    } else {
      const gapCCW = (val - bedV + 1440) % 1440;
      if (gapCCW <= minGapMin) return normMin(bedV + minGapMin);
      return val;
    }
  }, [minGapMin]);

  const snapAndProtect = useCallback((which:'bed'|'wake', val:number) => {
    let snapped = which === 'bed' ? floor5(val) : ceil5(val);
    snapped = normMin(snapped);
    const bedV  = which === 'bed' ? snapped : bedRef.current;
    const wakeV = which === 'wake' ? snapped : wakeRef.current;

    if (((wakeV - bedV + 1440) % 1440) < minGapMin) {
      if (which === 'bed') return normMin(wakeRef.current - minGapMin);
      else                 return normMin(bedRef.current + minGapMin);
    }
    return snapped;
  }, [minGapMin]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        return isInRing(evt);
      },
      onMoveShouldSetPanResponder: (evt) => isInRing(evt),
      onStartShouldSetPanResponderCapture: (evt) => isInRing(evt),
      onMoveShouldSetPanResponderCapture: (evt) => isInRing(evt),
      onPanResponderGrant: (evt) => {
        console.log('[Dial] grant');
        isDraggingRef.current = true;
        setIsDragging(true);
        const ang = angleFromTouch(evt);
        startAngRef.current = ang;
        prevAngRef.current = ang;
        movedRef.current = false;
        if (Platform.OS === 'ios') {
          try { Haptics.selection(); } catch {}
        }

        const bAng = (minutesToAngle(bedRef.current)+360)%360;
        const wAng = (minutesToAngle(wakeRef.current)+360)%360;
        const ah = degDist(ang,bAng) <= degDist(ang,wAng) ? 'bed' : 'wake';
        activeHandleRef.current = ah;
        dragValueRef.current = ah === 'bed' ? bedRef.current : wakeRef.current;

        lastShownMinRef.current = -1;
      },
      onPanResponderMove: (evt) => {
        console.log('[Dial] move');
        const ah = activeHandleRef.current;
        if (!ah) return;

        const ang = angleFromTouch(evt);
        const deltaRaw = ang - prevAngRef.current;
        const delta = ((deltaRaw + 540) % 360) - 180; // shortest signed delta
        prevAngRef.current = ang;

        const deltaMin = (delta / 360) * 1440;
        const proposed = dragValueRef.current + deltaMin;
        const diffAbs = Math.abs(proposed - dragValueRef.current);
        if (Math.abs(((ang - startAngRef.current + 540) % 360) - 180) > TAP_MOVE_THRESHOLD_DEG) movedRef.current = true;

        const next = clampWithBarrier(ah, proposed);
        dragValueRef.current = next;

        const rounded = Math.round(next); // keep smooth following
        if (ah === 'bed') {
          if (rounded !== bedRef.current) setBed(rounded);
        } else {
          if (rounded !== wakeRef.current) setWake(rounded);
        }

        const showMin = ah === 'bed' ? bedRef.current : wakeRef.current;
        if (showMin !== lastShownMinRef.current && Platform.OS !== 'web') {
          lastShownMinRef.current = showMin;
          Haptics.selection();
        }
      },
      onPanResponderRelease: () => {
        console.log('[Dial] release capture');
        console.log('[Dial] release');
        const ah = activeHandleRef.current;
        activeHandleRef.current = null;
        isDraggingRef.current = false;
        setIsDragging(false);

        if (movedRef.current && ah) {
          const toSnap = ah === 'bed' ? bedRef.current : wakeRef.current;
          const snapped = snapAndProtect(ah, toSnap);
          if (ah === 'bed') setBed(snapped); else setWake(snapped);
          setSleepPlan({ bedTime: toHHMM(bedRef.current), wakeTime: toHHMM(wakeRef.current) });
        }
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        console.log('[Dial] terminate');
        activeHandleRef.current = null;
        isDraggingRef.current = false;
        setIsDragging(false);
      },
    })
  ).current;

  const arcPath = useMemo(() => {
    const a0Orig = (minutesToAngle(bed) + 360) % 360;
    const a1Orig = (minutesToAngle(wake) + 360) % 360;

    let sweepOrig = (a1Orig - a0Orig + 360) % 360;
    if (sweepOrig === 0) sweepOrig = 360;

    const circumference = 2 * Math.PI * radius;
    const visualPadPx = HANDLE_ICON_BOX / 2 + DIAL_STROKE / 2 + 5;
    const padDeg = (visualPadPx / circumference) * 360;

    const a0 = (a0Orig + padDeg) % 360;
    const a1 = (a1Orig - padDeg + 360) % 360;

    let sweep = (a1 - a0 + 360) % 360;
    if (sweep === 0) sweep = 360;

    const p0 = pointOnCircle(a0);
    const p1 = pointOnCircle(a1);
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${largeArc} 1 ${p1.x} ${p1.y}`;
  }, [bed, wake, minutesToAngle, pointOnCircle, radius]);

  const bAng = (minutesToAngle(bed)+360)%360;
  const wAng = (minutesToAngle(wake)+360)%360;
  const bp = pointOnCircle(bAng);
  const wp = pointOnCircle(wAng);

  return (
    <ErrorBoundary>
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <LinearGradient colors={COLORS.grad} style={{ flex: 1 }}>
          <SafeAreaView style={styles.safeArea}>
          <View style={styles.header} pointerEvents="box-none">
            <Text style={styles.logo}>AI MONDAY</Text>
            <TouchableOpacity onPress={() => nav.push('/(tabs)/settings')} activeOpacity={0.9}>
              <View style={styles.avatar}><UserRound size={18} color={COLORS.text} /></View>
            </TouchableOpacity>
          </View>

          <View style={styles.contentWrap}>
            <View style={styles.dialWrap}>
              <View style={styles.svgHolder} {...panResponder.panHandlers} testID="sleep-dial">
                <Svg width={DIAL_SIZE} height={DIAL_SIZE} pointerEvents="none">
                  <Defs>
                    <SvgGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                      <Stop offset="100%" stopColor="#A78BFA" stopOpacity="0.8" />
                    </SvgGradient>
                  </Defs>

                  <Circle cx={center.x} cy={center.y} r={radius}
                          stroke="#2A2A36" strokeWidth={DIAL_STROKE}
                          strokeDasharray="4 10" fill="none" />

                  <Path d={arcPath} stroke="url(#g1)" strokeWidth={DIAL_STROKE} fill="none" strokeLinecap="round" />

                  <Circle cx={center.x} cy={center.y} r={radius}
                          stroke="transparent" strokeWidth={DIAL_STROKE + 40} fill="none" />
                </Svg>

                <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
                  <View style={[styles.handleIcon, { left: bp.x - HANDLE_ICON_BOX/2, top: bp.y - HANDLE_ICON_BOX/2 }]} testID="handle-bed">
                    <BedDouble size={16} color={COLORS.primary} />
                  </View>
                  <View style={[styles.handleIcon, { left: wp.x - HANDLE_ICON_BOX/2, top: wp.y - HANDLE_ICON_BOX/2 }]} testID="handle-wake">
                    <AlarmClock size={16} color={COLORS.primary} />
                  </View>
                </View>

                <View style={styles.centerTapArea} pointerEvents={isDragging ? 'none' : 'box-none'}>
                  <TouchableOpacity disabled={isDragging} activeOpacity={0.9} onPress={() => nav.push('/(tabs)/sleep-settings')} style={styles.centerPress}>
                    <View style={styles.centerInfo}>
                      <View style={styles.centerRow}>
                        <BedDouble size={16} color={COLORS.text} />
                        <Text style={styles.timeLarge}>{toHHMM(bed)}</Text>
                      </View>
                      <View style={styles.centerRowGap} />
                      <View style={styles.centerRow}>
                        <AlarmClock size={16} color={COLORS.text} />
                        <Text style={styles.timeLarge}>{toHHMM(wake)}</Text>
                      </View>
                      <Text style={styles.duration}>
                        {t.sleepDuration.replace('{{h}}', String(durH)).replace('{{m}}', String(durM))}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.scheduleCard} onPress={() => nav.push('/(tabs)/sleep-settings')} activeOpacity={0.85}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.cardLabel}>{t.scheduleTitle}</Text>
                  <Text style={styles.cardValue}>{t.bed} {toHHMM(bed)}  •  {t.wake} {toHHMM(wake)}</Text>
                </View>
                <ChevronRight size={18} color={COLORS.sub} />
              </View>
            </TouchableOpacity>

            <View style={styles.actionsRow}>
              <ActionButton label={t.stopwatch} icon={<Timer size={22} color={COLORS.text} />} onPress={() => nav.push('/(tabs)/settings')} />
              <ActionButton label={t.timer} icon={<Hourglass size={22} color={COLORS.text} />} onPress={() => nav.push('/(tabs)/settings')} />
              <ActionButton label={t.worldTime} icon={<Globe size={22} color={COLORS.text} />} onPress={() => nav.push('/(tabs)/settings')} />
            </View>

            <TouchableOpacity style={[styles.cta, { marginBottom: CARD_SPACING }]} activeOpacity={0.9} onPress={() => nav.push('/(tabs)/assistant')} testID="voice-cta">
              <LinearGradient colors={[COLORS.primary, '#A78BFA']} style={styles.ctaInner}>
                <Text style={styles.ctaText}>{t.talk}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </ErrorBoundary>
  );
}

function ActionButton({ label, icon, onPress }: { label: string; icon: React.ReactNode; onPress: () => void; }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionBtn} activeOpacity={0.9} testID={`action-${label}`}>
      <View style={styles.actionInner}>
        <View style={styles.actionIcon}>{icon}</View>
        <Text style={styles.actionLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { height: HEADER_H, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontSize: 18, color: COLORS.text, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.stroke, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },

  dialWrap: { marginTop: 8, marginBottom: CARD_SPACING, alignItems: 'center', justifyContent: 'center' },
  svgHolder: { width: DIAL_SIZE, height: DIAL_SIZE, position: 'relative' },

  centerTapArea: { position:'absolute', left:0, right:0, top:0, bottom:0, alignItems:'center', justifyContent:'center' },
  centerPress: {
    width: DIAL_SIZE - 2 * (DIAL_STROKE + 24),
    height: DIAL_SIZE - 2 * (DIAL_STROKE + 24),
    borderRadius: 999, alignItems:'center', justifyContent:'center'
  },

  centerInfo: { alignItems:'center', justifyContent:'center' },
  centerRow: { flexDirection:'row', alignItems:'center', gap:8 },
  centerRowGap: { height:10 },
  timeLarge: { fontSize:32, color:COLORS.text, fontWeight:'800', marginLeft:6 },
  duration: { marginTop:8, fontSize:14, color:COLORS.sub },

  handleIcon: {
    position:'absolute', width: HANDLE_ICON_BOX, height: HANDLE_ICON_BOX, borderRadius: HANDLE_ICON_BOX/2,
    alignItems:'center', justifyContent:'center',
    backgroundColor:'rgba(10,10,15,0.9)', borderWidth:2, borderColor:COLORS.primary,
  },

  scheduleCard: { borderRadius:RADIUS, padding:16, marginTop:8, marginBottom:CARD_SPACING, backgroundColor:'rgba(31,41,55,0.7)', borderWidth:1, borderColor:COLORS.stroke },
  cardLabel: { color:COLORS.sub, fontSize:13 },
  cardValue: { color:COLORS.text, fontSize:16, marginTop:6, fontWeight:'600' },

  actionsRow: { flexDirection:'row', gap:12, marginBottom:CARD_SPACING },
  actionBtn: { flex:1, borderRadius:RADIUS, overflow:'hidden', backgroundColor:'rgba(31,41,55,0.8)', borderWidth:1, borderColor:COLORS.stroke, height:100, alignItems:'center', justifyContent:'center' },
  actionInner: { alignItems:'center', justifyContent:'center' },
  actionIcon: { marginBottom:8 },
  actionLabel: { color:COLORS.text, fontSize:14, fontWeight:'600' },

  contentWrap: { flex:1, paddingHorizontal:20, paddingBottom:20 },
  cta: { borderRadius:20, overflow:'hidden' },
  ctaInner: { height:56, alignItems:'center', justifyContent:'center', borderRadius:20 },
  ctaText: { color:'#FFF', fontSize:16, fontWeight:'700' },
});
