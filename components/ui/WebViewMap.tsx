import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { ThemedText } from '../themed-text';

interface Coords {
    latitude: number;
    longitude: number;
}

interface WebViewMapProps {
    initialCoords?: Coords | null;
    markers?: { id: string; latitude: number; longitude: number; name: string; notes?: string; }[];
    onMapClick?: (coords: Coords) => void;
    onMarkerDragEnd?: (coords: Coords) => void;
    onSearchSelect?: (coords: Coords, name: string, displayName: string) => void;
    searchQuery?: string;
    showSearch?: boolean;
    showControls?: boolean;
    readOnly?: boolean; // Jika true, tidak bisa klik/drag marker
}

const WebViewMap: React.FC<WebViewMapProps> = ({
    initialCoords,
    markers = [],
    onMapClick,
    onMarkerDragEnd,
    onSearchSelect,
    searchQuery: propSearchQuery = '',
    showSearch = false,
    showControls = false,
    readOnly = false,
}) => {
    const webViewRef = useRef<WebView>(null);
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];
    const styles = createStyles(themeColors);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const generateHtml = useCallback((initialLat: number, initialLon: number) => `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            html, body, #map {
                height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
                overflow: hidden;
                background-color: ${themeColors.background};
            }
            .leaflet-control-attribution {
                color: ${themeColors.text};
            }
            .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                background: ${themeColors.card};
                color: ${themeColors.text};
            }
            .leaflet-popup-content a {
                color: ${themeColors.primary};
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            const map = L.map('map').setView([${initialLat}, ${initialLon}], ${markers.length > 0 ? 13 : 4});

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            let currentMarker = null;
            let allMarkers = {};
            let polyline = null;

            // Function to send messages to React Native
            function sendMessage(type, payload) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
            }

            // Handle map clicks for picking a location
            if (!${readOnly}) {
                map.on('click', function(e) {
                    const { lat, lng } = e.latlng;
                    if (currentMarker) {
                        currentMarker.setLatLng(e.latlng);
                    } else {
                        currentMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
                        currentMarker.on('dragend', function(event) {
                            const { lat, lng } = event.target.getLatLng();
                            sendMessage('markerDragEnd', { latitude: lat, longitude: lng });
                        });
                    }
                    sendMessage('mapClick', { latitude: lat, longitude: lng });
                });
            }

            // Function to add/update markers from React Native
            function updateMarkers(markersData) {
                // Clear existing markers if not in readOnly mode (for single picker marker)
                if (currentMarker && !${readOnly}) {
                    map.removeLayer(currentMarker);
                    currentMarker = null;
                }
                
                // Clear all existing markers if in readOnly mode
                if (${readOnly}) {
                    for (const id in allMarkers) {
                        map.removeLayer(allMarkers[id]);
                    }
                    allMarkers = {};
                }

                const latLngs = [];
                markersData.forEach(m => {
                    const latLng = [m.latitude, m.longitude];
                    latLngs.push(latLng);

                    let marker = allMarkers[m.id];
                    if (!marker) {
                        marker = L.marker(latLng).addTo(map);
                        allMarkers[m.id] = marker;
                    } else {
                        marker.setLatLng(latLng);
                    }

                    marker.bindPopup(\`<b>\${m.name}</b><br>\${m.notes || ''}\`);
                });

                // Update polyline
                if (polyline) {
                    map.removeLayer(polyline);
                }
                if (latLngs.length > 1) {
                    polyline = L.polyline(latLngs, { color: '${themeColors.primary}' }).addTo(map);
                }

                // Fit map to markers
                if (latLngs.length > 0) {
                    map.fitBounds(latLngs, { padding: [50, 50] });
                }
            }

            // Initial marker update
            updateMarkers(${JSON.stringify(markers)});

            // Listen for messages from React Native to update markers
            document.addEventListener('message', function(event) {
                const data = JSON.parse(event.data);
                if (data.type === 'updateMarkers') {
                    updateMarkers(data.payload);
                }
            });

            sendMessage('mapReady', {});
        </script>
    </body>
    </html>
  `, [themeColors, readOnly, markers]);

    const initialLat = initialCoords?.latitude ?? -6.2088;
    const initialLon = initialCoords?.longitude ?? 106.8456;

    const htmlContent = useMemo(() => generateHtml(initialLat, initialLon), [generateHtml, initialLat, initialLon]);

    const handleMessage = (event: any) => {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'mapReady') {
            setIsMapLoaded(true);
        } else if (data.type === 'mapClick' && onMapClick) {
            onMapClick(data.payload);
        } else if (data.type === 'markerDragEnd' && onMarkerDragEnd) {
            onMarkerDragEnd(data.payload);
        }
        // Add handlers for search results if implemented in WebView
    };

    // Inject JS to update markers when `markers` prop changes
    useEffect(() => {
        if (isMapLoaded && webViewRef.current && readOnly) {
            webViewRef.current.postMessage(JSON.stringify({ type: 'updateMarkers', payload: markers }));
        }
    }, [markers, isMapLoaded, readOnly]);

    return (
        <View style={styles.container}>
            {!isMapLoaded && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                    <ThemedText style={{ color: themeColors.secondaryText, marginTop: 10 }}>Memuat Peta...</ThemedText>
                </View>
            )}
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowFileAccess={true}
                geolocationEnabled={true}
                style={styles.webview}
            />
        </View>
    );
};

const createStyles = (themeColors: typeof Colors.light) => StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
        backgroundColor: themeColors.background,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: themeColors.background,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});

export default WebViewMap;