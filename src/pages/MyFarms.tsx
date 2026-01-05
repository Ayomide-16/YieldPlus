import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Plus, Sprout, Calendar, MapPin, Droplets, ChevronRight, Archive, PlayCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ActiveFarm {
  id: string;
  farm_name: string;
  location: { country: string; state: string; lga?: string };
  farm_size: number;
  size_unit: string;
  crop: string;
  crop_variety?: string;
  planting_date: string;
  expected_harvest_date?: string;
  current_growth_stage: string;
  status: string;
  water_access: string;
  created_at: string;
}

interface LegacyFarm {
  id: string;
  farm_name: string;
  location: { country: string; state: string };
  total_size: number;
  soil_type?: string;
  water_source?: string;
  crops?: string[];
  created_at: string;
}

const MyFarms = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeFarms, setActiveFarms] = useState<ActiveFarm[]>([]);
  const [legacyFarms, setLegacyFarms] = useState<LegacyFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (user) {
      loadFarms();
    }
  }, [user]);

  const loadFarms = async () => {
    setLoading(true);

    // Load active farms (new lifecycle system)
    const { data: activeData, error: activeError } = await supabase
      .from('active_farms')
      .select('*')
      .order('created_at', { ascending: false });

    if (!activeError && activeData) {
      setActiveFarms(activeData as unknown as ActiveFarm[]);
    }

    // Load legacy farms
    const { data: legacyData, error: legacyError } = await supabase
      .from('farms')
      .select('*')
      .order('created_at', { ascending: false });

    if (!legacyError && legacyData) {
      setLegacyFarms(legacyData as LegacyFarm[]);
    }

    setLoading(false);
  };

  const deleteActiveFarm = async (id: string) => {
    const { error } = await supabase
      .from('active_farms')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete farm", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Farm deleted" });
      loadFarms();
    }
  };

  const deleteLegacyFarm = async (id: string) => {
    const { error } = await supabase
      .from('farms')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete farm", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Farm deleted" });
      loadFarms();
    }
  };

  const calculateDaysSincePlanting = (plantingDate: string) => {
    const planting = new Date(plantingDate);
    const today = new Date();
    return Math.floor((today.getTime() - planting.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateProgress = (plantingDate: string, harvestDate?: string) => {
    const planting = new Date(plantingDate);
    const harvest = harvestDate ? new Date(harvestDate) : new Date(planting.getTime() + 90 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const total = harvest.getTime() - planting.getTime();
    const elapsed = today.getTime() - planting.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your farms</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                My Farms
              </h1>
              <p className="text-muted-foreground">
                Track your active farms and view historical data
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/create-farm')} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" /> Start New Farm
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                Active Farms ({activeFarms.filter(f => f.status === 'active').length})
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Archived ({activeFarms.filter(f => f.status !== 'active').length + legacyFarms.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Farms Tab */}
            <TabsContent value="active">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : activeFarms.filter(f => f.status === 'active').length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Sprout className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Farms</h3>
                    <p className="text-muted-foreground mb-4 text-center max-w-md">
                      Start tracking your farm with our intelligent farming assistant. Get daily recommendations based on weather and your crop's needs.
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={() => navigate('/create-farm')} className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" /> Create New Farm
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/comprehensive-plan')}>
                        I Already Planted
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeFarms.filter(f => f.status === 'active').map((farm, idx) => {
                    const daysSincePlanting = calculateDaysSincePlanting(farm.planting_date);
                    const progress = calculateProgress(farm.planting_date, farm.expected_harvest_date);

                    return (
                      <motion.div
                        key={farm.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={() => navigate(`/farm/${farm.id}`)}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2 group-hover:text-green-600 transition-colors">
                                  <Sprout className="h-5 w-5 text-green-500" />
                                  {farm.farm_name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {farm.location.state}{farm.location.lga ? `, ${farm.location.lga}` : ''}
                                </CardDescription>
                              </div>
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 capitalize">
                                {farm.crop}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Progress bar */}
                            <div>
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Day {daysSincePlanting}</span>
                                <span>{progress.toFixed(0)}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">Stage</p>
                                <p className="font-medium capitalize">{farm.current_growth_stage}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Size</p>
                                <p className="font-medium">{farm.farm_size} {farm.size_unit}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Planted</p>
                                <p className="font-medium">{new Date(farm.planting_date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">Water</p>
                                <p className="font-medium capitalize">{farm.water_access}</p>
                              </div>
                            </div>

                            <Button variant="secondary" className="w-full group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                              View Dashboard
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Archived Tab */}
            <TabsContent value="archived">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Archived active farms */}
                  {activeFarms.filter(f => f.status !== 'active').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Completed Seasons</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeFarms.filter(f => f.status !== 'active').map(farm => (
                          <Card key={farm.id} className="opacity-75">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base">{farm.farm_name}</CardTitle>
                                  <CardDescription>{farm.crop} • {farm.location.state}</CardDescription>
                                </div>
                                <Badge variant="outline">{farm.status}</Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <Button variant="ghost" size="sm" onClick={() => deleteActiveFarm(farm.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legacy farms */}
                  {legacyFarms.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Legacy Farm Profiles</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {legacyFarms.map(farm => (
                          <Card key={farm.id} className="opacity-75">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base">{farm.farm_name}</CardTitle>
                                  <CardDescription>
                                    {farm.location.state}, {farm.location.country}
                                  </CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => deleteLegacyFarm(farm.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Size:</span> {farm.total_size} plots
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Soil:</span> {farm.soil_type || 'N/A'}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeFarms.filter(f => f.status !== 'active').length === 0 && legacyFarms.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No archived farms yet</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MyFarms;
