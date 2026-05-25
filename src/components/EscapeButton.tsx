import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../lib/tokens';

interface Props {
  onPress: () => void;
}

export function EscapeButton({ onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.main}>ESCAPE</Text>
      <Text style={styles.sub}>辞表を出す</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.fire,
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  main: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 28,
    color: colors.fire,
    letterSpacing: 4,
  },
  sub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
});
