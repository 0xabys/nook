import { describe, expect, test } from 'bun:test';

import type { DisorderOption } from '@/hooks/use-audio-transcriber';

import { countItems, filterGroups, groupDisorders } from './disorders';

const ALL: DisorderOption[] = [
  { value: 'U_DIS_DEPRESSION', label: 'Feeling down' },
  { value: 'U_DIS_PANIC', label: 'Sudden panic' },
  { value: 'U_DIS_TRIGGERED_FEAR', label: 'Anxiety with clear reason' },
  { value: 'U_DIS_NO_TRIGGERED_FEAR', label: 'Generalised anxiety without a trigger' },
  { value: 'U_DIS_FEAR', label: 'Fears' },
  { value: 'U_DIS_PHYSICAL_PAIN', label: 'Physical pain' },
  { value: 'U_DIS_EATING_DISORDER', label: 'Eating behaviour disorders' },
  { value: 'U_DIS_SLEEP_PROBLEM', label: 'Sleep problems' },
  { value: 'U_DIS_OUT_OF_CONTROL_EMOTION', label: 'Emotions out of control' },
  { value: 'U_DIS_LACK_OF_DRIVE', label: 'Lack of drive' },
  { value: 'U_DIS_COMPULSION', label: 'Compulsions' },
  { value: 'U_DIS_TRAUMA', label: 'Trauma' },
  { value: 'U_DIS_GRIEF', label: 'Grief' },
  { value: 'U_DIS_STRESS', label: 'Stress' },
  { value: 'U_DIS_DEEP_SELF_WORTH', label: 'Low self-esteem' },
  { value: 'U_DIS_SELF_WORTH', label: 'Self-esteem problems' },
  { value: 'U_DIS_DECISION_MAKING', label: 'Decision making' },
  { value: 'U_DIS_LONELINESS', label: 'Loneliness' },
  { value: 'U_DIS_SEXUAL_PREFERENCE', label: 'Sexual orientation' },
  { value: 'U_DIS_DISPLEASURE', label: 'Depressive mood' },
  { value: 'U_DIS_EATING_BEHAVIOUR', label: 'Eating habits' },
  { value: 'U_DIS_EMOTION', label: 'Regulating emotions' },
  { value: 'U_DIS_MEANING_SEEKING', label: 'Search for meaning' },
  { value: 'U_DIS_COMMUNICATION_PROBLEM', label: 'Communication problems' },
  { value: 'U_DIS_LOYALTY_PROBLEM', label: 'Trust issues' },
  { value: 'U_DIS_CONFLICT_RESOLUTION', label: 'Conflict resolution' },
  { value: 'U_DIS_INTIMACY_SEXUALITY', label: 'Intimacy and sexuality' },
  { value: 'U_DIS_AGGRESSION_VIOLENCE', label: 'Aggression' },
  { value: 'U_DIS_MANIPULATION_VIOLENCE', label: 'Manipulation' },
  { value: 'U_DIS_ALIENATION', label: 'Alienation' },
  { value: 'U_DIS_EMOTIONAL_DEPENDENCE', label: 'Emotional dependency' },
  { value: 'U_DIS_SUBSTANCE_ABUSE', label: 'Substance abuse' },
  { value: 'U_DIS_JEALOUSY', label: 'Jealousy' },
  { value: 'U_DIS_BEHAVIOR_PROBLEM_CHILD', label: 'Child with behavioural problems' },
  { value: 'U_DIS_EATING_BEHAVIOR', label: 'Eating behaviour and body image' },
  { value: 'U_DIS_CONSUMER_BEHAVIOUR', label: 'Consumer behaviour' },
  { value: 'U_DIS_FAMILY_SUBSTANCE_ABUSE', label: 'Substance abuse (family)' },
  { value: 'U_DIS_FAMILY_ANXIETY', label: 'Fears (family)' },
  { value: 'U_DIS_FAMILY_DEPRESSION', label: 'Depressiveness' },
  { value: 'U_DIS_FAMILY_PANIC', label: 'Panic' },
  { value: 'U_DIS_FAMILY_SEXUALITY', label: 'Sexuality' },
  { value: 'U_DIS_GENDER_IDENTITY', label: 'Gender identity' },
  { value: 'U_DIS_FAMILY_COMPULSION', label: 'Compulsions (family)' },
  { value: 'U_DIS_FAMILY_SLEEP_PROBLEM', label: 'Sleep problems (family)' },
  { value: 'U_DIS_FAMILY_AUTISM', label: 'Autism spectrum' },
  { value: 'U_DIS_FAMILY_HYPERACTIVITY', label: 'Hyperactivity' },
  { value: 'U_DIS_FAMILY_CONCENTRATION_PROBLEM', label: 'Concentration problems' },
  { value: 'U_DIS_SOCIAL_BEHAVIOUR', label: 'Social behavior' },
  { value: 'U_DIS_OTHER', label: 'Others' },
];

