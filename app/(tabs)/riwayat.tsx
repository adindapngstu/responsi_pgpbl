import { PlanCard } from '@/components/PlanCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Sizing } from '@/constants/theme';
import { db } from '@/firebase/config';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Plan } from '@/types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';

export default function HistoryScreen() {
    const [completedPlans, setCompletedPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createStyles(themeColors);

    useEffect(() => {
        const plansCollection = collection(db, 'plans');
        // Query hanya untuk mengambil rencana dengan status 'completed', pengurutan dilakukan di client
        const q = query(plansCollection, where('status', '==', 'completed'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedPlans: Plan[] = querySnapshot.docs.map(doc => {
                const data = doc.data() as { [key: string]: any };
                return {
                    id: doc.id,
                    name: data.name ?? '',
                    startDate: data.startDate?.toDate()?.toISOString() ?? new Date().toISOString(),
                    endDate: data.endDate?.toDate()?.toISOString() ?? new Date().toISOString(),
                    notes: data.notes ?? '',
                    coverImageUri: data.coverImageUri ?? '',
                    status: data.status,
                };
            });

            // Lakukan pengurutan di sisi client
            fetchedPlans.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

            setCompletedPlans(fetchedPlans);
            setIsLoading(false);
        }, (error) => {
            console.error("Firestore onSnapshot error for history: ", error);
            Alert.alert("Gagal Memuat Riwayat", "Tidak dapat mengambil riwayat perjalanan.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const renderPlanItem = ({ item }: { item: Plan }) => <PlanCard item={item} isHistory={true} />;

    const ListEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <IconSymbol name="history" size={48} color={themeColors.secondaryText} />
            <ThemedText type="subtitle" style={{ textAlign: 'center' }}>Belum Ada Riwayat</ThemedText>
            <ThemedText style={{ textAlign: 'center', color: themeColors.secondaryText, marginTop: Sizing.sm }}>
                Rencana yang sudah selesai akan muncul di sini.
            </ThemedText>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <View style={styles.titleContainer}>
                <IconSymbol name="history" size={28} color={themeColors.text} />
                <ThemedText type="title" style={styles.title}>Riwayat Perjalanan</ThemedText>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={themeColors.primary} style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={completedPlans}
                    renderItem={renderPlanItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={ListEmptyComponent}
                />
            )}
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
        paddingTop: 60,
        marginBottom: Sizing.lg,
    },
    title: {
        fontSize: 28,
    },
    listContent: {
        paddingHorizontal: Sizing.xl,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
        height: '80%',
    }
});