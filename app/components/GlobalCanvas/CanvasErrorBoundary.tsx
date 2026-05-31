"use client";

import React, { Component, ReactNode } from 'react';
import { Html } from '@react-three/drei';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class CanvasErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Canvas Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div style={{ color: 'red', background: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '10px', textAlign: 'center', minWidth: '300px' }}>
            <h2>3D Asset Failed to Load</h2>
            <p>{this.state.error?.message}</p>
          </div>
        </Html>
      );
    }

    return this.props.children;
  }
}
