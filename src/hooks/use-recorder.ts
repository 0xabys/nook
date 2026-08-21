import {
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';

import { MIN_RECORDING_MS } from '@/constants';

export type RecorderPhase = 'idle' | 'recording' | 'processing' | 'denied' | 'tooShort';

const OPTIONS = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

/** dB floor for normalising. Below this counts as silence. */
const METER_FLOOR_DB = -50;

/** Metering reports dBFS (roughly -160..0). Map it to 0..1 for the waveform. */
function normalizeMetering(db: number | undefined): number {
  if (db == null || !Number.isFinite(db)) return 0;
  const clamped = Math.max(METER_FLOOR_DB, Math.min(0, db));
  return (clamped - METER_FLOOR_DB) / -METER_FLOOR_DB;
}

export function useRecorder() {
  const recorder = useAudioRecorder(OPTIONS);
  const state = useAudioRecorderState(recorder, 80);
  const [phase, setPhase] = useState<RecorderPhase>('idle');
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true }).catch(() => {});
  }, []);

  const start = useCallback(async () => {
    let granted = (await getRecordingPermissionsAsync()).granted;
    if (!granted) {
      granted = (await requestRecordingPermissionsAsync()).granted;
    }
    if (!granted) {
      setPhase('denied');
      return;
    }

    setUri(null);
    await recorder.prepareToRecordAsync();
    recorder.record();
    setPhase('recording');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [recorder]);

  const stop = useCallback(async () => {
    const durationMs = state.durationMillis;
    setPhase('processing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    await recorder.stop();

    // Reject a too-short take BEFORE the transcriber. The mock would throw
    // "Empty audio data", but catching it here explains what actually happened.
    if (durationMs < MIN_RECORDING_MS) {
      setPhase('tooShort');
      return null;
    }

    const finalUri = recorder.uri ?? null;
    setUri(finalUri);
    // Deliberately not resetting to `idle` here — `RecordScreen` does it once
    // the screen is covered, see `SETTLE_MS` there.
    return finalUri;
  }, [recorder, state.durationMillis]);

  const reset = useCallback(() => {
    setPhase('idle');
    setUri(null);
  }, []);

  return {
    phase,
    uri,
    durationMs: state.durationMillis,
    level: normalizeMetering(state.metering),
    isRecording: state.isRecording,
    start,
    stop,
    reset,
  };
}
