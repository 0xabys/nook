import type { Provider, ProviderTag } from '@/api/types';

/**
 * Priority order for the two tag slots a card has room for. NUM_SESSION is the
 * rarest but most informative, and the mockup puts it first; availability tags
 * come last because they are common and barely distinguish anyone. Unknown
 * types still render, just after the known ones.
 */
export const TAG_PRIORITY = [
  'NUM_SESSION',
  'METHOD',
  'FLEXIBLE_OFFERING',
  'EVENING_AVAILABILITY',
  'LUNCH_AVAILABILITY',
  'WEEKEND_AVAILABILITY',
] as const;

const PRIORITY_INDEX = new Map<string, number>(TAG_PRIORITY.map((t, i) => [t, i]));

const TITLE_LABELS: Record<string, string> = {
  PSYCHOLOGIST: 'Psychologist',
  PSYCHOTHERAPIST: 'Psychotherapist',
};

/**
 * `yearExperience` is a FLOAT and 0 for most providers.
 *
 * Always rounds DOWN, never to nearest: 7.79 reads "7 years". These are real
 * practitioners' profiles and inflating experience is a false claim.
 *
 * Returns null when there is nothing to say — callers must drop the line
 * entirely rather than print "—" or "N/A".
 */
export function formatExperience(years: number | null | undefined): string | null {
  if (years == null || !Number.isFinite(years) || years <= 0) return null;

  const whole = Math.floor(years);
  // 0 < years < 1: some experience, but not a full year. "0 years" would be
  // both wrong and ugly, so say nothing rather than invent a number.
  if (whole < 1) return null;

  return `${whole} ${whole === 1 ? 'year' : 'years'} of experience`;
}

export function formatTitle(title: string | null | undefined): string | null {
  if (title == null) return null;

  const trimmed = title.trim();
  if (trimmed.length === 0) return null;

  const known = TITLE_LABELS[trimmed.toUpperCase()];
  if (known) return known;

  // Already human-readable: leave it alone.
  if (trimmed !== trimmed.toUpperCase() && !trimmed.includes('_')) return trimmed;

  const words = trimmed
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean);
  if (words.length === 0) return null;

  return (
    words[0].charAt(0).toUpperCase() +
    words[0].slice(1) +
    (words.length > 1 ? ' ' + words.slice(1).join(' ') : '')
  );
}

/**
 * Picks at most `limit` tags by TAG_PRIORITY.
 *
 * NOT `tags.slice(0, 2)`. The mockup was built from the one provider who has 5
 * tags, so a slice matches the reference image perfectly and then breaks on
 * everyone else.
 *
 * Stable: tags of equal priority keep their API order.
 */
export function pickTags(tags: ProviderTag[] | null | undefined, limit = 2): ProviderTag[] {
  if (!tags || tags.length === 0 || limit <= 0) return [];

  const rankOf = (t: ProviderTag) => PRIORITY_INDEX.get(t.type) ?? TAG_PRIORITY.length;

  return tags
    .filter((t) => typeof t?.text === 'string' && t.text.trim().length > 0)
    .map((tag, index) => ({ tag, index, rank: rankOf(tag) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.tag);
}

/**
 * Avatar initials for when `userInfo.avatar` is null. Array.from iterates by
 * character rather than UTF-16 code unit — the real dataset holds names like
 * "Şir Alexdasdasd Phan".
 */
export function initialsOf(name: Provider['userName'] | null | undefined): string {
  if (!name) return '';

  const firstChar = (value: string | null | undefined): string => {
    const chars = Array.from((value ?? '').trim());
    return chars.length > 0 ? chars[0].toUpperCase() : '';
  };

  return `${firstChar(name.firstName)}${firstChar(name.lastName)}`;
}

export function fullNameOf(name: Provider['userName'] | null | undefined): string {
  if (!name) return '';
  return [name.firstName, name.lastName]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' ');
}
