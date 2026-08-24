import type { DisorderOption } from '@/hooks/use-audio-transcriber';

export type DisorderGroup = {
  id: string;
  label: string;
  hint?: string;
  items: DisorderOption[];
};

const GROUP_DEFS: { id: string; label: string; hint?: string; values: string[] }[] = [
  {
    id: 'mood',
    label: 'MOOD & FEELINGS',
    values: [
      'U_DIS_DEPRESSION',
      'U_DIS_DISPLEASURE',
      'U_DIS_GRIEF',
      'U_DIS_LACK_OF_DRIVE',
      'U_DIS_OUT_OF_CONTROL_EMOTION',
      'U_DIS_EMOTION',
      'U_DIS_STRESS',
    ],
  },
  {
    id: 'fear',
    label: 'FEAR & WORRY',
    values: [
      'U_DIS_PANIC',
      'U_DIS_TRIGGERED_FEAR',
      'U_DIS_NO_TRIGGERED_FEAR',
      'U_DIS_FEAR',
      'U_DIS_COMPULSION',
      'U_DIS_TRAUMA',
    ],
  },
  {
    id: 'body',
    label: 'BODY & SLEEP',
    values: [
      'U_DIS_SLEEP_PROBLEM',
      'U_DIS_PHYSICAL_PAIN',
      'U_DIS_EATING_DISORDER',
      'U_DIS_EATING_BEHAVIOUR',
      'U_DIS_EATING_BEHAVIOR',
    ],
  },
  {
    id: 'self',
    label: 'YOURSELF',
    values: [
      'U_DIS_DEEP_SELF_WORTH',
      'U_DIS_SELF_WORTH',
      'U_DIS_DECISION_MAKING',
      'U_DIS_MEANING_SEEKING',
      'U_DIS_LONELINESS',
      'U_DIS_ALIENATION',
      'U_DIS_GENDER_IDENTITY',
      'U_DIS_SEXUAL_PREFERENCE',
    ],
  },
  {
    id: 'relationships',
    label: 'RELATIONSHIPS',
    values: [
      'U_DIS_COMMUNICATION_PROBLEM',
      'U_DIS_LOYALTY_PROBLEM',
      'U_DIS_CONFLICT_RESOLUTION',
      'U_DIS_INTIMACY_SEXUALITY',
      'U_DIS_JEALOUSY',
      'U_DIS_EMOTIONAL_DEPENDENCE',
      'U_DIS_AGGRESSION_VIOLENCE',
      'U_DIS_MANIPULATION_VIOLENCE',
      'U_DIS_SOCIAL_BEHAVIOUR',
    ],
  },
  {
    id: 'habits',
    label: 'HABITS',
    values: ['U_DIS_SUBSTANCE_ABUSE', 'U_DIS_CONSUMER_BEHAVIOUR'],
  },
  {
    id: 'family',
    label: 'SOMEONE IN YOUR FAMILY',
    hint: 'Pick from here if you are looking for someone else — your child, or a person close to you.',
    values: [
      'U_DIS_BEHAVIOR_PROBLEM_CHILD',
      'U_DIS_FAMILY_DEPRESSION',
      'U_DIS_FAMILY_ANXIETY',
      'U_DIS_FAMILY_PANIC',
      'U_DIS_FAMILY_COMPULSION',
      'U_DIS_FAMILY_SLEEP_PROBLEM',
      'U_DIS_FAMILY_SUBSTANCE_ABUSE',
      'U_DIS_FAMILY_SEXUALITY',
      'U_DIS_FAMILY_AUTISM',
      'U_DIS_FAMILY_HYPERACTIVITY',
      'U_DIS_FAMILY_CONCENTRATION_PROBLEM',
    ],
  },
];

const FALLBACK_GROUP = { id: 'other', label: 'SOMETHING ELSE' };

/**
 * The source data suffixes "(family)" onto exactly 4 of the 11 family items, so
 * the group looks like it holds two different kinds of entry. The section
 * heading already says "family", so the suffix is stripped at DISPLAY level
 * only — the `value` sent to the API is untouched.
 */
const FAMILY_SUFFIX = /\s*\(family\)$/i;

function displayLabel(option: DisorderOption, groupId: string): DisorderOption {
  if (groupId !== 'family') return option;
  const stripped = option.label.replace(FAMILY_SUFFIX, '');
  return stripped === option.label ? option : { ...option, label: stripped };
}

const GROUP_OF = new Map<string, string>();
for (const def of GROUP_DEFS) {
  for (const value of def.values) GROUP_OF.set(value, def.id);
}

/**
 * Splits options into groups, keeping API order inside each group.
 *
 * TOTAL: everything that goes in comes out. Unknown values land in the catch-all
 * instead of disappearing, so a disorder added by the backend stays selectable.
 */
export function groupDisorders(options: DisorderOption[] | null | undefined): DisorderGroup[] {
  if (!options || options.length === 0) return [];

  const buckets = new Map<string, DisorderOption[]>();
  for (const option of options) {
    const groupId = GROUP_OF.get(option.value) ?? FALLBACK_GROUP.id;
    const shown = displayLabel(option, groupId);
    const bucket = buckets.get(groupId);
    if (bucket) bucket.push(shown);
    else buckets.set(groupId, [shown]);
  }

  const groups: DisorderGroup[] = [];
  for (const def of GROUP_DEFS) {
    const items = buckets.get(def.id);
    if (items?.length) groups.push({ id: def.id, label: def.label, hint: def.hint, items });
  }

  const leftovers = buckets.get(FALLBACK_GROUP.id);
  if (leftovers?.length) {
    groups.push({ ...FALLBACK_GROUP, items: leftovers });
  }

  return groups;
}

export function filterGroups(groups: DisorderGroup[], query: string): DisorderGroup[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return groups;

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(needle)),
    }))
    .filter((group) => group.items.length > 0);
}

export function countItems(groups: DisorderGroup[]): number {
  return groups.reduce((total, group) => total + group.items.length, 0);
}

/**
 * Per-group selection signature, one string per group, in `groups` order.
 *
 * A `Set` is a fresh object after every tap, so handing it to each group
 * re-renders all 49 chips for a change that touched one. Strings compare by
 * value, so groups whose selection did not move keep their memoised JSX; the
 * cost is a single pass over the options.
 */
export function selectionKeys(
  groups: readonly DisorderGroup[],
  selected: ReadonlySet<string>,
): string[] {
  return groups.map((group) =>
    group.items
      .filter((item) => selected.has(item.value))
      .map((item) => item.value)
      .join(','),
  );
}

/**
 * Resolves ids back to the labels the user actually tapped, in id order.
 *
 * Never derive a label from the id: `U_DIS_DEPRESSION` is shown as "Feeling
 * down", and echoing "Depression" puts a word on screen that reads like a
 * diagnosis and that nobody chose. Unknown ids drop out instead.
 */
export function labelsFor(
  options: readonly DisorderOption[] | null | undefined,
  ids: readonly string[],
): string[] {
  if (!options || options.length === 0) return [];

  const labelOf = new Map(options.map((option) => [option.value, option.label]));
  return ids
    .map((id) => labelOf.get(id))
    .filter((label): label is string => typeof label === 'string' && label.length > 0);
}
