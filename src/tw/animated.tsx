/**
 * Animated.View that accepts `className`. TW.View has to be the inner wrapper —
 * the other way round Reanimated swallows the className.
 */
import RNAnimated from 'react-native-reanimated';

import * as TW from './index';

export const Animated = {
  ...RNAnimated,
  View: RNAnimated.createAnimatedComponent(TW.View),
};
