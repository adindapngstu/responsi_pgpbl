import { Location, Plan } from '@/types';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './config'; // Pastikan db diimpor dari config

const PLANS_COLLECTION = 'plans';
const LOCATIONS_COLLECTION = 'locations';

export const addPlan = async (name: string, startDate: Date, endDate: Date, notes?: string, coverImageUri?: string) => {
    await addDoc(collection(db, PLANS_COLLECTION), {
        name,
        // Mengonversi Date ke Timestamp Firestore saat menyimpan
        startDate: Timestamp.fromDate(startDate), // Simpan sebagai camelCase
        endDate: Timestamp.fromDate(endDate),     // Simpan sebagai camelCase
        notes: notes || null,
        coverImageUri: coverImageUri || null, // Simpan sebagai camelCase
        createdAt: Timestamp.now(),
        status: 'active', // Tambahkan status default untuk semua rencana baru
    });
};

export const fetchPlanById = async (id: string): Promise<Plan | null> => {
    const docRef = doc(db, PLANS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Mengembalikan objek dengan camelCase agar konsisten dengan DB
        return {
            id: docSnap.id,
            name: data.name ?? '',
            startDate: data.startDate?.toDate()?.toISOString() ?? '',
            endDate: data.endDate?.toDate()?.toISOString() ?? '',
            notes: data.notes ?? '',
            coverImageUri: data.coverImageUri ?? '',
            status: data.status, // Tambahkan properti status
        } as Plan;
    }
    return null;
};

export const updatePlan = async (id: string, data: { name: string, startDate: Date, endDate: Date, notes: string | null, coverImageUri: string | undefined }) => {
    const planDoc = doc(db, PLANS_COLLECTION, id);
    // Buat objek baru untuk diupdate, agar tidak memutasi objek 'data'
    const updateData: { [key: string]: any } = {
        name: data.name, // Simpan sebagai camelCase
        notes: data.notes, // Simpan sebagai camelCase
        coverImageUri: data.coverImageUri // Simpan sebagai camelCase
    };

    // Konversi Date ke Timestamp sebelum update
    if (data.startDate) {
        updateData.startDate = Timestamp.fromDate(data.startDate); // Simpan sebagai camelCase
    }
    if (data.endDate) {
        updateData.endDate = Timestamp.fromDate(data.endDate); // Simpan sebagai camelCase
    }
    await updateDoc(planDoc, updateData);
};

export const deletePlan = async (id: string) => {
    const locationsCollection = collection(db, PLANS_COLLECTION, id, LOCATIONS_COLLECTION);
    const locationsSnapshot = await getDocs(locationsCollection);
    const batch = writeBatch(db);
    locationsSnapshot.docs.forEach((locationDoc) => {
        batch.delete(locationDoc.ref);
    });
    await batch.commit();

    const planDoc = doc(db, PLANS_COLLECTION, id);
    await deleteDoc(planDoc);
};

/**
 * Memperbarui status sebuah rencana perjalanan (misalnya menjadi 'completed').
 * @param planId ID dari rencana yang akan diperbarui.
 * @param status Status baru ('active' atau 'completed').
 */
export const updatePlanStatus = async (planId: string, status: 'active' | 'completed') => {
  const planDocRef = doc(db, PLANS_COLLECTION, planId);
  await updateDoc(planDocRef, {
    status: status,
  });
};

/**
 * MIGRASI: Menambahkan status 'active' ke semua rencana lama yang belum memilikinya.
 * Fungsi ini hanya perlu dijalankan sekali.
 */
export const migratePlansToActiveStatus = async () => {
    const plansCollection = collection(db, PLANS_COLLECTION);
    const q = query(plansCollection, where('status', '==', null)); // Cari dokumen dimana status adalah null (atau tidak ada)
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log("Tidak ada rencana yang perlu dimigrasi.");
        return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { status: 'active' });
    });
    await batch.commit();
    console.log(`Migrasi selesai: ${snapshot.size} rencana telah diperbarui.`);
};

// --- LOCATION SERVICE FUNCTIONS ---

export const fetchLocationsForPlan = async (planId: string): Promise<Location[]> => {
    const locationsCollection = collection(db, PLANS_COLLECTION, planId, LOCATIONS_COLLECTION);
    const q = query(locationsCollection, orderBy('orderIndex', 'asc'));
    const querySnapshot = await getDocs(q);
    // Mengembalikan objek dengan camelCase agar konsisten dengan DB
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            planId: planId,
            name: data.name ?? '',
            visitDate: data.visitDate, // Sudah camelCase
            notes: data.notes ?? '',
            photoUri: data.photoUri ?? '', // Sudah camelCase
            latitude: data.latitude ?? 0,
            longitude: data.longitude ?? 0,
            orderIndex: data.orderIndex ?? 999, // Sudah camelCase
        } as Location;
    });
};

export const addLocation = async (planId: string, locationData: any) => {
    const locationsCollection = collection(db, PLANS_COLLECTION, planId, LOCATIONS_COLLECTION);
    // Langsung simpan data karena sudah dalam format camelCase
    await addDoc(locationsCollection, locationData);
};

export const fetchLocationById = async (planId: string, locationId: string): Promise<Location | null> => {
    const docRef = doc(db, PLANS_COLLECTION, planId, LOCATIONS_COLLECTION, locationId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        // Mengembalikan objek dengan camelCase agar konsisten
        const data = docSnap.data();
        return {
            id: docSnap.id,
            planId: planId,
            name: data.name ?? '',
            visitDate: data.visitDate ?? new Date().toISOString(), // Sudah camelCase
            notes: data.notes ?? '',
            photoUri: data.photoUri ?? '', // Sudah camelCase
            latitude: data.latitude ?? 0,
            longitude: data.longitude ?? 0
        } as Location;
    }
    return null;
};

export const updateLocation = async (planId: string, locationId: string, data: any) => {
    const locationDoc = doc(db, PLANS_COLLECTION, planId, LOCATIONS_COLLECTION, locationId);
    // Langsung update data karena sudah dalam format camelCase
    await updateDoc(locationDoc, data);
};

export const deleteLocation = async (planId: string, locationId: string) => {
    const locationDoc = doc(db, PLANS_COLLECTION, planId, LOCATIONS_COLLECTION, locationId);
    await deleteDoc(locationDoc);
};

export const updateLocationOrder = async (planId: string, locationIds: string[]) => {
    const batch = writeBatch(db);
    locationIds.forEach((id, index) => {
        const locationDoc = doc(db, PLANS_COLLECTION, planId, LOCATIONS_COLLECTION, id);
        batch.update(locationDoc, { orderIndex: index });
    });
    await batch.commit();
};