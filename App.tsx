import { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useFonts, JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { EscapeTimer } from './src/components/EscapeTimer';
import { InputPanel } from './src/components/InputPanel';
import { calcEscape } from './src/lib/calcEscape';
import { monthsToSeconds } from './src/lib/formatTime';
import { colors, defaults } from './src/lib/tokens';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({ JetBrainsMono_400Regular });

  const [assets, setAssets]           = useState<number>(defaults.assets);
  const [monthlyCost, setMonthlyCost] = useState<number>(defaults.monthlyCost);
  const [sideIncome, setSideIncome]   = useState<number>(defaults.sideIncome);
  const [annualRate, setAnnualRate]   = useState<number>(defaults.annualRate);

  const result = useMemo(
    () => calcEscape(assets, monthlyCost, sideIncome, annualRate),
    [assets, monthlyCost, sideIncome, annualRate],
  );

  const totalSeconds = useMemo(
    () => (result.status === 'DEPLETE' && result.months !== null
      ? monthsToSeconds(result.months)
      : null),
    [result],
  );

  const onLayout = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.root} onLayout={onLayout}>
      <StatusBar style="light" />

      {/* タイマーエリア */}
      <View style={styles.timerArea}>
        <EscapeTimer totalSeconds={totalSeconds} status={result.status} />
      </View>

      {/* スライダーパネル */}
      <ScrollView
        style={styles.panelScroll}
        contentContainerStyle={styles.panelContent}
        showsVerticalScrollIndicator={false}
      >
        <InputPanel
          assets={assets}
          monthlyCost={monthlyCost}
          sideIncome={sideIncome}
          annualRate={annualRate}
          onAssetsChange={setAssets}
          onMonthlyCostChange={setMonthlyCost}
          onSideIncomeChange={setSideIncome}
          onAnnualRateChange={setAnnualRate}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  timerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelScroll: {
    flexShrink: 0,
  },
  panelContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
