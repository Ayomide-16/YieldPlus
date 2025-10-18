import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Lightbulb, Upload, Loader2, ImageIcon, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { compressImage } from "@/lib/imageUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadialBarChart, RadialBar } from "recharts";
import { useFarmData } from "@/contexts/FarmDataContext";
import ToolSuggestions from "@/components/ToolSuggestions";

const SoilNutrientAdvisor = () => {
  const [color, setColor] = useState("");
  const [texture, setTexture] = useState("");
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [soilPH, setSoilPH] = useState("");
  const [soilCompactness, setSoilCompactness] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { farmData, updateFarmData} = useFarmData();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImage(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleAnalyze = async () => {
    if (!color || !texture) {
      toast({
        title: "Missing Information",
        description: "Please select soil color and texture",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setShowResults(false);

    try {
      let imageBase64 = null;
      if (image) {
        imageBase64 = await compressImage(image);
      }

      const { data, error } = await supabase.functions.invoke('analyze-soil', {
        body: { color, texture, notes, imageBase64, soilPH, soilCompactness }
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
      updateFarmData({ soilType: texture });
      
      toast({
        title: "Analysis Complete",
        description: "Your soil analysis is ready",
      });
    } catch (error: any) {
      console.error('Error analyzing soil:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze soil. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Soil Nutrient Advisor
            </h1>
            <p className="text-muted-foreground">
              Upload a photo and assess your soil health with AI-powered recommendations
            </p>
          </div>

          <Card className="mb-8 shadow-[var(--shadow-elevated)]">
            <CardHeader>
              <CardTitle>Soil Assessment</CardTitle>
              <CardDescription>Describe your soil's characteristics and upload a photo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image">Soil Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Soil Image
                  </Button>
                </div>
                {imagePreview && (
                  <div className="mt-4 relative rounded-lg overflow-hidden border-2 border-primary/20">
                    <img src={imagePreview} alt="Soil preview" className="w-full h-48 object-cover" />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      Image uploaded
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="color">Soil Color *</Label>
                  <Select value={color} onValueChange={setColor}>
                    <SelectTrigger id="color">
                      <SelectValue placeholder="Select soil color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark-brown">Dark Brown / Black</SelectItem>
                      <SelectItem value="brown">Brown</SelectItem>
                      <SelectItem value="red">Red / Reddish</SelectItem>
                      <SelectItem value="yellow">Yellow / Pale</SelectItem>
                      <SelectItem value="gray">Gray</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="texture">Soil Texture *</Label>
                  <Select value={texture} onValueChange={setTexture}>
                    <SelectTrigger id="texture">
                      <SelectValue placeholder="Select soil texture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sticky">Sticky (Clay)</SelectItem>
                      <SelectItem value="gritty">Gritty (Sandy)</SelectItem>
                      <SelectItem value="smooth">Smooth (Loamy)</SelectItem>
                      <SelectItem value="silky">Silky (Silt)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="soilPH">Soil pH (Optional)</Label>
                  <Select value={soilPH} onValueChange={setSoilPH}>
                    <SelectTrigger id="soilPH">
                      <SelectValue placeholder="Taste indicator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bitter">Bitter (Alkaline pH)</SelectItem>
                      <SelectItem value="sour">Sour (Acidic pH)</SelectItem>
                      <SelectItem value="tasteless">Tasteless (Neutral pH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soilCompactness">Soil Compactness (Optional)</Label>
                  <Select value={soilCompactness} onValueChange={setSoilCompactness}>
                    <SelectTrigger id="soilCompactness">
                      <SelectValue placeholder="Select compactness" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loose">Loose</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other observations about your soil..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleAnalyze} className="w-full" disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  'Get AI Recommendations'
                )}
              </Button>
            </CardContent>
          </Card>

          {showResults && analysis && (
            <div className="space-y-6">
              {analysis.summary && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{analysis.summary}</p>
                  </CardContent>
                </Card>
              )}

              {analysis.healthAssessment && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Health Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      {typeof analysis.healthAssessment === 'object' && Object.entries(analysis.healthAssessment).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                          <p className="text-xs text-muted-foreground mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-lg font-bold">{value}</p>
                        </div>
                      ))}
                    </div>
                    {analysis.healthAssessment.healthScore && (
                      <ResponsiveContainer width="100%" height={200}>
                        <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{name: 'Health Score', value: analysis.healthAssessment.healthScore, fill: 'hsl(var(--primary))'}]}>
                          <RadialBar dataKey="value" cornerRadius={10} />
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-primary">
                            {analysis.healthAssessment.healthScore}%
                          </text>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              )}

              {analysis.nutrientChart && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Nutrient Analysis</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={analysis.nutrientChart}>
                        <defs>
                          <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="nutrient" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Legend />
                        <Bar dataKey="current" fill="url(#colorCurrent)" radius={[8, 8, 0, 0]} name="Current Level" />
                        <Bar dataKey="optimal" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} name="Optimal Level" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {analysis.expectedImprovementTimeline && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Improvement Projection</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analysis.expectedImprovementTimeline}>
                        <defs>
                          <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
                        <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Health Score', angle: -90, position: 'insideLeft' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="healthScore" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorHealth)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {analysis.amendments && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Recommended Amendments</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Array.isArray(analysis.amendments) ? (
                      analysis.amendments.map((amendment: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-lg bg-accent/30 border border-accent">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{amendment.name || amendment.type}</h4>
                            {amendment.priority && (
                              <span className={`text-xs px-2 py-1 rounded ${amendment.priority === 'High' ? 'bg-destructive/20 text-destructive' : 'bg-muted'}`}>
                                {amendment.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{amendment.purpose || amendment.description}</p>
                          {amendment.application && <p className="text-sm"><span className="font-medium">Application:</span> {amendment.application}</p>}
                          {amendment.quantity && <p className="text-sm"><span className="font-medium">Quantity:</span> {amendment.quantity}</p>}
                          {amendment.cost && <p className="text-sm"><span className="font-medium">Est. Cost:</span> {amendment.cost}</p>}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{typeof analysis.amendments === 'string' ? analysis.amendments : JSON.stringify(analysis.amendments)}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {analysis.timeline && (
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader><CardTitle>Implementation Timeline</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {Array.isArray(analysis.timeline) ? (
                      analysis.timeline.map((phase: any, idx: number) => (
                        <div key={idx} className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light text-primary-foreground flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{phase.period || phase.phase}</p>
                            <p className="text-sm text-muted-foreground">{phase.action || phase.description}</p>
                            {phase.expectedImprovement && <p className="text-xs text-primary mt-1">Expected: {phase.expectedImprovement}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">{typeof analysis.timeline === 'string' ? analysis.timeline : JSON.stringify(analysis.timeline)}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              <ToolSuggestions currentTool="soil" farmData={farmData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoilNutrientAdvisor;
