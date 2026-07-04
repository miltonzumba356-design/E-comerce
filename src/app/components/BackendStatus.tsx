import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { Button } from './ui/button';

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      // Tentar fazer uma requisição simples para o backend
      const response = await fetch(`${apiBaseUrl}/products/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok || response.status === 401) { // 401 significa que o backend está rodando mas precisa auth
        setStatus('online');
        setTimeout(() => setShowAlert(false), 3000); // Esconder após 3 segundos
      } else {
        setStatus('offline');
      }
    } catch (error) {
      setStatus('offline');
    }
  };

  if (!showAlert) return null;

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="w-80">
          <Settings className="h-4 w-4 animate-spin" />
          <AlertTitle>Verificando backend...</AlertTitle>
          <AlertDescription>
            Conectando ao servidor...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status === 'online') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="w-80 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Backend Online</AlertTitle>
          <AlertDescription className="text-green-700">
            Conectado ao servidor com sucesso!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert className="border-yellow-500 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900">Backend Offline</AlertTitle>
        <AlertDescription className="text-yellow-700 space-y-2">
          <p className="text-sm">
            Não foi possível conectar à API. Verifique sua conexão ou a configuração de VITE_API_BASE_URL.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                window.open('/BACKEND_SETUP.md', '_blank');
              }}
              className="text-xs"
            >
              Ver Instruções
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                checkBackendStatus();
              }}
              className="text-xs"
            >
              Tentar Novamente
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAlert(false)}
              className="text-xs"
            >
              Fechar
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
