import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts, JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { EscapeTimer } from './src/components/EscapeTimer';
import { calcEscape } from './src/lib/calcEscape';
import { monthsToSeconds } from './src/lib/formatTime';
import { colors, defaults } from './src/lib/tokens';

SplashScreen.preventAutoHideAsync();

const defaultResult = calcEscape(
  defaults.assets,
  defaults.monthlyCost,
  defaults.sideIncome,
  defaults.annualRate,
);
const defaultSeconds =
  defaultResult.status === 'DEPLETE' && defaultResult.months !== null
    ? monthsToSeconds(defaultResult.months)
    : null;

export default function App() {
  const [fontsLoaded] = useFonts({ JetBrainsMono_400Regular });

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container} onLayout={onLayout}>
      <StatusBar style="light" />
      <EscapeTimer totalSeconds={defaultSeconds} status={defaultResult.status} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
