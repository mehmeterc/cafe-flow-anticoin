import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSolana } from "@/contexts/SolanaContext";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Banknote, Clock, Wallet, MapPin, Square } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import WalletConnection from "@/components/wallet/WalletConnection";
import { Link } from "react-router-dom";

const Live = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { connected, publicKey, mintAntiCoins } = useSolana();
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [costAccrued, setCostAccrued] = useState<number>(0);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);
  const [processingMint, setProcessingMint] = useState<boolean>(false);

  const queryClient = useQueryClient();
  
  // Fetch active check-in
  const { data: activeCheckIn, isLoading } = useQuery({
    queryKey: ["active-checkin", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("checkins")
        .select(`
          *,
          cafes:cafe_id (
            name,
            location,
            hourly_cost,
            image_url
          )
        `)
        .eq("user_id", user.id)
        .is("end_time", null)
        .single();
      
      if (error && error.code !== "PGRST116") {
        // PGRST116 is the error code for no rows returned
        throw error;
      }
      
      return data || null;
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
  });

  // Update time, cost, and coins every second if there's an active check-in
  useEffect(() => {
    if (!activeCheckIn) return;
    
    const startTime = new Date(activeCheckIn.start_time).getTime();
    const hourlyRate = activeCheckIn.cafes?.hourly_cost || 0;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const elapsedMs = now - startTime;
      const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
      const cost = (elapsedMinutes / 60) * hourlyRate;
      
      setTimeElapsed(elapsedMinutes);
      setCostAccrued(parseFloat(cost.toFixed(2)));
      setCoinsEarned(elapsedMinutes); // 1 coin per minute
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeCheckIn]);

  // Handle checkout
  const handleCheckout = async () => {
    if (!activeCheckIn || !user) return;
    
    try {
      // Calculate minutes spent and coins earned (1 coin per minute)
      const checkInTime = new Date(activeCheckIn.start_time);
      const checkOutTime = new Date();
      const minutesSpent = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60));
      const coins = minutesSpent;
      
      // Update check-in record with end time
      const { error: checkInError } = await supabase
        .from("checkins")
        .update({
          end_time: checkOutTime.toISOString(),
          minutes_spent: minutesSpent,
          anticoin_earned: coins,
        })
        .eq("id", activeCheckIn.id);
      
      if (checkInError) throw checkInError;
      
      // Mint AntiCoins to the user's wallet if connected
      let txId = null;
      if (connected && publicKey) {
        setProcessingMint(true);
        try {
          // This will actually mint tokens on the blockchain
          txId = await mintAntiCoins(coins);
          if (txId) {
            toast.success(`${coins} AntiCoins minted to your wallet!`);
          }
        } catch (mintError: any) {
          console.error("Error minting tokens:", mintError);
          toast.error("Failed to mint tokens, but check-out was successful.");
        } finally {
          setProcessingMint(false);
        }
      } else {
        toast.warning("Connect your wallet to receive AntiCoins on the blockchain!");
      }
      
      // Add anticoin transaction record
      const { error: transactionError } = await supabase
        .from("anticoin_transactions")
        .insert({
          user_id: user.id,
          amount: coins,
          transaction_type: "earn",
          description: `Check-in at ${activeCheckIn.cafes?.name}`,
          reference_id: activeCheckIn.id,
          blockchain_tx_id: txId, // Store the blockchain transaction ID if available
        });
      
      if (transactionError) throw transactionError;
      
      // Invalidate queries to refetch data and refresh profile
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["active-checkin", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["user-profile", user?.id] }),
        queryClient.invalidateQueries({ queryKey: ["anticoin-transactions", user?.id] }),
        refreshProfile() // Refresh the user profile
      ]);
      
      // Reset local state
      setTimeElapsed(0);
      setCostAccrued(0);
      setCoinsEarned(0);
      
      toast.success(
        txId 
          ? `Checked out successfully! ${coins} AntiCoins have been minted to your wallet.`
          : `Checked out successfully! Connect your wallet to receive ${coins} AntiCoins.`
      );
    } catch (error: any) {
      console.error("Error checking out:", error);
      toast.error(error.message || "Failed to check out");
    }
  };

  // Format time display
  const formatTimeDisplay = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold mb-2">Live Status</h1>
          <p className="text-gray-600 mb-6">
            Track your current session and earnings
          </p>
          
          {isLoading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antiapp-purple"></div>
            </div>
          ) : activeCheckIn ? (
            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <div className="relative h-48 rounded-lg overflow-hidden">
                        <img
                          src={activeCheckIn.cafes?.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"}
                          alt={activeCheckIn.cafes?.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h2 className="font-bold">{activeCheckIn.cafes?.name}</h2>
                          <div className="flex items-center mt-1 text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{activeCheckIn.cafes?.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Link to={`/cafes/${activeCheckIn.cafe_id}`}>
                          <Button variant="outline" className="w-full">
                            View Cafe Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="md:w-2/3">
                      <h3 className="text-xl font-semibold mb-4">Current Session</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Session Duration</p>
                                <h3 className="text-2xl font-bold">
                                  {formatTimeDisplay(timeElapsed)}
                                </h3>
                              </div>
                              <Clock className="h-8 w-8 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Money Accrued</p>
                                <h3 className="text-2xl font-bold">
                                  ${costAccrued.toFixed(2)}
                                </h3>
                              </div>
                              <Banknote className="h-8 w-8 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">AntiCoins Earned</p>
                                <h3 className="text-2xl font-bold text-antiapp-purple">
                                  {coinsEarned}
                                </h3>
                              </div>
                              <Coins className="h-8 w-8 text-antiapp-purple" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <Wallet className="h-5 w-5 mr-2" />
                            Connect Wallet to Earn AntiCoins on Solana
                          </CardTitle>
                          <CardDescription>
                            Connect your Solana wallet to receive AntiCoins as blockchain tokens when you check out
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <WalletConnection fullWidth={false} showDetails={false} />
                        </CardContent>
                      </Card>
                      
                      <div className="bg-gray-100 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Started at:</span> {new Date(activeCheckIn.start_time).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Rate:</span> ${activeCheckIn.cafes?.hourly_cost}/hr (1 AntiCoin per minute)
                        </p>
                      </div>
                      
                      <div className="flex justify-end items-center gap-3">
                        {processingMint && (
                          <div className="flex items-center text-antiapp-purple">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                            <span>Processing blockchain transaction...</span>
                          </div>
                        )}
                        <Button 
                          onClick={handleCheckout} 
                          className="px-8" 
                          disabled={processingMint}
                        >
                          Check Out Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">No active session</h3>
              <p className="mt-1 text-gray-500 mb-6">
                You're not currently checked in to any workspace
              </p>
              <Link to="/explore">
                <Button className="bg-hero-gradient">
                  Find a Workspace
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Live;
