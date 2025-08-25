import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import CreateAdmin from "./pages/CreateAdmin";
import SimpleLogin from "./pages/SimpleLogin";
import Login from "./pages/login";
import Register from "./pages/Register";
import CompleteProfile from "./pages/CompleteProfile";
import ApiConnection from "./pages/ApiConnection";
import Dashboard from "./pages/Dashboard";
import TestWebhook from "./pages/TestWebhook";

import Deposit from "./pages/Deposit";
import Withdrawal from "./pages/Withdrawal";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Simulation from "./pages/Simulation";

import Admin from "./pages/Admin";
import { AdminDeposits } from "./pages/AdminDeposits";
// import Bonus from "./pages/Bonus"; // Página removida
import Investments from "./pages/Investments";
import TradingInvestments from "./pages/TradingInvestments";
import ActivePlansPage from "./pages/ActivePlansPage";
import Referrals from "./pages/Referrals";
import Partners from "./pages/Partners";
import UserProfilePage from "./pages/UserProfile";
import FacebookProfile from "./pages/FacebookProfile";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";
import BNB20Page from "./pages/BNB20";
import USDTPayments from "./pages/USDTPayments";
import USDTCheckout from "./pages/USDTCheckout";

import Navbar from "./components/Navbar";
import PriceTicker from "./components/PriceTicker";
import Footer from "./components/Footer";
import AdminImpersonationBanner from "./components/AdminImpersonationBanner";
import PortRedirect from "./components/PortRedirect";
import OAuthRedirect from "./components/OAuthRedirect";
import AuthErrorHandler from "./components/AuthErrorHandler";
import CompleteProfileRoute from "./components/CompleteProfileRoute";

const queryClient = new QueryClient();

// Auto-redirect Route Component for root path
const AutoRedirect = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <div className="text-xl">Carregando...</div>
      </div>
    </div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
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

// Layout Component with Navbar and Footer
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background w-full">
    <Navbar />
    <AdminImpersonationBanner />
    <PriceTicker />
    <div className="w-full pb-20 md:pb-0">
      {children}
    </div>
    <Footer />
  </div>
);



const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthErrorHandler />
          <PortRedirect />
          <OAuthRedirect />
          
          <Routes>
          <Route path="/" element={<AutoRedirect />} />
          <Route path="/simple-login" element={<SimpleLogin />} />
          <Route path="/create-admin" element={<CreateAdmin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/painel" element={<Navigate to="/dashboard" replace />} />
          <Route path="/complete-profile" element={<CompleteProfileRoute />} />
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
            path="/bnb20"
            element={
              <ProtectedRoute>
                <Layout>
                  <BNB20Page />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usdt-payments"
            element={
              <ProtectedRoute>
                <Layout>
                  <USDTPayments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usdt-checkout"
            element={
              <ProtectedRoute>
                <Layout>
                  <USDTCheckout />
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
              <Navigate to="/referrals" replace />
            }
          />
          {/* Rota do Bonus removida */}
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
                  <TradingInvestments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investments-old"
            element={
              <ProtectedRoute>
                <Layout>
                  <Investments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/active-plans"
            element={
              <ProtectedRoute>
                <Layout>
                  <ActivePlansPage />
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
            path="/partners"
            element={
              <ProtectedRoute>
                <Layout>
                  <Partners />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <ProtectedRoute>
                <Layout>
                  <FacebookProfile />
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
          <Route
            path="/admin/deposits"
            element={
              <AdminRoute>
                <Layout>
                  <AdminDeposits />
                </Layout>
              </AdminRoute>
            }
          />

          {/* Página de teste de webhook */}
          <Route path="/test-webhook" element={<TestWebhook />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
