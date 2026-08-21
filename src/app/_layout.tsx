// Deep imports per weight. The package root require()s every .ttf, so Metro
// would bundle all 14 weights (~1MB of dead font).
import { Newsreader_400Regular } from '@expo-google-fonts/newsreader/400Regular';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import '@/global.css';

import { CHOOSE_TITLE } from '@/screens/choose';
import { RESULTS_TITLE } from '@/screens/results';
import { Colors, FontFamily } from '@/theme';
import { chromeTier } from '@/utils/chrome';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const headerChrome =
  chromeTier === 'ios26'
    ? { headerTransparent: true as const }
    : {
        headerTransparent: false as const,
        headerStyle: { backgroundColor: Colors.bg.canvas },
      };

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Newsreader_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: Colors.bg.canvas },
          // Dark glyphs: Choose and Results both sit on the light sage canvas.
          // Android does not infer this — left at the default the clock and
          // status icons stay white and become unreadable on those screens.
          // The record screen opts back into light below.
          statusBarStyle: 'dark' as const,
          // The bar is painted `bg.canvas`, the same color as the content, so
          // without this the scrolled content runs straight into the title with
          // no boundary at all. On Android this is the M3 shadow, on iOS < 26
          // the `UINavigationBar` hairline. Off only on iOS 26, where the system
          // already draws a scroll edge effect and a hairline would double it.
          headerShadowVisible: chromeTier !== 'ios26',
          headerTintColor: Colors.brand.default,
          headerBackButtonDisplayMode: 'minimal' as const,
          headerTitleStyle: {
            fontFamily: FontFamily.serif,
            fontSize: 22,
            color: Colors.text.strong,
          },
          ...headerChrome,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: 'Nook', statusBarStyle: 'light' }}
        />

        {/* `title` is not `headerTitle`. Without it expo-router falls back to the
            ROUTE FILENAME, so the Android app bar reads "results" and the back
            button's accessibility label reads "choose". The real `headerTitle` is
            declared per screen. */}
        <Stack.Screen name="choose" options={{ title: CHOOSE_TITLE }} />
        <Stack.Screen name="results" options={{ title: RESULTS_TITLE }} />
      </Stack>
    </QueryClientProvider>
  );
}
