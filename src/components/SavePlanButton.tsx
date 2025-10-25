import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: "Missing Name",
        description: "Please enter a name for your plan",
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
        title: "Success",
        description: "Plan saved successfully"
      });

      setOpen(false);
      setPlanName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save plan",
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
          <Save className="mr-2 h-4 w-4" />Save Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your Plan</DialogTitle>
          <DialogDescription>
            Give your plan a name so you can easily find it later
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="planName">Plan Name *</Label>
          <Input
            id="planName"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g., Spring 2025 Maize Plan"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Save</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};