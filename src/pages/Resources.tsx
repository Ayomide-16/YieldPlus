import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Newspaper, Users, FileText, Send, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Resources = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Mock data for PDFs
  const mockPdfs = [
    {
      id: '1',
      title: 'Soil Management Essentials',
      description: 'Short guide on improving soil health through composting, crop rotation, and pH management',
      category: 'Soil Management',
      file_url: '#'
    },
    {
      id: '2',
      title: 'Efficient Irrigation Techniques',
      description: 'Learn water-saving methods including drip irrigation, mulching, and timing strategies',
      category: 'Irrigation',
      file_url: '#'
    },
    {
      id: '3',
      title: 'Crop Rotation Guide',
      description: 'Maximize yields and soil health with proven crop rotation patterns',
      category: 'Crop Management',
      file_url: '#'
    },
    {
      id: '4',
      title: 'Natural Pest Control',
      description: 'Organic methods for controlling common pests using local resources',
      category: 'Pest Control',
      file_url: '#'
    }
  ];

  // Mock data for news
  const mockNews = [
    {
      id: '1',
      title: 'Fall Armyworm Alert in West Africa',
      content: 'Agricultural ministries across West Africa have issued alerts about increased fall armyworm activity. Farmers are advised to monitor maize and sorghum fields closely and apply recommended treatments.',
      published_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Regional Agricultural Network',
      category: 'Disease Alert'
    },
    {
      id: '2',
      title: 'Government Subsidy Program for Fertilizers',
      content: 'The Ministry of Agriculture announces a 40% subsidy on NPK fertilizers for smallholder farmers. Application forms available at local agricultural offices.',
      published_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'Ministry of Agriculture',
      category: 'Government Program'
    },
    {
      id: '3',
      title: 'Favorable Rainfall Forecast for Planting Season',
      content: 'Meteorological services predict above-average rainfall in the coming months, creating excellent conditions for planting. Farmers should prepare for early planting.',
      published_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'National Weather Service',
      category: 'Weather'
    },
    {
      id: '4',
      title: 'NGO Offers Free Training on Modern Farming',
      content: 'AgriCare Foundation launches free training programs on precision agriculture, covering drip irrigation, greenhouse farming, and digital farm management tools.',
      published_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      source: 'AgriCare Foundation',
      category: 'Training'
    }
  ];

  // Mock data for regional experts
  const mockExperts = [
    { region: 'North', name: 'Dr. Amina Hassan', specialty: 'Crop Pathology', phone: '+234-801-234-5678', email: 'amina.hassan@agriexpert.ng' },
    { region: 'South', name: 'Mr. Chidi Okonkwo', specialty: 'Soil Science', phone: '+234-802-345-6789', email: 'chidi.okonkwo@agriexpert.ng' },
    { region: 'East', name: 'Dr. Grace Mwangi', specialty: 'Pest Management', phone: '+234-803-456-7890', email: 'grace.mwangi@agriexpert.ng' },
    { region: 'West', name: 'Prof. Ibrahim Bello', specialty: 'Irrigation Systems', phone: '+234-804-567-8901', email: 'ibrahim.bello@agriexpert.ng' },
    { region: 'Central', name: 'Dr. Fatima Adamu', specialty: 'Crop Nutrition', phone: '+234-805-678-9012', email: 'fatima.adamu@agriexpert.ng' }
  ];
  
  const [pdfs, setPdfs] = useState<any[]>(mockPdfs);
  const [news, setNews] = useState<any[]>(mockNews);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Expert consultation form
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadConsultations();
    }
  }, [user]);

  const loadConsultations = async () => {
    const { data } = await supabase
      .from('expert_consultations')
      .select('*')
      .order('created_at', { ascending: false });
    
    setConsultations(data || []);
  };

  const handleSubmitConsultation = async () => {
    if (!subject || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('expert_consultations').insert({
        user_id: user?.id,
        subject,
        description,
        urgency
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "An expert will review your request soon"
      });

      setSubject("");
      setDescription("");
      setUrgency("medium");
      loadConsultations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
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
              <BookOpen className="h-10 w-10 text-primary" />
              {t("resources.title")}
            </h1>
            <p className="text-muted-foreground">{t("resources.subtitle")}</p>
          </div>

          <Tabs defaultValue="pdfs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pdfs" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Study Materials
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                News Feed
              </TabsTrigger>
              <TabsTrigger value="expert" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Expert Help
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdfs" className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : pdfs.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No study materials available yet
                  </CardContent>
                </Card>
              ) : (
                pdfs.map(pdf => (
                  <Card key={pdf.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{pdf.title}</CardTitle>
                          <CardDescription>{pdf.description}</CardDescription>
                        </div>
                        <Badge>{pdf.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <a href={pdf.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full">
                          <FileText className="mr-2 h-4 w-4" />
                          View Document
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="news" className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : news.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No news available yet
                  </CardContent>
                </Card>
              ) : (
                news.map(item => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{item.title}</CardTitle>
                          <CardDescription>
                            {new Date(item.published_date).toLocaleDateString()} • {item.source}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{item.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="expert" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Local Agricultural Experts</CardTitle>
                  <CardDescription>Contact information for regional agricultural specialists</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {mockExperts.map((expert, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{expert.name}</h4>
                            <p className="text-sm text-muted-foreground">{expert.specialty}</p>
                            <Badge variant="secondary" className="mt-1 mb-2">{expert.region} Region</Badge>
                            <div className="space-y-1 text-xs">
                              <p>📞 {expert.phone}</p>
                              <p>✉️ {expert.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Request Expert Consultation</CardTitle>
                  <CardDescription>
                    Get help from agricultural experts for urgent or critical farm decisions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Urgency Level</Label>
                    <Select value={urgency} onValueChange={setUrgency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide detailed information about your question or issue..."
                      rows={5}
                    />
                  </div>

                  <Button onClick={handleSubmitConsultation} className="w-full" disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Submit Request</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Consultations</CardTitle>
                </CardHeader>
                <CardContent>
                  {consultations.length === 0 ? (
                    <p className="text-center text-muted-foreground">No consultations yet</p>
                  ) : (
                    <div className="space-y-3">
                      {consultations.map(consultation => (
                        <div key={consultation.id} className="p-4 rounded-lg bg-muted">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{consultation.subject}</h4>
                            <Badge variant={
                              consultation.status === 'resolved' ? 'default' :
                              consultation.status === 'in_progress' ? 'secondary' :
                              'outline'
                            }>
                              {consultation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {consultation.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {new Date(consultation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Resources;
