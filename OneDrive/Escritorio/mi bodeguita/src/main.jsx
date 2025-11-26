import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Component } from 'react';
import App from './App';
import './index.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#fee', minHeight: '100vh' }}>
          <h1>Algo salió mal</h1>
          <p>Error: {this.state.error?.message || 'Error desconocido'}</p>
          <pre style={{ backgroundColor: '#fff', padding: '10px', overflow: 'auto' }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

console.log('App starting...');
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
