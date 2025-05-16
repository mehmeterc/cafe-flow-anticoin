
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

const Bookings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");

  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", user?.id, activeTab],
    queryFn: async () => {
      if (!user) return [];
      
      const now = new Date().toISOString();
      let query = supabase
        .from("bookings")
        .select(`
          *,
          cafes:cafe_id (
            name,
            location,
            image_url,
            hourly_cost
          )
        `)
        .eq("user_id", user.id);
      
      // Filter by date
      if (activeTab === "upcoming") {
        query = query.gte("date", now.split('T')[0]);
      } else {
        query = query.lt("date", now.split('T')[0]);
      }
      
      // Order by date and time
      query = query.order("date", { ascending: activeTab === "upcoming" })
        .order("start_time", { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Format booking time
  const formatBookingTime = (time: string) => {
    return format(parseISO(`2000-01-01T${time}`), "h:mm a");
  };

  // Format booking duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0
      ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}`
      : `${mins}m`;
  };

  // Calculate booking cost
  const calculateCost = (duration: number, hourlyRate: number) => {
    return ((duration / 60) * hourlyRate).toFixed(2);
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Bookings</h1>
              <p className="text-gray-600">
                Manage your workspace reservations
              </p>
            </div>
            <Link to="/bookings/new">
              <Button className="bg-hero-gradient">
                <Calendar className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </Link>
          </div>

          <Tabs 
            defaultValue="upcoming" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center my-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antiapp-purple"></div>
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="grid gap-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-0">
                        <div className="md:flex">
                          <div className="md:w-1/4 bg-gray-100">
                            <div className="relative h-32 md:h-full">
                              <img
                                src={booking.cafes?.image_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24"}
                                alt={booking.cafes?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="md:w-3/4 p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{booking.cafes?.name}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  <span>{booking.cafes?.location}</span>
                                </div>
                              </div>
                              <div className="mt-2 md:mt-0">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="font-medium">
                                  {format(parseISO(booking.date), "MMM d, yyyy")}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Time</p>
                                <p className="font-medium">
                                  {formatBookingTime(booking.start_time)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Duration</p>
                                <p className="font-medium">
                                  {formatDuration(booking.duration)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Cost</p>
                                <p className="font-medium">
                                  ${calculateCost(booking.duration, booking.cafes?.hourly_cost || 0)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Link to={`/cafes/${booking.cafe_id}`} className="flex-1">
                                <Button variant="outline" className="w-full">
                                  View Café
                                </Button>
                              </Link>
                              <Link to={`/bookings/${booking.id}`} className="flex-1">
                                <Button className="w-full">
                                  Manage Booking
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No upcoming bookings</h3>
                  <p className="mt-1 text-gray-500 mb-6">
                    Book a workspace to get started
                  </p>
                  <Link to="/bookings/new">
                    <Button className="bg-hero-gradient">
                      Book a Workspace
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center my-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-antiapp-purple"></div>
                </div>
              ) : bookings && bookings.length > 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Café</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              {format(parseISO(booking.date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>{booking.cafes?.name}</TableCell>
                            <TableCell>{formatBookingTime(booking.start_time)}</TableCell>
                            <TableCell>{formatDuration(booking.duration)}</TableCell>
                            <TableCell>
                              ${calculateCost(booking.duration, booking.cafes?.hourly_cost || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No past bookings</h3>
                  <p className="text-gray-500">
                    Your booking history will appear here
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

export default Bookings;
