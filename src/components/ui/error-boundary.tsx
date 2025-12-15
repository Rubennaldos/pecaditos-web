/**
 * Componente ErrorBoundary - Captura errores y muestra UI amigable
 * 
 * @example
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Componente personalizado para mostrar en caso de error */
  fallback?: ReactNode;
  /** Callback cuando ocurre un error */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Si debe mostrar detalles técnicos del error (solo desarrollo) */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log del error para debugging
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Si hay un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Componente de fallback por defecto para errores
 */
interface ErrorFallbackProps {
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
  onReset?: () => void;
  onReload?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  errorInfo,
  onReset,
  onReload,
  onGoHome,
  showDetails = import.meta.env.DEV,
  title = '¡Ups! Algo salió mal',
  description = 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.',
}: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">{title}</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{description}</p>
          
          {showDetails && error && (
            <details className="text-left bg-muted rounded-lg p-4 text-xs">
              <summary className="cursor-pointer font-medium text-sm mb-2">
                Detalles técnicos
              </summary>
              <div className="space-y-2 overflow-auto max-h-40">
                <p className="font-mono text-red-600">{error.message}</p>
                {errorInfo?.componentStack && (
                  <pre className="text-muted-foreground whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
          {onReset && (
            <Button variant="outline" onClick={onReset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
          {onReload && (
            <Button variant="outline" onClick={onReload}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recargar página
            </Button>
          )}
          {onGoHome && (
            <Button onClick={onGoHome}>
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * HOC para envolver componentes con ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;




