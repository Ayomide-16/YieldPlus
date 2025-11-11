import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { PriceComparisonTool } from "@/components/PriceComparisonTool";
import { PriceAlertSystem } from "@/components/PriceAlertSystem";
import { TrendingUp, Bell, BarChart3 } from "lucide-react";

export default function MarketTools() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Market Intelligence Tools</h1>
          <p className="text-muted-foreground">
            Compare prices, set alerts, and analyze market trends
          </p>
        </div>

        <Tabs defaultValue="comparison" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Price Comparison
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Price Alerts
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Market Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison">
            <PriceComparisonTool />
          </TabsContent>

          <TabsContent value="alerts">
            <PriceAlertSystem />
          </TabsContent>

          <TabsContent value="trends">
            <div className="text-center py-12 text-muted-foreground">
              Market Trends Dashboard - Coming Soon
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
