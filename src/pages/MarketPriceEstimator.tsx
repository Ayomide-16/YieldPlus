import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Loader2 } from "lucide-react";
import LocationSelector from "@/components/LocationSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { useFarmData } from "@/contexts/FarmDataContext";
import ToolSuggestions from "@/components/ToolSuggestions";
import DataSources from "@/components/DataSources";
import ClimateRecommendations from "@/components/ClimateRecommendations";

const MarketPriceEstimator = () => {
  const [cropType, setCropType] = useState("");
  const [expectedYield, setExpectedYield] = useState("");
  const [location, setLocation] = useState({ country: "", state: "", localGovernment: "" });
  const [harvestDate, setHarvestDate] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { farmData, updateFarmData } = useFarmData();

  const handleEstimate = async () => {
    if (!cropType || !expectedYield || !location.country || !location.state || !harvestDate) {
      toast({ title: "Missing Information", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);

    try {
      const { data, error } = await supabase.functions.invoke('estimate-market-price', {
        body: { cropType, expectedYield, location, harvestDate }
      });

      if (error) throw error;

      let parsedAnalysis;
      try {
        const cleanedAnalysis = data.analysis.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsedAnalysis = JSON.parse(cleanedAnalysis);
      } catch {
        parsedAnalysis = { summary: data.analysis };
      }

      setAnalysis(parsedAnalysis);
      setShowResults(true);
      updateFarmData({ cropType, expectedYield, harvestDate });
      toast({ title: "Analysis Complete", description: "Your market price estimate is ready" });
    } catch (error: any) {
      toast({ title: "Analysis Failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Market Price Estimator</h1>
            <p className="text-muted-foreground">AI-powered market analysis and pricing strategy</p>
          </div>

          <Card className="mb-8 shadow-[var(--shadow-elevated)]">
            <CardHeader>
              <CardTitle>Crop Details</CardTitle>
              <CardDescription>Enter information about your produce for AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LocationSelector location={location} onLocationChange={setLocation} />

              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type *</Label>
                <Input id="cropType" placeholder="e.g., Maize, Rice, Tomatoes" value={cropType} onChange={(e) => setCropType(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedYield">Expected Yield (kg) *</Label>
                <Input id="expectedYield" type="number" placeholder="e.g., 5000" value={expectedYield} onChange={(e) => setExpectedYield(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate">Expected Harvest Date *</Label>
                <Input id="harvestDate" type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} />
              </div>

              <Button onClick={handleEstimate} className="w-full" disabled={isAnalyzing}>
                {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing with AI...</> : 'Get AI Price Estimate'}
              </Button>
            </CardContent>
          </Card>

          {showResults && analysis && (
            <div className="space-y-6">
              {analysis.error && (
                <Card className="shadow-[var(--shadow-card)] border-destructive/50 bg-destructive/5">
                  <CardHeader><CardTitle className="text-destructive">Invalid Crop</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{analysis.error}</p>
                  </CardContent>
                </Card>
              )}

              {analysis.summary && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Market Summary</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                  </CardContent>
                </Card>
              )}

              {analysis.priceEstimate && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Price Estimate</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {typeof analysis.priceEstimate === 'object' ? (
                        Object.entries(analysis.priceEstimate).map(([key, value]: [string, any]) => (
                          <div key={key} className="p-4 rounded-lg bg-accent/50">
                            <p className="text-sm text-muted-foreground mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-2xl font-bold text-primary">{value}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground col-span-3">{analysis.priceEstimate}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.marketTrends && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Market Trends</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Array.isArray(analysis.marketTrends) ? (
                      analysis.marketTrends.map((trend: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <TrendingUp className="h-5 w-5 text-primary mt-1" />
                          <div className="flex-1">
                            {typeof trend === 'object' ? (
                              <>
                                <h4 className="font-semibold mb-1">{trend.factor || trend.trend}</h4>
                                <p className="text-sm text-muted-foreground">{trend.description || trend.impact}</p>
                              </>
                            ) : (
                              <p className="text-muted-foreground">{trend}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{typeof analysis.marketTrends === 'string' ? analysis.marketTrends : JSON.stringify(analysis.marketTrends)}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {analysis.sellingStrategy && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Selling Strategy</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{typeof analysis.sellingStrategy === 'string' ? analysis.sellingStrategy : JSON.stringify(analysis.sellingStrategy, null, 2)}</p>
                  </CardContent>
                </Card>
              )}

              {analysis.historicalPrices && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Historical Price Trends</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analysis.historicalPrices}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Legend />
                        <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrice)" name="Price" />
                        <Line type="monotone" dataKey="demand" stroke="hsl(var(--secondary))" strokeWidth={2} name="Demand Index" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {analysis.riskFactors && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Risk Factors</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {Array.isArray(analysis.riskFactors) ? (
                      analysis.riskFactors.map((risk: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          {typeof risk === 'object' ? (
                            <>
                              <h4 className="font-semibold text-sm">{risk.risk || risk.factor}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{risk.mitigation || risk.description}</p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">{risk}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{typeof analysis.riskFactors === 'string' ? analysis.riskFactors : JSON.stringify(analysis.riskFactors)}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {analysis.seasonalClimateImpact && (
                <Card className="shadow-[var(--shadow-card)] border-primary/20">
                  <CardHeader>
                    <CardTitle>Seasonal Climate Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-1">Harvest Season Weather</p>
                      <p className="text-sm text-muted-foreground">{analysis.seasonalClimateImpact.harvestSeasonWeather}</p>
                    </div>
                    {analysis.seasonalClimateImpact.storageConditions && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Storage Conditions</p>
                        <p className="text-sm text-muted-foreground">{analysis.seasonalClimateImpact.storageConditions}</p>
                      </div>
                    )}
                    {analysis.seasonalClimateImpact.transportRecommendations && (
                      <div>
                        <p className="text-sm font-semibold mb-1">Transport Recommendations</p>
                        <p className="text-sm text-muted-foreground">{analysis.seasonalClimateImpact.transportRecommendations}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {analysis.dataSources && (
                <DataSources sources={analysis.dataSources} />
              )}

              <ToolSuggestions currentTool="market" farmData={farmData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPriceEstimator;
