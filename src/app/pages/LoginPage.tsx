import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loggedUser = await login({ email, password });
      toast.success('Login realizado com sucesso!');
      navigate(loggedUser.role === 'admin' ? '/admin' : '/');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-sm rounded-3xl px-6 py-10 pt-14">
        <CardContent>
          <div className="flex flex-col items-center space-y-8">
            <Logo size={64} showName={false} />

            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold text-foreground">Bem-vindo de volta!</h1>
              <p className="text-muted-foreground text-sm">
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-foreground hover:underline font-medium"
                >
                  Criar conta grátis
                </button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-xl" size="lg" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="text-center text-xs w-11/12 text-muted-foreground">
              Ao entrar, você concorda com nossos{' '}
              <a href="#" className="underline hover:text-foreground">
                Termos de Uso
              </a>{' '}
              e nossa{' '}
              <a href="#" className="underline hover:text-foreground">
                Política de Privacidade
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
