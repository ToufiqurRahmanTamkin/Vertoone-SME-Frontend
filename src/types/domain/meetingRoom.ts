export const MEETING_ROOM_MIN_CAPACITY = 1;

export const MEETING_ROOM_MAX_CAPACITY = 10000;

export interface MeetingRoomRef {
  _id: string;
  name: string;
  code: string;
  color: string;
  capacity: number;
}

export interface MeetingRoom extends MeetingRoomRef {
  floor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingRoomListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  floor?: string;
  isActive?: boolean;
}

export interface MeetingRoomOptionQuery {
  search?: string;
  minCapacity?: number;
}

export interface MeetingRoomSummary {
  used: number;
  activeCount: number;
  inactiveCount: number;
  totalCapacity: number;
  floorCount: number;
}

export interface CreateMeetingRoomPayload {
  name: string;
  code: string;
  floor?: string;
  color: string;
  capacity: number;
  isActive?: boolean;
}

export type UpdateMeetingRoomPayload = Partial<CreateMeetingRoomPayload>;
