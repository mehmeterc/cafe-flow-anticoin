import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import OptimizedImage from "@/components/ui/optimized-image";
import { Cafe, Checkin } from "@/types/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import {
  MapPin,
  Wifi,
  Battery,
  Volume2,
  Calendar,
  Clock,
  Play,
  Square,
  ArrowLeft,
  Star
} from "lucide-react";
import { toast } from "sonner";

const CafeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentCheckinId, setCurrentCheckinId] = useState<string | null>(null);
  const [checkInStartTime, setCheckInStartTime] = useState<Date | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch cafe details
  const { data: cafe, isLoading: isCafeLoading } = useQuery({
    queryKey: ["cafe", id],
    queryFn: async () => {
      if (!id) throw new Error("No cafe ID provided");
      
      const { data, error } = await supabase
        .from("cafes")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Cafe;
    },
    enabled: !!id,
  });

  // Fetch active check-in if exists
  const { data: activeCheckin, refetch: refetchActiveCheckin } = useQuery({
    queryKey: ["active-checkin", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", user.id)
        .is("end_time", null)
        .single();
      
      if (error && error.code !== "PGRST116") {
        // PGRST116 is the error code for no rows returned
        throw error;
      }
      
      if (data) {
        setIsCheckedIn(true);
        setCurrentCheckinId(data.id);
        setCheckInStartTime(new Date(data.start_time));
        return data as Checkin;
      }
      
      return null;
    },
    enabled: !!user,
  });

  // Fetch favorite status
  useQuery({
    queryKey: ["favorite", user?.id, id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("cafe_id", id)
        .single();
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      setIsFavorite(!!data);
      return data;
    },
    enabled: !!user && !!id,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!user || !cafe) throw new Error("User or cafe not found");
      
      const { data, error } = await supabase
        .from("checkins")
        .insert({
          user_id: user.id,
          cafe_id: cafe.id,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Checkin;
    },
    onSuccess: (data) => {
      setIsCheckedIn(true);
      setCurrentCheckinId(data.id);
      setCheckInStartTime(new Date(data.start_time));
      toast.success(`Checked in to ${cafe?.name}`);
      refetchActiveCheckin();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to check in");
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      if (!currentCheckinId || !checkInStartTime) throw new Error("No active check-in");
      
      const endTime = new Date();
      const durationInMinutes = Math.floor((endTime.getTime() - checkInStartTime.getTime()) / 60000);
      const cost = durationInMinutes * (cafe?.hourly_cost || 0) / 60;
      const coinsEarned = durationInMinutes; // 1 coin per minute
      
      // Update the check-in
      const { data: checkInData, error: checkInError } = await supabase
        .from("checkins")
        .update({
          end_time: endTime.toISOString(),
          duration: durationInMinutes,
          cost: cost,
          coins_earned: coinsEarned,
        })
        .eq("id", currentCheckinId)
        .select()
        .single();
      
      if (checkInError) throw checkInError;
      
      // Add anticoin transaction
      if (user) {
        const { error: transactionError } = await supabase
          .from("anticoin_transactions")
          .insert({
            user_id: user.id,
            amount: coinsEarned,
            transaction_type: "earn",
            description: `Check-in at ${cafe?.name}`,
            reference_id: currentCheckinId,
          });
        
        if (transactionError) throw transactionError;
        
        // Update user profile with new balance
        if (profile) {
          const { error: profileError } = await supabase
            .from("user_profiles")
            .update({
              anticoin_balance: (profile.anticoin_balance || 0) + coinsEarned,
            })
            .eq("id", user.id);
            
          if (profileError) throw profileError;
        }
      }
      
      return checkInData;
    },
    onSuccess: () => {
      setIsCheckedIn(false);
      setCurrentCheckinId(null);
      setCheckInStartTime(null);
      toast.success(
        "Checked out successfully! AntiCoins have been added to your balance."
      );
      queryClient.invalidateQueries({ queryKey: ["active-checkin"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to check out");
    },
  });

  const toggleFavorite = async () => {
    if (!user || !id) {
      toast.error("You must be logged in to favorite cafes");
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("cafe_id", id);
        
        if (error) throw error;
        
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, cafe_id: id });
        
        if (error) throw error;
        
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
      
      queryClient.invalidateQueries({ queryKey: ["favorite"] });
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast.error(error.message || "Failed to update favorites");
    }
  };
  
  const handleCheckIn = () => {
    if (!user) {
      toast.error("You must be logged in to check in");
      return;
    }
    checkInMutation.mutate();
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate();
  };

  // Calculate elapsed time for active check-in
  const [elapsedTime, setElapsedTime] = useState("0m");
  useState(() => {
    if (!isCheckedIn || !checkInStartTime) return;
    
    const interval = setInterval(() => {
      if (checkInStartTime) {
        const elapsed = formatDistance(new Date(), checkInStartTime, { addSuffix: false });
        setElapsedTime(elapsed);
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  });

  if (isCafeLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antiapp-purple"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col p-4">
          <h2 className="text-2xl font-bold mb-2">Cafe not found</h2>
          <p className="text-gray-600 mb-4">The cafe you're looking for doesn't exist</p>
          <Link to="/explore">
            <Button>Back to Explore</Button>
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      <main className="flex-1">
        <div className="relative h-64 sm:h-96">
          <OptimizedImage
            src={cafe.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"}
            alt={cafe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <Link 
            to="/explore" 
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <button
            onClick={toggleFavorite}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full"
          >
            <Star 
              className={`h-5 w-5 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}`} 
            />
          </button>
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold">{cafe.name}</h1>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{cafe.address}</span>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="bg-white rounded-xl shadow-md p-6 -mt-10 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <span className="text-antiapp-purple text-2xl font-bold">${cafe.hourly_cost}/hr</span>
                <p className="text-gray-600 text-sm mt-1">
                  Earn 1 AntiCoin per minute spent here
                </p>
              </div>
              
              {isCheckedIn && activeCheckin?.cafe_id === cafe.id ? (
                <div className="mt-4 sm:mt-0 flex flex-col items-center sm:items-end">
                  <span className="text-gray-600 text-sm mb-1">Currently checked in for</span>
                  <span className="text-lg font-semibold">{elapsedTime}</span>
                  <Button 
                    variant="destructive" 
                    className="mt-2"
                    onClick={handleCheckOut}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Check Out
                  </Button>
                </div>
              ) : isCheckedIn ? (
                <div className="mt-4 sm:mt-0">
                  <Button disabled>
                    Already checked in at another cafe
                  </Button>
                </div>
              ) : (
                <Button 
                  className="mt-4 sm:mt-0 bg-hero-gradient"
                  onClick={handleCheckIn}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Check In Now
                </Button>
              )}
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <h2 className="font-semibold text-lg mb-4">About this workspace</h2>
              <p className="text-gray-600 mb-6">{cafe.description || "A great place to focus and be productive."}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                  <Wifi className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm font-medium">WiFi</span>
                  <span className="text-xs text-gray-500">{cafe.wifi_strength}/5</span>
                </div>
                
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                  <Volume2 className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm font-medium">Noise</span>
                  <span className="text-xs text-gray-500">{cafe.noise_level}/5</span>
                </div>
                
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                  <Battery className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm font-medium">Power</span>
                  <span className="text-xs text-gray-500">
                    {cafe.power_outlets ? "Available" : "Limited"}
                  </span>
                </div>
                
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                  <Calendar className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm font-medium">Seating</span>
                  <span className="text-xs text-gray-500">{cafe.seating_type || "Mixed"}</span>
                </div>
              </div>
              
              <h3 className="font-semibold text-md mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {cafe.tags?.map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
              
              <h3 className="font-semibold text-md mb-2">Operating Hours</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                {cafe.open_hours ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {cafe.open_hours && typeof cafe.open_hours === 'object' && Object.entries(cafe.open_hours as Record<string, {open: string, close: string}>).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}:</span>
                        <span>{hours.open} - {hours.close}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Hours information not available</p>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link to="/explore">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Explore
                  </Link>
                </Button>
                <Button asChild>
                  <Link to={`/bookings/new?cafe=${cafe.id}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book This Space
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default CafeDetail;
