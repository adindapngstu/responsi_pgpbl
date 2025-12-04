import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Location } from '@/types';
import { router } from 'expo-router';
import React, { FC, useCallback, useMemo } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
// Impor LocationItem dari path yang benar
import { Shadows } from '@/constants/theme';
import { LocationItem } from '../LocationItem';

interface TimelineTabProps {
    planId: string;
    initialLocations: Location[];
    onLocationsChange: (locations: Location[]) => void;
    isReadOnly?: boolean;
}

interface LocationSection {
    title: string;
    data: Location[];
}

const TimelineTab: FC<TimelineTabProps> = ({ planId, initialLocations, onLocationsChange, isReadOnly }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createStyles(themeColors);

    // Mengelompokkan lokasi berdasarkan tanggal
    const locationSections = useMemo(() => {
        if (initialLocations.length === 0) return [];

        const grouped: { [key: string]: Location[] } = initialLocations.reduce((acc, location) => {
            const date = new Date(location.visitDate).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
            });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(location);
            return acc;
        }, {} as { [key: string]: Location[] });

        return Object.keys(grouped).map(date => ({
            title: date,
            data: grouped[date],
        }));
    }, [initialLocations]);

    const renderItem = useCallback(({ item }: { item: Location }) => (
        <LocationItem 
            item={item} 
            planId={planId} 
            onRefresh={() => onLocationsChange([...initialLocations])} // Simple refresh trigger
        />
    ), [planId]); // isActive bisa digunakan untuk mengubah style saat item di-drag

    const renderSectionHeader = ({ section: { title } }: { section: LocationSection }) => <Text style={styles.sectionHeader}>{title}</Text>;

    const ListEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyText, { color: themeColors.secondaryText }]}>
                Belum ada lokasi yang ditambahkan.
            </ThemedText>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <SectionList
                sections={locationSections}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={[styles.sectionListContent, initialLocations.length === 0 && styles.emptyListContent]}
            />
            
            {/* Hanya tampilkan tombol jika tidak dalam mode read-only */}
            {!isReadOnly && (
                <Pressable style={styles.fab} onPress={() => router.push({ pathname: '/add-location', params: { planId: planId } })}>
                    <ThemedText style={styles.fabText}>+ Tambah Lokasi</ThemedText>
                </Pressable>
            )}
        </ThemedView>
    );
};

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionListContent: {
        paddingHorizontal: Sizing.lg,
        paddingBottom: 100, // Padding untuk FAB
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Sizing.lg,
        marginTop: 80,
    },
    emptyListContent: {
        flexGrow: 1,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    sectionHeader: {
        paddingTop: Sizing.lg,
        paddingBottom: Sizing.sm,
        fontSize: 18,
        fontFamily: Fonts.sansBold,
        color: themeColors.text,
        backgroundColor: themeColors.background,
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
        color: themeColors.white,
        fontFamily: Fonts.sansBold,
        fontSize: 16,
    }
});

export default TimelineTab;