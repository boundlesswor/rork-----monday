import React from 'react';
import { ViewStyle } from 'react-native';
import LinearGradientNative from 'react-native-linear-gradient'; // Прямой импорт

type Props = {
  colors: readonly string[] | string[];
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

export default function LinearGradient({ colors, style, children }: Props) {
  return (
    <LinearGradientNative colors={colors as string[]} style={style}>
      {children}
    </LinearGradientNative>
  );
}
