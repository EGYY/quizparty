import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="login-screen">
      <section className="login-panel">
        <p className="eyebrow">QuizParty</p>
        <h1>Страница не найдена</h1>
        <p className="muted-text">Возможно, ссылка устарела или введена с ошибкой.</p>
        <p>
          <Link to="/">На главную</Link> · <Link to="/admin">В админку</Link>
        </p>
      </section>
    </main>
  );
}
