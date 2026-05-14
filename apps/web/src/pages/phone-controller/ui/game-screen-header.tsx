import { Menu } from 'lucide-react';
import { quizPartyLogoUrl } from '@shared/lib/assets';

export function GameScreenHeader() {
  return (
    <header className="game-screen-header">
      <img alt="QuizParty" src={quizPartyLogoUrl} />
      <button type="button" aria-label="Меню">
        <Menu size={27} />
      </button>
    </header>
  );
}
