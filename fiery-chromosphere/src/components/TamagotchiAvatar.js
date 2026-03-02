import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Brain } from 'lucide-react-native';
import { theme } from '../theme/colors';

export function TamagotchiAvatar({ dopamineScore }) {
    // Simple logic: if score >= 50, it glows emerald. If low, it is dull.
    const isHealthy = dopamineScore >= 50;
    const color = isHealthy ? theme.colors.primary : theme.colors.textSecondary;
    const size = isHealthy ? 120 : 100;

    return (
        <View style={styles.container}>
            <View style={[styles.glow, isHealthy && styles.glowing]} />
            <Brain size={size} color={color} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    glow: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'transparent',
    },
    glowing: {
        backgroundColor: theme.colors.primary,
        opacity: 0.15,
    }
});
