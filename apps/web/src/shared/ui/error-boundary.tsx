import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FallbackScreen } from './fallback-screen/fallback-screen';

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Admin UI crashed', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <FallbackScreen
          message="Обновите страницу. Ошибка уже выведена в консоль."
          title="Интерфейс упал"
        />
      );
    }

    return this.props.children;
  }
}
