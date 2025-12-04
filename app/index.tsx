import { Colors, Sizing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

const logoImage = require('../assets/images/travelio.jpg');

export default function SplashScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    useFocusEffect(
        // Setelah 2 detik, arahkan ke halaman utama
        () => {
            const timer = setTimeout(() => {
                router.replace('/(tabs)');
            }, 2000); // 2 detik
    
            return () => clearTimeout(timer); // Bersihkan timer jika komponen di-unmount
        }
    );

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Image source={logoImage} style={styles.logo} />
            <ActivityIndicator size="small" color={themeColors.primary} style={styles.spinner} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    spinner: {
        marginTop: Sizing.xxl,
    },
});