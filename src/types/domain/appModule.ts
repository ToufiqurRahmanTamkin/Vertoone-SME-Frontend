export interface AppModule {
  _id: string;
  name: string;
  key: string;
  description: string;
  icon: string;
  iconPublicId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AppModuleRef = string | AppModule;

export const moduleRefId = (ref: AppModuleRef): string =>
  typeof ref === "string" ? ref : ref._id;

export interface AppModuleListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface AppModulePayload {
  name: string;
  key: string;
  description?: string;
  icon?: string;
  iconPublicId?: string;
  isActive?: boolean;
}

export interface GrantedModule {
  moduleId: string;
  key: string;
  name: string;
}

export interface GrantedModuleAccess {
  invoiceNumber: string;
  planName: string;
  hasAccess: boolean;
  accessFrom: string;
  accessUntil: string;
  modules: GrantedModule[];
}
