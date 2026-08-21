import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Colors } from '@/theme';

export const SCRIM_H = 40;

export function BarScrim() {
  return (
    <Svg
      style={ROOT}
      height={SCRIM_H}
      width="100%"
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Defs>
        <LinearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.bg.canvas} stopOpacity="0" />
          <Stop offset="1" stopColor={Colors.bg.canvas} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height={SCRIM_H} fill="url(#scrim)" />
    </Svg>
  );
}

const ROOT = { position: 'absolute', left: 0, right: 0, top: -SCRIM_H } as const;
