/** dB floor for normalising. Anything below this counts as silence. */
export const METER_FLOOR_DB = -50;

/** Metering reports dBFS (roughly -160..0). Maps it to 0..1 for the waveform. */
export function normalizeMetering(db: number | null | undefined): number {
  if (db == null || !Number.isFinite(db)) return 0;

  const clamped = Math.max(METER_FLOOR_DB, Math.min(0, db));
  return (clamped - METER_FLOOR_DB) / -METER_FLOOR_DB;
}
