import { useTranslation } from "react-i18next";
import { useHedera } from "@/contexts/HederaContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Wallet, Package, FileCheck, Award, Coins, TrendingUp } from "lucide-react";
import { FarmAssetTokenization } from "@/components/blockchain/FarmAssetTokenization";
import { SupplyChainTracker } from "@/components/blockchain/SupplyChainTracker";
import { FarmDataRegistry } from "@/components/blockchain/FarmDataRegistry";
import { AgriNFTCertificates } from "@/components/blockchain/AgriNFTCertificates";
import { SmartPaymentContracts } from "@/components/blockchain/SmartPaymentContracts";

export default function BlockchainHub() {
  const { t } = useTranslation();
  const { accountId, isConnected, connectWallet, disconnectWallet, loading } = useHedera();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blockchain Hub</h1>
          <p className="text-muted-foreground">Powered by Hedera Network</p>
        </div>
        
        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-mono">
                <Wallet className="w-3 h-3 mr-1" />
                {accountId?.slice(0, 8)}...{accountId?.slice(-6)}
              </Badge>
              <Button variant="outline" onClick={disconnectWallet} disabled={loading}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connectWallet} disabled={loading}>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Wallet Connection Required Message */}
      {!isConnected && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connect Your Hedera Wallet
            </CardTitle>
            <CardDescription>
              Connect your HashPack wallet to access blockchain features including tokenization, supply chain tracking, smart contracts, and NFT certificates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectWallet} disabled={loading} size="lg">
              <Wallet className="w-4 h-4 mr-2" />
              {loading ? 'Connecting...' : 'Connect HashPack Wallet'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Asset Tokenization</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tokenize your farm assets and enable fractional ownership and investment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Supply Chain</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track your crops from farm to market with immutable blockchain records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Smart Contracts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automate payments based on yield, delivery, or weather conditions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Data Registry</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Store farm data on-chain for certifications and proof of practices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">NFT Certificates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Earn and display digital certificates for organic practices and achievements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Features Tabs */}
      {isConnected && (
        <Tabs defaultValue="tokenization" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tokenization">
              <Coins className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Tokenization</span>
            </TabsTrigger>
            <TabsTrigger value="supply-chain">
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Supply Chain</span>
            </TabsTrigger>
            <TabsTrigger value="contracts">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Contracts</span>
            </TabsTrigger>
            <TabsTrigger value="registry">
              <FileCheck className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Registry</span>
            </TabsTrigger>
            <TabsTrigger value="nfts">
              <Award className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">NFTs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tokenization" className="space-y-4">
            <FarmAssetTokenization />
          </TabsContent>

          <TabsContent value="supply-chain" className="space-y-4">
            <SupplyChainTracker />
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <SmartPaymentContracts />
          </TabsContent>

          <TabsContent value="registry" className="space-y-4">
            <FarmDataRegistry />
          </TabsContent>

          <TabsContent value="nfts" className="space-y-4">
            <AgriNFTCertificates />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
