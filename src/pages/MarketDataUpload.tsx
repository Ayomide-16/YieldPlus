import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MarketDataUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ inserted: number; total: number; errors?: string[] } | null>(null);

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split('\t').map(h => h.trim());
    
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      if (values.length < 9) continue; // Skip incomplete rows
      
      // Parse date from DD/MM/YYYY to YYYY-MM-DD
      const dateParts = values[0].split('/');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      
      records.push({
        date: formattedDate,
        state: values[1].trim(),
        lga: values[2].trim(),
        outlet_type: values[3].trim(),
        sector: values[5].trim(),
        food_item: values[6].trim(),
        price_category: values[7].trim(),
        uprice: parseFloat(values[8].trim())
      });
    }
    
    return records;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      // Read file
      const text = await file.text();
      const records = parseCSV(text);
      
      if (records.length === 0) {
        toast.error("No valid records found in CSV");
        setUploading(false);
        return;
      }

      toast.info(`Parsed ${records.length.toLocaleString()} records. Starting upload...`);

      // Upload in batches of 5000 to avoid timeouts
      const BATCH_SIZE = 5000;
      let totalInserted = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await supabase.functions.invoke('bulk-insert-market-prices', {
          body: { records: batch }
        });

        if (response.error) {
          throw response.error;
        }

        if (response.data?.errors) {
          allErrors.push(...response.data.errors);
        }

        totalInserted += response.data?.inserted || 0;
        setProgress(Math.round((totalInserted / records.length) * 100));
        
        toast.success(`Uploaded ${totalInserted.toLocaleString()} / ${records.length.toLocaleString()} records`);
      }

      setResult({
        inserted: totalInserted,
        total: records.length,
        errors: allErrors.length > 0 ? allErrors : undefined
      });

      toast.success(`Successfully uploaded ${totalInserted.toLocaleString()} records!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Market Data Upload</CardTitle>
            <CardDescription>
              Upload your historical market price CSV file (up to 100MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>CSV Format Requirements:</strong>
                <ul className="list-disc list-inside mt-2 text-sm">
                  <li>Columns: Date, State, LGA, Outlet Type, Country, Sector, Food Item, Price Category, UPRICE</li>
                  <li>Date format: DD/MM/YYYY (e.g., 27/11/2024)</li>
                  <li>Tab-separated values</li>
                  <li>First row should contain headers</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
                disabled={uploading}
              />
              <label htmlFor="csv-upload">
                <Button
                  variant="outline"
                  disabled={uploading}
                  onClick={() => document.getElementById('csv-upload')?.click()}
                >
                  Select CSV File
                </Button>
              </label>
              {file && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {result && (
              <Alert className={result.errors ? "border-destructive" : "border-green-500"}>
                {result.errors ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      <strong>Upload Complete:</strong> {result.inserted.toLocaleString()} / {result.total.toLocaleString()} records inserted
                    </p>
                    {result.errors && (
                      <details className="text-sm">
                        <summary className="cursor-pointer">View Errors ({result.errors.length})</summary>
                        <ul className="list-disc list-inside mt-2 max-h-40 overflow-y-auto">
                          {result.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? 'Uploading...' : 'Upload Market Data'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketDataUpload;
