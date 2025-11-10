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

  const generateSampleCSV = () => {
    const sampleData = `Date\tState\tLGA\tOutlet Type\tCountry\tSector\tFood Item\tPrice Category\tUPRICE
16/05/2025\tRIVERS\tAHOADA EAST\tRoadSide shops street vendors\tNigeria\tUrban\tMaize yellow\tRetail\t1562.5
16/05/2025\tABIA\tUKWA EAST\tOpen air or covered market\tNigeria\tRural\tMaize yellow\tRetail\t1875`;
    
    const blob = new Blob([sampleData], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_market_data.tsv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Sample file downloaded!");
  };

  const parseCSV = (text: string): any[] => {
    console.log('=== CSV PARSING DEBUG START ===');
    console.log('Raw text length:', text.length);
    console.log('First 300 characters:', JSON.stringify(text.substring(0, 300)));
    
    // Remove BOM if present
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
      console.log('BOM removed');
    }
    
    // Split into lines - handle all line ending types
    const lines = text.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0);
    
    console.log(`Total non-empty lines: ${lines.length}`);
    
    if (lines.length < 2) {
      console.error('CSV must have at least 2 lines (header + 1 data row)');
      toast.error('CSV file must have at least a header row and one data row');
      return [];
    }
    
    // Detect separator from header line
    const headerLine = lines[0];
    const tabCount = (headerLine.match(/\t/g) || []).length;
    const commaCount = (headerLine.match(/,/g) || []).length;
    const separator = tabCount > commaCount ? '\t' : ',';
    
    console.log('Header line:', headerLine);
    console.log(`Detected separator: ${separator === '\t' ? 'TAB' : 'COMMA'} (tabs: ${tabCount}, commas: ${commaCount})`);
    
    const headerColumns = headerLine.split(separator);
    console.log(`Header has ${headerColumns.length} columns:`, headerColumns.map(h => h.trim()));
    
    // Show first 3 data lines for debugging
    for (let i = 1; i <= Math.min(3, lines.length - 1); i++) {
      const cols = lines[i].split(separator);
      console.log(`Data line ${i} (${cols.length} columns):`, cols);
    }
    
    const records = [];
    const errors: string[] = [];
    let skippedLines = 0;
    
    // Start from line 1 (skip header at line 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        const values = line.split(separator);
        
        // Must have at least 9 columns
        if (values.length < 9) {
          skippedLines++;
          if (errors.length < 10) {
            errors.push(`Line ${i}: Only ${values.length} columns (expected 9)`);
          }
          continue;
        }
        
        // Extract and validate date (column 0)
        const dateStr = values[0].trim();
        if (!dateStr) {
          skippedLines++;
          if (errors.length < 10) errors.push(`Line ${i}: Empty date`);
          continue;
        }
        
        // Parse DD/MM/YYYY format
        const dateParts = dateStr.split('/');
        if (dateParts.length !== 3) {
          skippedLines++;
          if (errors.length < 10) errors.push(`Line ${i}: Invalid date format "${dateStr}" (expected DD/MM/YYYY)`);
          continue;
        }
        
        const day = dateParts[0].padStart(2, '0');
        const month = dateParts[1].padStart(2, '0');
        const year = dateParts[2];
        
        // Validate date components
        if (year.length !== 4 || isNaN(Number(year)) || isNaN(Number(month)) || isNaN(Number(day))) {
          skippedLines++;
          if (errors.length < 10) errors.push(`Line ${i}: Invalid date "${dateStr}"`);
          continue;
        }
        
        const formattedDate = `${year}-${month}-${day}`;
        
        // Extract and validate price (column 8)
        const priceStr = values[8].trim();
        if (!priceStr) {
          skippedLines++;
          if (errors.length < 10) errors.push(`Line ${i}: Empty price`);
          continue;
        }
        
        const price = parseFloat(priceStr);
        if (isNaN(price) || price < 0) {
          skippedLines++;
          if (errors.length < 10) errors.push(`Line ${i}: Invalid price "${priceStr}"`);
          continue;
        }
        
        // Extract other fields
        const state = values[1].trim();
        const lga = values[2].trim();
        const outlet_type = values[3].trim();
        const sector = values[5].trim();
        const food_item = values[6].trim();
        const price_category = values[7].trim();
        
        // Validate required fields
        if (!state || !lga || !outlet_type || !sector || !food_item || !price_category) {
          skippedLines++;
          if (errors.length < 10) errors.push(`Line ${i}: Missing required field(s)`);
          continue;
        }
        
        records.push({
          date: formattedDate,
          state,
          lga,
          outlet_type,
          sector,
          food_item,
          price_category,
          uprice: price
        });
        
      } catch (error) {
        skippedLines++;
        if (errors.length < 10) {
          errors.push(`Line ${i}: ${error instanceof Error ? error.message : 'Parse error'}`);
        }
      }
    }
    
    console.log('=== PARSING COMPLETE ===');
    console.log(`✓ Successfully parsed: ${records.length} records`);
    console.log(`✗ Skipped: ${skippedLines} lines`);
    
    if (errors.length > 0) {
      console.log('Errors (showing first 10):', errors);
    }
    
    if (records.length > 0) {
      console.log('Sample record:', records[0]);
    }
    
    if (records.length === 0 && errors.length > 0) {
      toast.error(`No valid records found. First error: ${errors[0]}`);
    }
    
    return records;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('File selected:', selectedFile.name, 'Type:', selectedFile.type, 'Size:', selectedFile.size);
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    console.log('=== UPLOAD STARTED ===');
    console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      // Read file
      console.log('Reading file...');
      const text = await file.text();
      console.log(`File read complete. Length: ${text.length} characters`);
      
      if (text.length === 0) {
        throw new Error('File is empty');
      }
      
      const records = parseCSV(text);
      
      if (records.length === 0) {
        setUploading(false);
        return;
      }

      toast.info(`Parsed ${records.length.toLocaleString()} valid records. Starting upload...`);

      // Upload in batches of 5000
      const BATCH_SIZE = 5000;
      let totalInserted = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        
        console.log(`Uploading batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} records`);
        
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          throw new Error('Not authenticated. Please log in.');
        }

        const response = await supabase.functions.invoke('bulk-insert-market-prices', {
          body: { records: batch }
        });

        if (response.error) {
          console.error('Batch upload error:', response.error);
          throw new Error(response.error.message || 'Upload failed');
        }

        if (response.data?.errors) {
          allErrors.push(...response.data.errors);
        }

        totalInserted += response.data?.inserted || 0;
        const progressPercent = Math.round(((i + batch.length) / records.length) * 100);
        setProgress(progressPercent);
        
        toast.success(`Uploaded ${totalInserted.toLocaleString()} / ${records.length.toLocaleString()} records`);
      }

      setResult({
        inserted: totalInserted,
        total: records.length,
        errors: allErrors.length > 0 ? allErrors : undefined
      });

      toast.success(`Successfully uploaded ${totalInserted.toLocaleString()} records!`);
    } catch (error) {
      console.error('=== UPLOAD ERROR ===');
      console.error(error);
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
                  <li>9 Columns: Date, State, LGA, Outlet Type, Country, Sector, Food Item, Price Category, UPRICE</li>
                  <li>Date format: DD/MM/YYYY (e.g., 16/05/2025)</li>
                  <li>Tab-separated or comma-separated values</li>
                  <li>First row must contain headers</li>
                  <li>All fields required except Country</li>
                </ul>
                <Button 
                  variant="link" 
                  onClick={generateSampleCSV}
                  className="p-0 h-auto mt-2 text-primary"
                >
                  📥 Download Sample CSV File
                </Button>
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <input
                type="file"
                accept=".csv,.txt,.tsv"
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
