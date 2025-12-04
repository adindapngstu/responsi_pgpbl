// c:\SEMESTER 5\PGPBL\Acara 7\reactnative\constants\theme.ts

export const Colors = {
    light: {
        primary: '#53629E', // Muted Blue
        danger: '#FF3B30',
        white: '#FFFFFF',
        text: '#473472', // Deep Purple
        secondaryText: '#8A8A8A', // A slightly lighter grey for secondary info
        background: '#E3E3E3', // Light Grey
        secondaryBackground: '#87BAC3', // Soft Teal
        card: '#FFFFFF', // White cards for contrast
        border: '#E0E0E0', // A light border color
    },
    dark: {
        primary: '#87BAC3', // Soft Teal for dark mode primary
        danger: '#FF453A',
        white: '#FFFFFF',
        text: '#E5E5E7', // Light text for dark mode
        secondaryText: '#9E9E9E', // Dimmer text for secondary info
        background: '#121212', // Standard dark mode background
        secondaryBackground: '#1C2541', // Darker blue-ish grey
        card: '#1C2541', // Darker blue-ish grey for cards
        border: '#272729', // Subtle border for dark mode
    },
};

export const Fonts = {
    sans: 'Inter-Regular',
    sansBold: 'Inter-Bold',
    sansSemiBold: 'Inter-SemiBold',
};

export const Sizing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    radius: 12,
    largeRadius: 24,
};

export const Shadows = {
    subtle: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
};
