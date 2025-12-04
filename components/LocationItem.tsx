
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { deleteLocation } from '@/firebase/service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Location } from '@/types';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

interface LocationItemProps {
  item: Location;
  planId: string; // Terima planId secara eksplisit
  onRefresh: () => void;
  drag?: () => void; // Tambahkan prop untuk fungsi drag
}

export function LocationItem({ item, planId, onRefresh, drag }: LocationItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [isExpanded, setIsExpanded] = useState(false);
  const themeColors = Colors[colorScheme];
  const styles = createStyles(themeColors);
  const handleLongPress = () => {
    Alert.alert(
      item.name,
      'Pilih aksi yang ingin Anda lakukan untuk lokasi ini.',
      [
        {
          text: 'Edit',
          onPress: () => router.push(`/add-location?planId=${planId}&locationId=${item.id}`),
          style: 'default',
        },
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert(
              `Hapus "${item.name}"?`,
              'Apakah Anda yakin ingin menghapus lokasi ini?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  onPress: async () => {
                    try {
                      await deleteLocation(planId, item.id);
                      onRefresh();
                    } catch (error) {
                      console.error('Failed to delete location:', error);
                      Alert.alert('Gagal', 'Tidak dapat menghapus lokasi.');
                    }
                  },
                  style: 'destructive',
                },
              ]
            );
          },
          style: 'destructive',
        },
        {
          text: 'Batal',
          style: 'cancel',
        },
      ],
      { cancelable: true } // Memungkinkan dialog ditutup dengan mengetuk di luar
    );
  };

  const handleRoutePress = () => {
    if (!item.latitude || !item.longitude) {
      Alert.alert("Lokasi Tidak Valid", "Koordinat untuk lokasi ini tidak tersedia.");
      return;
    }
    // Membuat URL untuk Google Maps Directions API
    const url = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
    // Membuka URL di aplikasi Google Maps atau browser
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const toggleExpansion = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <View style={styles.shadowContainer}>
      <Pressable 
        onLongPress={handleLongPress}
        onPress={toggleExpansion}
        style={styles.card}
      >
        {/* Drag Handle */}
        {/* Gunakan Pressable dan batalkan event bubble agar tidak memicu long press pada parent */}
        <Pressable onLongPress={drag} onPressIn={(e) => e.stopPropagation()} style={styles.dragHandle}>
            <IconSymbol name="drag-handle" size={24} color={themeColors.secondaryText} />
        </Pressable>

        {/* Icon could go here */}
        <View style={styles.timeContainer}>
          <ThemedText style={styles.timeText}>
              {new Date(item.visitDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </ThemedText>
        </View>
        <View style={styles.detailsContainer}>
          <ThemedText type="subtitle" style={styles.locationName}>{item.name}</ThemedText>
          {item.notes ? <ThemedText numberOfLines={isExpanded ? undefined : 2} style={styles.locationNotes}>{item.notes}</ThemedText> : null}
          
          {isExpanded && (
            <View style={styles.expandedContainer}>
              <Pressable style={styles.routeButton} onPress={handleRoutePress}>
                <IconSymbol name="square.and.arrow.up" size={16} color={styles.routeButtonText.color} />
                <Text style={styles.routeButtonText}>Lihat Rute</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
  shadowContainer: {
    ...Shadows.subtle,
    marginBottom: Sizing.md,
  },
  card: {
    backgroundColor: themeColors.card,
    borderRadius: Sizing.radius,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Sizing.md,
  },
  dragHandle: {
    paddingRight: Sizing.md,
    justifyContent: 'center',
  },
  timeContainer: {
    marginRight: Sizing.md, // Mengganti padding dengan margin
    borderRightWidth: 1,
    borderRightColor: themeColors.border,
    alignItems: 'center',
    paddingRight: Sizing.md,
  },
  timeText: { // Gaya untuk teks waktu
    fontFamily: Fonts.sansBold,
    color: themeColors.primary,
    fontSize: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  locationName: {
    fontFamily: Fonts.sansSemiBold,
    marginBottom: Sizing.xs,
  },
  locationNotes: {
      color: themeColors.secondaryText,
      fontSize: 14,
  },
  expandedContainer: {
    marginTop: Sizing.md,
  },
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.secondaryBackground,
    paddingVertical: Sizing.sm,
    paddingHorizontal: Sizing.md,
    borderRadius: Sizing.radius,
    alignSelf: 'flex-start', // Agar tombol tidak memenuhi lebar
    gap: Sizing.sm,
  },
  routeButtonText: {
    color: themeColors.primary,
    fontFamily: Fonts.sansSemiBold,
  }
});
