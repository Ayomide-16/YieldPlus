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
import { TrendingUp, Plus, DollarSign } from "lucide-react";

export function SmartPaymentContracts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    contract_type: '',
    amount: '',
    buyer_name: '',
    terms_description: ''
  });

  useEffect(() => {
    loadContracts();
  }, [user]);

  const loadContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_contracts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('payment_contracts')
        .insert({
          user_id: user?.id,
          contract_type: formData.contract_type,
          amount: parseFloat(formData.amount),
          parties: {
            seller: user?.email,
            buyer: formData.buyer_name
          },
          terms: {
            description: formData.terms_description
          },
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Smart contract created!');
      setShowForm(false);
      setFormData({
        contract_type: '',
        amount: '',
        buyer_name: '',
        terms_description: ''
      });
      
      loadContracts();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  const getContractTypeLabel = (type: string) => {
    const labels: any = {
      yield_based: 'Yield-Based Payment',
      delivery: 'Delivery Payment',
      insurance: 'Insurance Payout',
      escrow: 'Escrow Service'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Smart Payment Contracts</CardTitle>
              <CardDescription>
                Automate payments based on conditions like yield, delivery, or weather
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contract Type</Label>
                  <Select
                    value={formData.contract_type}
                    onValueChange={(value) => setFormData({ ...formData, contract_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yield_based">Yield-Based Payment</SelectItem>
                      <SelectItem value="delivery">Delivery Payment</SelectItem>
                      <SelectItem value="insurance">Insurance Payout</SelectItem>
                      <SelectItem value="escrow">Escrow Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount (HBAR)</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="1000"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Buyer/Partner Name</Label>
                  <Input
                    value={formData.buyer_name}
                    onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                    placeholder="Name or organization"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contract Terms</Label>
                <Textarea
                  value={formData.terms_description}
                  onChange={(e) => setFormData({ ...formData, terms_description: e.target.value })}
                  placeholder="Describe payment conditions and terms..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Contract'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Contracts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts.map((contract) => (
          <Card key={contract.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {getContractTypeLabel(contract.contract_type)}
                  </CardTitle>
                  <CardDescription>
                    {contract.parties?.buyer || 'Unknown buyer'}
                  </CardDescription>
                </div>
                <Badge variant={
                  contract.status === 'completed' ? 'default' :
                  contract.status === 'active' ? 'secondary' :
                  contract.status === 'cancelled' ? 'destructive' :
                  'outline'
                }>
                  {contract.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">
                  {contract.amount.toLocaleString()} {contract.currency}
                </span>
              </div>

              {contract.terms?.description && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Terms:</p>
                  <p className="line-clamp-2">{contract.terms.description}</p>
                </div>
              )}

              <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>Created: {new Date(contract.created_at).toLocaleDateString()}</span>
                {contract.execution_date && (
                  <span>Executed: {new Date(contract.execution_date).toLocaleDateString()}</span>
                )}
              </div>

              {contract.hedera_contract_id && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-mono">Contract ID: {contract.hedera_contract_id}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {contracts.length === 0 && !showForm && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No smart contracts yet</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Contract
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
