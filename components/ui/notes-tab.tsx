import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts, Shadows, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface NotesTabProps {
    planId: string;
}

const NotesTab: React.FC<NotesTabProps> = ({ planId }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createStyles(themeColors);

    const menuItems = [
        {
            title: 'Jurnal Harian',
            icon: 'book.fill', // SF Symbol name
            screen: 'journal',
            color: '#FF9500', // Orange
        },
        {
            title: 'Checklist Barang',
            icon: 'backpack.fill', // SF Symbol name
            screen: 'checklist',
            color: '#34C759', // Green
        },
        {
            title: 'To-Do List',
            icon: 'checkmark.square.fill', // SF Symbol name
            screen: 'todo',
            color: '#007AFF', // Blue
        },
    ];

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Catatan Perjalanan</ThemedText>
            {menuItems.map((item) => (
                <Pressable
                    key={item.screen}
                    style={styles.card}
                    onPress={() => router.push({ pathname: `/notes/${item.screen}`, params: { planId } })}
                >
                    <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                        <IconSymbol name={item.icon} size={24} color="#FFF" />
                    </View>
                    <ThemedText style={styles.cardText}>{item.title}</ThemedText>
                    <IconSymbol name="chevron.right" size={18} color={themeColors.secondaryText} />
                </Pressable>
            ))}
        </ThemedView>
    );
};

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
        padding: Sizing.lg,
    },
    title: {
        marginBottom: Sizing.xl,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeColors.card,
        padding: Sizing.md,
        borderRadius: Sizing.radius,
        marginBottom: Sizing.md,
        ...Shadows.subtle,
    },
    iconContainer: {
        padding: Sizing.sm,
        borderRadius: Sizing.radius,
        marginRight: Sizing.md,
    },
    cardText: {
        flex: 1,
        fontFamily: Fonts.sansSemiBold,
    },
});

export default NotesTab;