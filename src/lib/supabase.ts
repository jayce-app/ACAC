import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  company: string;
  trade: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  role: "member" | "admin";
  years_in_business?: string | null;
  service_area?: string | null;
  website?: string | null;
  insurance_notes?: string | null;
  license_notes?: string | null;
  about_work?: string | null;
};
