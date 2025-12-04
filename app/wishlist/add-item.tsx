import useWishlistStore from '@/app/wishlist-store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function WishlistAddItem() {
    const { lat, lon, suggestedName } = useLocalSearchParams<{ lat: string; lon: string; suggestedName: string }>();
    const { addWishlistItem } = useWishlistStore();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createStyles(themeColors);

    const [name, setName] = useState(suggestedName || '');
    const [details, setDetails] = useState('');

    const latitude = parseFloat(lat || '0');
    const longitude = parseFloat(lon || '0');

    const handleSave = async () => {
        if (!name.trim()) return;
        await addWishlistItem({
            name: name.trim(),
            details: details.trim(),
            latitude,
            longitude,
        });
        router.back(); // Kembali ke map picker
        router.back(); // Kembali ke wishlist tab
    };

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1, backgroundColor: themeColors.background }}
            contentContainerStyle={styles.container}
            extraScrollHeight={20}
            enableOnAndroid={true}
        >
            <ThemedView style={styles.innerContainer}>
                <ThemedText type="title" style={styles.title}>Tambah ke Wishlist</ThemedText>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nama Tempat</Text>
                    <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="cth: Kedai Kopi Senja" placeholderTextColor={themeColors.secondaryText} />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Detail (Opsional)</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={details} onChangeText={setDetails} placeholder="cth: Tempat yang bagus untuk kerja" multiline placeholderTextColor={themeColors.secondaryText} />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Koordinat</Text>
                    <Text style={styles.coordsText}>{`Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`}</Text>
                </View>

                <Pressable style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Simpan ke Wishlist</Text>
                </Pressable>
            </ThemedView>
        </KeyboardAwareScrollView>
    );
}

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
    container: { flexGrow: 1, justifyContent: 'space-between', padding: Sizing.lg },
    innerContainer: { backgroundColor: 'transparent' },
    title: { marginBottom: Sizing.xl, textAlign: 'center' },
    inputGroup: { marginBottom: Sizing.lg },
    label: { fontFamily: Fonts.sansSemiBold, color: themeColors.secondaryText, marginBottom: Sizing.sm, fontSize: 14 },
    input: { backgroundColor: themeColors.card, paddingHorizontal: Sizing.md, paddingVertical: Sizing.sm, borderRadius: 12, fontSize: 16, color: themeColors.text, ...Shadows.subtle },
    textArea: { height: 100, textAlignVertical: 'top' },
    coordsText: { fontFamily: 'monospace', color: themeColors.text, fontSize: 14, padding: Sizing.md, backgroundColor: themeColors.secondaryBackground, borderRadius: 12, overflow: 'hidden' },
    saveButton: { backgroundColor: themeColors.primary, padding: Sizing.md, borderRadius: 16, alignItems: 'center', marginTop: Sizing.xl, ...Shadows.medium },
    saveButtonText: { color: themeColors.white, fontFamily: Fonts.sansBold, fontSize: 16 },
});