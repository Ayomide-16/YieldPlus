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
import { BookOpen, Newspaper, Users, FileText, Send, Loader2, Upload, Trash2, Phone, Mail, MessageCircle, Plus, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LocationSelector from "@/components/LocationSelector";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { z } from "zod";

// Validation schemas
const expertSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  specialization: z.string().trim().min(2, "Specialization must be at least 2 characters").max(100, "Specialization must be less than 100 characters"),
  location: z.string().trim().min(2, "Location must be at least 2 characters").max(100, "Location must be less than 100 characters"),
  phone: z.string().trim().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  whatsapp_link: z.string().trim().max(255, "WhatsApp link must be less than 255 characters").optional()
});

const pdfUploadSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().trim().max(1000, "Description must be less than 1000 characters").optional(),
  category: z.string().trim().min(2, "Category is required").max(50, "Category must be less than 50 characters")
});

const consultationSchema = z.object({
  subject: z.string().trim().min(5, "Subject must be at least 5 characters").max(200, "Subject must be less than 200 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters")
});

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
  
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [location, setLocation] = useState({ country: "", state: "", localGovernment: "" });
  
  // Expert consultation form
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [submitting, setSubmitting] = useState(false);

  // PDF upload
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfCategory, setPdfCategory] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Expert management
  const [showExpertDialog, setShowExpertDialog] = useState(false);
  const [expertName, setExpertName] = useState("");
  const [expertSpec, setExpertSpec] = useState("");
  const [expertLocation, setExpertLocation] = useState("");
  const [expertPhone, setExpertPhone] = useState("");
  const [expertEmail, setExpertEmail] = useState("");
  const [expertWhatsApp, setExpertWhatsApp] = useState("");

  useEffect(() => {
    if (user) {
      loadConsultations();
      loadResources();
      loadExperts();
      loadNews();
      checkAdmin();
    }
  }, [user]);

  const checkAdmin = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .single();
    
    setIsAdmin(data?.role === 'admin');
  };

  const loadResources = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('agricultural_resources')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Generate signed URLs for each PDF
    if (data) {
      const pdfsWithSignedUrls = await Promise.all(
        data.map(async (pdf) => {
          // Skip if file_url looks like a legacy public URL
          if (pdf.file_url.includes('supabase.co/storage')) {
            return pdf;
          }
          
          // Generate signed URL (valid for 1 hour)
          const { data: signedData, error } = await supabase.storage
            .from('study-materials')
            .createSignedUrl(pdf.file_url, 3600);
          
          return {
            ...pdf,
            file_url: error ? pdf.file_url : signedData.signedUrl
          };
        })
      );
      setPdfs(pdfsWithSignedUrls);
    } else {
      setPdfs([]);
    }
    setLoading(false);
  };

  const loadExperts = async () => {
    const { data } = await supabase
      .from('agricultural_experts')
      .select('*')
      .order('location', { ascending: true });
    
    setExperts(data || []);
  };

  const loadNews = async () => {
    const { data } = await supabase
      .from('agricultural_news_feed')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(10);
    
    setNews(data || []);
  };

  const fetchAINews = async () => {
    if (!location.country) {
      toast({
        title: "Location Required",
        description: "Please select your location to fetch relevant news",
        variant: "destructive"
      });
      return;
    }

    setLoadingNews(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-agriculture-news', {
        body: { location }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Latest agricultural news loaded"
      });
      
      loadNews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch news",
        variant: "destructive"
      });
    } finally {
      setLoadingNews(false);
    }
  };

  const loadConsultations = async () => {
    const { data } = await supabase
      .from('expert_consultations')
      .select('*')
      .order('created_at', { ascending: false });
    
    setConsultations(data || []);
  };

  const handleUploadPDF = async () => {
    if (!pdfFile) {
      toast({
        title: "Missing File",
        description: "Please select a PDF file to upload",
        variant: "destructive"
      });
      return;
    }

    // Validate input
    const validation = pdfUploadSchema.safeParse({
      title: pdfTitle,
      description: pdfDescription,
      category: pdfCategory
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    setUploadingPDF(true);
    try {
      // Upload to storage
      const filePath = `${user?.id}/${Date.now()}_${pdfFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, pdfFile);

      if (uploadError) throw uploadError;

      // Save metadata to database with file path (not public URL)
      const { error: dbError } = await supabase
        .from('agricultural_resources')
        .insert({
          user_id: user?.id,
          title: pdfTitle,
          description: pdfDescription,
          category: pdfCategory,
          file_url: filePath, // Store file path instead of public URL
          file_type: pdfFile.type,
          file_size: pdfFile.size
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "PDF uploaded successfully"
      });

      setPdfFile(null);
      setPdfTitle("");
      setPdfDescription("");
      setPdfCategory("");
      setShowUploadDialog(false);
      loadResources();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingPDF(false);
    }
  };

  const handleDeletePDF = async (id: string, filePath: string) => {
    try {
      // Delete from storage using the stored file path
      if (filePath) {
        await supabase.storage.from('study-materials').remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('agricultural_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "PDF deleted successfully"
      });
      loadResources();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateExpert = async () => {
    // Validate input
    const validation = expertSchema.safeParse({
      name: expertName,
      specialization: expertSpec,
      location: expertLocation,
      phone: expertPhone,
      email: expertEmail,
      whatsapp_link: expertWhatsApp || undefined
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('agricultural_experts')
        .insert({
          name: validation.data.name,
          specialization: validation.data.specialization,
          location: validation.data.location,
          phone: validation.data.phone,
          email: validation.data.email,
          whatsapp_link: validation.data.whatsapp_link
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expert added successfully"
      });

      setExpertName("");
      setExpertSpec("");
      setExpertLocation("");
      setExpertPhone("");
      setExpertEmail("");
      setExpertWhatsApp("");
      setShowExpertDialog(false);
      loadExperts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteExpert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agricultural_experts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expert removed successfully"
      });
      loadExperts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmitConsultation = async () => {
    // Validate input
    const validation = consultationSchema.safeParse({
      subject: subject,
      description: description
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
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
                {t("resources.tabs.studyMaterials")}
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                {t("resources.tabs.newsFeed")}
              </TabsTrigger>
              <TabsTrigger value="expert" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t("resources.tabs.expertHelp")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdfs" className="space-y-4">
              {isAdmin && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Upload className="mr-2 h-4 w-4" />{t("resources.uploadPDF")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("resources.uploadPDFTitle")}</DialogTitle>
                          <DialogDescription>{t("resources.uploadPDFDescription")}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>PDF File *</Label>
                            <Input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input value={pdfTitle} onChange={(e) => setPdfTitle(e.target.value)} placeholder="Document title" />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={pdfDescription} onChange={(e) => setPdfDescription(e.target.value)} placeholder="Brief description" rows={3} />
                          </div>
                          <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select value={pdfCategory} onValueChange={setPdfCategory}>
                              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Soil Management">Soil Management</SelectItem>
                                <SelectItem value="Irrigation">Irrigation</SelectItem>
                                <SelectItem value="Crop Management">Crop Management</SelectItem>
                                <SelectItem value="Pest Control">Pest Control</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
                          <Button onClick={handleUploadPDF} disabled={uploadingPDF}>
                            {uploadingPDF ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : 'Upload'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}

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
                        <div className="flex gap-2 items-center">
                          <Badge>{pdf.category}</Badge>
                          {isAdmin && pdf.user_id === user?.id && (
                            <Button variant="destructive" size="sm" onClick={() => handleDeletePDF(pdf.id, pdf.file_url)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <a href={pdf.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full">
                          <FileText className="mr-2 h-4 w-4" />View Document
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="news" className="space-y-4">
              <Card className="border-primary/20">
                <CardContent className="pt-6 space-y-4">
                  <LocationSelector location={location} onLocationChange={setLocation} />
                  <Button onClick={fetchAINews} className="w-full" disabled={loadingNews}>
                    {loadingNews ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Fetching News...</> : <><Newspaper className="mr-2 h-4 w-4" />Fetch Latest Agricultural News</>}
                  </Button>
                </CardContent>
              </Card>

              {news.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No news available. Select your location and fetch news.
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
                            {new Date(item.published_date).toLocaleDateString()} • {item.source_name}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">{item.summary}</p>
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="link" className="p-0 h-auto">
                          Read full article <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="expert" className="space-y-6">
              {isAdmin && (
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <Dialog open={showExpertDialog} onOpenChange={setShowExpertDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Plus className="mr-2 h-4 w-4" />Add New Expert
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Agricultural Expert</DialogTitle>
                          <DialogDescription>Add a new expert to the directory</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={expertName} onChange={(e) => setExpertName(e.target.value)} placeholder="Dr. John Doe" />
                          </div>
                          <div className="space-y-2">
                            <Label>Specialization *</Label>
                            <Input value={expertSpec} onChange={(e) => setExpertSpec(e.target.value)} placeholder="Crop Pathology" />
                          </div>
                          <div className="space-y-2">
                            <Label>Location *</Label>
                            <Input value={expertLocation} onChange={(e) => setExpertLocation(e.target.value)} placeholder="North Region" />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone *</Label>
                            <Input value={expertPhone} onChange={(e) => setExpertPhone(e.target.value)} placeholder="+234-801-234-5678" />
                          </div>
                          <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input type="email" value={expertEmail} onChange={(e) => setExpertEmail(e.target.value)} placeholder="expert@example.com" />
                          </div>
                          <div className="space-y-2">
                            <Label>WhatsApp Link</Label>
                            <Input value={expertWhatsApp} onChange={(e) => setExpertWhatsApp(e.target.value)} placeholder="https://wa.me/..." />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowExpertDialog(false)}>Cancel</Button>
                          <Button onClick={handleCreateExpert}>Add Expert</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Local Agricultural Experts</CardTitle>
                  <CardDescription>Contact information for regional agricultural specialists</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {experts.map((expert) => (
                      <div key={expert.id} className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{expert.name}</h4>
                                <p className="text-sm text-muted-foreground">{expert.specialization}</p>
                                <Badge variant="secondary" className="mt-1 mb-2">{expert.location}</Badge>
                              </div>
                              {isAdmin && (
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteExpert(expert.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2 mt-3">
                              <a href={`tel:${expert.phone}`}>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                  <Phone className="mr-2 h-3 w-3" />{expert.phone}
                                </Button>
                              </a>
                              <a href={`mailto:${expert.email}`}>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                  <Mail className="mr-2 h-3 w-3" />{expert.email}
                                </Button>
                              </a>
                              {expert.whatsapp_link && (
                                <a href={expert.whatsapp_link} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700">
                                    <MessageCircle className="mr-2 h-3 w-3" />WhatsApp
                                  </Button>
                                </a>
                              )}
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
