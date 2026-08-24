import {
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';

import { MIN_RECORDING_MS } from '@/constants';
import { tapStart, tapStop } from '@/utils/haptics';
import { normalizeMetering } from '@/utils/metering';

export type RecorderPhase = 'idle' | 'recording' | 'processing' | 'denied' | 'tooShort' | 'failed';

const OPTIONS = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

/** Metering polling interval — fast enough for the waveform, cheap enough to poll. */
const METER_INTERVAL_MS = 80;

export function useRecorder() {
  const recorder = useAudioRecorder(OPTIONS);
  const state = useAudioRecorderState(recorder, METER_INTERVAL_MS);
  const [phase, setPhase] = useState<RecorderPhase>('idle');

  useEffect(() => {
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true }).catch((error) => {
      // Not fatal on its own — `start()` reports the failure the user can see.
      // Swallowing it without a trace is what makes this class of bug expensive.
      console.warn('[recorder] could not configure the audio session', error);
    });
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

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase('recording');
      tapStart();
    } catch (error) {
      // A busy audio session, a session another app grabbed, no route in.
      // Without this the promise rejects into nothing and the button just
      // never changes — the user taps again and again with no feedback.
      console.warn('[recorder] could not start recording', error);
      setPhase('failed');
    }
  }, [recorder]);

  const stop = useCallback(async () => {
    const durationMs = state.durationMillis;
    setPhase('processing');
    tapStop();

    try {
      await recorder.stop();
    } catch (error) {
      console.warn('[recorder] could not stop cleanly', error);
      setPhase('failed');
      return null;
    }

    // Reject a too-short take BEFORE the transcriber. The mock would throw
    // "Empty audio data", but catching it here explains what actually happened.
    if (durationMs < MIN_RECORDING_MS) {
      setPhase('tooShort');
      return null;
    }

    const finalUri = recorder.uri ?? null;
    if (!finalUri) {
      setPhase('failed');
      return null;
    }

    // Deliberately not resetting to `idle` here — `RecordScreen` does it once
    // the screen is covered, see `SETTLE_MS` there.
    return finalUri;
  }, [recorder, state.durationMillis]);

  const reset = useCallback(() => setPhase('idle'), []);

  return {
    phase,
    durationMs: state.durationMillis,
    level: normalizeMetering(state.metering),
    start,
    stop,
    reset,
  };
}
