import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    fontFamily: 'Arial, sans-serif',
                    color: '#333'
                }}>
                    <h1>Something went wrong</h1>
                    <p style={{ color: '#666' }}>{this.state.error?.message}</p>
                    <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                        {this.state.error?.stack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
