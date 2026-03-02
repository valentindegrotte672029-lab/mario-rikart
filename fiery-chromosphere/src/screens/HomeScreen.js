import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme/colors';
import { StatCard } from '../components/StatCard';
import { TamagotchiAvatar } from '../components/TamagotchiAvatar';
import { Button } from '../components/Button';
import { Zap, ShieldBan, Flame, Info } from 'lucide-react-native';

export function HomeScreen({ navigation }) {
    const dopamineSaved = useAppStore((state) => state.dopamineSaved);
    const targetApps = useAppStore((state) => state.targetApps);
    const unlockedApps = useAppStore((state) => state.unlockedApps);
    const dailyUsage = useAppStore(state => state.dailyUsage);
    const dailyLimit = useAppStore(state => state.dailyLimit);
    const streak = useAppStore(state => state.streak);

    const handleAppPress = (appId) => {
        const unlockTime = unlockedApps[appId] || 0;
        const today = new Date().toISOString().split('T')[0];
        const appUsage = dailyUsage[appId] || { date: today, minutes: 0 };

        if (Date.now() < unlockTime) {
            alert(`Ouverture de ${appId} autorisée !`);
        } else if (appUsage.date === today && appUsage.minutes >= dailyLimit) {
            alert(`Limite atteinte ! Tu as déjà utilisé tes ${dailyLimit} minutes pour ${appId} aujourd'hui.`);
        } else {
            navigation.navigate('ExerciseSelection', { appId });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.greeting}>Bonjour, Maître de l'Attention</Text>
                    <View style={styles.statsRow}>
                        <StatCard
                            title="Dopamine"
                            value={`${dopamineSaved} pts`}
                            icon={<Zap size={16} color={theme.colors.alert} />}
                        />
                        <StatCard
                            title="Apps ciblées"
                            value={targetApps.length}
                            icon={<ShieldBan size={16} color={theme.colors.primary} />}
                        />
                        <StatCard
                            title="Série"
                            value={`${streak} j`}
                            icon={<Flame size={16} color={theme.colors.alert} />}
                        />
                    </View>
                </View>

                <View style={styles.goalSection}>
                    <View style={styles.goalHeader}>
                        <Text style={styles.goalTitle}>Objectif Hebdomadaire</Text>
                        <Text style={styles.goalText}>{dopamineSaved} / 100 reps</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${Math.min(100, (dopamineSaved / 100) * 100)}%` }]} />
                    </View>
                </View>

                <View style={styles.avatarSection}>
                    <TamagotchiAvatar dopamineScore={dopamineSaved} />
                    <Text style={styles.avatarStatus}>
                        {dopamineSaved >= 50 ? "Ton cortex est renforcé" : "Ton cerveau a besoin de friction"}
                    </Text>
                </View>

                <View style={styles.actions}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Tes boucliers</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ShortcutGuide')} style={styles.infoBtn}>
                            <Info size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {targetApps.length === 0 ? (
                        <Text style={styles.emptyText}>Aucune application ciblée pour le moment.</Text>
                    ) : (
                        targetApps.map(app => {
                            const unlockTime = unlockedApps[app] || 0;
                            const isUnlocked = Date.now() < unlockTime;
                            const remainingMins = Math.max(0, Math.ceil((unlockTime - Date.now()) / 60000));

                            const today = new Date().toISOString().split('T')[0];
                            const currentUsage = dailyUsage[app] || { date: today, minutes: 0 };
                            let usedMins = 0;
                            if (currentUsage.date === today) {
                                usedMins = currentUsage.minutes;
                            }
                            const isLimitReached = usedMins >= dailyLimit;

                            return (
                                <View key={app} style={styles.appRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.appText}>{app}</Text>
                                        <Text style={styles.usageText}>
                                            Aujourd'hui : {usedMins}/{dailyLimit} min
                                        </Text>
                                        {isUnlocked && <Text style={styles.unlockText}>Déverrouillé ({remainingMins}m)</Text>}
                                    </View>
                                    <Button
                                        title={isUnlocked ? "Ouvrir" : (isLimitReached ? "Bloqué" : "Action (Friction)")}
                                        variant={isUnlocked ? "primary" : (isLimitReached ? "outline" : "secondary")}
                                        style={styles.simulateBtn}
                                        onPress={() => handleAppPress(app)}
                                        disabled={!isUnlocked && isLimitReached}
                                    />
                                </View>
                            );
                        })
                    )}

                    <Button
                        title="Ajouter une application cible"
                        onPress={() => navigation.navigate('AppSelection')}
                        style={styles.addBtn}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: -4,
        gap: 8,
    },
    goalSection: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalTitle: {
        color: theme.colors.textPrimary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    goalText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: theme.colors.background,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.alert,
        borderRadius: 4,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    avatarStatus: {
        color: theme.colors.textSecondary,
        marginTop: 16,
        fontSize: 14,
    },
    actions: {
        marginTop: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    infoBtn: {
        padding: 4,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: 16,
    },
    appRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    appText: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    usageText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    unlockText: {
        color: theme.colors.primary,
        fontSize: 12,
        marginTop: 4,
    },
    simulateBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginVertical: 0,
    },
    addBtn: {
        marginTop: 16,
    }
});
