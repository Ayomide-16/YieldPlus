import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Plus, CheckCircle, ArrowRight } from "lucide-react";

const STAGES = [
  { value: 'planting', label: 'Planting', color: 'bg-blue-500' },
  { value: 'growing', label: 'Growing', color: 'bg-green-500' },
  { value: 'harvesting', label: 'Harvesting', color: 'bg-yellow-500' },
  { value: 'processing', label: 'Processing', color: 'bg-orange-500' },
  { value: 'transport', label: 'Transport', color: 'bg-purple-500' },
  { value: 'market', label: 'Market', color: 'bg-pink-500' }
];

export function SupplyChainTracker() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    crop_type: '',
    batch_id: '',
    current_stage: '',
    location: ''
  });

  useEffect(() => {
    loadBatches();
  }, [user]);

  const loadBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('supply_chain_records')
        .select('*')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      // Group by batch_id
      const grouped = (data || []).reduce((acc: any, record: any) => {
        if (!acc[record.batch_id]) {
          acc[record.batch_id] = [];
        }
        acc[record.batch_id].push(record);
        return acc;
      }, {});

      setBatches(Object.entries(grouped).map(([batch_id, records]: any) => ({
        batch_id,
        records: records.sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
        current_stage: records[records.length - 1].current_stage,
        crop_type: records[0].crop_type
      })));
    } catch (error) {
      console.error('Error loading batches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('supply_chain_records')
        .insert({
          user_id: user?.id,
          crop_type: formData.crop_type,
          batch_id: formData.batch_id || `BATCH-${Date.now()}`,
          current_stage: formData.current_stage,
          location: { name: formData.location },
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Supply chain record created!');
      setShowForm(false);
      setFormData({
        crop_type: '',
        batch_id: '',
        current_stage: '',
        location: ''
      });
      
      loadBatches();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  const getStageInfo = (stage: string) => {
    return STAGES.find(s => s.value === stage) || STAGES[0];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Supply Chain Tracking</CardTitle>
              <CardDescription>
                Track your crops from farm to market with blockchain-verified records
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Crop Type</Label>
                  <Input
                    value={formData.crop_type}
                    onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                    placeholder="e.g., Tomatoes"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Batch ID (Optional)</Label>
                  <Input
                    value={formData.batch_id}
                    onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                    placeholder="Auto-generated if empty"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Current Stage</Label>
                  <Select
                    value={formData.current_stage}
                    onValueChange={(value) => setFormData({ ...formData, current_stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map(stage => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Current location"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Record'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Batches List */}
      <div className="space-y-4">
        {batches.map((batch) => {
          const stageInfo = getStageInfo(batch.current_stage);
          return (
            <Card key={batch.batch_id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{batch.crop_type}</CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {batch.batch_id}
                    </CardDescription>
                  </div>
                  <Badge className={stageInfo.color}>
                    {stageInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    {STAGES.map((stage, idx) => {
                      const isCompleted = batch.records.some((r: any) => r.current_stage === stage.value);
                      const isCurrent = batch.current_stage === stage.value;
                      
                      return (
                        <div key={stage.value} className="flex items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted || isCurrent ? stage.color : 'bg-gray-200'
                          } text-white`}>
                            {isCompleted && <CheckCircle className="w-5 h-5" />}
                          </div>
                          {idx < STAGES.length - 1 && (
                            <div className={`flex-1 h-1 ${
                              isCompleted ? stage.color : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Records Timeline */}
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-semibold">Record History:</p>
                    {batch.records.map((record: any, idx: number) => (
                      <div key={record.id} className="flex items-start gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getStageInfo(record.current_stage).color}`} />
                        <div className="flex-1">
                          <p className="font-medium">{getStageInfo(record.current_stage).label}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.timestamp).toLocaleString()}
                          </p>
                          {record.location?.name && (
                            <p className="text-xs text-muted-foreground">
                              📍 {record.location.name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {batches.length === 0 && !showForm && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No supply chain records yet</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Record
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
