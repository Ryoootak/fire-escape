import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  label: string;
  color: string;
}

export function TierTag({ label, color }: Props) {
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  label: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    letterSpacing: 1,
  },
});
