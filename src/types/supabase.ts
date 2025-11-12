
export type UserProfile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  work_style: string | null;
  skills: string[] | null;
  wallet_address: string | null;
  anticoin_balance: number;
  created_at: string;
  updated_at: string;
}

export type Cafe = {
  id: string;
  owner_id: string | null;
  name: string;
  location: string;
  address: string;
  description: string | null;
  wifi_strength: number | null;
  power_outlets: boolean;
  noise_level: number | null;
  seating_type: string | null;
  hourly_cost: number;
  open_hours: any | null; // JSONB field - can be any structure
  image_url: string | null;
  created_at: string;
  updated_at: string;
  tags: string[] | null;
}

export type Favorite = {
  id: string;
  user_id: string;
  cafe_id: string;
  created_at: string;
}

export type Checkin = {
  id: string;
  user_id: string;
  cafe_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  cost: number | null;
  coins_earned: number | null;
  created_at: string;
}

export type Booking = {
  id: string;
  user_id: string;
  cafe_id: string;
  date: string;
  start_time: string;
  duration: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export type AnticoinTransaction = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earn' | 'spend';
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export type Event = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cafe_id: string | null;
  date: string;
  start_time: string;
  duration: number;
  price: number | null;
  anticoin_cost: number | null;
  seat_limit: number | null;
  organizer: string | null;
  organizer_wallet: string | null; // Wallet address of the event organizer
  created_at: string;
  updated_at: string;
}

export type EventAttendee = {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

export type Sponsor = {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}
