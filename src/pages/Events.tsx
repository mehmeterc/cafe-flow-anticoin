
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSolana } from "@/contexts/SolanaContext"; // Import Solana context
import { Event, EventAttendee } from "@/types/supabase";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin, Users, Coins } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const Events = () => {
  const { user, profile } = useAuth();
  const { connected, publicKey, tokenBalance, transferAntiCoins } = useSolana();
  const queryClient = useQueryClient();
  
  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          cafes:cafe_id (
            name,
            location,
            address
          )
        `)
        .order("date", { ascending: true });
      
      if (error) throw error;
      return data as (Event & { cafes: { name: string; location: string; address: string } })[];
    },
  });
  
  // Fetch user's event attendances
  const { data: userAttendances } = useQuery({
    queryKey: ["event-attendances", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("event_attendees")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as EventAttendee[];
    },
    enabled: !!user,
  });

  // Check if user is attending an event
  const isAttending = (eventId: string) => {
    return userAttendances?.some(attendance => attendance.event_id === eventId) || false;
  };

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async (event: Event) => {
      if (!user || !profile) throw new Error("User not authenticated");
      
      if (!connected || !publicKey) {
        throw new Error("You must connect your wallet to register for events");
      }
      
      // Check if user has enough AntiCoins for the event using blockchain balance
      if (event.anticoin_cost && tokenBalance < event.anticoin_cost) {
        throw new Error(`Not enough AntiCoins in your wallet. You need ${event.anticoin_cost} AntiCoins but have ${tokenBalance}.`);
      }
      
      // Show processing state
      toast.loading(`Processing payment of ${event.anticoin_cost} AntiCoins...`);

      try {
        // Execute a blockchain transaction to pay for the event
        const eventOrganizerWallet = event.organizer_wallet || "933C...wJ2m"; // Default to a placeholder address if not available
        
        // This makes a REAL blockchain transfer for the event cost
        const txId = await transferAntiCoins(eventOrganizerWallet, event.anticoin_cost || 0);
        
        if (!txId) {
          throw new Error("Blockchain transaction failed. Please try again.");
        }

        // Now register the user for the event in the database
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("event_attendees")
          .insert({
            event_id: event.id,
            user_id: user.id,
          })
          .select()
          .single();
        
        if (attendanceError) throw attendanceError;
        
        // Store the transaction details in the database for record-keeping
        const { error: transactionError } = await supabase
          .from("anticoin_transactions")
          .insert({
            user_id: user.id,
            amount: -event.anticoin_cost,
            transaction_type: "spend",
            description: `Registered for event: ${event.title}`,
            reference_id: event.id,
            blockchain_tx_id: txId, // Store the blockchain transaction ID
          });
        
        if (transactionError) throw transactionError;
        
        toast.dismiss();
        return { attendanceData, event, txId };
      } catch (error) {
        toast.dismiss();
        throw error;
      }
    },
    onSuccess: ({ event, txId }) => {
      toast.success(
        `Successfully registered for: ${event.title}. Transaction confirmed on blockchain!`, 
        { 
          description: `Transaction ID: ${txId?.slice(0, 8)}...${txId?.slice(-8)}`,
          duration: 5000
        }
      );
      queryClient.invalidateQueries({ queryKey: ["event-attendances"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to register for event");
    },
  });

  // Unregister from event mutation
  const unregisterMutation = useMutation({
    mutationFn: async (event: Event) => {
      if (!user) throw new Error("User not authenticated");
      
      // Unregister from the event
      const { error } = await supabase
        .from("event_attendees")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      return event;
    },
    onSuccess: (event) => {
      toast.success(`Successfully unregistered from: ${event.title}`);
      queryClient.invalidateQueries({ queryKey: ["event-attendances"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to unregister from event");
    },
  });

  // Format event time
  const formatEventTime = (time: string) => {
    return format(parseISO(`2000-01-01T${time}`), "h:mm a");
  };

  // Format event duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0
      ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
      : `${mins}m`;
  };

  // Handle registration
  const handleRegister = (event: Event) => {
    if (!user) {
      toast.error("You must be logged in to register for events");
      return;
    }
    
    if (event.anticoin_cost && (profile?.anticoin_balance || 0) < event.anticoin_cost) {
      toast.error("Not enough AntiCoins to register for this event");
      return;
    }
    
    registerMutation.mutate(event);
  };

  // Handle unregistration
  const handleUnregister = (event: Event) => {
    if (!user) {
      toast.error("You must be logged in to unregister from events");
      return;
    }
    
    unregisterMutation.mutate(event);
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Events & Happenings</h1>
            <p className="text-gray-600">
              Join exciting community events and activities
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antiapp-purple"></div>
            </div>
          ) : events && events.length > 0 ? (
            <div className="space-y-6">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="md:flex">
                      <div className="md:w-1/3 bg-gray-100">
                        <div className="relative h-48 md:h-full">
                          <img
                            src={event.image_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                          {event.price && (
                            <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-medium">
                              ${event.price.toFixed(2)}
                            </div>
                          )}
                          {event.anticoin_cost && (
                            <div className="absolute bottom-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-medium flex items-center">
                              <Coins className="h-3.5 w-3.5 mr-1 text-antiapp-purple" />
                              {event.anticoin_cost}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="mb-2 flex items-center">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {format(parseISO(event.date), "MMMM d, yyyy")}
                          </Badge>
                        </div>
                        
                        <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                        
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarDays className="h-4 w-4 mr-1.5" />
                            <span>{format(parseISO(event.date), "MMMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1.5" />
                            <span>{formatEventTime(event.start_time)} ({formatDuration(event.duration)})</span>
                          </div>
                          {event.cafes && (
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-1.5" />
                              <span>{event.cafes.name}, {event.cafes.location}</span>
                            </div>
                          )}
                          {event.seat_limit && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="h-4 w-4 mr-1.5" />
                              <span>Limited to {event.seat_limit} seats</span>
                            </div>
                          )}
                        </div>
                        
                        {event.organizer && (
                          <p className="text-sm text-gray-500 mb-4">Organized by: <span className="font-medium">{event.organizer}</span></p>
                        )}
                        
                        {isAttending(event.id) ? (
                          <Button 
                            variant="outline" 
                            onClick={() => handleUnregister(event)}
                            disabled={unregisterMutation.isPending}
                          >
                            Cancel Registration
                          </Button>
                        ) : (
                          <Button 
                            className="bg-hero-gradient"
                            onClick={() => handleRegister(event)}
                            disabled={registerMutation.isPending || (event.anticoin_cost && (profile?.anticoin_balance || 0) < event.anticoin_cost)}
                          >
                            {event.anticoin_cost ? (
                              <>
                                Register ({event.anticoin_cost} <Coins className="h-3.5 w-3.5 mx-1" />)
                              </>
                            ) : (
                              "Register for Free"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
              <p className="mt-1 text-gray-500">
                Check back soon for new events and happenings
              </p>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Events;
