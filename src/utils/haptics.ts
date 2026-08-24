import * as Haptics from 'expo-haptics';

/**
 * Haptics are decoration: a device without a Taptic Engine, or one where the
 * user disabled system haptics, rejects these calls. Failing the interaction
 * over it would be worse than staying silent, so the rejection is absorbed here
 * — deliberately, and in exactly one place — rather than with a bare
 * `.catch(() => {})` at each call site.
 */
function bestEffort(run: () => Promise<void>): void {
  run().catch(() => {});
}

export function tapStart(): void {
  bestEffort(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function tapStop(): void {
  bestEffort(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function tapSelect(): void {
  bestEffort(() => Haptics.selectionAsync());
}
