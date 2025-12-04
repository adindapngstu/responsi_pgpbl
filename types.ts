export interface Plan {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    notes?: string;
    coverImageUri?: string;
    status?: 'active' | 'completed';
}

export interface Location {
    id: string;
    planId: string;
    name: string;
    visitDate: string;
    notes?: string;
    photoUri?: string;
    latitude: number;
    longitude: number;
    orderIndex?: number; // Untuk pengurutan di timeline
}