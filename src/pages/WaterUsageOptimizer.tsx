import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplet, Loader2 } from "lucide-react";
import LocationSelector from "@/components/LocationSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useFarmData } from "@/contexts/FarmDataContext";
import ToolSuggestions from "@/components/ToolSuggestions";
import DataSources from "@/components/DataSources";
import ClimateRecommendations from "@/components/ClimateRecommendations";
import RainPrediction from "@/components/RainPrediction";
import { UnitSelector, convertToHectares } from "@/components/UnitSelector";
import { Printer } from "lucide-react";

const WaterUsageOptimizer = () => {
  const [waterSource, setWaterSource] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [farmSizeUnit, setFarmSizeUnit] = useState("hectares");
  const [location, setLocation] = useState({ country: "", state: "", localGovernment: "" });
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [irrigationMethod, setIrrigationMethod] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { farmData, updateFarmData } = useFarmData();

  const handleOptimize = async () => {
    if (!waterSource || !farmSize || cropTypes.length === 0 || !irrigationMethod || !location.country) {
      toast({ title: "Missing Information", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);

    try {
      const farmSizeInHectares = convertToHectares(parseFloat(farmSize), farmSizeUnit);
      
      const { data, error } = await supabase.functions.invoke('analyze-water', {
        body: { 
          waterSource, 
          farmSize: farmSizeInHectares, 
          cropTypes, 
          irrigationMethod,
          location 
        }
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
      updateFarmData({ waterSource, irrigationMethod });
      toast({ title: "Analysis Complete", description: "Your water optimization plan is ready" });
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
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Water Usage Optimizer</h1>
            <p className="text-muted-foreground">AI-powered water management and irrigation planning</p>
          </div>

          <Card className="mb-8 shadow-[var(--shadow-elevated)]">
            <CardHeader>
              <CardTitle>Water Resource Details</CardTitle>
              <CardDescription>Tell us about your water supply and farm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LocationSelector location={location} onLocationChange={setLocation} />
              
              <div className="space-y-2">
                <Label htmlFor="waterSource">Water Source *</Label>
                <Select value={waterSource} onValueChange={setWaterSource}>
                  <SelectTrigger id="waterSource"><SelectValue placeholder="Select water source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="well">Well Water</SelectItem>
                    <SelectItem value="river">River / Stream</SelectItem>
                    <SelectItem value="rainwater">Rainwater Harvesting</SelectItem>
                    <SelectItem value="municipal">Municipal Supply</SelectItem>
                    <SelectItem value="borehole">Borehole</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="cropType">Primary Crop Types * (comma separated)</Label>
                <Input id="cropType" placeholder="e.g., maize, rice, vegetables" onChange={(e) => setCropTypes(e.target.value.split(',').map(c => c.trim()))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="irrigationMethod">Current Irrigation Method *</Label>
                <Select value={irrigationMethod} onValueChange={setIrrigationMethod}>
                  <SelectTrigger id="irrigationMethod"><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flood">Flood Irrigation</SelectItem>
                    <SelectItem value="drip">Drip Irrigation</SelectItem>
                    <SelectItem value="sprinkler">Sprinkler System</SelectItem>
                    <SelectItem value="manual">Manual Watering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleOptimize} className="w-full" disabled={isAnalyzing}>
                {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing with AI...</> : 'Get AI Irrigation Plan'}
              </Button>
            </CardContent>
          </Card>

          {showResults && analysis && (
            <div className="space-y-6">
              <Card className="shadow-[var(--shadow-card)]">
                <CardContent className="pt-6">
                  <Button onClick={() => window.print()} variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />Print Water Optimization Plan
                  </Button>
                </CardContent>
              </Card>
              {analysis.summary && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                  </CardContent>
                </Card>
              )}

              {analysis.currentUsage && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Current Water Usage</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {typeof analysis.currentUsage === 'object' ? (
                        Object.entries(analysis.currentUsage).map(([key, value]: [string, any]) => (
                          <div key={key} className="p-4 rounded-lg bg-accent/50">
                            <p className="text-sm text-muted-foreground mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-lg font-semibold">{value}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground col-span-3">{analysis.currentUsage}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysis.optimizationStrategies && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Optimization Strategies</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Array.isArray(analysis.optimizationStrategies) ? (
                      analysis.optimizationStrategies.map((strategy: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                          {typeof strategy === 'object' ? (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{strategy.name || strategy.strategy}</h4>
                                {strategy.savings && <span className="text-sm font-bold text-primary">{strategy.savings}</span>}
                              </div>
                              <p className="text-sm text-muted-foreground">{strategy.description || strategy.details}</p>
                              {strategy.implementation && <p className="text-sm mt-2"><span className="font-medium">Implementation:</span> {strategy.implementation}</p>}
                            </>
                          ) : (
                            <p className="text-muted-foreground">{strategy}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{typeof analysis.optimizationStrategies === 'string' ? analysis.optimizationStrategies : JSON.stringify(analysis.optimizationStrategies)}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {analysis.irrigationSchedule && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Irrigation Schedule</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Array.isArray(analysis.irrigationSchedule) ? (
                      analysis.irrigationSchedule.map((schedule: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{schedule.crop || schedule.period}</h4>
                            <span className="text-xs text-muted-foreground">{schedule.frequency || schedule.timing}</span>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 h-8 bg-primary rounded flex items-center justify-center text-xs text-white">
                              {schedule.morning || 'Morning'}
                            </div>
                            <div className="flex-1 h-8 bg-primary/60 rounded flex items-center justify-center text-xs text-white">
                              {schedule.evening || 'Evening'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{typeof analysis.irrigationSchedule === 'string' ? analysis.irrigationSchedule : JSON.stringify(analysis.irrigationSchedule)}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {analysis.monthlyProjection && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Water Savings Projection</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analysis.monthlyProjection}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Legend />
                        <Line type="monotone" dataKey="currentUsage" stroke="hsl(var(--destructive))" strokeWidth={2} name="Current Usage" />
                        <Line type="monotone" dataKey="optimizedUsage" stroke="hsl(var(--primary))" strokeWidth={2} name="Optimized Usage" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {analysis.rainPredictions && (
                <RainPrediction rainPredictions={analysis.rainPredictions} />
              )}

              {analysis.climateBasedSchedule && (
                <ClimateRecommendations 
                  recommendations={analysis.climateBasedSchedule} 
                  title="Climate-Based Irrigation Schedule"
                />
              )}

              {analysis.recommendations && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Additional Recommendations</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{typeof analysis.recommendations === 'string' ? analysis.recommendations : JSON.stringify(analysis.recommendations, null, 2)}</p>
                  </CardContent>
                </Card>
              )}

              {analysis.dataSources && (
                <DataSources sources={analysis.dataSources} />
              )}

              <ToolSuggestions currentTool="water" farmData={farmData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterUsageOptimizer;
