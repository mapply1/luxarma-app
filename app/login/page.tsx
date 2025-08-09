"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { signIn, getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'client') {
          router.push('/app');
        }
      }
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { user } = await signIn(email, password);
      
      if (!user?.user_metadata?.role) {
        setError("Compte non configuré. Contactez l'administrateur.");
        return;
      }

      const userRole = user.user_metadata.role;

      toast.success("Connexion réussie !");
      
      // Redirect based on role
      if (userRole === 'admin') {
        router.push(redirectTo || '/admin');
      } else if (userRole === 'client') {
        router.push('/app');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Side - Hero Image */}
        <div className="relative p-8 lg:p-12 bg-black rounded-3xl lg:rounded-r-none hidden lg:block">
          <div className="absolute inset-0 rounded-3xl lg:rounded-r-none overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1754275052072-da580427b7ff?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Luxarma Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          
          <div className="relative z-10 flex flex-col justify-center h-full text-white">
            <div className="max-w-md">
              <div className="mb-8">
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Pour des sites qui<br />
                vous représentent<br />
              </h1>
              
              <p className="text-lg text-white/90 leading-relaxed">
                Je suis Armand et depuis deux ans j'ai aidé plus de 30 entreprises à booster leur marque, renforcer leur crédibilité en améliorant leur présence en ligne.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto space-y-8">
            {/* Welcome */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Bon Retour</h2>
              <p className="text-slate-600">
                Entrez votre email et mot de passe pour accéder à votre compte
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <Label htmlFor="remember" className="text-sm text-slate-600">
                  Se souvenir de moi
                </Label>
              </div>

              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se Connecter"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  );
}