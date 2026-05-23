import { Link } from 'react-router-dom';
import { FallbackScreen } from '@shared/ui';

export default function NotFoundPage() {
  return (
    <FallbackScreen
      message="Возможно, ссылка устарела или введена с ошибкой."
      title="Страница не найдена"
      action={
        <p>
          <Link to="/">На главную</Link> · <Link to="/admin">В админку</Link>
        </p>
      }
    />
  );
}
