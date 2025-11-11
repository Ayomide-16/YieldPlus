import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceData {
  crop: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  recordCount: number;
  trend: 'up' | 'down' | 'stable';
}

export const PriceComparisonTool = () => {
  const [selectedState, setSelectedState] = useState<string>("");
  const [states, setStates] = useState<string[]>([]);
  const [crops, setCrops] = useState<string[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load states on mount
  const loadStates = async () => {
    const { data, error } = await supabase
      .from('market_prices')
      .select('state')
      .order('state');
    
    if (!error && data) {
      const uniqueStates = [...new Set(data.map(d => d.state))];
      setStates(uniqueStates);
    }
  };

  // Load crops for selected state
  const loadCrops = async (state: string) => {
    const { data, error } = await supabase
      .from('market_prices')
      .select('food_item')
      .eq('state', state)
      .order('food_item');
    
    if (!error && data) {
      const uniqueCrops = [...new Set(data.map(d => d.food_item))];
      setCrops(uniqueCrops);
    }
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCrops([]);
    setComparisonData([]);
    loadCrops(state);
  };

  const toggleCropSelection = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    );
  };

  const comparePrices = async () => {
    if (selectedCrops.length < 2) {
      toast({
        title: "Select at least 2 crops",
        description: "Please select at least two crops to compare",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const comparisonResults: PriceData[] = [];

    for (const crop of selectedCrops) {
      const { data, error } = await supabase
        .from('market_prices')
        .select('uprice, date')
        .eq('state', selectedState)
        .eq('food_item', crop)
        .order('date', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        const prices = data.map(d => d.uprice);
        const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Calculate trend (comparing recent vs older prices)
        const recentAvg = data.slice(0, 10).reduce((sum, d) => sum + d.uprice, 0) / Math.min(10, data.length);
        const olderAvg = data.slice(-10).reduce((sum, d) => sum + d.uprice, 0) / Math.min(10, data.length);
        const trend = recentAvg > olderAvg * 1.05 ? 'up' : recentAvg < olderAvg * 0.95 ? 'down' : 'stable';

        comparisonResults.push({
          crop,
          avgPrice: Number(avgPrice.toFixed(2)),
          minPrice: Number(minPrice.toFixed(2)),
          maxPrice: Number(maxPrice.toFixed(2)),
          recordCount: data.length,
          trend
        });
      }
    }

    setComparisonData(comparisonResults);
    setLoading(false);

    if (comparisonResults.length === 0) {
      toast({
        title: "No data found",
        description: "No market data available for the selected crops",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compare Crop Varieties</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Select State</Label>
            <Select value={selectedState} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a state" />
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
              <Label>Select Crops to Compare (min 2)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {crops.map(crop => (
                  <Button
                    key={crop}
                    variant={selectedCrops.includes(crop) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCropSelection(crop)}
                  >
                    {crop}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={comparePrices} 
            disabled={loading || selectedCrops.length < 2}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Compare Prices
          </Button>
        </div>
      </Card>

      {comparisonData.length > 0 && (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Price Comparison Results</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="crop" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgPrice" fill="hsl(var(--primary))" name="Average Price" />
                <Bar dataKey="minPrice" fill="hsl(var(--secondary))" name="Min Price" />
                <Bar dataKey="maxPrice" fill="hsl(var(--accent))" name="Max Price" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {comparisonData.map(data => (
              <Card key={data.crop} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{data.crop}</h4>
                  <div className="flex items-center gap-1">
                    {data.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {data.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {data.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average:</span>
                    <span className="font-medium">₦{data.avgPrice}/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Range:</span>
                    <span>₦{data.minPrice} - ₦{data.maxPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data points:</span>
                    <span>{data.recordCount}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
