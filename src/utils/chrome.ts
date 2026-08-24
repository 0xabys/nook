import { Platform } from 'react-native';

import { resolveChromeTier } from './chrome-tier';

export type { ChromeTier } from './chrome-tier';

/** Resolved once at import: `Platform` cannot change during a session. */
export const chromeTier = resolveChromeTier(Platform.OS, Platform.Version);
