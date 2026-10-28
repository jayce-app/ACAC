import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

export type EmployeeRole = "employee" | "admin";
export type EmployeeStatus = "active" | "inactive";
export type DocumentKind = "announcement" | "sop" | "policy" | "other";

export type EmployeeRow = {
  id: string;
  email: string;
  full_name: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  phone: string;
  created_at?: string;
};

export type TimeEntryRow = {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  note: string;
  clock_in_lat?: number | null;
  clock_in_lng?: number | null;
  clock_in_accuracy_m?: number | null;
  clock_out_lat?: number | null;
  clock_out_lng?: number | null;
  clock_out_accuracy_m?: number | null;
  created_at?: string;
};

export type DocumentRow = {
  id: string;
  kind: DocumentKind;
  title: string;
  body: string;
  published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  file_name?: string | null;
  file_mime?: string | null;
  file_size?: number | null;
  file_path?: string | null;
};

/** Private Supabase Storage bucket for crew document attachments */
export const EMPLOYEE_DOCS_BUCKET = "employee-docs";

export type GeofenceRow = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius_m: number;
  active: boolean;
  notify_enter: boolean;
  notify_exit: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
