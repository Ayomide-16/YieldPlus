import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Bug, Loader2, AlertTriangle, Leaf, ShieldCheck, Upload, DollarSign, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LocationSelector from "@/components/LocationSelector";
import DataSources from "@/components/DataSources";
import { SavePlanButton } from "@/components/SavePlanButton";

const commonSymptoms = [
  "Yellowing leaves", "Brown spots", "Wilting", "Holes in leaves", 
  "White powder on leaves", "Curling leaves", "Stunted growth", 
  "Black spots", "Webbing on plants", "Sticky residue",
  "Discolored stems", "Root damage", "Fruit damage"
];

const PestIdentifier = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [cropType, setCropType] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [location, setLocation] = useState({ country: "", state: "", localGovernment: "" });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAddCustomSymptom = () => {
    if (customSymptom.trim()) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!cropType || selectedSymptoms.length === 0) {
      toast({
        title: t("common.error") || "Error",
        description: "Please select crop type and at least one symptom",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('identify-pest', {
        body: {
          cropType,
          symptoms: selectedSymptoms,
          location
        }
      });

      if (error) throw error;

      let parsedAnalysis;
      try {
        let cleanedAnalysis = data.analysis.trim();
        cleanedAnalysis = cleanedAnalysis.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        parsedAnalysis = JSON.parse(cleanedAnalysis);
      } catch (parseError) {
        if (import.meta.env.DEV) {
          console.error('JSON Parse Error:', parseError, 'Raw data:', data.analysis);
        }
        toast({
          title: "Error",
          description: "Failed to parse analysis. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setAnalysis(parsedAnalysis);

      if (user) {
        await supabase.from('pest_disease_reports').insert({
          user_id: user.id,
          crop_type: cropType,
          symptoms: selectedSymptoms,
          diagnosis: parsedAnalysis.diagnosis,
          treatment_recommendations: parsedAnalysis.treatment,
          location
        });
      }

      toast({
        title: "Analysis Complete",
        description: "Pest/disease identified successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze symptoms",
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
              <Bug className="h-10 w-10 text-primary" />
              {t("pestIdentifier.title")}
            </h1>
            <p className="text-muted-foreground">{t("pestIdentifier.subtitle")}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Input Information</CardTitle>
                <CardDescription>Describe what you're observing on your crops</CardDescription>
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

                <LocationSelector location={location} onLocationChange={setLocation} />

                <div className="space-y-3">
                  <Label>Observed Symptoms *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {commonSymptoms.map(symptom => (
                      <div key={symptom} className="flex items-center space-x-2">
                        <Checkbox
                          id={symptom}
                          checked={selectedSymptoms.includes(symptom)}
                          onCheckedChange={() => handleSymptomToggle(symptom)}
                        />
                        <Label htmlFor={symptom} className="cursor-pointer text-sm">
                          {symptom}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custom Symptom</Label>
                  <div className="flex gap-2">
                    <Input
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      placeholder="Describe other symptoms..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSymptom()}
                    />
                    <Button onClick={handleAddCustomSymptom} variant="outline">Add</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Upload Plant Image (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img src={imagePreview} alt="Plant preview" className="max-h-48 mx-auto rounded" />
                          <p className="text-sm text-muted-foreground">Click to change image</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Click to upload plant image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {selectedSymptoms.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Symptoms:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSymptoms.map(symptom => (
                        <Badge key={symptom} variant="secondary" className="cursor-pointer"
                          onClick={() => handleSymptomToggle(symptom)}>
                          {symptom} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleAnalyze} className="w-full" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                  ) : (
                    <><Bug className="mr-2 h-4 w-4" />Identify Pest/Disease</>
                  )}
                </Button>
              </CardContent>
            </Card>

              <div className="space-y-6">
                {analysis ? (
                  <>
                    <Card className="shadow-[var(--shadow-card)]">
                      <CardContent className="pt-6 space-y-2">
                        <Button onClick={() => window.print()} variant="outline" className="w-full">
                          <Printer className="mr-2 h-4 w-4" />Print Pest Analysis Report
                        </Button>
                        <SavePlanButton
                          planType="pest"
                          planData={analysis}
                          location={location}
                          defaultName={`Pest - ${cropType}`}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          Diagnosis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-l-4 border-orange-500">
                      <h3 className="font-bold text-xl mb-1">{analysis.diagnosis?.primary?.name}</h3>
                      <p className="text-sm italic text-muted-foreground mb-3">
                        {analysis.diagnosis?.primary?.scientificName}
                      </p>
                      <Badge className="mb-3" variant={
                        analysis.diagnosis?.primary?.confidence === 'high' ? 'default' :
                        analysis.diagnosis?.primary?.confidence === 'medium' ? 'secondary' : 'outline'
                      }>
                        {analysis.diagnosis?.primary?.confidence} confidence
                      </Badge>
                      <p className="mt-2 leading-relaxed">{analysis.diagnosis?.primary?.description}</p>
                    </div>

                    {analysis.causes && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Causes</h4>
                        <div className="p-3 rounded-lg bg-muted">
                          <p className="font-medium text-sm mb-2">Primary Cause:</p>
                          <p className="text-sm">{analysis.causes.primary}</p>
                          {analysis.causes.contributing && analysis.causes.contributing.length > 0 && (
                            <>
                              <p className="font-medium text-sm mt-3 mb-2">Contributing Factors:</p>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {analysis.causes.contributing.map((factor: string, idx: number) => (
                                  <li key={idx}>{factor}</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    </CardContent>
                  </Card>

                  <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-500" />
                      Treatment Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.treatment?.immediate && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                          Immediate Actions Required
                        </h4>
                        {analysis.treatment.immediate.map((action: any, idx: number) => (
                          <Alert key={idx} className="mb-3 border-l-4 border-red-500">
                            <AlertDescription>
                              <p className="font-semibold text-base mb-2">{action.action}</p>
                              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Materials:</p>
                                  <p className="font-medium">{action.materials?.join(', ')}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Est. Cost:</p>
                                  <p className="font-medium">{action.cost}</p>
                                </div>
                              </div>
                              <Badge className="mt-2" variant={action.effectiveness === 'high' ? 'default' : 'secondary'}>
                                {action.effectiveness} effectiveness
                              </Badge>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    <Separator />

                    {analysis.treatment?.organic && analysis.treatment.organic.length > 0 && (
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
                          <Leaf className="h-4 w-4" />
                          Organic Solutions (Eco-Friendly)
                        </h4>
                        <ul className="space-y-2">
                          {analysis.treatment.organic.map((solution: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></span>
                              <span className="text-sm">{solution}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.treatment?.chemical && analysis.treatment.chemical.length > 0 && (
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">Chemical Treatments</h4>
                        {analysis.treatment.chemical.map((chem: any, idx: number) => (
                          <div key={idx} className="mb-3 last:mb-0">
                            <p className="font-medium text-sm">{chem.product}</p>
                            <p className="text-xs text-muted-foreground mt-1">Dosage: {chem.dosage}</p>
                            <Alert className="mt-2 bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700">
                              <AlertDescription className="text-xs">
                                ⚠️ {chem.safety}
                              </AlertDescription>
                            </Alert>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-blue-500" />
                      Prevention Measures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.treatment?.preventive && (
                      <div className="space-y-3">
                        {analysis.treatment.preventive.map((measure: any, idx: number) => (
                          <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-muted/50 rounded-r">
                            <p className="font-semibold">{measure.measure}</p>
                            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                              <span>⏰ {measure.timing}</span>
                              <span>🔄 {measure.frequency}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {analysis.lifecycle && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Pest/Disease Lifecycle</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground mb-1">Duration</p>
                          <p className="font-bold">{analysis.lifecycle.duration}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground mb-1">Spread Rate</p>
                          <p className="font-bold">{analysis.lifecycle.spreadRate}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground mb-1">Stages</p>
                          <p className="font-bold">{analysis.lifecycle.stages?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analysis.economicImpact && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-yellow-500" />
                        Economic Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-red-950">
                          <span className="text-sm font-medium">Potential Loss</span>
                          <span className="font-bold text-red-600 dark:text-red-400">{analysis.economicImpact.potentialLoss}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                          <span className="text-sm font-medium">Treatment Cost</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{analysis.economicImpact.costOfTreatment}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                          <span className="text-sm font-medium">Yield Impact</span>
                          <span className="font-bold text-orange-600 dark:text-orange-400">{analysis.economicImpact.yieldImpact}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analysis.expertAdvice && (
                  <Alert>
                    <AlertDescription>
                      <p className="font-semibold mb-1">Expert Consultation Recommended:</p>
                      <p className="text-sm">{analysis.expertAdvice}</p>
                    </AlertDescription>
                  </Alert>
                )}

                {analysis.resources && <DataSources sources={analysis.resources} />}
              </>
            ) : null}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PestIdentifier;
