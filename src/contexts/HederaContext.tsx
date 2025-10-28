import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface HederaContextType {
  accountId: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  loading: boolean;
}

const HederaContext = createContext<HederaContextType | undefined>(undefined);

export const HederaProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWalletInfo();
    } else {
      setAccountId(null);
      setIsConnected(false);
      setLoading(false);
    }
  }, [user]);

  const loadWalletInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (data && !error) {
        setAccountId(data.hedera_account_id);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      
      // Check if HashPack is installed
      if (!window.hashpack) {
        toast.error('Please install HashPack wallet extension');
        window.open('https://www.hashpack.app/', '_blank');
        return;
      }

      // Initialize HashPack
      const appMetadata = {
        name: "AgriTech Platform",
        description: "Agricultural blockchain platform",
        icon: window.location.origin + "/favicon.ico"
      };

      const hashpack = window.hashpack;
      await hashpack.init(appMetadata);

      // Pair with wallet
      const pairingData = await hashpack.pairingRequest();
      
      if (pairingData.accountIds && pairingData.accountIds.length > 0) {
        const hederaAccountId = pairingData.accountIds[0];
        
        // Save to database
        const { error } = await supabase
          .from('user_wallets')
          .upsert({
            user_id: user?.id,
            hedera_account_id: hederaAccountId,
            wallet_type: 'hashpack',
            connected_at: new Date().toISOString(),
            last_used_at: new Date().toISOString(),
            is_active: true
          });

        if (error) throw error;

        setAccountId(hederaAccountId);
        setIsConnected(true);
        toast.success('Wallet connected successfully!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setLoading(true);
      
      await supabase
        .from('user_wallets')
        .update({ is_active: false })
        .eq('user_id', user?.id);

      setAccountId(null);
      setIsConnected(false);
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <HederaContext.Provider value={{ accountId, isConnected, connectWallet, disconnectWallet, loading }}>
      {children}
    </HederaContext.Provider>
  );
};

export const useHedera = () => {
  const context = useContext(HederaContext);
  if (!context) {
    throw new Error('useHedera must be used within HederaProvider');
  }
  return context;
};

// Extend Window interface for HashPack
declare global {
  interface Window {
    hashpack: any;
  }
}
