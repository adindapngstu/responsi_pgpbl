import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const WISHLIST_STORAGE_KEY = 'trip-planner-wishlist';

export interface WishlistItem {
    id: string;
    name: string;
    details: string;
    latitude: number;
    longitude: number;
    createdAt: string;
}

interface WishlistState {
    wishlist: WishlistItem[];
    loadWishlist: () => Promise<void>;
    addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt'>) => Promise<void>;
    removeWishlistItem: (id: string) => Promise<void>;
}

const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlist: [],

    // Memuat wishlist dari AsyncStorage
    loadWishlist: async () => {
        try {
            const storedWishlist = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
            if (storedWishlist) {
                set({ wishlist: JSON.parse(storedWishlist) });
            }
        } catch (error) {
            console.error("Gagal memuat wishlist:", error);
        }
    },

    // Menambah item baru dan menyimpannya
    addWishlistItem: async (newItemData) => {
        const newItem: WishlistItem = {
            ...newItemData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        const updatedWishlist = [newItem, ...get().wishlist];
        set({ wishlist: updatedWishlist });
        try {
            await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updatedWishlist));
        } catch (error) {
            console.error("Gagal menyimpan wishlist:", error);
        }
    },

    // Menghapus item dan menyimpannya
    removeWishlistItem: async (id) => {
        const updatedWishlist = get().wishlist.filter(item => item.id !== id);
        set({ wishlist: updatedWishlist });
        try {
            await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updatedWishlist));
        } catch (error) {
            console.error("Gagal menyimpan wishlist setelah menghapus:", error);
        }
    },
}));

export default useWishlistStore;