import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolana } from '@/contexts/SolanaContext';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, ExternalLink, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type WalletConnectionProps = {
  fullWidth?: boolean;
  showDetails?: boolean;
  className?: string;
};

const WalletConnection = ({ fullWidth = false, showDetails = true, className = '' }: WalletConnectionProps) => {
  const { connected, publicKey, walletBalance, tokenBalance } = useSolana();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const viewOnExplorer = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`, '_blank');
    }
  };

  const truncatedAddress = publicKey 
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : '';

  return (
    <div className={`${className} ${fullWidth ? 'w-full' : ''}`}>
      {connected && publicKey ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white rounded-lg shadow p-3 border">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 font-medium">
                Connected
              </Badge>
              <span className="text-sm font-medium">{truncatedAddress}</span>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={copyAddress}
                className="h-8 w-8"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={viewOnExplorer}
                className="h-8 w-8"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {showDetails && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg shadow p-3 border">
                <p className="text-xs text-gray-500 mb-1">SOL Balance</p>
                <p className="font-semibold">{walletBalance.toFixed(4)} SOL</p>
              </div>
              <div className="bg-antiapp-purple/10 rounded-lg shadow p-3 border border-antiapp-purple/20">
                <p className="text-xs text-gray-500 mb-1">AntiCoins</p>
                <div className="flex items-center">
                  <Coins className="h-4 w-4 mr-1 text-antiapp-purple" />
                  <p className="font-semibold">{profile?.anticoin_balance || tokenBalance}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`${fullWidth ? 'w-full' : ''}`}>
          <WalletMultiButton className="wallet-adapter-button-custom" />
        </div>
      )}
    </div>
  );
};

export default memo(WalletConnection);
