import { useCallback, useEffect, useState } from 'react';
import { openDb } from '../database/db';
import { ensureSeeded } from '../services/seed';

interface DbState {
  ready: boolean;
  error: string | null;
}

export function useDbReady(): DbState {
  const [state, setState] = useState<DbState>({ ready: false, error: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await openDb();
        await ensureSeeded();
        if (!cancelled) setState({ ready: true, error: null });
      } catch {
        if (!cancelled) setState({ ready: false, error: 'Не удалось запустить базу данных' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function useForceRender(): () => void {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}