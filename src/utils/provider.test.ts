import { describe, expect, test } from 'bun:test';

import type { ProviderTag } from '@/api/types';

import { formatExperience, formatTitle, fullNameOf, initialsOf, pickTags } from './provider';

const tag = (type: string, text: string): ProviderTag => ({ type, subType: null, text });

describe('formatExperience', () => {
  test('hides the line for 0 or null', () => {
    expect(formatExperience(0)).toBeNull();
    expect(formatExperience(0.0)).toBeNull();
    expect(formatExperience(null)).toBeNull();
    expect(formatExperience(undefined)).toBeNull();
  });

  test('hides the line below a full year', () => {
    expect(formatExperience(0.17)).toBeNull();
    expect(formatExperience(0.99)).toBeNull();
  });

  test('rounds DOWN, not to nearest', () => {
    expect(formatExperience(7.79)).toBe('7 years of experience');
    expect(formatExperience(4.56)).toBe('4 years of experience');
    expect(formatExperience(3.65)).toBe('3 years of experience');
  });

  test('uses the singular at exactly one year', () => {
    expect(formatExperience(1)).toBe('1 year of experience');
    expect(formatExperience(1.99)).toBe('1 year of experience');
    expect(formatExperience(2)).toBe('2 years of experience');
  });

  test('matches the provider-item.png mockup', () => {
    expect(formatExperience(4)).toBe('4 years of experience');
  });

  test('survives junk values', () => {
    expect(formatExperience(-3)).toBeNull();
    expect(formatExperience(NaN)).toBeNull();
    expect(formatExperience(Infinity)).toBeNull();
  });
});

describe('formatTitle', () => {
  test('hides the line for null or empty', () => {
    expect(formatTitle(null)).toBeNull();
    expect(formatTitle(undefined)).toBeNull();
    expect(formatTitle('')).toBeNull();
    expect(formatTitle('   ')).toBeNull();
  });

  test('maps the two values present in the dataset', () => {
    expect(formatTitle('PSYCHOTHERAPIST')).toBe('Psychotherapist');
    expect(formatTitle('PSYCHOLOGIST')).toBe('Psychologist');
  });

  test('humanises unknown values instead of hiding them', () => {
    expect(formatTitle('COUPLES_THERAPIST')).toBe('Couples therapist');
    expect(formatTitle('SYSTEMIC_FAMILY_COACH')).toBe('Systemic family coach');
  });

  test('leaves already-readable strings alone', () => {
    expect(formatTitle('Psychotherapist')).toBe('Psychotherapist');
    expect(formatTitle('Art therapist')).toBe('Art therapist');
  });
});

describe('pickTags', () => {
  test('returns an empty array when there are no tags', () => {
    expect(pickTags(null)).toEqual([]);
    expect(pickTags(undefined)).toEqual([]);
    expect(pickTags([])).toEqual([]);
  });

  test('lifts NUM_SESSION to the front even when the API returns it last', () => {
    const tags = [
      tag('EVENING_AVAILABILITY', 'Evening appointments'),
      tag('LUNCH_AVAILABILITY', 'Lunch appointments'),
      tag('NUM_SESSION', '100+ sessions'),
    ];
    expect(pickTags(tags).map((t) => t.type)).toEqual(['NUM_SESSION', 'EVENING_AVAILABILITY']);
  });

  test('reproduces the mockup for the one provider with 5 tags', () => {
    const tags = [
      tag('NUM_SESSION', '500+ sessions'),
      tag('FLEXIBLE_OFFERING', 'Flexible offerings'),
      tag('LUNCH_AVAILABILITY', 'Lunch appointments'),
      tag('EVENING_AVAILABILITY', 'Evening appointments'),
      tag('METHOD', 'Crisis Intervention'),
    ];
    expect(pickTags(tags).map((t) => t.text)).toEqual(['500+ sessions', 'Crisis Intervention']);
  });

  test('ranks METHOD above FLEXIBLE_OFFERING', () => {
    const tags = [
      tag('FLEXIBLE_OFFERING', 'Flexible offerings'),
      tag('METHOD', 'Crisis Intervention'),
    ];
    expect(pickTags(tags).map((t) => t.type)).toEqual(['METHOD', 'FLEXIBLE_OFFERING']);
  });

  test('slice(0,2) would be wrong here — this is why the function exists', () => {
    const tags = [
      tag('WEEKEND_AVAILABILITY', 'Weekend appointments'),
      tag('EVENING_AVAILABILITY', 'Evening appointments'),
      tag('NUM_SESSION', '300+ sessions'),
    ];
    expect(tags.slice(0, 2).map((t) => t.type)).toEqual([
      'WEEKEND_AVAILABILITY',
      'EVENING_AVAILABILITY',
    ]);
    expect(pickTags(tags)[0].type).toBe('NUM_SESSION');
  });

  test('unknown types still render, just after the known ones', () => {
    const tags = [
      tag('SOMETHING_NEW', 'Brand new thing'),
      tag('FLEXIBLE_OFFERING', 'Flexible offerings'),
    ];
    expect(pickTags(tags).map((t) => t.type)).toEqual(['FLEXIBLE_OFFERING', 'SOMETHING_NEW']);
  });

  test('drops text-less tags so no empty slot renders', () => {
    const tags = [tag('NUM_SESSION', '   '), tag('FLEXIBLE_OFFERING', 'Flexible offerings')];
    expect(pickTags(tags).map((t) => t.type)).toEqual(['FLEXIBLE_OFFERING']);
  });

  test('sorts stably within one priority level', () => {
    const tags = [tag('METHOD', 'Second'), tag('METHOD', 'First')];
    expect(pickTags(tags).map((t) => t.text)).toEqual(['Second', 'First']);
  });

  test('respects the limit', () => {
    const tags = [tag('NUM_SESSION', 'a'), tag('METHOD', 'b'), tag('FLEXIBLE_OFFERING', 'c')];
    expect(pickTags(tags, 1)).toHaveLength(1);
    expect(pickTags(tags, 3)).toHaveLength(3);
    expect(pickTags(tags, 0)).toEqual([]);
  });
});

describe('initialsOf', () => {
  test('takes the first letter of each name', () => {
    expect(initialsOf({ firstName: 'Alexandra', lastName: 'Rossy' })).toBe('AR');
    expect(initialsOf({ firstName: 'Anastasiya', lastName: 'Gnitko' })).toBe('AG');
  });

  test('handles non-ASCII characters', () => {
    expect(initialsOf({ firstName: 'Şir', lastName: 'Phan' })).toBe('ŞP');
  });

  test('handles multi-word and junk names', () => {
    expect(initialsOf({ firstName: 'Nam under 18 Duong', lastName: 'Provider 4' })).toBe('NP');
  });

  test('handles a missing half', () => {
    expect(initialsOf({ firstName: 'Marta', lastName: '' })).toBe('M');
    expect(initialsOf({ firstName: '', lastName: '' })).toBe('');
    expect(initialsOf(null)).toBe('');
  });
});

describe('fullNameOf', () => {
  test('joins both halves', () => {
    expect(fullNameOf({ firstName: 'Sir Alex', lastName: 'Ferguson' })).toBe('Sir Alex Ferguson');
  });

  test('leaves no stray whitespace when a half is missing', () => {
    expect(fullNameOf({ firstName: 'Marta', lastName: '' })).toBe('Marta');
    expect(fullNameOf({ firstName: '', lastName: 'Keller' })).toBe('Keller');
    expect(fullNameOf(null)).toBe('');
  });
});
