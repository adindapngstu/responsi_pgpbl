import useWishlistStore from '@/app/wishlist-store';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const WishlistItemCard = ({ item, onRemove }: { item: any; onRemove: (id: string) => void }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createStyles(themeColors);

    const translateX = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationX < 0) {
                translateX.value = event.translationX;
            }
        })
        .onEnd(() => {
            if (translateX.value < -80) {
                runOnJS(onRemove)(item.id);
            }
            translateX.value = withTiming(0);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={styles.cardContainer}>
            <View style={styles.deleteAction}>
                <IconSymbol name="trash.fill" size={20} color="#FFF" />
            </View>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.card, animatedStyle]}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        {item.details && <Text style={styles.cardDetails}>{item.details}</Text>}
                        <Text style={styles.cardCoords}>{`Lat: ${item.latitude.toFixed(4)}, Lon: ${item.longitude.toFixed(4)}`}</Text>
                    </View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

export default function WishlistTab() {
    const { wishlist, loadWishlist, removeWishlistItem } = useWishlistStore();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createStyles(themeColors);

    useFocusEffect(
        useCallback(() => {
            loadWishlist();
        }, [])
    );

    const handleRemoveWithConfirmation = useCallback((id: string) => {
        Alert.alert(
            "Hapus Wishlist",
            "Apakah Anda yakin ingin menghapus lokasi ini dari wishlist?",
            [
                {
                    text: "Batal",
                    style: "cancel",
                    onPress: () => {} // Tidak melakukan apa-apa
                },
                { 
                    text: "Hapus", 
                    onPress: () => removeWishlistItem(id), 
                    style: "destructive" 
                }
            ]
        );
    }, [removeWishlistItem]);

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <IconSymbol name="star.fill" size={28} color={themeColors.text} />
                <ThemedText type="title" style={{ fontSize: 28 }}>Wishlist</ThemedText>
            </View>
            <FlatList
                data={wishlist}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <WishlistItemCard item={item} onRemove={handleRemoveWithConfirmation} />}
                contentContainerStyle={{ paddingHorizontal: Sizing.lg }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <ThemedText style={{ color: themeColors.secondaryText }}>Belum ada lokasi di wishlist.</ThemedText>
                        <ThemedText style={{ color: themeColors.secondaryText, marginTop: 4 }}>Tekan "Jelajahi" untuk menambah.</ThemedText>
                    </View>
                }
            />
            <Pressable style={styles.fab} onPress={() => router.push('/wishlist/map-picker')}>
                <IconSymbol name="map.fill" size={18} color={themeColors.white} />
                <Text style={styles.fabText}>Jelajahi Peta</Text>
            </Pressable>
        </ThemedView>
    );
}

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
    container: { flex: 1, backgroundColor: themeColors.background },
    header: { 
        flexDirection: 'row',
        alignItems: 'center',
        gap: Sizing.md,
        padding: Sizing.lg, 
        paddingTop: 60, 
        paddingBottom: Sizing.sm 
    },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: '50%' },
    cardContainer: { marginBottom: Sizing.md, backgroundColor: '#FF3B30', borderRadius: 16, justifyContent: 'center' },
    deleteAction: { position: 'absolute', right: 24, alignItems: 'center' },
    card: { padding: Sizing.lg, backgroundColor: themeColors.card, borderRadius: 16, ...Shadows.subtle },
    cardTitle: { fontFamily: Fonts.sansBold, fontSize: 18, color: themeColors.text, marginBottom: 4 },
    cardDetails: { fontFamily: Fonts.sans, fontSize: 14, color: themeColors.secondaryText, marginBottom: 8 },
    cardCoords: { fontFamily: 'monospace', fontSize: 12, color: themeColors.secondaryText },
    fab: { position: 'absolute', bottom: Sizing.lg, right: Sizing.lg, flexDirection: 'row', alignItems: 'center', gap: Sizing.sm, backgroundColor: themeColors.primary, paddingVertical: Sizing.md, paddingHorizontal: Sizing.lg, borderRadius: Sizing.largeRadius, ...Shadows.medium },
    fabText: { color: themeColors.white, fontFamily: Fonts.sansBold, fontSize: 16 },
});