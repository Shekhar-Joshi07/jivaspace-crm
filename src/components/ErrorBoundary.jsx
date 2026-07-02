import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Frontend render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-canvas p-5 text-center">
          <div className="max-w-md">
            <p className="text-xs font-black uppercase tracking-[.2em] text-red-600">Something went wrong</p>
            <h1 className="mt-2 font-display text-3xl font-black">The page could not be rendered.</h1>
            <p className="mt-3 text-sm leading-6 text-ink-600">Refresh the page to try again. Your saved CRM data has not been changed.</p>
            <button className="btn-primary mt-6" onClick={() => window.location.reload()} type="button">Refresh page</button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
