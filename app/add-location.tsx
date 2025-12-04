import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { addLocation, fetchLocationById, updateLocation } from '@/firebase/service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Location } from '@/types';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function AddLocationScreen() {
    const params = useLocalSearchParams<{ planId: string; locationId?: string, selectedLat?: string, selectedLon?: string, name?: string, notes?: string, visitDate?: string, photoUri?: string, suggestedName?: string }>();
    const { planId, locationId, selectedLat, selectedLon, suggestedName } = params;
    const isEditMode = locationId !== undefined;

    const [name, setName] = useState('');
    const [visitDate, setVisitDate] = useState(new Date());
    const [notes, setNotes] = useState('');
    const [photoUri, setPhotoUri] = useState<string | undefined>();
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(isEditMode);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = useMemo(() => createStyles(themeColors), [colorScheme]);

    // Effect to load existing data when in edit mode
    useEffect(() => {
        if (isEditMode && locationId) {
            const loadLocation = async () => {
                setIsLoading(true);
                try {
                    const location = await fetchLocationById(planId, locationId);
                    if (location) {
                        // Only set state if it hasn't been updated by map-picker params
                        setName(location.name);
                        setVisitDate(new Date(location.visitDate));
                        setNotes(location.notes || '');
                        setPhotoUri(location.photoUri || undefined);
                        // Prioritize coordinates from map picker if they exist
                        setLatitude(selectedLat ? parseFloat(selectedLat) : location.latitude);
                        setLongitude(selectedLon ? parseFloat(selectedLon) : location.longitude);
                    } else {
                        Alert.alert('Error', 'Lokasi tidak ditemukan.');
                        router.back();
                    }
                } catch (error) {
                    console.error(error);
                    Alert.alert('Error', 'Gagal memuat data lokasi.');
                } finally {
                    setIsLoading(false);
                }
            };
            loadLocation();
        }
    }, [planId, locationId, isEditMode]);

    // Effect to handle params passed back from other screens (like map-picker)
    useEffect(() => {
        if (params.name) setName(params.name);
        if (params.notes) setNotes(params.notes);
        if (params.visitDate) setVisitDate(new Date(params.visitDate));
        if (params.photoUri) setPhotoUri(params.photoUri);
        if (selectedLat) setLatitude(parseFloat(selectedLat));
        if (selectedLon) setLongitude(parseFloat(selectedLon));
        // Jika ada nama yang disarankan DAN nama saat ini kosong, isi otomatis.
        if (suggestedName && !name) {
            setName(suggestedName);
        }
    }, [params.name, params.notes, params.visitDate, params.photoUri, selectedLat, selectedLon, suggestedName]);

    const handleImagePick = useCallback(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotoUri(result.assets[0].uri);
        }
    }, []);

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setVisitDate(selectedDate);
        }
    };

    const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setVisitDate(selectedTime);
        }
    };

    const handleSaveLocation = useCallback(async () => {
        if (!name.trim()) {
            Alert.alert('Nama Dibutuhkan', 'Mohon masukkan nama tempat.');
            return;
        }
        if (latitude === null || longitude === null) {
            Alert.alert('Lokasi Dibutuhkan', 'Mohon pilih lokasi di peta.');
            return;
        }

        try {
            // Firestore akan menangani pembuatan ID. Order index akan di-handle oleh Timeline.
            const locationData: Omit<Location, 'id'> = {
                name,
                planId: planId,
                visitDate: visitDate.toISOString(),
                notes: notes || '',
                photoUri: photoUri || '',
                latitude,
                longitude,
                orderIndex: 999, // Default order, will be managed by timeline logic
            };

            if (isEditMode && locationId) {
                await updateLocation(planId, locationId, locationData);
            } else {
                await addLocation(planId, locationData);
            }
            router.back();
        } catch (error) {
            console.error('Failed to save location', error);
            Alert.alert('Error', `Tidak dapat ${isEditMode ? 'memperbarui' : 'menyimpan'} lokasi. Coba lagi.`);
        }
    }, [planId, locationId, isEditMode, name, visitDate, notes, photoUri, latitude, longitude]);

    if (isLoading) {
        return <ActivityIndicator size="large" color={themeColors.primary} style={styles.loadingIndicator} />;
    }

    return (
        <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.container}
        >
            <ThemedView style={styles.innerContainer}>
                <ThemedText type="title" style={styles.title}>{isEditMode ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</ThemedText>

                {photoUri ? (
                    <Pressable onPress={handleImagePick}>
                        <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                    </Pressable>
                ) : (
                    <Pressable style={styles.imagePicker} onPress={handleImagePick}>
                        <ThemedText style={styles.imagePickerText}>+ {isEditMode ? 'Ganti' : 'Tambah'} Foto</ThemedText>
                    </Pressable>
                )}

                <ThemedText style={styles.label}>Nama Tempat</ThemedText>
                <TextInput
                    style={styles.input}
                    placeholder="cth: Pantai Kuta"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={themeColors.secondaryText}
                />

                <View style={styles.dateContainer}>
                    <View style={styles.datePickerWrapper}>
                        <ThemedText style={styles.label}>Tanggal Kunjungan</ThemedText>
                        <Pressable onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.dateText}>{visitDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
                        </Pressable>
                    </View>
                    <View style={styles.datePickerWrapper}>
                        <ThemedText style={styles.label}>Jam Kunjungan</ThemedText>
                        <Pressable onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.dateText}>{visitDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </Pressable>
                    </View>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={visitDate}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={visitDate}
                        mode="time"
                        display="default"
                        onChange={onTimeChange}
                    />
                )}

                <ThemedText style={styles.label}>Lokasi di Peta</ThemedText>
                <Pressable 
                    style={styles.mapPickerButton} 
                    onPress={() => router.push({
                        pathname: '/map-picker',
                        params: { 
                            planId,
                            locationId,
                            lat: latitude?.toString(), 
                            lon: longitude?.toString(),
                            name,
                            notes,
                            visitDate: visitDate.toISOString(),
                            photoUri,
                        }
                    })}
                >
                    <IconSymbol name="mappin.and.ellipse" size={20} color={styles.mapPickerButtonText.color} />
                    <Text style={styles.mapPickerButtonText}>
                        {latitude !== null && longitude !== null ? `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}` : 'Pilih Lokasi dari Peta'}
                    </Text>
                </Pressable>

                <ThemedText style={styles.label}>Catatan</ThemedText>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="cth: Buka jam 9 pagi, tiket masuk 50rb"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    placeholderTextColor={themeColors.secondaryText}
                />

                <Pressable style={styles.saveButton} onPress={handleSaveLocation}>
                    <Text style={styles.saveButtonText}>{isEditMode ? 'Perbarui Lokasi' : 'Simpan Lokasi'}</Text>
                </Pressable>
            </ThemedView>
        </KeyboardAwareScrollView>
    );
}

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    container: {
        padding: Sizing.lg,
    },
    innerContainer: {
        backgroundColor: 'transparent'
    },
    loadingIndicator: {
        flex: 1, justifyContent: 'center', alignItems: 'center'
    },
    title: {
        marginBottom: Sizing.xl,
        textAlign: 'center',
    },
    label: {
        color: themeColors.secondaryText,
        marginBottom: Sizing.sm,
        fontFamily: Fonts.sansSemiBold,
        fontSize: 14,
    },
    input: {
        backgroundColor: themeColors.secondaryBackground,
        paddingHorizontal: Sizing.md,
        paddingVertical: 12,
        borderRadius: Sizing.radius,
        marginBottom: Sizing.lg,
        fontFamily: Fonts.sans,
        fontSize: 16,
        color: themeColors.text,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Sizing.lg,
        gap: Sizing.md,
    },
    datePickerWrapper: { flex: 1 },
    dateText: {
        backgroundColor: themeColors.secondaryBackground,
        padding: Sizing.md,
        borderRadius: Sizing.radius,
        fontSize: 16,
        color: themeColors.text,
        overflow: 'hidden',
    },
    imagePicker: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Sizing.radius,
        borderWidth: 2,
        borderColor: themeColors.border,
        borderStyle: 'dashed',
        marginBottom: Sizing.lg,
        backgroundColor: themeColors.secondaryBackground,
        aspectRatio: 16 / 9,
    },
    imagePickerText: {
        color: themeColors.primary,
        fontFamily: Fonts.sansSemiBold,
    },
    photoPreview: {
        width: '100%',
        borderRadius: Sizing.radius,
        marginBottom: Sizing.lg,
        aspectRatio: 16 / 9,
    },
    mapPickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.secondaryBackground,
        padding: Sizing.md,
        borderRadius: Sizing.radius,
        marginBottom: Sizing.lg,
        gap: Sizing.sm,
    },
    mapPickerButtonText: {
        color: themeColors.primary,
        fontFamily: Fonts.sansSemiBold,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: themeColors.primary,
        paddingVertical: Sizing.md,
        borderRadius: Sizing.largeRadius,
        alignItems: 'center',
        ...Shadows.medium,
        marginTop: Sizing.md,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontFamily: Fonts.sansBold,
        fontSize: 18,
    },
});