import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RefreshCw, Database, Calendar, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface SyncHistory {
  id: string;
  sync_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  records_processed: number;
  records_inserted: number;
  records_skipped: number;
  error_message: string | null;
  dataset_source_url: string | null;
  triggered_by: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [stats, setStats] = useState({ totalRecords: 0, lastSync: null as string | null });

  useEffect(() => {
    checkAdminAccess();
    loadSyncHistory();
    loadStats();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in");
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        toast.error("Admin access required");
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadSyncHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('data_sync_history')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSyncHistory(data || []);
    } catch (error) {
      console.error('Error loading sync history:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Get total records count
      const { count } = await supabase
        .from('market_prices')
        .select('*', { count: 'exact', head: true });

      // Get last successful sync
      const { data: lastSync } = await supabase
        .from('data_sync_history')
        .select('completed_at')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      setStats({
        totalRecords: count || 0,
        lastSync: lastSync?.completed_at || null
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 2000);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-nbs-data', {
        body: {}
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('Sync error:', error);
        throw error;
      }

      setProgress(100);
      toast.success(`Sync completed! Inserted: ${data.inserted}, Skipped: ${data.skipped}`);
      
      // Reload data
      await Promise.all([loadSyncHistory(), loadStats()]);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Manual sync failed:', error);
      toast.error(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setSyncing(false);
      setProgress(0);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage NBS market data synchronization</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <p className="text-3xl font-bold">{stats.totalRecords.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <p className="text-sm">{formatDate(stats.lastSync)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Source</CardTitle>
            </CardHeader>
            <CardContent>
              <a 
                href="https://www.nigeriafoodpricetracking.ng/dashboard.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline text-sm"
              >
                NBS Dashboard <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Manual Sync Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Manual Data Sync</CardTitle>
            <CardDescription>
              Fetch and update market prices from the National Bureau of Statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Syncing data...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <Alert>
              <AlertDescription>
                This will download the latest dataset from NBS, validate records, and update the database.
                Duplicate records will be automatically skipped.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleManualSync}
              disabled={syncing}
              className="w-full"
              size="lg"
            >
              {syncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Start Manual Sync
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sync History */}
        <Card>
          <CardHeader>
            <CardTitle>Sync History</CardTitle>
            <CardDescription>Recent data synchronization attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No sync history yet</p>
              ) : (
                syncHistory.map((sync) => (
                  <div key={sync.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(sync.status)}
                      <div>
                        <p className="font-medium capitalize">{sync.status}</p>
                        <p className="text-sm text-muted-foreground">
                          Started: {formatDate(sync.started_at)}
                        </p>
                        {sync.completed_at && (
                          <p className="text-sm text-muted-foreground">
                            Completed: {formatDate(sync.completed_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {sync.status === 'completed' && (
                        <>
                          <Badge variant="outline" className="mb-1">
                            {sync.records_inserted} inserted
                          </Badge>
                          <br />
                          <Badge variant="secondary">
                            {sync.records_skipped} skipped
                          </Badge>
                        </>
                      )}
                      {sync.status === 'failed' && sync.error_message && (
                        <p className="text-xs text-destructive max-w-xs truncate">
                          {sync.error_message}
                        </p>
                      )}
                      {sync.status === 'running' && (
                        <Badge variant="outline">In Progress</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
