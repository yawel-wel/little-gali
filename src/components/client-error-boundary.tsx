"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ClientErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Client render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="mx-auto max-w-md px-6 py-16 text-center font-body text-dark-gray"
            role="alert"
          >
            <p className="mb-4 text-lg font-body-bold">
              משהו השתבש בטעינת העמוד.
            </p>
            <button
              type="button"
              className="rounded-full bg-accent-burgundy px-6 py-2 text-white"
              onClick={() => window.location.reload()}
            >
              רענון העמוד
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
