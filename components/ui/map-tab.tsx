import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Location } from '@/types';
import React from 'react';
import { StyleSheet } from 'react-native';
import WebViewMap from './WebViewMap';

interface MapTabProps {
    planId: string;
    locations: Location[];
}

const MapTab: React.FC<MapTabProps> = ({ planId, locations }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createStyles(themeColors);

    return (
        <WebViewMap
            markers={locations}
            readOnly={true}
            showControls={true}
            initialCoords={locations.length > 0 ? { latitude: locations[0].latitude, longitude: locations[0].longitude } : null}
        />
    );
};

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default MapTab;