import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

export function StatCard({ title, value, icon }) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                {icon}
                <Text style={styles.title}>{title}</Text>
            </View>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginLeft: 6,
    },
    value: {
        color: theme.colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
    }
});
