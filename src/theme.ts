import { Platform } from 'react-native';

export const Palette = {
  primary100: '#f5fbf4',
  primary200: '#edf5eb',
  primary300: '#c9dacc',
  primary400: '#91a693',
  primary500: '#516253',
  primary600: '#2e382f',
  /** Extension: primary600 × 0.85. Lifts peach500 to 4.89:1 (AA) from 4.37. */
  primary700: '#273028',

  peach300: '#f4ca9a',
  peach400: '#edac94',
  peach500: '#f0766f',

  rose300: '#eac5c3',
  rose600: '#853d38',

  green400: '#27ae60',
  green500: '#1e854a',
  yellow400: '#ecae52',
  yellow600: '#774f0d',
  red500: '#d7250e',
  blue500: '#223d49',

  grey200: '#f2f2f2',
  grey300: '#dedede',
  white: '#ffffff',
} as const;

export const Colors = {
  bg: {
    deep: Palette.primary700,
    canvas: Palette.primary200,
    canvasStrong: Palette.primary300,
    surface: Palette.white,
    surfaceSunken: Palette.grey200,
    surfaceSelected: Palette.primary200,
    scrim: 'rgba(39, 48, 40, 0.55)',
  },

  text: {
    primary: Palette.primary500,
    secondary: '#6b7a6d',
    strong: Palette.primary600,
    placeholder: Palette.primary400,
    disabled: Palette.primary400,
  },

  textOnDeep: {
    default: Palette.primary100,
    muted: Palette.primary300,
    faint: Palette.primary400,
  },

  border: {
    hairline: Palette.grey200,
    default: Palette.grey300,
    focus: Palette.primary500,
    onDeep: 'rgba(145, 166, 147, 0.30)',
  },

  brand: {
    default: Palette.primary600,
    onDefault: Palette.white,
    muted: Palette.primary200,
  },

  accent: {
    coral: Palette.peach500,
    coralMid: Palette.peach400,
    coralSoft: Palette.peach300,
  },

  feedback: {
    success: Palette.green500,
    successFill: Palette.green400,
    info: Palette.blue500,
    caution: Palette.yellow600,
    cautionFill: Palette.yellow400,
    danger: Palette.red500,
    gentle: Palette.rose600,
    gentleFill: Palette.rose300,
  },
} as const;

/**
 * Family names EMBEDDED into `android/app/src/main/res/font` by the `expo-font`
 * config plugin (`app.json` → plugins → expo-font → android.fonts).
 *
 * Different from `FontFamily.sans` below, which is the runtime name registered
 * by `useFonts` — native views cannot resolve runtime-loaded fonts. Anything
 * handed down to the native layer (Compose via `@expo/ui`, XML styles) must use
 * these names.
 */
export const AndroidEmbeddedFont = {
  sans: 'PlusJakartaSans',
} as const;

export const FontFamily = {
  serif: 'Newsreader_400Regular',
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
} as const;

type TextStyleToken = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
};

export const Type = {
  display: { fontFamily: FontFamily.serif, fontSize: 32, lineHeight: 38, letterSpacing: -0.5 },
  title: { fontFamily: FontFamily.serif, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  heading: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  body: { fontFamily: FontFamily.sans, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: FontFamily.sansSemiBold, fontSize: 16, lineHeight: 24 },
  callout: { fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: FontFamily.sansMedium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: FontFamily.sans, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
} as const satisfies Record<string, TextStyleToken>;

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  giant: 64,
} as const;

export const Layout = {
  screenPaddingH: Space.base,
  screenPaddingTop: Space.xl,
  cardPadding: Space.base,
  listGap: Space.md,
  sectionGap: Space.xxl,
  minTouchTarget: 44,
  avatarSize: 56,
  recordButtonSize: 88,
  maxContentWidth: 800,
  bottomTabInset: Platform.select({ ios: 50, android: 80 }) ?? 0,
} as const;

export const Radius = {
  xs: 6,
  sm: 10,
  /** Provider card. Measured off the mockup: 0.024 × card width. */
  md: 12,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
} as const;

export const Motion = {
  duration: {
    instant: 120,
    fast: 180,
    base: 240,
    slow: 320,
    breath: 2400,
    /**
     * HALF a cycle of the "analysing" pulse — `withRepeat(..., -1, true)` takes
     * a half cycle, so 600 is a full 1200ms round. One shared beat for every
     * placeholder: voiceprint and chip skeletons share a viewport, and two
     * different beats drift out of phase and read as noise.
     */
    pulse: 600,
  },
  spring: { damping: 22, stiffness: 140, mass: 1 },
  /**
   * Strong ease-out for anything entering or leaving the screen.
   *
   * Array form because `Easing.bezier` takes four separate arguments:
   * `Easing.bezier(...Motion.easeOut)`.
   */
  easeOut: [0.23, 1, 0.32, 1] as const,
  listStagger: 40,
  listStaggerMaxItems: 8,
  /** Chips on Choose: 49 of them vs ~10 cards, so the step has to be smaller. */
  chipStagger: 25,
  /** 12 chips fit a 393pt screen before scrolling. */
  chipStaggerMaxItems: 12,
} as const;
