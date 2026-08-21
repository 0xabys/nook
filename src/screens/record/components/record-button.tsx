import Svg, { Path, Rect } from 'react-native-svg';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import type { RecorderPhase } from '@/hooks/use-recorder';
import { Colors } from '@/theme';
import { Pressable, View } from '@/tw';

import { Waveform } from './waveform';

type Props = {
  phase: RecorderPhase;
  level: number;
  onPress: () => void;
};

export function RecordButton({ phase, level, onPress }: Props) {
  const reducedMotion = useReducedMotion();
  const recording = phase === 'recording';
  const busy = phase === 'processing';

  return (
    <View className="size-[300px] items-center justify-center">
      <Waveform level={level} active={recording} reducedMotion={reducedMotion} />

      <Pressable
        onPress={onPress}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={
          recording ? 'Stop recording' : busy ? 'Processing your recording' : 'Start recording'
        }
        accessibilityState={{ busy, disabled: busy }}
        className="press size-22 items-center justify-center rounded-full bg-on-deep"
      >
        {recording || busy ? <StopIcon /> : <MicIcon />}
      </Pressable>
    </View>
  );
}

/**
 * 40, not 30. The mic is already inset inside its 24 viewBox, so at 30 the drawn
 * glyph covers only ~26% of an 88pt button and reads as a dot lost on a disc.
 * 40 brings it to ~38%.
 */
function MicIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Rect x={9} y={2.5} width={6} height={12} rx={3} stroke={Colors.bg.deep} strokeWidth={1.6} />
      <Path
        d="M5.5 11a6.5 6.5 0 0 0 13 0"
        stroke={Colors.bg.deep}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path d="M12 17.5V21" stroke={Colors.bg.deep} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * 44. The square fills only half of its 24 viewBox, so the Svg has to be larger
 * than the mic glyph to carry the same visual weight: 44 yields a 22pt square,
 * 25% of the button width.
 */
function StopIcon() {
  return (
    <Svg width={44} height={44} viewBox="0 0 24 24">
      <Rect x={6} y={6} width={12} height={12} rx={3} fill={Colors.bg.deep} />
    </Svg>
  );
}
