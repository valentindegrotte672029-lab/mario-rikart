import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/colors';
import { Button } from '../components/Button';
import { X, Activity, Dumbbell } from 'lucide-react-native';

export function ExerciseSelectionScreen({ navigation, route }) {
    const { appId } = route.params || {};

    const handleSelect = (exerciseType) => {
        navigation.navigate('ChallengeFitness', { appId, exerciseType });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X size={28} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Choisis ta Friction</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>
                    Comment veux-tu payer ton accès à {appId} ?
                </Text>

                <TouchableOpacity style={styles.card} onPress={() => handleSelect('pushup')}>
                    <Dumbbell size={48} color={theme.colors.primary} style={styles.icon} />
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>Pompes (Push-ups)</Text>
                        <Text style={styles.cardDesc}>1 Pompe = 1 Minute</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card} onPress={() => handleSelect('squat')}>
                    <Activity size={48} color={theme.colors.alert} style={styles.icon} />
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>Squats</Text>
                        <Text style={styles.cardDesc}>1 Squat = 1 Minute</Text>
                    </View>
                </TouchableOpacity>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    closeBtn: { padding: 8 },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginBottom: 32,
        fontSize: 18,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    icon: {
        marginRight: 20,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    }
});
