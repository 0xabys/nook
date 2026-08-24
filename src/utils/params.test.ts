import { describe, expect, it } from 'bun:test';

import { decodeList, encodeList } from './params';

describe('encodeList / decodeList', () => {
  it('round-trips a plain list', () => {
    const items = ['U_DIS_DEPRESSION', 'U_DIS_PANIC'];
    expect(decodeList(encodeList(items))).toEqual(items);
  });

  it('round-trips labels containing the old separators', () => {
    const items = ['Stress, burnout', 'Fear | worry', 'He said "no"'];
    expect(decodeList(encodeList(items))).toEqual(items);
  });

  it('round-trips non-ASCII labels', () => {
    const items = ['Şir Alexdasdasd', 'Trầm cảm', '😔 low mood'];
    expect(decodeList(encodeList(items))).toEqual(items);
  });

  it('encodes an empty list as undefined so the param is dropped', () => {
    expect(encodeList([])).toBeUndefined();
  });

  it('decodes a missing param as an empty list', () => {
    expect(decodeList(undefined)).toEqual([]);
    expect(decodeList('')).toEqual([]);
  });

  it('decodes malformed input as an empty list instead of throwing', () => {
    expect(decodeList('not json')).toEqual([]);
    expect(decodeList('{"a":1}')).toEqual([]);
    expect(decodeList('[')).toEqual([]);
  });

  it('drops non-string and empty entries', () => {
    expect(decodeList('["a",1,null,"","b"]')).toEqual(['a', 'b']);
  });
});
