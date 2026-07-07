import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Rendered instead of the children when a descendant throws. */
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Isolates a single rich block: if its renderer throws at runtime, the fallback
 * shows and the rest of the message still renders. One bad block never breaks
 * the whole reply.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Rich block renderer error:', error, info);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
