
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSolana } from "@/contexts/SolanaContext";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, TrendingUp, Wallet } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import WalletConnection from "@/components/wallet/WalletConnection";

// Mock rewards for the rewards store
const rewardsStore = [
  {
    id: "1",
    title: "Free Coffee",
    description: "Redeem for a free coffee at any partner cafe",
    cost: 100,
    image: "https://images.unsplash.com/photo-1497636577773-f1231844b336",
  },
  {
    id: "2",
    title: "30 Minutes Free",
    description: "Get 30 minutes free at any workspace",
    cost: 200,
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4",
  },
  {
    id: "3",
    title: "Premium Workspace Access",
    description: "One-time access to premium workspace areas",
    cost: 300,
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174",
  },
  {
    id: "4",
    title: "Workshop Ticket",
    description: "Free ticket to a partner workshop",
    cost: 500,
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
  },
  {
    id: "5",
    title: "AntiApp Merchandise",
    description: "Exclusive AntiApp branded notebook and sticker set",
    cost: 400,
    image: "https://images.unsplash.com/photo-1531053270060-6643c8e70e8f",
  },
];

const Rewards = () => {
  const { user, profile } = useAuth();
  const { connected, publicKey, transferAntiCoins } = useSolana();
  const queryClient = useQueryClient();

  // Fetch anticoin transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["anticoin-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("anticoin_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Redeem reward mutation
  const redeemRewardMutation = useMutation({
    mutationFn: async (reward: typeof rewardsStore[0]) => {
      if (!user || !profile) throw new Error("User not authenticated");
      
      // Check if user has enough AntiCoins
      if ((profile.anticoin_balance || 0) < reward.cost) {
        throw new Error("Not enough AntiCoins to redeem this reward");
      }
      
      // Check if wallet is connected for blockchain transaction
      if (!connected || !publicKey) {
        throw new Error("Please connect your wallet to redeem rewards");
      }

      // Perform Solana transaction if wallet is connected
      // We'll use a "treasury" address for rewards transactions
      // In a real app, this would be the partner's address
      const treasuryAddress = "5tpQGGNFfUxBkY8t3xJRnHRWL16fHLSJ54QoVGDX4Q7d";
      const txId = await transferAntiCoins(treasuryAddress, reward.cost);
      
      if (!txId) {
        throw new Error("Failed to execute blockchain transaction");
      }
      
      // Create a transaction record
      const { error: transactionError } = await supabase
        .from("anticoin_transactions")
        .insert({
          user_id: user.id,
          amount: -reward.cost, // Negative amount for spending
          transaction_type: "spend",
          description: `Redeemed: ${reward.title}`,
          reference_id: txId, // Store blockchain transaction ID
        });
      
      if (transactionError) throw transactionError;
      
      // Update user profile balance
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          anticoin_balance: (profile.anticoin_balance || 0) - reward.cost,
        })
        .eq("id", user.id);
      
      if (profileError) throw profileError;
      
      return { reward, txId };
    },
    onSuccess: (data) => {
      toast.success(`Reward redeemed successfully! Transaction ID: ${data.txId.slice(0, 8)}...`);
      queryClient.invalidateQueries({ queryKey: ["anticoin-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to redeem reward");
    },
  });

  // Format transaction amount
  const formatAmount = (amount: number) => {
    return amount > 0 ? `+${amount}` : amount.toString();
  };

  // Get total earned and spent
  const totalEarned = transactions
    ?.filter(tx => tx.transaction_type === "earn")
    .reduce((sum, tx) => sum + tx.amount, 0) || 0;
  
  const totalSpent = transactions
    ?.filter(tx => tx.transaction_type === "spend")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

  const handleRedeemReward = (reward: typeof rewardsStore[0]) => {
    if (!user) {
      toast.error("You must be logged in to redeem rewards");
      return;
    }
    
    if ((profile?.anticoin_balance || 0) < reward.cost) {
      toast.error("Not enough AntiCoins to redeem this reward");
      return;
    }
    
    redeemRewardMutation.mutate(reward);
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold mb-2">AntiCoin Rewards</h2>
              <p className="text-gray-600">
                Redeem your hard-earned AntiCoins for exclusive perks and offers
              </p>
              {!connected && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200 max-w-md mx-auto">
                  <p className="text-yellow-800 mb-3 font-medium flex items-center">
                    <Wallet className="w-4 h-4 mr-2" /> Connect your Solana wallet to redeem rewards
                  </p>
                  <WalletConnection />
                </div>
              )}
            </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <Coins className="h-8 w-8 mr-3 text-antiapp-purple" />
                    <div>
                      <p className="text-sm text-gray-500">Your AntiCoin Balance</p>
                      <p className="text-3xl font-bold">{profile?.anticoin_balance || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 md:mt-0">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="h-6 w-6 mr-2 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Total Earned</p>
                        <p className="text-lg font-semibold">{totalEarned}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Gift className="h-6 w-6 mr-2 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Total Spent</p>
                        <p className="text-lg font-semibold">{totalSpent}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="store" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="store">Rewards Store</TabsTrigger>
              <TabsTrigger value="history">Transaction History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="store" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewardsStore.map((reward) => (
                  <Card key={reward.id} className="overflow-hidden">  
                  <div className="relative h-40">
                    <img
                      src={reward.image}
                      alt={reward.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{reward.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 mr-1 text-antiapp-purple" />
                        <span className="font-semibold">{reward.cost}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRedeemReward(reward)}
                        disabled={!user || (profile?.anticoin_balance || 0) < reward.cost || !connected}
                      >
                        {connected ? 'Redeem' : 'Connect Wallet'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>))}
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center my-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antiapp-purple"></div>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {format(parseISO(transaction.created_at), "MMM d, yyyy h:mm a")}
                            </TableCell>
                            <TableCell>{transaction.description || "Transaction"}</TableCell>
                            <TableCell>
                              <Badge
                                variant={transaction.transaction_type === "earn" ? "outline" : "default"}
                                className={
                                  transaction.transaction_type === "earn" 
                                    ? "border-green-500 text-green-500" 
                                    : "bg-purple-500"
                                }
                              >
                                {transaction.transaction_type === "earn" ? "Earned" : "Spent"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              <span
                                className={
                                  transaction.transaction_type === "earn"
                                    ? "text-green-600"
                                    : "text-purple-600"
                                }
                              >
                                {formatAmount(transaction.amount)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <Coins className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
                  <p className="text-gray-500">
                    Check in to cafes to earn AntiCoins and see your transaction history here
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Rewards;
