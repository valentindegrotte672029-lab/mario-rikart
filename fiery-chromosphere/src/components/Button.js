import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

export function Button({ title, onPress, variant = 'primary', style }) {
    const isPrimary = variant === 'primary';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isPrimary ? styles.primaryBg : styles.secondaryBg,
                style
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={[
                styles.text,
                isPrimary ? styles.primaryText : styles.secondaryText
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    primaryBg: {
        backgroundColor: theme.colors.primary,
    },
    secondaryBg: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    primaryText: {
        color: '#000000', // Dark text on matcha green
    },
    secondaryText: {
        color: theme.colors.textPrimary,
    }
});
