import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navigation from "./components/Navigation";
import AppSidebar from "./components/AppSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import CropPlanner from "./pages/CropPlanner";
import SoilNutrientAdvisor from "./pages/SoilNutrientAdvisor";
import WaterUsageOptimizer from "./pages/WaterUsageOptimizer";
import MarketPriceEstimator from "./pages/MarketPriceEstimator";
import MarketDataUpload from "./pages/MarketDataUpload";
import ComprehensivePlan from "./pages/ComprehensivePlan";
import PestIdentifier from "./pages/PestIdentifier";
import FertilizerPlanner from "./pages/FertilizerPlanner";
import Resources from "./pages/Resources";
import MyPlans from "./pages/MyPlans";
import MyFarms from "./pages/MyFarms";
import MarketTools from "./pages/MarketTools";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { FarmDataProvider } from "./contexts/FarmDataContext";
import FarmCreationWizard from "./components/FarmCreationWizard";
import ActiveFarmDashboard from "./components/ActiveFarmDashboard";

const queryClient = new QueryClient();

// Layout component that conditionally shows sidebar
const AppLayout = () => {
  const location = useLocation();
  const isPublicPage = location.pathname === "/" || location.pathname === "/auth";

  // For landing and auth pages, render without sidebar
  if (isPublicPage) {
    return (
      <main className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    );
  }

  // For all other pages, render with sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              {/* Protected Routes - Require Authentication */}
              <Route path="/crop-planner" element={<ProtectedRoute><CropPlanner /></ProtectedRoute>} />
              <Route path="/soil-advisor" element={<ProtectedRoute><SoilNutrientAdvisor /></ProtectedRoute>} />
              <Route path="/water-optimizer" element={<ProtectedRoute><WaterUsageOptimizer /></ProtectedRoute>} />
              <Route path="/market-estimator" element={<ProtectedRoute><MarketPriceEstimator /></ProtectedRoute>} />
              <Route path="/market-data-upload" element={<ProtectedRoute><MarketDataUpload /></ProtectedRoute>} />
              <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/comprehensive-plan" element={<ProtectedRoute><ComprehensivePlan /></ProtectedRoute>} />
              <Route path="/pest-identifier" element={<ProtectedRoute><PestIdentifier /></ProtectedRoute>} />
              <Route path="/fertilizer-planner" element={<ProtectedRoute><FertilizerPlanner /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
              <Route path="/my-plans" element={<ProtectedRoute><MyPlans /></ProtectedRoute>} />
              <Route path="/my-farms" element={<ProtectedRoute><MyFarms /></ProtectedRoute>} />
              <Route path="/market-tools" element={<ProtectedRoute><MarketTools /></ProtectedRoute>} />
              <Route path="/create-farm" element={<ProtectedRoute><FarmCreationWizard /></ProtectedRoute>} />
              <Route path="/farm/:farmId" element={<ProtectedRoute><ActiveFarmDashboard /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FarmDataProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </FarmDataProvider>
  </QueryClientProvider>
);

export default App;

