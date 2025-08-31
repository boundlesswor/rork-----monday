import React from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

type Props = {
  colors: readonly string[] | string[];
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

export default function LinearGradient({ colors, style, children }: Props) {
  return (
    <ExpoLinearGradient colors={colors as string[]} style={style as any}>
      {children}
    </ExpoLinearGradient>
  );
}
