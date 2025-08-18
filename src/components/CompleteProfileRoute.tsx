import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import CompleteProfile from "@/pages/CompleteProfile";

const CompleteProfileRoute = () => {
  const { user, profile, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se o perfil já está completo, redirecionar para dashboard
  if (profile && profile.profile_completed && profile.display_name) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <CompleteProfile />;
};

export default CompleteProfileRoute;
