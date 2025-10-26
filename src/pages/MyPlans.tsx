import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const MyPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  const loadPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPlans(data);
    }
    setLoading(false);
  };

  const deletePlan = async (id: string) => {
    const { error } = await supabase
      .from('saved_plans')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete plan", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Plan deleted successfully" });
      loadPlans();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t('myPlans.authRequired')}</CardTitle>
            <CardDescription>{t('myPlans.signInPrompt')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/auth')}>{t('auth.signIn')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plansByType = {
    crop: plans.filter(p => p.plan_type === 'crop'),
    soil: plans.filter(p => p.plan_type === 'soil'),
    water: plans.filter(p => p.plan_type === 'water'),
    market: plans.filter(p => p.plan_type === 'market'),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              {t('myPlans.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('myPlans.subtitle')}
            </p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">{t('myPlans.allPlans')} ({plans.length})</TabsTrigger>
              <TabsTrigger value="crop">{t('myPlans.cropPlans')} ({plansByType.crop.length})</TabsTrigger>
              <TabsTrigger value="soil">{t('myPlans.soilPlans')} ({plansByType.soil.length})</TabsTrigger>
              <TabsTrigger value="water">{t('myPlans.waterPlans')} ({plansByType.water.length})</TabsTrigger>
              <TabsTrigger value="market">{t('myPlans.marketPlans')} ({plansByType.market.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <Card><CardContent className="p-8 text-center">{t('common.loading')}</CardContent></Card>
              ) : plans.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">{t('myPlans.noPlans')}</p>
                    <Button onClick={() => navigate('/crop-planner')}>{t('myPlans.createFirst')}</Button>
                  </CardContent>
                </Card>
              ) : (
                plans.map(plan => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{plan.plan_name}</CardTitle>
                          <CardDescription>{new Date(plan.created_at).toLocaleDateString()}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => deletePlan(plan.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>

            {Object.entries(plansByType).map(([type, typePlans]) => (
              <TabsContent key={type} value={type} className="space-y-4">
                {typePlans.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      No {type} plans saved yet
                    </CardContent>
                  </Card>
                ) : (
                  typePlans.map(plan => (
                    <Card key={plan.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{plan.plan_name}</CardTitle>
                            <CardDescription>{new Date(plan.created_at).toLocaleDateString()}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => deletePlan(plan.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MyPlans;
