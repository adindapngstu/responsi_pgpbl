import { ThemedView } from '@/components/themed-view';
import { Colors, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import useDebouncedSave from '@/hooks/use-debounced-save';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput } from 'react-native';

// ───────────────────────────────────────────────
// 🟦 Tipe aman untuk color scheme
// ───────────────────────────────────────────────
type ThemeMode = keyof typeof Colors; // "light" | "dark"

// ───────────────────────────────────────────────
// 🟩 Main Component
// ───────────────────────────────────────────────
export default function JournalScreen() {
    const { planId } = useLocalSearchParams<{ planId: string }>();

    // pastikan hanya "light" atau "dark"
    const scheme = (useColorScheme() ?? 'light') as ThemeMode;

    const themeColors = Colors[scheme];
    const styles = createStyles(themeColors);

    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const storageKey = `journal_${planId}`;

    // ───────────────────────────────────────────────
    // 🔵 Load data dari AsyncStorage
    // ───────────────────────────────────────────────
    useEffect(() => {
        const loadJournal = async () => {
            if (!planId) return;
            try {
                const savedContent = await AsyncStorage.getItem(storageKey);
                if (savedContent !== null) setContent(savedContent);
            } catch (e) {
                console.error("Failed to load journal", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadJournal();
    }, [planId]);

    // ───────────────────────────────────────────────
    // 🟣 Debounced save
    // ───────────────────────────────────────────────
    useDebouncedSave(content, 500, () => {
        if (!planId || isLoading) return;
        AsyncStorage.setItem(storageKey, content)
            .catch(e => console.error("Failed to save journal", e));
    });

    // ───────────────────────────────────────────────
    // 🟡 Loading screen
    // ───────────────────────────────────────────────
    if (isLoading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" />;
    }

    // ───────────────────────────────────────────────
    // 🟢 UI utama
    // ───────────────────────────────────────────────
    return (
        <ThemedView style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Tulis pengalaman, pemikiran, atau momen perjalanan Anda…"
                value={content}
                onChangeText={setContent}
                multiline
                autoFocus
                placeholderTextColor={themeColors.secondaryText}
            />
        </ThemedView>
    );
}

// ───────────────────────────────────────────────
// 🔧 Styles
// ───────────────────────────────────────────────
const createStyles = (themeColors: typeof Colors.light) =>
    StyleSheet.create({
        container: { flex: 1, padding: 16 },
        input: {
            flex: 1,
            padding: Sizing.lg,
            fontSize: 16,
            color: themeColors.text,
            textAlignVertical: 'top',
        },
    });
