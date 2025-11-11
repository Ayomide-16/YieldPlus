import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PriceAlert {
  id: string;
  crop: string;
  targetPrice: number;
  condition: 'above' | 'below';
  state: string;
  active: boolean;
  created_at: string;
}

export const PriceAlertSystem = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [states, setStates] = useState<string[]>([]);
  const [crops, setCrops] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadStates();
    loadAlerts();
    
    // Check alerts every 5 minutes
    const interval = setInterval(checkAlerts, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadStates = async () => {
    const { data } = await supabase
      .from('market_prices')
      .select('state')
      .order('state');
    
    if (data) {
      setStates([...new Set(data.map(d => d.state))]);
    }
  };

  const loadCropsForState = async (state: string) => {
    const { data } = await supabase
      .from('market_prices')
      .select('food_item')
      .eq('state', state)
      .order('food_item');
    
    if (data) {
      setCrops([...new Set(data.map(d => d.food_item))]);
    }
  };

  const loadAlerts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load from localStorage (in production, use a database table)
    const stored = localStorage.getItem(`price_alerts_${user.id}`);
    if (stored) {
      setAlerts(JSON.parse(stored));
    }
  };

  const saveAlerts = (newAlerts: PriceAlert[]) => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        localStorage.setItem(`price_alerts_${user.id}`, JSON.stringify(newAlerts));
      }
    });
  };

  const createAlert = () => {
    if (!selectedCrop || !targetPrice || !selectedState) {
      toast({
        title: "Missing information",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    const newAlert: PriceAlert = {
      id: crypto.randomUUID(),
      crop: selectedCrop,
      targetPrice: parseFloat(targetPrice),
      condition,
      state: selectedState,
      active: true,
      created_at: new Date().toISOString()
    };

    const updated = [...alerts, newAlert];
    setAlerts(updated);
    saveAlerts(updated);

    toast({
      title: "Alert created",
      description: `You'll be notified when ${selectedCrop} price goes ${condition} ₦${targetPrice}`,
    });

    // Reset form
    setSelectedCrop("");
    setTargetPrice("");
  };

  const deleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
    
    toast({
      title: "Alert deleted",
      description: "Price alert has been removed"
    });
  };

  const toggleAlert = (id: string) => {
    const updated = alerts.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    );
    setAlerts(updated);
    saveAlerts(updated);
  };

  const checkAlerts = async () => {
    for (const alert of alerts.filter(a => a.active)) {
      const { data } = await supabase
        .from('market_prices')
        .select('uprice')
        .eq('state', alert.state)
        .eq('food_item', alert.crop)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const currentPrice = data.uprice;
        const triggered = alert.condition === 'above' 
          ? currentPrice >= alert.targetPrice 
          : currentPrice <= alert.targetPrice;

        if (triggered) {
          toast({
            title: "🔔 Price Alert Triggered!",
            description: `${alert.crop} is now ₦${currentPrice}/kg (${alert.condition} your target of ₦${alert.targetPrice})`,
            duration: 10000,
          });

          // Deactivate the alert after triggering
          toggleAlert(alert.id);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Create Price Alert</h3>
        
        <div className="space-y-4">
          <div>
            <Label>State</Label>
            <Select value={selectedState} onValueChange={(val) => {
              setSelectedState(val);
              loadCropsForState(val);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedState && (
            <div>
              <Label>Crop</Label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {crops.map(crop => (
                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Condition</Label>
            <Select value={condition} onValueChange={(val: 'above' | 'below') => setCondition(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Price goes above</SelectItem>
                <SelectItem value="below">Price goes below</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Target Price (₦/kg)</Label>
            <Input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Enter target price"
            />
          </div>

          <Button onClick={createAlert} className="w-full">
            <Bell className="mr-2 h-4 w-4" />
            Create Alert
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
        
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No alerts created yet</p>
        ) : (
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{alert.crop} ({alert.state})</p>
                  <p className="text-sm text-muted-foreground">
                    Alert when price goes {alert.condition} ₦{alert.targetPrice}/kg
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleAlert(alert.id)}
                  >
                    {alert.active ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
