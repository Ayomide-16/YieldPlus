import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sprout, Loader2, AlertTriangle, TrendingUp } from "lucide-react";
import { UnitSelector, convertToHectares } from "@/components/UnitSelector";
import LocationSelector from "@/components/LocationSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useFarmData } from "@/contexts/FarmDataContext";
import ToolSuggestions from "@/components/ToolSuggestions";
import DataSources from "@/components/DataSources";
import { Printer } from "lucide-react";
import ClimateRecommendations from "@/components/ClimateRecommendations";
import { SavePlanButton } from "@/components/SavePlanButton";

const CropPlanner = () => {
  const [location, setLocation] = useState({ country: "", state: "", localGovernment: "" });
  const [soilType, setSoilType] = useState("");
  const [cropType, setCropType] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [farmSizeUnit, setFarmSizeUnit] = useState("hectares");
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { farmData, updateFarmData } = useFarmData();

  const handlePlan = async () => {
    if (!location.country || !location.state || !location.localGovernment || !soilType || !cropType || !farmSize) {
      toast({ title: "Missing Information", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-crop', {
        body: { location, soilType, cropType, farmSize }
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
      updateFarmData({ location, soilType, cropType, farmSize });
      toast({ title: "Analysis Complete", description: "Your crop plan is ready" });
    } catch (error: any) {
      toast({ title: "Analysis Failed", description: error.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Crop Planner</h1>
              <p className="text-muted-foreground">Plan your planting schedule based on climate and soil conditions</p>
            </div>
            {showResults && (
              <Button className="bg-primary hover:bg-primary/90" onClick={() => { setShowResults(false); setAnalysis(null); }}>
                <span className="mr-2">+</span> New Plan
              </Button>
            )}
          </div>

          {!showResults && (
            <Card className="mb-8 shadow-[var(--shadow-elevated)]">
              <CardHeader>
                <CardTitle>Planning Parameters</CardTitle>
                <CardDescription>Enter your farm details for AI-powered recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <LocationSelector location={location} onLocationChange={setLocation} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="soilType">Soil Type *</Label>
                    <Select value={soilType} onValueChange={setSoilType}>
                      <SelectTrigger id="soilType"><SelectValue placeholder="Select soil type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="loamy">Loamy</SelectItem>
                        <SelectItem value="silt">Silt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmSize">Farm Size *</Label>
                      <Input id="farmSize" type="number" placeholder="e.g., 10" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} />
                    </div>
                    <UnitSelector value={farmSizeUnit} onChange={setFarmSizeUnit} label="Unit *" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cropType">Crop Type *</Label>
                  <Input 
                    id="cropType" 
                    placeholder="Enter crop name (e.g., Maize, Rice, Wheat)" 
                    value={cropType} 
                    onChange={(e) => setCropType(e.target.value)} 
                  />
                </div>

                <Button onClick={handlePlan} className="w-full" disabled={isAnalyzing}>
                  {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing with AI...</> : 'Generate Plan'}
                </Button>
              </CardContent>
            </Card>
          )}

              {showResults && analysis && (
                <div className="space-y-6">
                  <Card className="shadow-[var(--shadow-card)]">
                    <CardContent className="pt-6 space-y-2">
                      <Button onClick={() => window.print()} variant="outline" className="w-full">
                        <Printer className="mr-2 h-4 w-4" />Print Crop Planning Report
                      </Button>
                      <SavePlanButton
                        planType="crop"
                        planData={analysis}
                        location={location}
                        defaultName={`${cropType} - ${location.country}`}
                      />
                    </CardContent>
                  </Card>
              {analysis.error && (
                <Card className="border-destructive shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <CardTitle className="text-destructive">Invalid Crop Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{analysis.error}</p>
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Recommended Crops</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.recommendedCrops?.map((crop: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <Sprout className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{crop.name}</h4>
                            <span className="text-sm font-bold text-primary">{crop.suitability}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{crop.season}</p>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">Analyzing...</p>}
                  </CardContent>
                </Card>

                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Planting Schedule</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.recommendedCrops?.map((crop: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{crop.name}</h4>
                          <span className="text-xs text-muted-foreground">{crop.plantingWindow}</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 h-8 bg-primary rounded flex items-center justify-center text-xs text-white">Planting</div>
                          <div className="flex-1 h-8 bg-primary/60 rounded flex items-center justify-center text-xs text-white">Harvesting</div>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground">Generating...</p>}
                  </CardContent>
                </Card>
              </div>

              {analysis.yieldPotential && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Yield Potential Analysis</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">Expected Total Yield</p>
                        <p className="text-2xl font-bold text-primary">{analysis.yieldPotential.expectedYield}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-accent/50 to-accent/30">
                        <p className="text-sm text-muted-foreground mb-1">Average Yield Per Acre</p>
                        <p className="text-2xl font-bold">{analysis.yieldPotential.averageYieldPerAcre}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/30">
                        <p className="text-sm text-muted-foreground mb-1">Confidence Level</p>
                        <p className="text-2xl font-bold text-primary">{analysis.yieldPotential.confidenceLevel}</p>
                      </div>
                    </div>
                    {analysis.recommendedCrops && (
                      <div className="space-y-6">
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={analysis.recommendedCrops}>
                            <defs>
                              <linearGradient id="colorSuitability" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                              labelStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Legend />
                            <Bar dataKey="suitability" fill="url(#colorSuitability)" radius={[8, 8, 0, 0]} name="Suitability Score" />
                            <Bar dataKey="marketDemand" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} name="Market Demand" />
                            <Bar dataKey="profitPotential" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} name="Profit Potential" />
                          </BarChart>
                        </ResponsiveContainer>
                        {analysis.recommendedCrops && analysis.recommendedCrops.length >= 3 && (
                          <ResponsiveContainer width="100%" height={350}>
                            <RadarChart data={analysis.recommendedCrops.slice(0, 3)}>
                              <PolarGrid stroke="hsl(var(--border))" />
                              <PolarAngleAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                              <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                              <Radar name="Suitability" dataKey="suitability" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                              <Radar name="Market Demand" dataKey="marketDemand" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.3} />
                              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                              <Legend />
                            </RadarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {analysis.monthlyData && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Monthly Climate Analysis</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analysis.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="rainfall" stroke="hsl(var(--primary))" strokeWidth={2} name="Rainfall (mm)" />
                        <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="hsl(var(--secondary))" strokeWidth={2} name="Temperature (°C)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {analysis.recommendations && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Array.isArray(analysis.recommendations) ? (
                      analysis.recommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-lg bg-accent/30 border border-accent">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{rec.category}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${rec.priority === 'High' ? 'bg-destructive/20 text-destructive' : rec.priority === 'Medium' ? 'bg-secondary/30 text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              {rec.priority} Priority
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{rec.action}</p>
                          <div className="flex justify-between text-xs mt-2">
                            <span className="text-muted-foreground">Timeframe: {rec.timeframe}</span>
                            <span className="text-muted-foreground">Cost: {rec.costEstimate}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{typeof analysis.recommendations === 'string' ? analysis.recommendations : JSON.stringify(analysis.recommendations)}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {analysis.pestRiskAnalysis && (
                <Card className="shadow-[var(--shadow-card)] border-destructive/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Pest Risk Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Array.isArray(analysis.pestRiskAnalysis) ? (
                      analysis.pestRiskAnalysis.map((pest: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{pest.pest}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${pest.risk === 'High' ? 'bg-destructive text-destructive-foreground' : pest.risk === 'Medium' ? 'bg-secondary' : 'bg-muted'}`}>
                              {pest.risk} Risk
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{pest.preventiveMeasures}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{typeof analysis.pestRiskAnalysis === 'string' ? analysis.pestRiskAnalysis : JSON.stringify(analysis.pestRiskAnalysis)}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {analysis.climateAnalysis && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Climate Analysis</CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{analysis.climateAnalysis}</p></CardContent>
                </Card>
              )}

              {analysis.climateRecommendations && (
                <ClimateRecommendations recommendations={analysis.climateRecommendations} />
              )}

              {analysis.dataSources && (
                <DataSources sources={analysis.dataSources} />
              )}

              <ToolSuggestions currentTool="crop" farmData={farmData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropPlanner;
