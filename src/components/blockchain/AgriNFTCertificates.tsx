import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, CheckCircle, XCircle } from "lucide-react";

export function AgriNFTCertificates() {
  const { user } = useAuth();
  const [nfts, setNfts] = useState<any[]>([]);

  useEffect(() => {
    loadNFTs();
  }, [user]);

  const loadNFTs = async () => {
    try {
      const { data, error } = await supabase
        .from('agricultural_nfts')
        .select('*')
        .eq('user_id', user?.id)
        .order('issued_date', { ascending: false });

      if (error) throw error;
      setNfts(data || []);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    }
  };

  const getNFTTypeLabel = (type: string) => {
    const labels: any = {
      organic_certification: 'Organic Certification',
      quality_badge: 'Quality Badge',
      training_certificate: 'Training Certificate',
      achievement: 'Achievement'
    };
    return labels[type] || type;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agricultural NFT Certificates</CardTitle>
          <CardDescription>
            Your digital certificates and achievements stored as NFTs on Hedera
          </CardDescription>
        </CardHeader>
      </Card>

      {/* NFTs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft) => {
          const expired = isExpired(nft.expiry_date);
          
          return (
            <Card key={nft.id} className={expired ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center mb-3">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={nft.status === 'active' && !expired ? 'default' : 'secondary'}>
                      {expired ? 'Expired' : nft.status}
                    </Badge>
                    {nft.hedera_token_id && (
                      <Badge variant="outline" className="text-xs font-mono">
                        #{nft.hedera_serial_number}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{nft.title}</CardTitle>
                <CardDescription className="capitalize">
                  {getNFTTypeLabel(nft.nft_type)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {nft.description && (
                  <p className="text-sm text-muted-foreground">
                    {nft.description}
                  </p>
                )}

                <div className="space-y-2 pt-2 border-t">
                  {nft.issuer && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Issued by:</span>
                      <span className="font-medium">{nft.issuer}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {new Date(nft.issued_date).toLocaleDateString()}
                    </span>
                  </div>

                  {nft.expiry_date && (
                    <div className="flex items-center gap-2 text-sm">
                      {expired ? (
                        <XCircle className="w-4 h-4 text-destructive" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className={expired ? 'text-destructive' : 'text-muted-foreground'}>
                        Expires: {new Date(nft.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {nft.hedera_token_id && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      <p className="font-mono">Token: {nft.hedera_token_id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {nfts.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No NFT certificates yet</p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                NFT certificates will be automatically issued when you achieve milestones,
                complete certifications, or earn quality badges
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
