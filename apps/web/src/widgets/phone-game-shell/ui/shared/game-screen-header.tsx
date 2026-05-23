import { memo } from 'react';
import { quizPartyLogoUrl } from '@shared/lib';
import styles from './game-screen-header.module.scss';

export const GameScreenHeader = memo(function GameScreenHeader({
  className = '',
}: {
  className?: string | undefined;
}) {
  const headerClassName = `${styles['game-screen-header']} ${className}`.trim();

  return (
    <header className={headerClassName}>
      <img alt="QuizParty" src={quizPartyLogoUrl} />
    </header>
  );
});
