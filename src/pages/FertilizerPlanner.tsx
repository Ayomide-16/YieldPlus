import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Leaf, Loader2, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LocationSelector from "@/components/LocationSelector";
import { UnitSelector, convertToHectares } from "@/components/UnitSelector";
import DataSources from "@/components/DataSources";
import { Printer } from "lucide-react";
import { SavePlanButton } from "@/components/SavePlanButton";

const FertilizerPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [cropType, setCropType] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [farmSizeUnit, setFarmSizeUnit] = useState("hectares");
  const [plantingMonth, setPlantingMonth] = useState("");
  const [location, setLocation] = useState({ country: "", state: "", localGovernment: "" });
  const [soilPH, setSoilPH] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [organicMatter, setOrganicMatter] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!cropType || !farmSize || !plantingMonth || !location.country) {
      toast({
        title: t("common.error") || "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const farmSizeInHectares = convertToHectares(parseFloat(farmSize), farmSizeUnit);
      
      const { data, error } = await supabase.functions.invoke('analyze-fertilizer', {
        body: {
          cropType,
          farmSize: farmSizeInHectares,
          plantingMonth,
          location,
          soilData: {
            pH: soilPH ? parseFloat(soilPH) : null,
            nitrogen: nitrogen ? parseFloat(nitrogen) : null,
            phosphorus: phosphorus ? parseFloat(phosphorus) : null,
            potassium: potassium ? parseFloat(potassium) : null,
            organicMatter: organicMatter ? parseFloat(organicMatter) : null
          }
        }
      });

      if (error) throw error;

      const parsedAnalysis = JSON.parse(data.analysis);
      setAnalysis(parsedAnalysis);

      toast({
        title: "Analysis Complete",
        description: "Fertilizer plan generated successfully"
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Fertilizer analysis error:', error);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to generate fertilizer plan",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t("auth.required")}</CardTitle>
            <CardDescription>{t("auth.pleaseSignIn")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')}>{t("auth.signIn")}</Button>
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
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent flex items-center gap-3">
              <Leaf className="h-10 w-10 text-primary" />
              Fertilizer Planner
            </h1>
            <p className="text-muted-foreground">Get cost-effective fertilizer recommendations for maximum yield</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Farm Details</CardTitle>
                <CardDescription>Enter your farm information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Crop Type *</Label>
                  <Select value={cropType} onValueChange={setCropType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maize">Maize</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="cassava">Cassava</SelectItem>
                      <SelectItem value="tomato">Tomato</SelectItem>
                      <SelectItem value="beans">Beans</SelectItem>
                      <SelectItem value="sorghum">Sorghum</SelectItem>
                      <SelectItem value="millet">Millet</SelectItem>
                      <SelectItem value="yam">Yam</SelectItem>
                      <SelectItem value="cocoa">Cocoa</SelectItem>
                      <SelectItem value="coffee">Coffee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Farm Size *</Label>
                    <Input
                      type="number"
                      value={farmSize}
                      onChange={(e) => setFarmSize(e.target.value)}
                      placeholder="e.g., 5"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <UnitSelector value={farmSizeUnit} onChange={setFarmSizeUnit} label="Unit *" />
                </div>

                <div className="space-y-2">
                  <Label>Planting Month *</Label>
                  <Select value={plantingMonth} onValueChange={setPlantingMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"].map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <LocationSelector location={location} onLocationChange={setLocation} />

                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Soil Analysis (Optional)</h3>
                  <p className="text-xs text-muted-foreground">Provide soil test results for more accurate recommendations</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Soil pH</Label>
                      <Input
                        type="number"
                        value={soilPH}
                        onChange={(e) => setSoilPH(e.target.value)}
                        placeholder="e.g., 6.5"
                        min="0"
                        max="14"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nitrogen (ppm)</Label>
                      <Input
                        type="number"
                        value={nitrogen}
                        onChange={(e) => setNitrogen(e.target.value)}
                        placeholder="e.g., 45"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Phosphorus (ppm)</Label>
                      <Input
                        type="number"
                        value={phosphorus}
                        onChange={(e) => setPhosphorus(e.target.value)}
                        placeholder="e.g., 30"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Potassium (ppm)</Label>
                      <Input
                        type="number"
                        value={potassium}
                        onChange={(e) => setPotassium(e.target.value)}
                        placeholder="e.g., 150"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Organic Matter (%)</Label>
                      <Input
                        type="number"
                        value={organicMatter}
                        onChange={(e) => setOrganicMatter(e.target.value)}
                        placeholder="e.g., 3.5"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleAnalyze} className="w-full" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                  ) : (
                    <><Leaf className="mr-2 h-4 w-4" />Generate Fertilizer Plan</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {analysis && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6 space-y-2">
                    <Button onClick={() => window.print()} variant="outline" className="w-full">
                      <Printer className="mr-2 h-4 w-4" />Print Fertilizer Plan
                    </Button>
                    <SavePlanButton
                      planType="fertilizer"
                      planData={analysis}
                      location={location}
                      defaultName={`Fertilizer - ${cropType}`}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-500" />
                      Nutrient Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">Nitrogen (N)</p>
                        <p className="font-bold text-lg">{analysis.cropNutrientRequirements?.nitrogen}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">Phosphorus (P)</p>
                        <p className="font-bold text-lg">{analysis.cropNutrientRequirements?.phosphorus}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">Potassium (K)</p>
                        <p className="font-bold text-lg">{analysis.cropNutrientRequirements?.potassium}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Application Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.fertilizerPlan?.basalApplication && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                          Basal Application
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{analysis.fertilizerPlan.basalApplication.timing}</p>
                        {analysis.fertilizerPlan.basalApplication.fertilizers?.map((fert: any, idx: number) => (
                          <Alert key={idx} className="mb-2">
                            <AlertDescription>
                              <p className="font-medium">{fert.type}</p>
                              <p className="text-sm mt-1">Quantity: {fert.totalQuantity} ({fert.quantity})</p>
                              <p className="text-sm">Method: {fert.applicationMethod}</p>
                              <p className="text-sm">Cost: {fert.cost}</p>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    <Separator />

                    {analysis.fertilizerPlan?.topDressing && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                          Top Dressing
                        </h4>
                        {analysis.fertilizerPlan.topDressing.map((application: any, idx: number) => (
                          <div key={idx} className="mb-3">
                            <p className="text-sm font-medium">{application.timing} - {application.cropStage}</p>
                            {application.fertilizers?.map((fert: any, fertIdx: number) => (
                              <Alert key={fertIdx} className="mt-2">
                                <AlertDescription>
                                  <p className="font-medium">{fert.type}</p>
                                  <p className="text-sm mt-1">Quantity: {fert.totalQuantity} ({fert.quantity})</p>
                                  <p className="text-sm">Cost: {fert.cost}</p>
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Cost Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.costAnalysis && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-sm font-medium">Inorganic Fertilizers</p>
                          <p className="text-lg font-bold">{analysis.costAnalysis.inorganicFertilizers?.totalCost}</p>
                          <p className="text-xs text-muted-foreground">{analysis.costAnalysis.inorganicFertilizers?.costPerHectare}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="text-sm font-medium">Organic Fertilizers</p>
                          <p className="text-lg font-bold">{analysis.costAnalysis.organicFertilizers?.totalCost}</p>
                          <p className="text-xs text-muted-foreground">{analysis.costAnalysis.organicFertilizers?.costPerHectare}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/10">
                          <p className="text-sm font-medium">Hybrid Approach (Recommended)</p>
                          <p className="text-lg font-bold">{analysis.costAnalysis.hybrid?.totalCost}</p>
                          <p className="text-xs text-muted-foreground">{analysis.costAnalysis.hybrid?.description}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {analysis.organicAlternatives && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Organic Alternatives</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysis.organicAlternatives.compost && (
                        <div className="border-l-2 border-green-500 pl-3">
                          <p className="font-medium">Compost</p>
                          <p className="text-sm">{analysis.organicAlternatives.compost.quantity}</p>
                          <p className="text-xs text-muted-foreground">{analysis.organicAlternatives.compost.benefits}</p>
                        </div>
                      )}
                      {analysis.organicAlternatives.animalManure && (
                        <div className="border-l-2 border-green-500 pl-3">
                          <p className="font-medium">Animal Manure</p>
                          <p className="text-sm">{analysis.organicAlternatives.animalManure.type}</p>
                          <p className="text-xs text-muted-foreground">{analysis.organicAlternatives.animalManure.quantity}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {analysis.yieldProjection && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Yield Projection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">With Fertilization</p>
                          <p className="font-bold text-2xl text-primary">{analysis.yieldProjection.withOptimalFertilization}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted">
                          <p className="text-sm text-muted-foreground">Yield Increase</p>
                          <p className="font-bold text-2xl text-green-500">{analysis.yieldProjection.yieldIncrease}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analysis.resources && <DataSources sources={analysis.resources} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilizerPlanner;