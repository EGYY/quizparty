import { Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PhoneAvatarPicker } from '@entities/player';
import { phonePopcornMascotUrl, quizPartyLogoUrl } from '@shared/lib';
import styles from './join-room-screen.module.scss';

export function JoinRoomScreen({
  avatarId,
  canJoin,
  isPending,
  nickname,
  roomCode,
  onAvatarChange,
  onJoin,
  onNicknameChange,
  setRoomCode,
}: {
  avatarId: string;
  canJoin: boolean;
  isPending: boolean;
  nickname: string;
  roomCode: string;
  onAvatarChange: (avatarId: string) => void;
  onJoin: () => void;
  onNicknameChange: (nickname: string) => void;
  setRoomCode: (roomCode: string) => void;
}) {
  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <img alt="QuizParty" className={styles.logo} src={quizPartyLogoUrl} fetchPriority="high" />
        <Link className={styles.authorLink} to="/admin/login">
          Вход для авторов
        </Link>
        <h1>Подключайся и играй вместе с друзьями!</h1>
        <img alt="" className={styles.mascot} src={phonePopcornMascotUrl} />
      </section>

      <section className={`${styles.baseCard} ${styles.card}`}>
        <label className={styles.field}>
          <span>Код комнаты</span>
          <input
            inputMode="text"
            maxLength={7}
            placeholder="4821"
            value={roomCode.startsWith('QUIZ-') ? roomCode.slice(5) : roomCode}
            onChange={(event) => setRoomCode('QUIZ-' + event.target.value.toUpperCase())}
          />
          <small>Найди код на экране телевизора</small>
        </label>

        <label className={styles.field}>
          <span>Твое имя</span>
          <input
            maxLength={24}
            placeholder="Maxim"
            value={nickname}
            onChange={(event) => onNicknameChange(event.target.value)}
          />
        </label>

        <h2 className={styles.title}>Выбери аватар</h2>
        <PhoneAvatarPicker compact selectedAvatarId={avatarId} onChange={onAvatarChange} />

        <div className={styles.safety}>
          <span>🛡</span>
          <div>
            <strong>Безопасно и весело!</strong>
            <small>Твой ник видят только другие игроки</small>
          </div>
          <span>🔒</span>
        </div>

        <button
          className={styles.primary}
          disabled={!canJoin || isPending}
          type="button"
          onClick={onJoin}
        >
          {isPending ? <Loader2 className={styles.spin} size={18} /> : <Send size={18} />}
          Подключиться
        </button>
      </section>
    </main>
  );
}
