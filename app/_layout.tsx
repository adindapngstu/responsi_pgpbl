import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Tabs utama */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 

          {/* Halaman detail perjalanan */}
          <Stack.Screen name="plan/[id]" options={{ headerShown: false }} />

          {/* Modal untuk bikin perjalanan & tambah lokasi */}
          <Stack.Screen 
            name="create-plan" 
            options={{ presentation: 'modal', title: 'Rencana Perjalanan' }} 
          />
          <Stack.Screen 
            name="add-location" 
            options={{ presentation: 'modal', title: 'Tambah Lokasi' }} 
          /> 
          <Stack.Screen 
            name="map-picker" 
            options={{ presentation: 'fullScreenModal', headerShown: false }} 
          /> 

          {/* Rute untuk Wishlist */}
          <Stack.Screen 
            name="wishlist/map-picker" 
            options={{ presentation: 'fullScreenModal', headerShown: false }} 
          />
          <Stack.Screen 
            name="wishlist/add-item" 
            options={{ presentation: 'modal', title: 'Tambah Wishlist' }} 
          />
          {/* Catatan: TIDAK perlu declare route-nya di sini. 
              Expo Router otomatis membaca folder app/notes/*.tsx 
          */}

          {/* Halaman fallback */}
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
