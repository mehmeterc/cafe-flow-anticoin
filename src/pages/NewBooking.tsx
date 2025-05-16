
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Cafe } from "@/types/supabase";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, MapPin, ClockIcon } from "lucide-react";
import { toast } from "sonner";

const durations = [
  { value: "60", label: "1 hour" },
  { value: "90", label: "1.5 hours" },
  { value: "120", label: "2 hours" },
  { value: "180", label: "3 hours" },
  { value: "240", label: "4 hours" },
  { value: "300", label: "5 hours" },
  { value: "360", label: "6 hours" },
  { value: "480", label: "8 hours" },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00"
];

const NewBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCafeId = searchParams.get("cafe");
  const queryClient = useQueryClient();

  const [selectedCafe, setSelectedCafe] = useState<string | null>(preselectedCafeId);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [selectedDuration, setSelectedDuration] = useState<string>("120");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch cafes
  const { data: cafes, isLoading: cafesLoading } = useQuery({
    queryKey: ["cafes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cafes")
        .select("*");
      
      if (error) throw error;
      return data as Cafe[];
    },
  });

  // Fetch selected cafe details if preselected
  const { data: selectedCafeDetails } = useQuery({
    queryKey: ["cafe", selectedCafe],
    queryFn: async () => {
      if (!selectedCafe) return null;
      
      const { data, error } = await supabase
        .from("cafes")
        .select("*")
        .eq("id", selectedCafe)
        .single();
      
      if (error) throw error;
      return data as Cafe;
    },
    enabled: !!selectedCafe,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedCafe || !selectedDate || !selectedTime || !selectedDuration) {
        throw new Error("Missing required booking information");
      }
      
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          cafe_id: selectedCafe,
          date: format(selectedDate, "yyyy-MM-dd"),
          start_time: selectedTime,
          duration: parseInt(selectedDuration),
          status: "confirmed",
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Booking created successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      navigate("/bookings");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create booking");
    },
  });

  // Filter cafes by search term
  const filteredCafes = cafes?.filter(cafe =>
    cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cafe.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate booking cost
  const calculateBookingCost = () => {
    if (!selectedCafeDetails || !selectedDuration) return 0;
    return ((parseInt(selectedDuration) / 60) * selectedCafeDetails.hourly_cost).toFixed(2);
  };

  const handleCreateBooking = () => {
    if (!user) {
      toast.error("You must be logged in to create a booking");
      return;
    }
    
    if (!selectedCafe) {
      toast.error("Please select a cafe");
      return;
    }
    
    createBookingMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Create a Booking</h1>
            <p className="text-gray-600">
              Reserve your spot at your favorite workspace
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Select a Workspace</h2>
                  
                  {preselectedCafeId && selectedCafeDetails ? (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded overflow-hidden">
                          <img
                            src={selectedCafeDetails.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"}
                            alt={selectedCafeDetails.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{selectedCafeDetails.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            <span>{selectedCafeDetails.location}</span>
                          </div>
                          <p className="text-sm mt-1">
                            <span className="font-medium">${selectedCafeDetails.hourly_cost}</span> per hour
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <Input
                        type="text"
                        placeholder="Search cafe by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                      />
                      
                      <div className="max-h-60 overflow-y-auto rounded-md border">
                        {cafesLoading ? (
                          <div className="p-4 text-center">Loading cafes...</div>
                        ) : filteredCafes && filteredCafes.length > 0 ? (
                          filteredCafes.map((cafe) => (
                            <div
                              key={cafe.id}
                              className={cn(
                                "p-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50",
                                selectedCafe === cafe.id ? "bg-gray-50" : ""
                              )}
                              onClick={() => setSelectedCafe(cafe.id)}
                            >
                              <div className="h-10 w-10 rounded overflow-hidden">
                                <img
                                  src={cafe.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"}
                                  alt={cafe.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium">{cafe.name}</h4>
                                <p className="text-sm text-gray-500">{cafe.location}</p>
                              </div>
                              <div className="ml-auto">
                                <span className="font-semibold">${cafe.hourly_cost}/hr</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No cafes found matching your search
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
                  
                  <div className="grid sm:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Time</label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {format(parse(time, "HH:mm", new Date()), "h:mm a")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Duration</label>
                      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
                  
                  {selectedCafeDetails ? (
                    <div>
                      <div className="border-b pb-3 mb-3">
                        <h3 className="font-medium">{selectedCafeDetails.name}</h3>
                        <p className="text-sm text-gray-500">{selectedCafeDetails.location}</p>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date:</span>
                          <span>{format(selectedDate, "PPP")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Time:</span>
                          <span>{format(parse(selectedTime, "HH:mm", new Date()), "h:mm a")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span>
                            {durations.find(d => d.value === selectedDuration)?.label || selectedDuration + " minutes"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3 mb-6">
                        <div className="flex justify-between font-semibold">
                          <span>Total Cost:</span>
                          <span>${calculateBookingCost()}</span>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full bg-hero-gradient"
                        onClick={handleCreateBooking}
                        disabled={!selectedCafe || !user || createBookingMutation.isPending}
                      >
                        {createBookingMutation.isPending ? "Creating..." : "Confirm Booking"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <ClockIcon className="h-12 w-12 mb-3 text-gray-300" />
                      <p>Select a workspace to see booking summary</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default NewBooking;
