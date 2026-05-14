import { Component, type ErrorInfo, type ReactNode } from 'react';

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
        <main className="login-screen">
          <section className="login-panel">
            <p className="eyebrow">QuizParty</p>
            <h1>Интерфейс упал</h1>
            <p className="muted-text">Обновите страницу. Ошибка уже выведена в консоль.</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
