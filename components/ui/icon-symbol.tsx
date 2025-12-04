// Cross-platform icon system: SF Symbols on iOS, Material Icons elsewhere

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Ambil type nama ikon Material
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

// Mapping antara nama SF Symbol (atau custom) dengan nama Material Icon
const MAPPING: Record<string, MaterialIconName> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.left': 'chevron-left',
  'chevron.right': 'chevron-right',
  'add.circle.fill': 'add-circle',
  'camera.fill': 'photo-camera',
  'edit': 'edit',
  'user.graduate.fill': 'school',
  'mappin.and.ellipse': 'location-on',
  'map.fill': 'map',
  'list.bullet': 'format-list-bulleted',
  'trash.fill': 'delete',
  'calendar': 'calendar-today',
  'note.text': 'description',
  'drag-handle': 'drag-handle',
  'search': 'search',
  'gear': 'settings',
  'square.and.arrow.up': 'share',
  'cloud.upload': 'cloud-upload',
  'cloud.download': 'cloud-download',
  'history': 'history', // Menggunakan ikon jam standar untuk riwayat
  'checkmark.seal.fill': 'check-circle',
};

// Nama simbol bisa berupa string biasa (tanpa dibatasi SFSymbols6_0)
type IconSymbolName = keyof typeof MAPPING | string;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] || 'help'; // fallback kalau nama tidak ditemukan

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={iconName}
      style={style}
    />
  );
}
