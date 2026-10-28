import type { DocumentKind, EmployeeRole, EmployeeStatus } from "../lib/supabase";

export type Employee = {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  /** Local-demo only */
  password?: string;
};

export type GeoPoint = {
  lat: number;
  lng: number;
  accuracyM: number | null;
  capturedAt: string;
};

export type TimeEntry = {
  id: string;
  employeeId: string;
  employeeName?: string;
  clockIn: string;
  clockOut: string | null;
  note: string;
  clockInGeo?: GeoPoint | null;
  clockOutGeo?: GeoPoint | null;
};

export type ReminderPrefs = {
  enabled: boolean;
  /** Local America/Chicago wall time HH:mm */
  clockInAt: string;
  clockOutAt: string;
  longShiftHours: number;
  weekdaysOnly: boolean;
};

export type InternalDocument = {
  id: string;
  kind: DocumentKind;
  title: string;
  body: string;
  published: boolean;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResult = { ok: boolean; message: string };
