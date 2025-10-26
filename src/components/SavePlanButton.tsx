import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

interface SavePlanButtonProps {
  planType: 'crop' | 'soil' | 'water' | 'market' | 'fertilizer' | 'pest' | 'comprehensive';
  planData: any;
  location?: any;
  defaultName?: string;
}

export const SavePlanButton = ({ planType, planData, location, defaultName }: SavePlanButtonProps) => {
  const [open, setOpen] = useState(false);
  const [planName, setPlanName] = useState(defaultName || "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: t('savePlan.missingName'),
        description: t('savePlan.enterName'),
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('saved_plans')
        .insert({
          user_id: user?.id,
          plan_type: planType,
          plan_name: planName,
          plan_data: planData,
          location: location
        });

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('savePlan.savedSuccess')
      });

      setOpen(false);
      setPlanName("");
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('savePlan.saveFailed'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Save className="mr-2 h-4 w-4" />{t('savePlan.button')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('savePlan.title')}</DialogTitle>
          <DialogDescription>
            {t('savePlan.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="planName">{t('savePlan.planName')} *</Label>
          <Input
            id="planName"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder={t('savePlan.planNamePlaceholder')}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('savePlan.saving')}</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />{t('common.save')}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};