import type { UserRole } from "./auth";

export interface ActorRef {
  _id: string;
  name: string;
  email: string;
}

export interface UserOption {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
}

export interface UserOptionQuery {
  search?: string;
  limit?: number;
}
