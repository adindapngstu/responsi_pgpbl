import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import MapTab from '@/components/ui/map-tab';
import NotesTab from '@/components/ui/notes-tab';
import TimelineTab from '@/components/ui/timeline-tab';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { deletePlan, fetchLocationsForPlan, fetchPlanById } from '@/firebase/service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Location, Plan } from '@/types';
import { formatDateRange } from '@/utils/date';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
const placeholderImage = require('../../assets/images/cover.png');

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'map' | 'notes'>('timeline');
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const styles = createStyles(themeColors);
  const primaryColor = themeColors.primary;

  useFocusEffect(
    useCallback(() => {
      if (!id) return;

      let isMounted = true;

      const loadData = async () => {
        setIsLoading(true);
        try {
          const fetchedPlan = await fetchPlanById(id);
          const fetchedLocations = await fetchLocationsForPlan(id);
          if (isMounted) {
            setPlan(fetchedPlan);
            setLocations(fetchedLocations);
          }
        } catch (error) {
          console.error("Failed to fetch plan details:", error);
          if (isMounted) {
            Alert.alert('Error', 'Gagal memuat detail perjalanan.');
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    }, [id])
  );

  const handleDeletePlan = useCallback(async () => {
    if (!id) return;
    Alert.alert(
      `Hapus "${plan?.name}"?`,
      'Semua data di dalamnya akan hilang selamanya.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deletePlan(id);
              router.back();
            } catch (error) {
              console.error("Failed to delete plan:", error);
              Alert.alert('Error', 'Gagal menghapus rencana.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [id, plan?.name]);

  if (!id) {
    // Handle case where ID is missing, maybe redirect or show an error
    return <ThemedView style={styles.container}><ThemedText>ID Rencana tidak ditemukan.</ThemedText></ThemedView>;
  }

  if (isLoading || !plan) {
    return <ActivityIndicator size="large" color={themeColors.primary} style={{ flex: 1 }} />;
  }

  return (
    <ThemedView style={styles.container}>
      <Image source={plan.coverImageUri ? { uri: plan.coverImageUri } : placeholderImage} style={styles.headerImage} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={28} color={themeColors.white} />
        </Pressable>
        {plan.status !== 'completed' && (
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push(`/create-plan?id=${id}`)} style={styles.actionButton}>
              <IconSymbol name="pencil" size={22} color={themeColors.white} />
            </Pressable>
            <Pressable onPress={handleDeletePlan} style={styles.actionButton}>
              {isDeleting ? <ActivityIndicator color={themeColors.white} /> : <IconSymbol name="trash.fill" size={22} color={themeColors.danger} />}
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.planInfo}>
        <ThemedText type="title" style={styles.planTitle}>{plan.name}</ThemedText>
        <ThemedText style={styles.planDates}>{formatDateRange(plan.startDate, plan.endDate)}</ThemedText>
      </View>

      <View style={styles.tabContainer}>
        <Pressable 
            style={[styles.tabButton, activeTab === 'timeline' && [styles.activeTab, { backgroundColor: themeColors.secondaryBackground }]]} 
            onPress={() => setActiveTab('timeline')}>
            <IconSymbol name="list.bullet" size={20} color={activeTab === 'timeline' ? primaryColor : themeColors.secondaryText} />
            <Text style={[styles.tabText, {color: activeTab === 'timeline' ? primaryColor : themeColors.secondaryText}]}>Timeline</Text>
        </Pressable>
        <Pressable 
            style={[styles.tabButton, activeTab === 'map' && [styles.activeTab, { backgroundColor: themeColors.secondaryBackground }]]} 
            onPress={() => setActiveTab('map')}>
            <IconSymbol name="map.fill" size={20} color={activeTab === 'map' ? primaryColor : themeColors.secondaryText} />
            <Text style={[styles.tabText, {color: activeTab === 'map' ? primaryColor : themeColors.secondaryText}]}>Peta</Text>
        </Pressable>
        <Pressable 
            style={[styles.tabButton, activeTab === 'notes' && [styles.activeTab, { backgroundColor: themeColors.secondaryBackground }]]} 
            onPress={() => setActiveTab('notes')}>
            <IconSymbol name="note.text" size={20} color={activeTab === 'notes' ? primaryColor : themeColors.secondaryText} />
            <Text style={[styles.tabText, {color: activeTab === 'notes' ? primaryColor : themeColors.secondaryText}]}>Catatan</Text>
        </Pressable>
      </View>
      
      {/* Render all tab contents unconditionally, but hide inactive ones */}
      {/* This ensures hooks inside child tabs are always rendered */}
      <View style={styles.tabContentContainer}>
        <View style={{ display: activeTab === 'timeline' ? 'flex' : 'none', flex: 1 }}>
          <TimelineTab planId={id!} initialLocations={locations} onLocationsChange={setLocations} isReadOnly={plan.status === 'completed'} />
        </View>
        <View style={{ display: activeTab === 'map' ? 'flex' : 'none', flex: 1 }}>
          <MapTab planId={id!} locations={locations} />
        </View>
        <View style={{ display: activeTab === 'notes' ? 'flex' : 'none', flex: 1 }}>
          <NotesTab planId={id!} />
        </View>
      </View>

      {/* Hanya tampilkan tombol Tambah Lokasi jika rencana belum selesai */}
      {plan.status !== 'completed' && (
        <Pressable style={styles.fab} onPress={() => router.push({ pathname: '/add-location', params: { planId: id } })}>
          <IconSymbol name="add.circle.fill" size={56} color={themeColors.primary} />
        </Pressable>
      )}
    </ThemedView>
  );
}

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
    container: { flex: 1 },
    headerImage: {
        width: '100%',
        height: 220, // Use a fixed height for better control
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        top: 50,
        left: Sizing.md,
        right: Sizing.md,
    },
    backButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        padding: 4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: Sizing.sm,
    },
    actionButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        padding: 8,
    },
    planInfo: {
        padding: Sizing.lg,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
    },
    planTitle: {
        fontSize: 24,
        fontFamily: Fonts.sansBold,
    },
    planDates: {
        color: themeColors.secondaryText,
        marginTop: Sizing.xs,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: Sizing.lg,
        paddingTop: Sizing.md,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Sizing.md,
        gap: Sizing.sm,
        borderRadius: Sizing.radius,
    },
    activeTab: {
        // Active tab style is applied inline
    },
    tabText: { 
        fontFamily: Fonts.sansSemiBold, // Path sudah benar
    }, // Color is set inline
    fab: { position: 'absolute', right: 20, bottom: 20, ...Shadows.medium, zIndex: 1 },
    tabContentContainer: {
      flex: 1, // Ensure this container takes up available space
    },
});