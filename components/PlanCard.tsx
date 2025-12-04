import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { deletePlan, updatePlanStatus } from '@/firebase/service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Plan } from '@/types';
import { formatDateRange } from '@/utils/date';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface PlanCardProps {
  item: Plan;
  isHistory?: boolean; // Prop baru untuk menandakan kartu ini ada di riwayat
}

export function PlanCard({ item, isHistory = false }: PlanCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(Colors[colorScheme]);

  const handleLongPress = () => {
    Alert.alert(
      item.name,
      'Pilih aksi yang ingin Anda lakukan untuk rencana ini.',
      [
        {
          text: 'Edit',
          onPress: () => router.push(`/create-plan?id=${item.id}`),
          style: 'default',
        },
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert(
              `Hapus "${item.name}"?`,
              'Semua lokasi di dalamnya juga akan terhapus. Tindakan ini tidak dapat dibatalkan.',
              [
                { text: 'Batal', style: 'cancel' },
                {
                  text: 'Hapus',
                  onPress: async () => {
                    try {
                      await deletePlan(item.id);
                      // Tidak perlu onRefresh, UI akan update otomatis via onSnapshot
                    } catch (error) {
                      console.error('Failed to delete plan:', error);
                      Alert.alert('Gagal', 'Tidak dapat menghapus perjalanan ini.');
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
      { cancelable: true }
    );
  };

  const handleMarkAsDone = () => {
    Alert.alert(
      'Selesaikan Perjalanan?',
      `Rencana "${item.name}" akan dipindahkan ke Riwayat.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Selesaikan',
          onPress: async () => {
            await updatePlanStatus(item.id, 'completed');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.shadowContainer}>
      <Pressable
        onPress={() => router.push(`/plan/${item.id}`)}
        onLongPress={isHistory ? undefined : handleLongPress}
        style={styles.card}
      >
        {item.coverImageUri ? (
          <Image source={{ uri: item.coverImageUri }} style={styles.coverImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <IconSymbol name="camera.fill" size={32} color={styles.placeholderText.color} />
            <ThemedText style={styles.placeholderText}>Belum ada gambar</ThemedText>
          </View>
        )}
        <View style={styles.textContainer}>
          <ThemedText type="subtitle" style={styles.planName}>{item.name}</ThemedText>
          <ThemedText style={styles.planDates}>{formatDateRange(item.startDate, item.endDate)}</ThemedText>
          {item.notes ? (
            <View style={styles.notesContainer}>
              <IconSymbol name="note.text" size={14} color={styles.planNotes.color} style={{ marginRight: Sizing.sm }} />
              <ThemedText numberOfLines={2} style={styles.planNotes}>{item.notes}</ThemedText>
            </View>
          ) : null}
          {!isHistory && (
            <Pressable style={styles.doneButton} onPress={handleMarkAsDone}>
              <IconSymbol name="checkmark.seal.fill" size={16} color={styles.doneButtonText.color} />
              <Text style={styles.doneButtonText}>Tandai Selesai</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
  shadowContainer: {
    ...Shadows.subtle,
    marginBottom: Sizing.lg,
  },
  card: {
    backgroundColor: themeColors.card,
    borderRadius: Sizing.largeRadius,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  placeholderImage: {
    width: '100%',
    backgroundColor: themeColors.secondaryBackground,
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: themeColors.secondaryText,
    marginTop: Sizing.sm,
  },
  textContainer: {
    padding: Sizing.md,
  },
  planName: {
    fontFamily: Fonts.sansSemiBold,
    marginBottom: Sizing.xs,
  },
  planDates: {
    color: themeColors.secondaryText,
    fontSize: 14,
    marginBottom: Sizing.sm,
  },  
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  planNotes: {
    color: themeColors.secondaryText,
    fontSize: 14,
    fontStyle: 'italic',
    flex: 1, // Agar teks bisa wrap dengan benar
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizing.sm,
    backgroundColor: themeColors.secondaryBackground,
    paddingVertical: Sizing.sm,
    paddingHorizontal: Sizing.md,
    borderRadius: Sizing.radius,
    alignSelf: 'flex-start',
    marginTop: Sizing.md,
  },
  doneButtonText: {
    color: themeColors.primary,
    fontFamily: Fonts.sansSemiBold,
  },
});
