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
import { FileCheck, Plus, Shield } from "lucide-react";

export function FarmDataRegistry() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    record_type: '',
    data_summary: '',
    visibility: 'private'
  });

  useEffect(() => {
    loadRecords();
  }, [user]);

  const loadRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('farm_data_registry')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error loading records:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a hash of the data
      const dataHash = btoa(formData.data_summary).slice(0, 32);

      const { data, error } = await supabase
        .from('farm_data_registry')
        .insert({
          user_id: user?.id,
          record_type: formData.record_type,
          data_hash: dataHash,
          data_summary: { summary: formData.data_summary },
          visibility: formData.visibility,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Farm data registered on blockchain!');
      setShowForm(false);
      setFormData({
        record_type: '',
        data_summary: '',
        visibility: 'private'
      });
      
      loadRecords();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to register data');
    } finally {
      setLoading(false);
    }
  };

  const getRecordTypeLabel = (type: string) => {
    const labels: any = {
      soil_analysis: 'Soil Analysis',
      climate_data: 'Climate Data',
      harvest_record: 'Harvest Record',
      certification: 'Certification',
      practice: 'Farming Practice'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Farm Data Registry</CardTitle>
              <CardDescription>
                Store verified farm data on-chain for certifications and proof of practices
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Register Data
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Record Type</Label>
                <Select
                  value={formData.record_type}
                  onValueChange={(value) => setFormData({ ...formData, record_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soil_analysis">Soil Analysis</SelectItem>
                    <SelectItem value="climate_data">Climate Data</SelectItem>
                    <SelectItem value="harvest_record">Harvest Record</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="practice">Farming Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Summary</Label>
                <Textarea
                  value={formData.data_summary}
                  onChange={(e) => setFormData({ ...formData, data_summary: e.target.value })}
                  placeholder="Enter the data you want to register on-chain..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="certified_only">Certified Organizations Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Registering...' : 'Register on Blockchain'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Records List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((record) => (
          <Card key={record.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {getRecordTypeLabel(record.record_type)}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs mt-1">
                    Hash: {record.data_hash}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant={
                    record.verification_status === 'verified' ? 'default' : 
                    record.verification_status === 'disputed' ? 'destructive' : 
                    'secondary'
                  }>
                    {record.verification_status}
                  </Badge>
                  {record.visibility === 'public' && (
                    <Badge variant="outline" className="text-xs">
                      Public
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {record.data_summary?.summary && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-2">Summary:</p>
                  <p className="line-clamp-3">{record.data_summary.summary}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Shield className="w-3 h-3" />
                <span>Registered: {new Date(record.created_at).toLocaleDateString()}</span>
              </div>

              {record.hedera_transaction_id && (
                <div className="text-xs text-muted-foreground">
                  <p>Hedera TX: {record.hedera_transaction_id}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {records.length === 0 && !showForm && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileCheck className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No registered data yet</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Register First Data
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
