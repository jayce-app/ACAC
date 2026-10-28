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

export type TimeEntry = {
  id: string;
  employeeId: string;
  employeeName?: string;
  clockIn: string;
  clockOut: string | null;
  note: string;
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
