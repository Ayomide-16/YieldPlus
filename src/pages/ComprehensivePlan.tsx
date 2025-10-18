import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import LocationSelector from "@/components/LocationSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Tractor, Save, Plus, Calendar, TrendingUp, Sprout, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import DataSources from "@/components/DataSources";
import ClimateRecommendations from "@/components/ClimateRecommendations";

const ComprehensivePlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState("");
  const [showNewFarm, setShowNewFarm] = useState(false);
  
  // New farm form
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState({ country: "", state: "", localGovernment: "" });
  const [farmSize, setFarmSize] = useState("");
  const [soilType, setSoilType] = useState("");
  const [waterSource, setWaterSource] = useState("");
  const [irrigationMethod, setIrrigationMethod] = useState("");
  const [cropTypes, setCropTypes] = useState("");
  
  // Plan configuration
  const [plantingMonth, setPlantingMonth] = useState("");
  const [preferredPlantingDate, setPreferredPlantingDate] = useState("");
  const [includeSections, setIncludeSections] = useState({
    crop: true,
    soil: true,
    water: true,
    market: true,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [climateData, setClimateData] = useState<any>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  useEffect(() => {
    if (user) {
      loadFarms();
    }
  }, [user]);

  const loadFarms = async () => {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setFarms(data);
    }
  };

  const handleCreateFarm = async () => {
    if (!farmName || !location.country || !farmSize) {
      toast({ title: "Missing Information", description: "Please fill in required farm details", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from('farms')
      .insert({
        farm_name: farmName,
        location: location,
        total_size: parseFloat(farmSize),
        soil_type: soilType,
        water_source: waterSource,
        irrigation_method: irrigationMethod,
        crops: cropTypes.split(',').map(c => c.trim()),
        user_id: user?.id
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create farm", variant: "destructive" });
      return;
    }

    setFarms([data, ...farms]);
    setSelectedFarm(data.id);
    setShowNewFarm(false);
    toast({ title: "Success", description: "Farm created successfully" });
  };

  const handleGeneratePlan = async () => {
    if (!selectedFarm) {
      toast({ title: "No Farm Selected", description: "Please select or create a farm first", variant: "destructive" });
      return;
    }

    if (!plantingMonth || !preferredPlantingDate) {
      toast({ title: "Missing Information", description: "Please select planting month and date", variant: "destructive" });
      return;
    }

    const farm = farms.find(f => f.id === selectedFarm);
    if (!farm) return;

    setIsGenerating(true);

    try {
      // Step 1: Get climate data
      console.log('Fetching climate data...');
      const { data: climateResponse, error: climateError } = await supabase.functions.invoke('get-climate-data', {
        body: {
          latitude: 6.5244, // Default for Nigeria, should be derived from location
          longitude: 3.3792,
          startDate: preferredPlantingDate,
          endDate: new Date(new Date(preferredPlantingDate).getTime() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      });

      if (climateError) throw climateError;

      let parsedClimate;
      try {
        if (typeof climateResponse.climateData === 'string') {
          const cleaned = climateResponse.climateData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          parsedClimate = JSON.parse(cleaned);
        } else {
          parsedClimate = climateResponse.climateData;
        }
      } catch (e) {
        console.error('Error parsing climate data:', e);
        parsedClimate = { currentConditions: {}, forecast: {} };
      }
      setClimateData(parsedClimate);

      // Step 2: Generate comprehensive plan
      console.log('Generating comprehensive plan...');
      const { data: planResponse, error: planError } = await supabase.functions.invoke('generate-comprehensive-plan', {
        body: {
          farmData: farm,
          preferredPlantingDate,
          climateData: parsedClimate,
          includeSections
        }
      });

      if (planError) throw planError;

      let parsedPlan;
      try {
        if (typeof planResponse.plan === 'string') {
          const cleaned = planResponse.plan.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          parsedPlan = JSON.parse(cleaned);
        } else {
          parsedPlan = planResponse.plan;
        }
      } catch (e) {
        console.error('Error parsing plan:', e);
        // If JSON parsing fails, create a basic structure with the raw response
        parsedPlan = { 
          executiveSummary: { 
            overview: typeof planResponse.plan === 'string' ? planResponse.plan : 'Plan generated successfully. Details below.' 
          } 
        };
      }

      // Step 3: Save to database
      const { error: saveError } = await supabase
        .from('comprehensive_plans')
        .insert({
          farm_id: selectedFarm,
          user_id: user?.id,
          plan_name: `${farm.farm_name} - ${plantingMonth} ${new Date().getFullYear()}`,
          preferred_planting_date: preferredPlantingDate,
          included_sections: includeSections,
          climate_data: parsedClimate,
          comprehensive_summary: parsedPlan
        });

      if (saveError) throw saveError;

      setPlan(parsedPlan);
      toast({ title: "Success", description: "Comprehensive plan generated successfully!" });
    } catch (error: any) {
      console.error('Error generating plan:', error);
      let errorMessage = "Failed to generate plan";
      if (error.message) {
        errorMessage = error.message;
      }
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the comprehensive farm planner</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              {t('farmPlanner.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('farmPlanner.subtitle')}
            </p>
          </div>

          {!showNewFarm && (
            <Card className="mb-8 shadow-[var(--shadow-elevated)]">
              <CardHeader>
                <CardTitle>{t('farmPlanner.selectFarm')}</CardTitle>
                <CardDescription>{t('farmPlanner.selectFarmDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Farm</Label>
                  <Select value={selectedFarm} onValueChange={setSelectedFarm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a farm" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map(farm => (
                        <SelectItem key={farm.id} value={farm.id}>
                          {farm.farm_name} - {farm.total_size} hectares
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => setShowNewFarm(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> {t('farmPlanner.createNewFarm')}
                </Button>
              </CardContent>
            </Card>
          )}

          {showNewFarm && (
            <Card className="mb-8 shadow-[var(--shadow-elevated)]">
              <CardHeader>
                <CardTitle>{t('farmPlanner.createNewFarm')}</CardTitle>
                <CardDescription>Enter your farm details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('farmPlanner.farmName')} *</Label>
                  <Input value={farmName} onChange={(e) => setFarmName(e.target.value)} placeholder="My Farm" />
                </div>

                <LocationSelector location={location} onLocationChange={setLocation} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t('farmPlanner.farmSize')} *</Label>
                    <Input type="number" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} placeholder="10" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('farmPlanner.soilType')}</Label>
                    <Select value={soilType} onValueChange={setSoilType}>
                      <SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="loamy">Loamy</SelectItem>
                        <SelectItem value="silt">Silt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t('farmPlanner.waterSource')}</Label>
                    <Select value={waterSource} onValueChange={setWaterSource}>
                      <SelectTrigger><SelectValue placeholder="Select water source" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="well">Well</SelectItem>
                        <SelectItem value="river">River</SelectItem>
                        <SelectItem value="rainwater">Rainwater</SelectItem>
                        <SelectItem value="municipal">Municipal Supply</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('farmPlanner.irrigationMethod')}</Label>
                    <Select value={irrigationMethod} onValueChange={setIrrigationMethod}>
                      <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drip">Drip</SelectItem>
                        <SelectItem value="sprinkler">Sprinkler</SelectItem>
                        <SelectItem value="flood">Flood</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('farmPlanner.cropTypes')}</Label>
                  <Input value={cropTypes} onChange={(e) => setCropTypes(e.target.value)} placeholder="Maize, Rice, Cassava" />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateFarm}>
                    <Save className="mr-2 h-4 w-4" /> Create Farm
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewFarm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedFarm && !showNewFarm && (
            <Card className="mb-8 shadow-[var(--shadow-elevated)]">
              <CardHeader>
                <CardTitle>{t('farmPlanner.configuration')}</CardTitle>
                <CardDescription>Customize your comprehensive farm plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('farmPlanner.plantingMonth')} *
                    </Label>
                    <Select value={plantingMonth} onValueChange={setPlantingMonth}>
                      <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Planting Date *</Label>
                    <Input 
                      type="date" 
                      value={preferredPlantingDate} 
                      onChange={(e) => setPreferredPlantingDate(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>{t('farmPlanner.includeSections')}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="crop"
                        checked={includeSections.crop}
                        onCheckedChange={(checked) => setIncludeSections({...includeSections, crop: !!checked})}
                      />
                      <Label htmlFor="crop" className="cursor-pointer">{t('farmPlanner.cropPlanning')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="soil"
                        checked={includeSections.soil}
                        onCheckedChange={(checked) => setIncludeSections({...includeSections, soil: !!checked})}
                      />
                      <Label htmlFor="soil" className="cursor-pointer">{t('farmPlanner.soilAnalysis')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="water"
                        checked={includeSections.water}
                        onCheckedChange={(checked) => setIncludeSections({...includeSections, water: !!checked})}
                      />
                      <Label htmlFor="water" className="cursor-pointer">{t('farmPlanner.waterManagement')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="market"
                        checked={includeSections.market}
                        onCheckedChange={(checked) => setIncludeSections({...includeSections, market: !!checked})}
                      />
                      <Label htmlFor="market" className="cursor-pointer">{t('farmPlanner.marketPrices')}</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleGeneratePlan} className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('farmPlanner.generating')}</>
                  ) : (
                    <><Tractor className="mr-2 h-4 w-4" />{t('farmPlanner.generatePlan')}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {plan && climateData && (
            <div className="space-y-6">
              <Card className="shadow-[var(--shadow-card)] border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">{t('farmPlanner.yourPlan')}</CardTitle>
                  <CardDescription>AI-generated comprehensive farm plan with climate insights</CardDescription>
                </CardHeader>
              </Card>

              {/* Executive Summary */}
              {plan.executiveSummary && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{plan.executiveSummary.overview}</p>
                    {plan.executiveSummary.keyRecommendations && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Key Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {plan.executiveSummary.keyRecommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm text-muted-foreground">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {plan.executiveSummary.expectedOutcomes && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                          <p className="text-sm text-muted-foreground mb-1">Expected Yield</p>
                          <p className="text-xl font-bold text-primary">{plan.executiveSummary.expectedOutcomes.yield}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/30 to-secondary/10">
                          <p className="text-sm text-muted-foreground mb-1">Revenue Projection</p>
                          <p className="text-xl font-bold">{plan.executiveSummary.expectedOutcomes.revenue}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-accent/50 to-accent/20">
                          <p className="text-sm text-muted-foreground mb-1">ROI</p>
                          <p className="text-xl font-bold">{plan.executiveSummary.expectedOutcomes.roi}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Climate Analysis with Charts */}
              {plan.climaticAnalysis && (
                <Card className="shadow-[var(--shadow-card)] border-primary/20">
                  <CardHeader>
                    <CardTitle>{t('farmPlanner.climateInsights')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">{plan.climaticAnalysis.currentConditions}</p>
                    
                    {plan.climaticAnalysis.optimalPlantingWindow && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          Optimal Planting Window
                        </h4>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Start Date</p>
                            <p className="font-bold text-primary">{plan.climaticAnalysis.optimalPlantingWindow.start}</p>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div>
                            <p className="text-xs text-muted-foreground">End Date</p>
                            <p className="font-bold text-primary">{plan.climaticAnalysis.optimalPlantingWindow.end}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">{plan.climaticAnalysis.optimalPlantingWindow.reasoning}</p>
                      </div>
                    )}

                    {plan.climaticAnalysis.recommendations && (
                      <ClimateRecommendations recommendations={plan.climaticAnalysis.recommendations} />
                    )}

                    {plan.charts && plan.charts.monthlyWaterUsage && (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={plan.charts.monthlyWaterUsage}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                          <Legend />
                          <Line type="monotone" dataKey="usage" stroke="hsl(var(--primary))" strokeWidth={2} name="Water Usage (L)" />
                          <Line type="monotone" dataKey="rainfall" stroke="hsl(var(--secondary))" strokeWidth={2} name="Rainfall (mm)" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Crop Management */}
              {plan.cropManagement && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sprout className="h-5 w-5 text-primary" />
                      Crop Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {plan.cropManagement.recommendedCrops && (
                      <div className="space-y-3">
                        {plan.cropManagement.recommendedCrops.map((crop: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">{crop.crop}</h4>
                                <p className="text-sm text-muted-foreground">{crop.variety}</p>
                              </div>
                              <span className="text-sm font-bold text-primary px-3 py-1 rounded bg-primary/10">
                                {crop.expectedYield}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">Planting</p>
                                <p className="font-medium">{crop.plantingDate}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Harvest</p>
                                <p className="font-medium">{crop.harvestDate}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Spacing</p>
                                <p className="font-medium">{crop.spacing}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Market Value</p>
                                <p className="font-medium text-primary">{crop.marketValue}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Financial Projection */}
              {plan.financialProjection && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      {t('farmPlanner.financialProjection')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {plan.financialProjection.startup && (
                      <div>
                        <h4 className="font-semibold mb-3">Startup Costs</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(plan.financialProjection.startup).map(([key, value]: [string, any]) => (
                            key !== 'total' && (
                              <div key={key} className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground capitalize">{key}</p>
                                <p className="font-bold">{typeof value === 'object' ? value.cost : value}</p>
                              </div>
                            )
                          ))}
                          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="font-bold text-primary text-lg">{plan.financialProjection.startup.total}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {plan.charts && plan.charts.financialProjection && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={plan.charts.financialProjection}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                          <Legend />
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                          <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
                          <Bar dataKey="profit" fill="hsl(var(--secondary))" name="Profit" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {plan.financialProjection.profitability && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-primary/5">
                          <p className="text-sm text-muted-foreground mb-1">ROI</p>
                          <p className="text-2xl font-bold text-primary">{plan.financialProjection.profitability.roi}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-accent/30">
                          <p className="text-sm text-muted-foreground mb-1">Break-Even</p>
                          <p className="text-2xl font-bold">{plan.financialProjection.profitability.breakeven}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/30">
                          <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                          <p className="text-2xl font-bold">{plan.financialProjection.profitability.netProfit}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Soil Management */}
              {plan.soilManagement && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <CardTitle>Soil Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.soilManagement.analysis && (
                      <p className="text-muted-foreground">{plan.soilManagement.analysis}</p>
                    )}
                    {plan.soilManagement.amendments && plan.soilManagement.amendments.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Recommended Amendments:</h4>
                        {plan.soilManagement.amendments.map((amendment: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg bg-accent/30">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-medium">{amendment.material}</p>
                              {amendment.cost && <span className="text-sm text-primary">{amendment.cost}</span>}
                            </div>
                            <p className="text-sm text-muted-foreground">{amendment.quantity}</p>
                            <p className="text-sm text-muted-foreground">{amendment.application}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Water Management */}
              {plan.waterManagement && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <CardTitle>Water Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.waterManagement.irrigationSchedule && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Irrigation Schedule:</h4>
                        {plan.waterManagement.irrigationSchedule.map((schedule: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg bg-primary/5">
                            <p className="font-medium">{schedule.crop}</p>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">Frequency</p>
                                <p>{schedule.frequency}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Amount</p>
                                <p>{schedule.amount}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Pest & Disease Management */}
              {plan.pestDiseaseManagement && (
                <Card className="shadow-[var(--shadow-card)] border-destructive/20">
                  <CardHeader>
                    <CardTitle>Pest & Disease Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.pestDiseaseManagement.commonThreats && (
                      <div className="space-y-3">
                        {plan.pestDiseaseManagement.commonThreats.map((threat: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{threat.threat}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${
                                threat.risk === 'high' ? 'bg-destructive text-destructive-foreground' : 
                                threat.risk === 'medium' ? 'bg-secondary' : 'bg-muted'
                              }`}>
                                {threat.risk} Risk
                              </span>
                            </div>
                            {threat.timing && <p className="text-sm text-muted-foreground mb-2">Timing: {threat.timing}</p>}
                            {threat.prevention && threat.prevention.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-1">Prevention:</p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                  {threat.prevention.map((p: string, i: number) => (
                                    <li key={i}>{p}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {plan.pestDiseaseManagement.ipm && (
                      <div className="p-4 rounded-lg bg-primary/5">
                        <h4 className="font-semibold mb-2">Integrated Pest Management</h4>
                        <p className="text-sm text-muted-foreground">{plan.pestDiseaseManagement.ipm.strategy}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Market Strategy */}
              {plan.marketStrategy && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Market Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.marketStrategy.priceAnalysis && (
                      <div>
                        <h4 className="font-semibold mb-3">Price Analysis</h4>
                        {plan.marketStrategy.priceAnalysis.currentPrices && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {plan.marketStrategy.priceAnalysis.currentPrices.map((item: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg bg-primary/5">
                                <p className="text-sm text-muted-foreground">{item.crop}</p>
                                <p className="text-lg font-bold text-primary">{item.price}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {plan.marketStrategy.priceAnalysis.bestSellingTime && (
                          <div className="mt-3 p-3 rounded-lg bg-accent/30">
                            <p className="text-sm">
                              <span className="font-semibold">Best Selling Time:</span>{' '}
                              {plan.marketStrategy.priceAnalysis.bestSellingTime}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Risk Management */}
              {plan.riskManagement && (
                <Card className="shadow-[var(--shadow-card)] border-destructive/20">
                  <CardHeader>
                    <CardTitle>Risk Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.riskManagement.identified && plan.riskManagement.identified.length > 0 && (
                      <div className="space-y-3">
                        {plan.riskManagement.identified.map((risk: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{risk.risk}</h4>
                              <div className="flex gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  risk.probability === 'high' ? 'bg-destructive/20' : 'bg-muted'
                                }`}>
                                  {risk.probability} probability
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  risk.impact === 'high' ? 'bg-destructive text-destructive-foreground' : 'bg-muted'
                                }`}>
                                  {risk.impact} impact
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Mitigation:</span> {risk.mitigation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {plan.riskManagement.contingency && (
                      <div className="p-4 rounded-lg bg-secondary/30">
                        <h4 className="font-semibold mb-2">Contingency Plan</h4>
                        <p className="text-sm text-muted-foreground">{plan.riskManagement.contingency}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              {plan.timeline && plan.timeline.length > 0 && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {t('farmPlanner.timeline')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plan.timeline.map((phase: any, idx: number) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light text-primary-foreground flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1 pb-4 border-l-2 border-border pl-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{phase.phase}</h4>
                              <span className="text-sm text-muted-foreground">{phase.startDate} - {phase.endDate}</span>
                            </div>
                            {phase.activities && (
                              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {phase.activities.map((activity: string, i: number) => (
                                  <li key={i}>{activity}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Sources */}
              {plan.resources && Array.isArray(plan.resources) && plan.resources.length > 0 && (
                <DataSources sources={plan.resources} />
              )}
              
              {plan.climaticAnalysis?.dataSources && (
                <DataSources sources={plan.climaticAnalysis.dataSources} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensivePlan;
