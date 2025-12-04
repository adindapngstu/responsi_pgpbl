import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import WebViewMap from '@/components/ui/WebViewMap';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import useDebounce from '@/hooks/use-debounce';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

export default function WishlistMapPicker() {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createStyles(themeColors);

    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestedName, setSuggestedName] = useState('');

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Dapatkan lokasi pengguna saat ini
    useEffect(() => {
        const getUserLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Izin Lokasi', 'Aplikasi ini memerlukan izin lokasi untuk memusatkan peta.');
                // Jika izin ditolak, default ke tengah Indonesia
                if (!selectedLocation) {
                    setSelectedLocation({ latitude: -2.5489, longitude: 118.0149 });
                }
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

            if (!selectedLocation) {
                setSelectedLocation(coords);
            }
        };
        getUserLocation();
    }, []);

    // Search handler
    useEffect(() => {
        if (debouncedSearchQuery.length < 3) {
            setSearchResults([]);
            return;
        }
        const search = async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                        debouncedSearchQuery
                    )}&format=json&limit=5`
                );
                const data: NominatimResult[] = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error("Nominatim search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };
        search();
    }, [debouncedSearchQuery]);

    // Reverse geocoding
    useEffect(() => {
        if (!selectedLocation) return;

        const reverseGeocode = async () => {
            try {
                const { latitude, longitude } = selectedLocation;
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );
                const json = await res.json();

                setSuggestedName(
                    json.namedetails?.name ||
                    json.address?.road ||
                    json.display_name.split(',')[0] ||
                    'Lokasi Pilihan'
                );
            } catch (error) {
                console.error("Reverse geocode failed:", error);
                setSuggestedName("Lokasi Pilihan");
            }
        };
        reverseGeocode();
    }, [selectedLocation]);

    const handleSelectSearchResult = (result: NominatimResult) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setSelectedLocation({ latitude: lat, longitude: lon });
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleConfirm = () => {
        if (!selectedLocation) return;
        router.push({
            pathname: '/wishlist/add-item',
            params: {
                lat: selectedLocation.latitude,
                lon: selectedLocation.longitude,
                suggestedName: suggestedName,
            },
        });
    };

    return (
        <ThemedView style={styles.container}>
            <WebViewMap
                onMapClick={setSelectedLocation}
                markers={
                    selectedLocation
                        ? [{ ...selectedLocation, id: '1', name: 'Pilihan' }]
                        : []
                }
                onMarkerDragEnd={setSelectedLocation}
            />

            {/* HEADER */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="xmark" size={20} color={themeColors.text} />
                </Pressable>

                <View style={styles.searchContainer}>
                    <IconSymbol name="magnifyingglass" size={18} color={themeColors.secondaryText} />

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari lokasi..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={themeColors.secondaryText}
                    />

                    {isSearching && <ActivityIndicator size="small" />}
                </View>
            </View>

            {/* SEARCH RESULTS */}
            {searchResults.length > 0 && (
                <View style={styles.resultsContainer}>
                    {searchResults.map(item => (
                        <Pressable
                            key={item.place_id}
                            style={styles.resultItem}
                            onPress={() => handleSelectSearchResult(item)}
                        >
                            <Text numberOfLines={1}>{item.display_name}</Text>
                        </Pressable>
                    ))}
                </View>
            )}

            {/* CONFIRM BOX */}
            {selectedLocation && (
                <View style={styles.confirmContainer}>
                    <Text style={styles.confirmText} numberOfLines={1}>
                        {suggestedName}
                    </Text>

                    <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                        <Text style={styles.confirmButtonText}>Konfirmasi Lokasi</Text>
                    </Pressable>
                </View>
            )}
        </ThemedView>
    );
}

const createStyles = (themeColors: typeof Colors.light) =>
    StyleSheet.create({
        container: { flex: 1 },

        header: {
            position: 'absolute',
            top: 60,
            left: 0,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Sizing.md,
            gap: Sizing.sm,
        },

        backButton: {
            backgroundColor: themeColors.card,
            padding: 8,
            borderRadius: 20,
            ...Shadows.subtle,
        },

        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: themeColors.card,
            borderRadius: 20,
            paddingHorizontal: Sizing.md,
            height: 40,
            ...Shadows.subtle,
        },

        searchInput: {
            flex: 1,
            color: themeColors.text,
            marginLeft: Sizing.sm,
            fontFamily: Fonts.sans,
        },

        resultsContainer: {
            position: 'absolute',
            top: 110,
            left: Sizing.md,
            right: Sizing.md,
            backgroundColor: themeColors.card,
            borderRadius: 12,
            ...Shadows.medium,
        },

        resultItem: {
            padding: Sizing.md,
            borderBottomWidth: 1,
            borderBottomColor: themeColors.border,
        },

        confirmContainer: {
            position: 'absolute',
            bottom: 40,
            left: Sizing.lg,
            right: Sizing.lg,
            backgroundColor: themeColors.card,
            padding: Sizing.md,
            borderRadius: 16,
            ...Shadows.medium,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Sizing.md,
        },

        confirmText: {
            flex: 1,
            fontFamily: Fonts.sansSemiBold,
            color: themeColors.text,
        },

        confirmButton: {
            backgroundColor: themeColors.primary,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
        },

        confirmButtonText: {
            color: themeColors.white,
            fontFamily: Fonts.sansBold,
        },
    });
