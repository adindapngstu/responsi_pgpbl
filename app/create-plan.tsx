import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { addPlan, fetchPlanById, updatePlan } from '@/firebase/service';
import { useColorScheme } from '@/hooks/use-color-scheme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CreatePlanScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEditMode = !!id;

    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [coverImageUri, setCoverImageUri] = useState<string | undefined>(undefined);

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    useEffect(() => {
        if (isEditMode && id) {
            const loadPlan = async () => {
                try {
                    const plan = await fetchPlanById(id);
                    if (plan) {
                        setName(plan.name);
                        setNotes(plan.notes || '');
                        setStartDate(new Date(plan.startDate));
                        setEndDate(new Date(plan.endDate));
                        setCoverImageUri(plan.coverImageUri || undefined);
                    }
                } catch (error) {
                    console.error('Failed to load plan for editing:', error);
                }
            };
            loadPlan();
        }
    }, [id, isEditMode]);

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setCoverImageUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Nama diperlukan', 'Mohon masukkan nama untuk perjalanan Anda.');
            return;
        }

        try {
            if (isEditMode) {
                await updatePlan(id!, {
                    name: name,
                    startDate: startDate, // Kirim sebagai objek Date
                    endDate: endDate,     // Kirim sebagai objek Date
                    notes: notes || null,
                    coverImageUri: coverImageUri,
                });
            } else {
                await addPlan(name, startDate, endDate, notes, coverImageUri);
            }
            if (router.canGoBack()) router.back();
        } catch (error) {
            console.error('Failed to save plan:', error);
            Alert.alert('Error', 'Tidak dapat menyimpan rencana perjalanan.');
        }
    };

    const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || startDate;
        setShowStartDatePicker(Platform.OS === 'ios');
        setStartDate(currentDate);
        if (currentDate > endDate) {
            setEndDate(currentDate);
        }
    };

    const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || endDate;
        setShowEndDatePicker(Platform.OS === 'ios');
        setEndDate(currentDate);
    };

    const formatDate = (date: Date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <ThemedText type="title" style={styles.title}>{isEditMode ? 'Edit Rencana' : 'Rencana Baru'}</ThemedText>

                <Pressable onPress={handleImagePick} style={[styles.imagePicker, { backgroundColor: themeColors.secondaryBackground }]}>
                    {coverImageUri ? (
                        <Image source={{ uri: coverImageUri }} style={styles.coverImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <IconSymbol name="camera.fill" size={32} color={themeColors.secondaryText} />
                            <ThemedText style={{ color: themeColors.secondaryText, marginTop: Sizing.sm }}>Pilih Cover</ThemedText>
                        </View>
                    )}
                </Pressable>

                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Nama Perjalanan</ThemedText>
                    <TextInput
                        style={[styles.input, { backgroundColor: themeColors.secondaryBackground, color: themeColors.text }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Contoh: Liburan ke Bali"
                        placeholderTextColor={themeColors.secondaryText}
                    />
                </View>

                <View style={styles.dateRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <ThemedText style={styles.label}>Tanggal Mulai</ThemedText>
                        <Pressable onPress={() => setShowStartDatePicker(true)} style={[styles.input, { backgroundColor: themeColors.secondaryBackground }]}>
                            <ThemedText>{formatDate(startDate)}</ThemedText>
                        </Pressable>
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                        <ThemedText style={styles.label}>Tanggal Selesai</ThemedText>
                        <Pressable onPress={() => setShowEndDatePicker(true)} style={[styles.input, { backgroundColor: themeColors.secondaryBackground }]}>
                            <ThemedText>{formatDate(endDate < startDate ? startDate : endDate)}</ThemedText>
                        </Pressable>
                    </View>
                </View>

                {showStartDatePicker && (
                    <DateTimePicker value={startDate} mode="date" display="default" onChange={onStartDateChange} />
                )}
                {showEndDatePicker && (
                    <DateTimePicker value={endDate < startDate ? startDate : endDate} mode="date" display="default" onChange={onEndDateChange} minimumDate={startDate} />
                )}

                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Catatan (Opsional)</ThemedText>
                    <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: themeColors.secondaryBackground, color: themeColors.text }]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Tulis catatan penting di sini..."
                        placeholderTextColor={themeColors.secondaryText}
                        multiline
                    />
                </View>

                <Pressable style={[styles.saveButton, { backgroundColor: themeColors.primary }]} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Simpan Rencana</Text>
                </Pressable>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { padding: Sizing.lg },
    title: { marginBottom: Sizing.lg, fontSize: 28 },
    imagePicker: {
        width: '100%',
        borderRadius: Sizing.radius,
        aspectRatio: 16 / 9, // Membuat area gambar responsif
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Sizing.lg,
        overflow: 'hidden',
    },
    coverImage: { width: '100%', height: '100%' },
    imagePlaceholder: { alignItems: 'center' },
    inputGroup: { marginBottom: Sizing.lg },
    label: { fontFamily: Fonts.sansSemiBold, marginBottom: Sizing.sm, fontSize: 16 },
    input: {
        paddingHorizontal: Sizing.md,
        paddingVertical: Sizing.md,
        borderRadius: Sizing.radius,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    dateRow: {
        flexDirection: 'row',
        gap: Sizing.md,
    },
    saveButton: {
        padding: Sizing.lg,
        borderRadius: Sizing.radius,
        alignItems: 'center',
        marginTop: Sizing.md,
        ...Shadows.medium,
    },
    saveButtonText: {
        color: '#fff',
        fontFamily: Fonts.sansBold,
        fontSize: 18,
    },
});