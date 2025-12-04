import { ThemedView } from '@/components/themed-view';
import { ChecklistItem } from '@/components/ui/ChecklistItem';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Item {
    id: string;
    label: string;
    isChecked: boolean;
}

type ThemeMode = keyof typeof Colors;

export default function ChecklistScreen() {
    const { planId } = useLocalSearchParams<{ planId: string }>();
    
    // Pastikan hanya "light" atau "dark"
    const scheme = (useColorScheme() ?? 'light') as ThemeMode;
    const themeColors = Colors[scheme];
    const styles = createStyles(themeColors);

    const [items, setItems] = useState<Item[]>([]);
    const [newItemLabel, setNewItemLabel] = useState('');
    const storageKey = `checklist_${planId}`;

    // Muat data dari penyimpanan saat komponen dimuat
    useEffect(() => {
        const loadItems = async () => {
            if (!planId) return;
            try {
                const saved = await AsyncStorage.getItem(storageKey);
                if (saved) setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Gagal memuat checklist", e);
            }
        };
        loadItems();
    }, [planId]);

    // Fungsi untuk menyimpan data ke penyimpanan
    const saveData = (data: Item[]) => {
        if (planId) {
            AsyncStorage.setItem(storageKey, JSON.stringify(data))
                .catch(e => console.error("Gagal menyimpan checklist", e));
        }
    };

    // Fungsi untuk menambah item baru
    const handleAddItem = useCallback(() => {
        if (!newItemLabel.trim()) return;
        const newItem: Item = { id: Date.now().toString(), label: newItemLabel.trim(), isChecked: false };
        setItems(prevItems => {
            const updated = [...prevItems, newItem];
            saveData(updated);
            return updated;
        });
        setNewItemLabel('');
    }, [newItemLabel, storageKey]);

    // Fungsi untuk mengubah status ceklis
    const handleToggleItem = useCallback((id: string) => {
        setItems(prevItems => {
            const updated = prevItems.map(item =>
                item.id === id ? { ...item, isChecked: !item.isChecked } : item
            );
            saveData(updated);
            return updated;
        });
    }, [storageKey]);

    const renderItem = useCallback(({ item }: { item: Item }) => (
        <ChecklistItem
            label={item.label}
            isChecked={item.isChecked}
            onToggle={() => handleToggleItem(item.id)}
        />
    ), [handleToggleItem]);

    return (
        <ThemedView style={styles.container}>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: themeColors.secondaryText }]}>
                            Daftar barang bawaan masih kosong.
                        </Text>
                    </View>
                }
            />
            {/* Input untuk menambah item baru */}
            <View style={[styles.inputContainer, { borderTopColor: themeColors.border }]}>
                <TextInput
                    style={[styles.input, { backgroundColor: themeColors.secondaryBackground, color: themeColors.text }]}
                    placeholder="cth: Kaus kaki"
                    value={newItemLabel}
                    onChangeText={setNewItemLabel}
                    onSubmitEditing={handleAddItem}
                    placeholderTextColor={themeColors.secondaryText}
                />
                <Pressable style={styles.addButton} onPress={handleAddItem}>
                    <IconSymbol name="add.circle.fill" size={32} color={themeColors.primary} />
                </Pressable>
            </View>
        </ThemedView>
    );
}

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: Sizing.lg,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Sizing.md,
        gap: Sizing.md,
        borderTopWidth: 1,
        backgroundColor: themeColors.background,
    },
    input: {
        flex: 1,
        paddingHorizontal: Sizing.md,
        paddingVertical: Sizing.sm,
        borderRadius: Sizing.largeRadius,
        fontSize: 16,
    },
    addButton: {
        ...Shadows.subtle,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '50%',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: Fonts.sans,
    }
});
