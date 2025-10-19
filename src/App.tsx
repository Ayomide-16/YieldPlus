import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Navigation from "./components/Navigation";
import AppSidebar from "./components/AppSidebar";
import Index from "./pages/Index";
import CropPlanner from "./pages/CropPlanner";
import SoilNutrientAdvisor from "./pages/SoilNutrientAdvisor";
import WaterUsageOptimizer from "./pages/WaterUsageOptimizer";
import MarketPriceEstimator from "./pages/MarketPriceEstimator";
import ComprehensivePlan from "./pages/ComprehensivePlan";
import PestIdentifier from "./pages/PestIdentifier";
import FertilizerPlanner from "./pages/FertilizerPlanner";
import Resources from "./pages/Resources";
import MyPlans from "./pages/MyPlans";
import MyFarms from "./pages/MyFarms";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { FarmDataProvider } from "./contexts/FarmDataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FarmDataProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <Navigation />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/crop-planner" element={<CropPlanner />} />
                    <Route path="/soil-advisor" element={<SoilNutrientAdvisor />} />
                    <Route path="/water-optimizer" element={<WaterUsageOptimizer />} />
                    <Route path="/market-estimator" element={<MarketPriceEstimator />} />
                    <Route path="/comprehensive-plan" element={<ComprehensivePlan />} />
                    <Route path="/pest-identifier" element={<PestIdentifier />} />
                    <Route path="/fertilizer-planner" element={<FertilizerPlanner />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/my-plans" element={<MyPlans />} />
                    <Route path="/my-farms" element={<MyFarms />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </FarmDataProvider>
  </QueryClientProvider>
);

export default App;
