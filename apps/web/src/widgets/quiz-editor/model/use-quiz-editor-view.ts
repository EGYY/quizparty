import { useEffect, useMemo, useState } from 'react';
import type { MobileEditorView } from './types';

export function useQuizEditorView({
  draftId,
  failedValidationCount,
  questionCount,
}: {
  draftId: string | undefined;
  failedValidationCount: number;
  questionCount: number;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [mobileView, setMobileView] = useState<MobileEditorView>('question');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    setSelectedIndex(0);
    setShowErrors(false);
    setMobileView('question');
    setIsDeleteOpen(false);
  }, [draftId]);

  const safeIndex = Math.max(0, Math.min(selectedIndex, questionCount - 1));
  const mobileTabs = useMemo(
    () => [
      { id: 'quiz' as const, label: 'Квиз' },
      { id: 'question' as const, label: `Вопрос ${safeIndex + 1}` },
      { id: 'check' as const, label: 'Проверка', badge: failedValidationCount || '✓' },
      { id: 'preview' as const, label: 'Preview' },
    ],
    [failedValidationCount, safeIndex],
  );

  return {
    isDeleteOpen,
    mobileTabs,
    mobileView,
    safeIndex,
    selectedIndex,
    setIsDeleteOpen,
    setMobileView,
    setSelectedIndex,
    setShowErrors,
    showErrors,
  };
}
