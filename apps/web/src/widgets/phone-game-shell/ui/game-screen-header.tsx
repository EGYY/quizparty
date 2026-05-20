import { memo } from 'react';
import { quizPartyLogoUrl } from '@shared/lib/assets';
import styles from './phone-game-shell.module.scss';

export const GameScreenHeader = memo(function GameScreenHeader() {
  return (
    <header className={styles['game-screen-header']}>
      <img alt="QuizParty" src={quizPartyLogoUrl} />
    </header>
  );
});
