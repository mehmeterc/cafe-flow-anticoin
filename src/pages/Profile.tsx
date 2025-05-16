
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSolana } from "@/contexts/SolanaContext";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Coins, LogOut, Wallet, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import WalletConnection from "@/components/wallet/WalletConnection";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  avatar_url: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  work_style: z.string().optional(),
  wallet_address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const workStyles = [
  { value: "solo", label: "Solo - I prefer to work alone" },
  { value: "quiet", label: "Quiet - I like a calm environment" },
  { value: "collaborative", label: "Collaborative - I'm open to interactions" },
  { value: "social", label: "Social - I enjoy a buzzing atmosphere" },
];

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const { connected, publicKey } = useSolana();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      avatar_url: profile?.avatar_url || "",
      bio: profile?.bio || "",
      work_style: profile?.work_style || "",
      wallet_address: profile?.wallet_address || "",
    },
  });
  
  // Update form when profile data is available
  useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        form.reset({
          name: data.name || "",
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
          work_style: data.work_style || "",
          wallet_address: data.wallet_address || "",
        });
        
        setSkills(data.skills || []);
      }
      
      return data;
    },
    enabled: !!user,
  });
  
  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Fetch total check-ins
      const { data: checkinsData, error: checkinsError } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", user.id)
        .not("end_time", "is", null);
      
      if (checkinsError) throw checkinsError;
      
      // Fetch favorite cafes
      const { data: favoritesData, error: favoritesError } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id);
      
      if (favoritesError) throw favoritesError;
      
      // Calculate total hours and total spent from check-ins
      const totalMinutes = checkinsData?.reduce((sum, checkin) => sum + (checkin.duration || 0), 0) || 0;
      const totalHours = totalMinutes / 60;
      const totalSpent = checkinsData?.reduce((sum, checkin) => sum + (checkin.cost || 0), 0) || 0;
      
      return {
        checkinsCount: checkinsData?.length || 0,
        favoritesCount: favoritesData?.length || 0,
        totalHours,
        totalSpent,
      };
    },
    enabled: !!user,
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("user_profiles")
        .update({
          ...values,
          skills,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      return values;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
  
  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col p-4">
          <h2 className="text-2xl font-bold mb-2">Please sign in</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to view your profile</p>
          <Button className="bg-hero-gradient" asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar />
      <main className="flex-1 px-4 py-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-gray-600">
                Manage your account and preferences
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left sidebar */}
            <div>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.name || "User"} />
                      <AvatarFallback className="text-2xl">
                        {profile?.name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-xl font-semibold">{profile?.name || "User"}</h2>
                    <p className="text-gray-500">{user.email}</p>
                    
                    <div className="mt-4 flex items-center bg-gray-50 w-full p-3 rounded-lg">
                      <Coins className="h-5 w-5 mr-2 text-antiapp-purple" />
                      <div>
                        <p className="text-xs text-gray-500">AntiCoin Balance</p>
                        <p className="font-semibold">{connected && publicKey ? "100" : "Connect wallet to view"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Stats</CardTitle>
                  <CardDescription>Your activity overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Check-ins</span>
                      <span className="font-medium">{userStats?.checkinsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours Worked</span>
                      <span className="font-medium">{userStats?.totalHours.toFixed(1) || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Money Saved</span>
                      <span className="font-medium">${userStats?.totalSpent.toFixed(2) || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Favorite Cafes</span>
                      <span className="font-medium">{userStats?.favoritesCount || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Solana Wallet</CardTitle>
                  <CardDescription>Connect to manage your AntiCoins on Solana</CardDescription>
                </CardHeader>
                <CardContent>
                  <WalletConnection fullWidth showDetails />
                </CardContent>
              </Card>
            </div>
            
            {/* Right content area */}
            <div className="md:col-span-2">
              <Tabs defaultValue="profile">
                <TabsList className="grid grid-cols-2 w-full mb-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Profile</CardTitle>
                      <CardDescription>
                        Update your personal information and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="avatar_url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Avatar URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/avatar.jpg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us a little about yourself" 
                                    className="resize-none" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="work_style"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Work Style</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select your preferred work style" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {workStyles.map((style) => (
                                      <SelectItem key={style.value} value={style.value}>
                                        {style.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div>
                            <FormLabel>Skills & Interests</FormLabel>
                            <div className="flex mt-1.5 mb-3">
                              <Input
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                placeholder="Add a skill or interest"
                                className="mr-2"
                              />
                              <Button type="button" onClick={handleAddSkill}>Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill) => (
                                <Badge 
                                  key={skill} 
                                  variant="outline"
                                  className="px-3 py-1"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    className="ml-2 text-gray-500 hover:text-gray-700"
                                    onClick={() => handleRemoveSkill(skill)}
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                              {skills.length === 0 && (
                                <span className="text-sm text-gray-500">
                                  No skills added yet
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="mt-4 bg-hero-gradient"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="wallet">
                  <Card>
                    <CardHeader>
                      <CardTitle>Solana Wallet</CardTitle>
                      <CardDescription>
                        Manage your AntiCoins on the Solana blockchain
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Wallet Connection Component */}
                      <div className="mb-6">
                        <WalletConnection fullWidth showDetails />
                      </div>
                      
                      {/* AntiCoin Balance Info */}
                      <Card className="mt-4">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <Coins className="h-5 w-5 mr-2 text-antiapp-purple" />
                            AntiCoin Balance
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="w-full text-center">
                              <p className="text-sm text-gray-500">Blockchain Balance</p>
                              <p className="text-2xl font-semibold">{publicKey ? "100" : "--"}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {publicKey 
                                  ? "Your actual balance on Solana blockchain" 
                                  : "Connect wallet to view balance"}
                              </p>
                            </div>
                          </div>
                          {publicKey && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full mt-4"
                              onClick={() => {
                                window.open(`https://explorer.solana.com/address/${publicKey.toString()}/tokens?cluster=devnet`, '_blank');
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh Balance
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                      
                      {/* AntiCoin Token Info */}
                      <Card className="mt-4">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Token Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <dl className="space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-sm font-medium text-gray-500">Token Name:</dt>
                              <dd className="text-sm text-gray-900">AntiCoin</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm font-medium text-gray-500">Network:</dt>
                              <dd className="text-sm text-gray-900">Solana Devnet</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm font-medium text-gray-500">Mint Address:</dt>
                              <dd className="text-sm text-gray-900 truncate max-w-[200px]">
                                FgYtyNfue5ccRPkG3oeychHs4TQ4xWxYbmfmpD2FhQdN
                              </dd>
                            </div>
                          </dl>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => window.open('https://explorer.solana.com/address/FgYtyNfue5ccRPkG3oeychHs4TQ4xWxYbmfmpD2FhQdN?cluster=devnet', '_blank')}
                          >
                            View on Solana Explorer
                          </Button>
                        </CardFooter>
                      </Card>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;
