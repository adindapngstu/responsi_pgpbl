import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface ChecklistItemProps {
    label: string;
    isChecked: boolean;
    onToggle: () => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ label, isChecked, onToggle }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createStyles(themeColors, isChecked);

    return (
        <Pressable style={styles.container} onPress={onToggle}>
            <IconSymbol
                name={isChecked ? 'checkmark.square.fill' : 'square'}
                size={24}
                color={isChecked ? themeColors.secondaryText : themeColors.primary}
            />
            <ThemedText style={styles.label}>{label}</ThemedText>
        </Pressable>
    );
};

const createStyles = (themeColors: typeof Colors.light, isChecked: boolean) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: Sizing.sm,
            gap: Sizing.md,
        },
        label: {
            flex: 1,
            fontSize: 16,
            fontFamily: Fonts.sans,
            color: isChecked ? themeColors.secondaryText : themeColors.text,
            textDecorationLine: isChecked ? 'line-through' : 'none',
        },
    });