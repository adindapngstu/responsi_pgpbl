import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import WebViewMap from '@/components/ui/WebViewMap';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Coords {
  latitude: number;
  longitude: number;
}

interface Prediction {
  place_id: number;
  display_name: string;
  name: string;
  lat: number;
  lon: number;
}

export default function MapPickerScreen() {
  const params = useLocalSearchParams<{
    lat?: string;
    lon?: string;
    planId?: string;
    locationId?: string;
    name?: string;
    notes?: string;
    visitDate?: string;
    photoUri?: string;
  }>();

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [initialCoords] = useState<Coords | null>(() => {
    if (params.lat && params.lon) {
      return {
        latitude: parseFloat(params.lat),
        longitude: parseFloat(params.lon),
      };
    }
    return null;
  });

  const [selectedLocation, setSelectedLocation] = useState<Coords | null>(initialCoords);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedName, setSuggestedName] = useState<string | null>(params.name || null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // INITIAL USER LOCATION HANDLER
  useEffect(() => {
    const getUserLocation = async () => {
      if (initialCoords) return; // don't override existing location

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Izin Lokasi',
          'Aplikasi ini memerlukan izin lokasi untuk memusatkan peta.'
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      if (!selectedLocation) {
        setSelectedLocation(coords);
        reverseGeocode(coords);
      }
    };

    getUserLocation();
  }, []);

  // DEBOUNCED SEARCH
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (searchQuery.length > 2) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchQuery
          )}&format=json&addressdetails=1&limit=8`;

          const res = await fetch(url, {
            headers: { 'User-Agent': 'TravelPlannerApp' },
          });

          const data = await res.json();

          setPredictions(
            data.map((item: any) => ({
              place_id: item.place_id,
              display_name: item.display_name,
              name: item.namedetails?.name || item.display_name.split(',')[0],
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            }))
          );
        } catch (e) {
          Alert.alert('Gagal Mencari', 'Terjadi kesalahan saat mencari lokasi.');
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setPredictions([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  // REVERSE GEOCODING
  const reverseGeocode = async (coords: Coords) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1`;

      const res = await fetch(url, {
        headers: { 'User-Agent': 'TravelPlannerApp' },
      });

      const json = await res.json();
      const name = json.namedetails?.name || json.display_name.split(',')[0];

      setSuggestedName(name);
    } catch (e) {
      console.log('Reverse geocode error:', e);
    }
  };

  // HANDLE MAP INTERACTION
  const handleMapClick = (coords: Coords) => {
    setSelectedLocation(coords);
    reverseGeocode(coords);
  };

  const handleMarkerDragEnd = (coords: Coords) => {
    setSelectedLocation(coords);
    reverseGeocode(coords);
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Pilih Lokasi', 'Silakan pilih lokasi di peta terlebih dahulu.');
      return;
    }

    router.replace({
      pathname: '/add-location',
      params: {
        planId: params.planId,
        locationId: params.locationId,
        selectedLat: selectedLocation.latitude.toString(),
        selectedLon: selectedLocation.longitude.toString(),

        name: params.name,
        notes: params.notes,
        visitDate: params.visitDate,
        photoUri: params.photoUri,

        suggestedName: suggestedName,
      },
    });
  };

  const handleSearchSelect = (item: Prediction) => {
    const coords = { latitude: item.lat, longitude: item.lon };

    setSelectedLocation(coords);
    setSuggestedName(item.name);
    setSearchQuery(item.display_name);
    setPredictions([]);
  };

  const styles = createStyles(themeColors);

  return (
    <ThemedView style={styles.container}>
      <WebViewMap
        initialCoords={initialCoords}
        markers={
          selectedLocation
            ? [{ id: 'current', name: 'Lokasi Dipilih', ...selectedLocation }]
            : []
        }
        onMapClick={handleMapClick}
        onMarkerDragEnd={handleMarkerDragEnd}
        showSearch={false}
        showControls={false}
        readOnly={false}
      />

      {/* HEADER SEARCH */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: themeColors.secondaryBackground }]}
        >
          <IconSymbol name="chevron.left" size={28} color={themeColors.text} />
        </Pressable>

        <View style={[styles.searchContainer, { backgroundColor: themeColors.secondaryBackground }]}>
          <IconSymbol name="search" size={20} color={themeColors.secondaryText} />

          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Cari nama tempat atau alamat..."
            placeholderTextColor={themeColors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {isSearching ? (
            <ActivityIndicator size="small" color={themeColors.primary} style={styles.clearButton} />
          ) : (
            searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <IconSymbol
                  name="add.circle.fill"
                  size={20}
                  color={themeColors.secondaryText}
                  style={{ transform: [{ rotate: '45deg' }] }}
                />
              </Pressable>
            )
          )}
        </View>
      </View>

      {/* PREDICTION LIST */}
      {predictions.length > 0 && (
        <FlatList
          style={[styles.predictionsList, { backgroundColor: themeColors.secondaryBackground }]}
          data={predictions}
          keyExtractor={(item) => item.place_id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.predictionItem, { borderBottomColor: themeColors.background }]}
              onPress={() => handleSearchSelect(item)}
            >
              <Text style={{ color: themeColors.text }}>{item.display_name}</Text>
            </Pressable>
          )}
        />
      )}

      {/* FOOTER */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.confirmButton, { backgroundColor: themeColors.primary }]}
          onPress={handleConfirmLocation}
        >
          <Text style={[styles.confirmButtonText, { color: themeColors.white }]}>
            Konfirmasi Lokasi
          </Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const createStyles = (themeColors: typeof Colors.light) =>
  StyleSheet.create({
    container: { flex: 1 },

    header: {
      position: 'absolute',
      top: 50,
      left: Sizing.md,
      right: Sizing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Sizing.sm,
    },

    backButton: {
      borderRadius: 20,
      padding: 4,
    },

    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: Sizing.radius,
      paddingHorizontal: Sizing.md,
      ...Shadows.subtle,
    },

    searchInput: {
      flex: 1,
      height: 44,
      fontSize: 16,
      marginLeft: Sizing.sm,
    },

    clearButton: {
      padding: 8,
      marginRight: -8,
    },

    predictionsList: {
      position: 'absolute',
      top: 105,
      left: Sizing.md,
      right: Sizing.md,
      maxHeight: 200,
      borderRadius: Sizing.radius,
    },

    predictionItem: {
      padding: Sizing.md,
      borderBottomWidth: 1,
    },

    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: Sizing.lg,
    },

    confirmButton: {
      paddingVertical: Sizing.md,
      borderRadius: Sizing.largeRadius,
      alignItems: 'center',
      ...Shadows.medium,
    },

    confirmButtonText: {
      fontFamily: Fonts.sansBold,
      fontSize: 18,
    },
  });
