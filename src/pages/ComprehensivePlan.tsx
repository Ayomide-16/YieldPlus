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
import { Loader2, Tractor, Save, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const [season, setSeason] = useState("all-year");
  const [includeSections, setIncludeSections] = useState({
    crop: true,
    soil: true,
    water: true,
    market: true,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

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

    const farm = farms.find(f => f.id === selectedFarm);
    if (!farm) return;

    setIsGenerating(true);

    try {
      // Gather analyses from all selected sections
      const analyses: any = {};
      
      if (includeSections.crop) {
        const { data: cropData } = await supabase.functions.invoke('analyze-crop', {
          body: {
            location: farm.location,
            soilType: farm.soil_type,
            cropType: farm.crops[0],
            farmSize: farm.total_size
          }
        });
        analyses.crop = cropData?.analysis;
      }

      if (includeSections.soil) {
        const { data: soilData } = await supabase.functions.invoke('analyze-soil', {
          body: {
            color: "brown",
            texture: farm.soil_type,
            notes: `Farm: ${farm.farm_name}`
          }
        });
        analyses.soil = soilData?.analysis;
      }

      if (includeSections.water && season !== "rainy") {
        const { data: waterData } = await supabase.functions.invoke('analyze-water', {
          body: {
            waterSource: farm.water_source,
            farmSize: farm.total_size,
            cropTypes: farm.crops,
            irrigationMethod: farm.irrigation_method
          }
        });
        analyses.water = waterData?.analysis;
      }

      if (includeSections.market) {
        const { data: marketData } = await supabase.functions.invoke('estimate-market-price', {
          body: {
            cropType: farm.crops[0],
            expectedYield: farm.total_size * 10,
            location: farm.location,
            harvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        });
        analyses.market = marketData?.analysis;
      }

      // Save comprehensive plan
      const { error: saveError } = await supabase
        .from('comprehensive_plans')
        .insert({
          farm_id: selectedFarm,
          user_id: user?.id,
          plan_name: `${farm.farm_name} - ${new Date().toLocaleDateString()}`,
          season: season,
          included_sections: includeSections,
          crop_analysis: analyses.crop,
          soil_analysis: analyses.soil,
          water_analysis: analyses.water,
          market_analysis: analyses.market,
          comprehensive_summary: analyses
        });

      if (saveError) throw saveError;

      setAnalysis(analyses);
      toast({ title: "Success", description: "Comprehensive plan generated and saved!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate plan", variant: "destructive" });
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
              Comprehensive Farm Planner
            </h1>
            <p className="text-muted-foreground">
              Generate a complete farming plan that integrates all aspects of your farm operations
            </p>
          </div>

          {!showNewFarm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Select or Create a Farm</CardTitle>
                <CardDescription>Choose an existing farm or create a new one to generate a comprehensive plan</CardDescription>
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
                          {farm.farm_name} - {farm.total_size} plots
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => setShowNewFarm(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Create New Farm
                </Button>
              </CardContent>
            </Card>
          )}

          {showNewFarm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Create New Farm</CardTitle>
                <CardDescription>Enter your farm details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Farm Name *</Label>
                  <Input value={farmName} onChange={(e) => setFarmName(e.target.value)} placeholder="My Farm" />
                </div>

                <LocationSelector location={location} onLocationChange={setLocation} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Farm Size (plots) *</Label>
                    <Input type="number" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} placeholder="10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Soil Type</Label>
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
                    <Label>Water Source</Label>
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
                    <Label>Irrigation Method</Label>
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
                  <Label>Crop Types (comma-separated)</Label>
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
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Plan Configuration</CardTitle>
                <CardDescription>Customize your comprehensive farm plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Season</Label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rainy">Rainy Season</SelectItem>
                      <SelectItem value="dry">Dry Season</SelectItem>
                      <SelectItem value="all-year">All Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Include in Plan</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="crop"
                        checked={includeSections.crop}
                        onCheckedChange={(checked) => setIncludeSections({...includeSections, crop: !!checked})}
                      />
                      <Label htmlFor="crop" className="cursor-pointer">Crop Planning & Recommendations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="soil"
                        checked={includeSections.soil}
                        onCheckedChange={(checked) => setIncludeSections({...includeSections, soil: !!checked})}
                      />
                      <Label htmlFor="soil" className="cursor-pointer">Soil Analysis & Amendments</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="water"
                        checked={includeSections.water && season !== "rainy"}
                        disabled={season === "rainy"}
                        onCheckedChange={(checked) => setIncludeSections({...includeSections, water: !!checked})}
                      />
                      <Label htmlFor="water" className="cursor-pointer">
                        Water Management {season === "rainy" && "(Excluded for rainy season)"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="market"
                        checked={includeSections.market}
                        onCheckedChange={(checked) => setIncludeSections({...includeSections, market: !!checked})}
                      />
                      <Label htmlFor="market" className="cursor-pointer">Market Price Estimates</Label>
                    </div>
                  </div>
                </div>

                <Button onClick={handleGeneratePlan} className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Comprehensive Plan...</>
                  ) : (
                    <><Tractor className="mr-2 h-4 w-4" />Generate Comprehensive Plan</>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {analysis && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Comprehensive Farm Plan</CardTitle>
                  <CardDescription>AI-generated plan integrating all selected aspects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(analysis).map(([key, value]) => (
                    <div key={key} className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold mb-2 capitalize">{key} Analysis</h3>
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensivePlan;
