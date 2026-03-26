export type UserRole = "admin" | "user";
export type FunctionalRole = "owner" | "rider" | "trainer" | "producer";

export interface Profile {
    id: string;
    full_name: string | null;
    role: UserRole;
    functional_roles: FunctionalRole[];
    status: "active" | "banned" | "pending";
    avatar_url: string | null;
    is_spotlight: boolean;
    created_at: string;
    updated_at: string;
}

export interface Discipline {
    id: number;
    name: string;
    slug: string;
}

export interface Trainer {
    id: number;
    user_id?: string | null;
    name: string;
    location: string | null;
    phone: string | null;
    email: string | null;
    bio: string | null;
    image_url: string | null;
    specialties: string[] | null;
    is_spotlight?: boolean;
    created_at: string;
}

export interface Horse {
    id: number;
    name: string;
    breed: string | null;
    color: string | null;
    sex: "Stallion" | "Mare" | "Gelding" | "Colt" | "Filly" | null;
    birth_year: number | null;
    birth_date: string | null;
    has_pedigree: boolean;
    registry: string | null;
    sire: string | null;
    dam: string | null;
    owner_id: string | null;
    trainer_id: number | null;
    is_for_sale: boolean;
    sale_price: number | null;
    image_url: string | null;
    video_url: string | null;
    created_at: string;
    updated_at: string;
    // joined
    trainer?: Trainer;
    owner?: Profile;
}

export interface Event {
    id: number;
    name: string;
    venue: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    date: string;
    description: string | null;
    image_url: string | null;
    created_at: string;
}

export interface Performance {
    id: number;
    horse_id: number;
    event_id: number;
    discipline_id: number;
    event_name: string | null;
    event_type: string | null;
    time_or_score: string | null;
    est_time: string | null;
    placing: number | null;
    total_entries: number | null;
    rodeo_contest: string | null;
    season: string | null;
    prize_money: number | null;
    performance_date: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    priority: string | null;
    video_url: string | null;
    result_doc_url: string | null;
    created_at: string;
    // joined
    horse?: Horse;
    event?: Event;
    discipline?: Discipline;
}

export interface Sponsor {
    id: number;
    name: string;
    image_url: string | null;
    link_url: string | null;
    position: "sidebar" | "header" | "footer";
    dimensions: string | null;
    is_active: boolean;
    created_at: string;
}

export interface HorseFollow {
    id: number;
    user_id: string;
    horse_id: number;
    created_at: string;
}

// Database type map for Supabase generic client
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, "created_at" | "updated_at" | "is_spotlight">;
                Update: Partial<Omit<Profile, "id">>;
            };
            disciplines: {
                Row: Discipline;
                Insert: Omit<Discipline, "id">;
                Update: Partial<Omit<Discipline, "id">>;
            };
            trainers: {
                Row: Trainer;
                Insert: Omit<Trainer, "id" | "created_at" | "user_id">;
                Update: Partial<Omit<Trainer, "id">>;
            };
            horses: {
                Row: Horse;
                Insert: Omit<Horse, "id" | "created_at" | "updated_at" | "trainer" | "owner">;
                Update: Partial<Omit<Horse, "id" | "trainer" | "owner">>;
            };
            events: {
                Row: Event;
                Insert: Omit<Event, "id" | "created_at">;
                Update: Partial<Omit<Event, "id">>;
            };
            performances: {
                Row: Performance;
                Insert: Omit<Performance, "id" | "created_at" | "horse" | "event" | "discipline">;
                Update: Partial<Omit<Performance, "id" | "created_at" | "horse" | "event" | "discipline">>;
            };
            sponsors: {
                Row: Sponsor;
                Insert: Omit<Sponsor, "id" | "created_at">;
                Update: Partial<Omit<Sponsor, "id">>;
            };
            horse_follows: {
                Row: HorseFollow;
                Insert: Omit<HorseFollow, "id" | "created_at">;
                Update: Partial<Omit<HorseFollow, "id">>;
            };
            site_settings: {
                Row: { key: string; value: any; updated_at: string };
                Insert: { key: string; value: any; updated_at?: string };
                Update: { key?: string; value?: any; updated_at?: string };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            user_role: "admin" | "user" | "owner" | "rider" | "trainer" | "producer";
            horse_sex: "Stallion" | "Mare" | "Gelding" | "Colt" | "Filly";
            sponsor_position: "sidebar" | "header" | "footer";
        };
    };
}
