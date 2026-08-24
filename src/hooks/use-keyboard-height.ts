import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/**
 * Height of the on-screen keyboard, 0 when it is down.
 *
 * Anything pinned to the bottom OUTSIDE the scroll view has to move itself:
 * scrolling cannot rescue it, because it is not in the scroll area at all.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