describe('groupDisorders', () => {
  test('the source set has exactly 49 items', () => {
    expect(ALL).toHaveLength(49);
  });

  test('total — as many out as in', () => {
    expect(countItems(groupDisorders(ALL))).toBe(ALL.length);
  });

  test('no item appears in two groups', () => {
    const flat = groupDisorders(ALL).flatMap((g) => g.items.map((i) => i.value));
    expect(new Set(flat).size).toBe(flat.length);
  });

  test('every source item is placed, none falls through to the catch-all', () => {
    const other = groupDisorders(ALL).find((g) => g.id === 'other');
    expect(other?.items.map((i) => i.value)).toEqual(['U_DIS_OTHER']);
  });

  test("separates a family member's problems from the user's own", () => {
    const family = groupDisorders(ALL).find((g) => g.id === 'family');
    expect(family?.label).toBe('SOMEONE IN YOUR FAMILY');
    expect(family?.items).toHaveLength(11);
    expect(family?.items.map((i) => i.value)).toContain('U_DIS_BEHAVIOR_PROBLEM_CHILD');
    expect(family?.items.map((i) => i.value)).not.toContain('U_DIS_SUBSTANCE_ABUSE');
  });

  test('strips the redundant (family) suffix without touching the API value', () => {
    const family = groupDisorders(ALL).find((g) => g.id === 'family');
    const byValue = new Map(family!.items.map((i) => [i.value, i.label]));
    expect(byValue.get('U_DIS_FAMILY_SLEEP_PROBLEM')).toBe('Sleep problems');
    expect(byValue.get('U_DIS_FAMILY_ANXIETY')).toBe('Fears');
    expect(byValue.get('U_DIS_FAMILY_COMPULSION')).toBe('Compulsions');
    expect(byValue.get('U_DIS_FAMILY_SUBSTANCE_ABUSE')).toBe('Substance abuse');
    expect(byValue.get('U_DIS_FAMILY_AUTISM')).toBe('Autism spectrum');
    expect(family!.items.some((i) => /\(family\)/i.test(i.label))).toBe(false);
  });

  test('only the family group is stripped, other groups are untouched', () => {
    const groups = groupDisorders(ALL);
    const body = groups.find((g) => g.id === 'body');
    expect(body!.items.map((i) => i.label)).toContain('Eating behaviour disorders');
  });

  test('the family group carries a hint, the others do not', () => {
    const groups = groupDisorders(ALL);
    expect(groups.find((g) => g.id === 'family')?.hint).toContain('someone else');
    expect(groups.find((g) => g.id === 'mood')?.hint).toBeUndefined();
  });

  test('unknown values land in the catch-all instead of vanishing', () => {
    const withNew = [...ALL, { value: 'U_DIS_BRAND_NEW', label: 'Something new' }];
    const groups = groupDisorders(withNew);
    expect(countItems(groups)).toBe(50);
    const other = groups.find((g) => g.id === 'other');
    expect(other?.items.map((i) => i.value)).toContain('U_DIS_BRAND_NEW');
  });

  test('keeps API order inside each group', () => {
    const body = groupDisorders(ALL).find((g) => g.id === 'body');
    expect(body?.items.map((i) => i.value)).toEqual([
      'U_DIS_PHYSICAL_PAIN',
      'U_DIS_EATING_DISORDER',
      'U_DIS_SLEEP_PROBLEM',
      'U_DIS_EATING_BEHAVIOUR',
      'U_DIS_EATING_BEHAVIOR',
    ]);
  });

  test('never emits an empty group', () => {
    const groups = groupDisorders([{ value: 'U_DIS_STRESS', label: 'Stress' }]);
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('mood');
  });

  test('empty input', () => {
    expect(groupDisorders([])).toEqual([]);
    expect(groupDisorders(null)).toEqual([]);
    expect(groupDisorders(undefined)).toEqual([]);
  });
});

describe('filterGroups', () => {
  const groups = groupDisorders(ALL);

  test('an empty query returns everything', () => {
    expect(countItems(filterGroups(groups, ''))).toBe(49);
    expect(countItems(filterGroups(groups, '   '))).toBe(49);
  });

  test('is case-insensitive', () => {
    const a = filterGroups(groups, 'SLEEP');
    const b = filterGroups(groups, 'sleep');
    expect(countItems(a)).toBe(countItems(b));
    expect(countItems(a)).toBe(2); // "Sleep problems" and "Sleep problems (family)"
  });

  test('drops empty groups instead of leaving a bare heading', () => {
    const filtered = filterGroups(groups, 'jealousy');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('relationships');
  });

  test('returns an empty array when nothing matches', () => {
    expect(filterGroups(groups, 'zzzzz')).toEqual([]);
  });

  test('does not mutate the input', () => {
    filterGroups(groups, 'stress');
    expect(countItems(groups)).toBe(49);
  });
});
