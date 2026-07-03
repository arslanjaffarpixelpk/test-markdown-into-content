import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  /** Rendered when the child throws. Receives the error. */
  fallback: (error: Error) => ReactNode;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Isolates a rich block: if one renderer throws (bad data, library error),
 * the rest of the chat message keeps rendering instead of the whole app crashing.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept for visibility during the prototype; swap for real logging later.
    console.error('[RichBlock] renderer crashed:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}
