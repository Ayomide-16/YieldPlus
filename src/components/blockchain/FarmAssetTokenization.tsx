import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Coins, Plus, TrendingUp } from "lucide-react";

export function FarmAssetTokenization() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    asset_type: '',
    asset_name: '',
    description: '',
    total_value: '',
    total_supply: '',
    farm_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('tokenized_farm_assets')
        .insert({
          user_id: user?.id,
          asset_type: formData.asset_type,
          asset_name: formData.asset_name,
          description: formData.description,
          total_value: parseFloat(formData.total_value),
          total_supply: parseFloat(formData.total_supply),
          available_supply: parseFloat(formData.total_supply),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Asset created! Tokenization in progress...');
      setShowForm(false);
      setFormData({
        asset_type: '',
        asset_name: '',
        description: '',
        total_value: '',
        total_supply: '',
        farm_id: ''
      });
      
      loadAssets();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('tokenized_farm_assets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadAssets();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Farm Asset Tokenization</CardTitle>
              <CardDescription>
                Convert your farm assets into tradeable tokens for fractional ownership
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Tokenize Asset
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Select
                    value={formData.asset_type}
                    onValueChange={(value) => setFormData({ ...formData, asset_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="land">Farm Land</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="harvest">Expected Harvest</SelectItem>
                      <SelectItem value="livestock">Livestock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Asset Name</Label>
                  <Input
                    value={formData.asset_name}
                    onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                    placeholder="e.g., North Field 5 Acres"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Value (USD)</Label>
                  <Input
                    type="number"
                    value={formData.total_value}
                    onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
                    placeholder="10000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Number of Tokens</Label>
                  <Input
                    type="number"
                    value={formData.total_supply}
                    onChange={(e) => setFormData({ ...formData, total_supply: e.target.value })}
                    placeholder="1000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your asset..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Tokenized Asset'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Assets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((asset) => (
          <Card key={asset.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{asset.asset_name}</CardTitle>
                  <CardDescription className="capitalize">{asset.asset_type}</CardDescription>
                </div>
                <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                  {asset.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-semibold">${asset.total_value.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Supply:</span>
                <span className="font-semibold">{asset.total_supply} tokens</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available:</span>
                <span className="font-semibold">{asset.available_supply} tokens</span>
              </div>
              {asset.token_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Token ID:</span>
                  <span className="font-mono text-xs">{asset.token_id}</span>
                </div>
              )}
              {asset.description && (
                <p className="text-sm text-muted-foreground pt-2 border-t">
                  {asset.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {assets.length === 0 && !showForm && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Coins className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tokenized assets yet</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Asset
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
