import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRegister from "./pages/AdminRegister";
import ApiConnection from "./pages/ApiConnection";
import Dashboard from "./pages/Dashboard";
import Bot from "./pages/Bot";
import Deposit from "./pages/Deposit";
import Withdrawal from "./pages/Withdrawal";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Simulation from "./pages/Simulation";
import Market from "./pages/Market";
import Admin from "./pages/Admin";
import Bonus from "./pages/Bonus";
import Investments from "./pages/Investments";
import Referrals from "./pages/Referrals";
import Community from "./pages/Community";
import UserProfilePage from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import PriceTicker from "./components/PriceTicker";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Layout Component with Navbar
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <PriceTicker />
    {children}
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
           <Route path="/register/:referralCode" element={<Register />} />
           <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/api-connection" element={<ApiConnection />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bot"
            element={
              <ProtectedRoute>
                <Layout>
                  <Bot />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposit"
            element={
              <ProtectedRoute>
                <Layout>
                  <Deposit />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdrawal"
            element={
              <ProtectedRoute>
                <Layout>
                  <Withdrawal />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <History />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <Layout>
                  <Market />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bonus"
            element={
              <ProtectedRoute>
                <Layout>
                  <Bonus />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulation"
            element={
              <ProtectedRoute>
                <Layout>
                  <Simulation />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Investments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <ProtectedRoute>
                <Layout>
                  <Referrals />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <Layout>
                  <Community />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/user/:username"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout>
                  <Admin />
                </Layout>
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
