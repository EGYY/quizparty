import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@shared/config/theme';
import { s, sf, sv } from '@shared/config/scale';
import { useSoundEffects } from '@shared/ui/sound-effects-provider';

type Toast = {
  id: string;
  message: string;
  tone: 'success' | 'error' | 'info';
};

type ToastApi = {
  notify: (message: string, tone?: Toast['tone']) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { playError } = useSoundEffects();
  const removeTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(
    new Set(),
  );

  useEffect(
    () => () => {
      removeTimersRef.current.forEach(clearTimeout);
      removeTimersRef.current.clear();
    },
    [],
  );

  const notify = useCallback(
    (message: string, tone: Toast['tone'] = 'info') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts(current => [...current, { id, message, tone }].slice(-3));
      if (tone === 'error') playError();
      const timeoutId = setTimeout(() => {
        removeTimersRef.current.delete(timeoutId);
        setToasts(current => current.filter(toast => toast.id !== id));
      }, 3600);
      removeTimersRef.current.add(timeoutId);
    },
    [playError],
  );
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="none" style={styles.viewport}>
        {toasts.map(toast => (
          <View key={toast.id} style={[styles.toast, styles[toast.tone]]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    right: s(54),
    top: sv(42),
    gap: spacing.sm,
    width: s(420),
  },
  toast: {
    borderRadius: radii.md,
    borderWidth: s(1),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  info: {
    borderColor: colors.border,
    backgroundColor: colors.panelSolid,
  },
  success: {
    borderColor: colors.mint,
    backgroundColor: '#12382f',
  },
  error: {
    borderColor: colors.red,
    backgroundColor: '#3b1824',
  },
  toastText: {
    color: colors.text,
    fontSize: sf(18),
    fontWeight: '800',
  },
});
