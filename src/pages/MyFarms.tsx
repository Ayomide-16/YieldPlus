import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const MyFarms = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFarms();
    }
  }, [user]);

  const loadFarms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFarms(data);
    }
    setLoading(false);
  };

  const deleteFarm = async (id: string) => {
    const { error } = await supabase
      .from('farms')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete farm", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Farm deleted successfully" });
      loadFarms();
    }
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                My Farms
              </h1>
              <p className="text-muted-foreground">
                Manage your farm profiles and generate comprehensive plans
              </p>
            </div>
            <Button onClick={() => navigate('/comprehensive-plan')}>
              <Plus className="mr-2 h-4 w-4" /> Create New Farm
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>
            ) : farms.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No farms created yet</p>
                  <Button onClick={() => navigate('/comprehensive-plan')}>
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Farm
                  </Button>
                </CardContent>
              </Card>
            ) : (
              farms.map(farm => (
                <Card key={farm.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{farm.farm_name}</CardTitle>
                        <CardDescription>
                          {farm.location.state}, {farm.location.country}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteFarm(farm.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-medium">{farm.total_size} plots</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Soil Type</p>
                        <p className="font-medium capitalize">{farm.soil_type || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Water Source</p>
                        <p className="font-medium capitalize">{farm.water_source || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Crops</p>
                        <p className="font-medium">{farm.crops?.length || 0} types</p>
                      </div>
                    </div>
                    <Button variant="secondary" className="w-full mt-4" onClick={() => navigate('/comprehensive-plan')}>
                      Generate Plan
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyFarms;
