export interface Plan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  notes?: string;
  coverImageUri?: string;
}

export interface Location {
  id: string;
  planId: string; // Foreign key to Plan
  name: string;
  visitDate: string; // ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
  notes?: string;
  photoUri?: string;
  latitude: number;
  longitude: number;
  orderIndex: number;
}
