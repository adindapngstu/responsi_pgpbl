import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';

const welcomeImage = require('../assets/images/welcome.png');
const { width } = Dimensions.get('window');
const imageSize = width * 0.7;

export default function WelcomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const handleStart = useCallback(async () => {
        try {
            await AsyncStorage.setItem('hasOnboarded', 'true');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Failed to save onboarding status', error);
        }
    }, [router]);

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Image source={welcomeImage} style={styles.image} />
            <ThemedText type="title" style={styles.title}>Rencanakan Perjalanan Impian Anda</ThemedText>
            <ThemedText style={[styles.subtitle, { color: themeColors.secondaryText }]}>
                Mulai dari membuat itinerary, menandai lokasi di peta, hingga mencatat setiap momen berharga.
            </ThemedText>
            <Pressable style={[styles.button, { backgroundColor: themeColors.primary }]} onPress={handleStart}>
                <ThemedText style={styles.buttonText}>Mulai Sekarang</ThemedText>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Sizing.xl,
    },
    image: {
        width: imageSize,
        height: imageSize,
        marginBottom: Sizing.xl,
    },
    title: { textAlign: 'center', marginBottom: Sizing.md },
    subtitle: { textAlign: 'center', marginBottom: Sizing.xxl },
    button: { width: '100%', padding: Sizing.lg, borderRadius: Sizing.radius, alignItems: 'center' },
    buttonText: { color: '#FFFFFF', fontFamily: Fonts.sansBold, fontSize: 18 },
});