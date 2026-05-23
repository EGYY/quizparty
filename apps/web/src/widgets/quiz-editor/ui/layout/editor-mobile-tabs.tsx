import type { MobileEditorView } from '../../model/types';
import styles from './editor-mobile-tabs.module.scss';

export function EditorMobileTabs({
  activeView,
  tabs,
  onSelect,
}: {
  activeView: MobileEditorView;
  tabs: readonly { id: MobileEditorView; label: string; badge?: number | string }[];
  onSelect: (view: MobileEditorView) => void;
}) {
  return (
    <nav className={styles.mobileTabs} aria-label="Разделы редактора">
      {tabs.map((tab) => (
        <button
          aria-current={activeView === tab.id ? 'page' : undefined}
          className={activeView === tab.id ? styles.mobileTabActive : undefined}
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
          {tab.badge !== undefined ? <span>{tab.badge}</span> : null}
        </button>
      ))}
    </nav>
  );
}
