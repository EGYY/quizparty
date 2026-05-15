import { quizPartyLogoUrl } from '@shared/lib/assets';

export function GameScreenHeader() {
  return (
    <header className="game-screen-header">
      <img alt="QuizParty" src={quizPartyLogoUrl} />
    </header>
  );
}
