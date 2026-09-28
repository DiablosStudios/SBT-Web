import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      if (window.indexedDB) {
        window.indexedDB.deleteDatabase('sbt_studios_db');
      }
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#12141c] border border-red-500/20 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Se ha evitado una pantalla en blanco
            </h1>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              Ocurrió una excepción al procesar los archivos o actualizar la interfaz.
              La aplicación ha protegido tu sesión para que no se pierdan tus cambios.
            </p>

            {this.state.error && (
              <div className="bg-black/50 border border-neutral-800 rounded-xl p-3 text-left mb-6 text-xs text-red-300 font-mono overflow-x-auto max-h-32">
                {this.state.error.message || 'Error desconocido'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar página
              </button>

              <button
                onClick={this.handleResetStorage}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 font-medium rounded-xl border border-neutral-700 hover:border-red-500/40 transition-colors text-sm"
                title="Si la memoria del navegador se saturó de imágenes pesadas, esto restaura el estado limpio."
              >
                <Trash2 className="w-4 h-4" />
                Restaurar caché inicial
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
