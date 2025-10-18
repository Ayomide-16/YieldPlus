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
  
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Expert consultation form
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResources();
    if (user) {
      loadConsultations();
    }
  }, [user]);

  const loadResources = async () => {
    try {
      const [{ data: pdfData }, { data: newsData }] = await Promise.all([
        supabase.from('agricultural_resources').select('*').order('created_at', { ascending: false }),
        supabase.from('agricultural_news').select('*').order('published_date', { ascending: false }).limit(20)
      ]);

      setPdfs(pdfData || []);
      setNews(newsData || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

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
