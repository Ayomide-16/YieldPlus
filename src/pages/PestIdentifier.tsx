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
import { Bug, Loader2, AlertTriangle, Leaf, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LocationSelector from "@/components/LocationSelector";

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

      const parsedAnalysis = JSON.parse(data.analysis);
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

            {analysis && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Diagnosis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{analysis.diagnosis?.primary?.name}</h3>
                      <p className="text-sm text-muted-foreground italic">
                        {analysis.diagnosis?.primary?.scientificName}
                      </p>
                      <Badge className="mt-2">{analysis.diagnosis?.primary?.confidence} confidence</Badge>
                      <p className="mt-3">{analysis.diagnosis?.primary?.description}</p>
                    </div>
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
                        <h4 className="font-semibold mb-2">Immediate Actions:</h4>
                        {analysis.treatment.immediate.map((action: any, idx: number) => (
                          <Alert key={idx} className="mb-2">
                            <AlertDescription>
                              <p className="font-medium">{action.action}</p>
                              <p className="text-sm mt-1">Materials: {action.materials?.join(', ')}</p>
                              <p className="text-sm">Cost: {action.cost}</p>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    <Separator />

                    {analysis.treatment?.organic && (
                      <div>
                        <h4 className="font-semibold mb-2">Organic Solutions:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {analysis.treatment.organic.map((solution: string, idx: number) => (
                            <li key={idx} className="text-sm">{solution}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-blue-500" />
                      Prevention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysis.treatment?.preventive && (
                      <ul className="space-y-2">
                        {analysis.treatment.preventive.map((measure: any, idx: number) => (
                          <li key={idx} className="border-l-2 border-primary pl-3">
                            <p className="font-medium">{measure.measure}</p>
                            <p className="text-sm text-muted-foreground">
                              {measure.timing} - {measure.frequency}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                {analysis.resources && analysis.resources.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.resources.map((resource: any, idx: number) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-sm text-muted-foreground">{resource.source}</p>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PestIdentifier;
