import { PlanCard } from '@/components/PlanCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { db } from '@/firebase/config'; // Impor db untuk listener
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Plan } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

export default function DashboardScreen() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const styles = createStyles(themeColors);

  useEffect(() => {
    // Cek status onboarding saat dasbor pertama kali dimuat
    const checkOnboarding = async () => {
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
      if (!hasOnboarded) {
        // Jika belum pernah onboarding, arahkan ke layar selamat datang yang baru
        router.replace('/welcome'); // Kita akan buat layar ini
      }
    };
    checkOnboarding();

    const plansCollection = collection(db, 'plans');
    // Hapus orderBy dari query Firestore untuk menghindari error indeks
    const q = query(plansCollection, where('status', '==', 'active'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedPlans: Plan[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as { [key: string]: any };
        
        const planObj: Plan = {
          id: doc.id, // Firestore doc id is string
          name: data.name ?? '',
          // Gunakan camelCase sesuai standar baru
          startDate: data.startDate?.toDate()?.toISOString() ?? new Date().toISOString(),
          endDate: data.endDate?.toDate()?.toISOString() ?? new Date().toISOString(),
          notes: data.notes ?? '',
          coverImageUri: data.coverImageUri ?? '',
          status: data.status,
        };

        return planObj;
      });

      // Lakukan pengurutan di sisi client setelah data diterima
      fetchedPlans.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      setPlans(fetchedPlans);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error: ", error);
      Alert.alert("Gagal Memuat Data", "Tidak dapat mengambil rencana perjalanan. Silakan periksa koneksi Anda atau coba lagi nanti.");
      // Hentikan loading meskipun terjadi error agar pengguna tidak terjebak
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderPlanItem = ({ item }: { item: Plan }) => <PlanCard item={item} />;

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
        <IconSymbol name="paperplane.fill" size={48} color={themeColors.secondaryText} />
        <ThemedText type="subtitle" style={{textAlign: 'center'}}>Belum Ada Rencana</ThemedText>
        <ThemedText style={{textAlign: 'center', color: themeColors.secondaryText, marginTop: Sizing.sm}}>
            Tekan tombol '+' untuk memulai perjalanan impian Anda!
        </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.titleContainer}> 
        <IconSymbol name="paperplane.fill" size={28} color={themeColors.text} />
        <ThemedText type="title" style={styles.title}>Perjalanan Saya</ThemedText>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={{ flex: 1 }}/>
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={ListEmptyComponent}
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push('/create-plan')}>
        <ThemedText style={styles.fabText}>+ Tambah Rencana</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizing.md,
    paddingHorizontal: Sizing.xl,
    paddingTop: 60, // Disesuaikan agar tidak tertutup notch
    marginBottom: Sizing.lg,
  },
  title: {
    fontSize: 28,
  },
  fab: {
    position: 'absolute',
    right: Sizing.lg,
    bottom: Sizing.lg,
    backgroundColor: themeColors.primary,
    borderRadius: Sizing.largeRadius,
    paddingVertical: Sizing.md,
    paddingHorizontal: Sizing.lg,
    ...Shadows.medium,
    zIndex: 1,
  },
  fabText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sansBold,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: Sizing.xl,
    paddingBottom: 100, // Padding untuk FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Beri ruang dari bawah
    height: '80%', // Gunakan persentase tinggi agar lebih fleksibel
  }
});
