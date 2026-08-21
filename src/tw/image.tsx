import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { cssElement } from './index';

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

type CSSImageProps = Omit<ExpoImageProps, 'source'> & {
  source: ExpoImageProps['source'] | string;
};

function CSSImage({ source, style, ...rest }: CSSImageProps) {
  // @ts-expect-error: objectFit/objectPosition are CSS styles, expo-image takes them as props
  const { objectFit, objectPosition, ...flat } = StyleSheet.flatten(style) || {};

  return (
    <AnimatedExpoImage
      contentFit={objectFit}
      contentPosition={objectPosition}
      {...rest}
      source={typeof source === 'string' ? { uri: source } : source}
      style={flat}
    />
  );
}

export type ImageProps = CSSImageProps & { className?: string };

export const Image = (props: ImageProps) => cssElement(CSSImage, props, { className: 'style' });
Image.displayName = 'CSS(Image)';
