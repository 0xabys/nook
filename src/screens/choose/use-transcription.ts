import { File } from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';

import { useAudioTranscriber, type DisorderOption } from '@/hooks/use-audio-transcriber';

/**
 * `retry` re-reads the same recording; `record` means there is no recording to
 * read and the only way forward is back to the microphone.
 */
export type FailureRecovery = 'retry' | 'record';

export type TranscriptionFailure = {
  message: string;
  recovery: FailureRecovery;
};

export type Transcription = {
  options: DisorderOption[] | null;
  /** True from mount until the options or a failure land. */
  isLoading: boolean;
  failure: TranscriptionFailure | null;
  /** Options are on screen and usable. */
  ready: boolean;
  retry: () => void;
};

const NO_AUDIO: TranscriptionFailure = {
  message: 'There is no recording to listen back to.',
  recovery: 'record',
};

const UNREADABLE: TranscriptionFailure = {
  message: 'We could not read that recording.',
  recovery: 'retry',
};

/**
 * Reads the recording off disk and runs it through the transcriber.
 *
 * The hook takes `Blob | ArrayBuffer | Uint8Array` and we hold a file path.
 * `expo-file-system.File` implements Blob, so reading an ArrayBuffer meets the
 * contract without a cast.
 */
export function useTranscription(audioUri: string | null): Transcription {
  const { data, error, processAudio } = useAudioTranscriber();
  const [readError, setReadError] = useState<TranscriptionFailure | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!audioUri) return;

    // No synchronous setState in an effect body — it cascades renders and React
    // Compiler rejects it here.
    let cancelled = false;
    (async () => {
      try {
        const bytes = await new File(audioUri).arrayBuffer();
        if (cancelled) return;
        await processAudio(bytes);
      } catch {
        if (!cancelled) setReadError(UNREADABLE);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [audioUri, processAudio, attempt]);

  const retry = useCallback(() => {
    setReadError(null);
    setAttempt((n) => n + 1);
  }, []);

  // Reached without an `audio` param — a deep link, or a restored task. Nothing
  // is coming, so say so rather than leaving a skeleton pulsing forever.
  if (!audioUri) {
    return { options: null, isLoading: false, failure: NO_AUDIO, ready: false, retry };
  }

  const failure = readError ?? (error ? { message: error, recovery: 'retry' as const } : null);

  return {
    options: data,
    // Derived rather than the transcriber's own flag: between mount and
    // `processAudio` raising it there is a frame where nothing is loading and
    // no data exists yet, which would flash the empty state.
    isLoading: !failure && data === null,
    failure,
    ready: data !== null && !failure,
    retry,
  };
}
