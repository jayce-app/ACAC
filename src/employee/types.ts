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
  /** Optional short note shown with the attachment */
  body: string;
  published: boolean;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Attached file metadata (admin uploads; crew opens/downloads) */
  fileName: string | null;
  fileMime: string | null;
  fileSize: number | null;
  /** Cloud storage path, or local IndexedDB key */
  filePath: string | null;
};

export type DocumentWriteInput = {
  kind: DocumentKind;
  title: string;
  body: string;
  published: boolean;
  /** Required when creating; optional replacement when updating */
  file?: File | null;
};

/** Circular jobsite / shop fence. Admin-managed. */
export type Geofence = {
  id: string;
  name: string;
  /** Human-entered / geocoded street address (optional) */
  address: string;
  lat: number;
  lng: number;
  /** Radius in meters */
  radiusM: number;
  active: boolean;
  /** Notify crew to clock in when they enter */
  notifyEnter: boolean;
  /** Notify crew to clock out when they leave */
  notifyExit: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GeofenceInput = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  radiusM: number;
  active: boolean;
  notifyEnter: boolean;
  notifyExit: boolean;
};

export type AuthResult = { ok: boolean; message: string };
