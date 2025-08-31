import React from 'react';
import { ViewStyle } from 'react-native';

let LG: React.ComponentType<{ colors: string[]; style?: ViewStyle | ViewStyle[] }>;
try {
  // @ts-ignore
  LG = require('react-native-linear-gradient').default;
} catch (e) {
  // @ts-ignore
  LG = require('expo-linear-gradient').LinearGradient;
}

type Props = {
  colors: readonly string[] | string[];
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

export default function LinearGradient({ colors, style, children }: Props) {
  return (
    // @ts-ignore
    <LG colors={colors as string[]} style={style as any}>
      {children}
    </LG>
  );
}
