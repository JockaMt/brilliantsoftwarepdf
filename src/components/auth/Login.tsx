import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock, LogIn, AlertCircle, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAutoLogin } from '@/hooks/useAutoLogin';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(true);

  // Tentar auto-login ao montar o componente
  useAutoLogin({
    onAutoLoginSuccess: () => {
      setIsAutoLoggingIn(false);
      navigate('/home');
    },
    onAutoLoginFail: () => {
      setIsAutoLoggingIn(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Por favor, preencha todos os campos');
      return;
    }

    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setLocalError(error || 'Falha no login. Verifique suas credenciais.');
    }
  };

  if (isAutoLoggingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Brilliant Software
          </h1>
          <p className="text-muted-foreground">
            Faça login para continuar
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-2 rounded-md bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 rounded-md bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Message */}
            {(localError || error) && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">
                  {localError || error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="h-5 w-5" />
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Ainda não tem conta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary hover:underline font-medium"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-card/50 border border-border rounded-lg p-4 text-xs text-muted-foreground">
          <p>
            <strong>Demo:</strong> Use suas credenciais para fazer login no sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
