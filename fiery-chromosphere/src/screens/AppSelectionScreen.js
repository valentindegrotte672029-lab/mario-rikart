import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme/colors';
import { Button } from '../components/Button';
import { Check, ArrowLeft } from 'lucide-react-native';

const MOCK_APPS = [
    { id: 'instagram', name: 'Instagram' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'youtube', name: 'YouTube Shorts' },
    { id: 'twitter', name: 'X / Twitter' },
    { id: 'reddit', name: 'Reddit' },
];

export function AppSelectionScreen({ navigation }) {
    const targetApps = useAppStore(state => state.targetApps);
    const addTargetApp = useAppStore(state => state.addTargetApp);
    const removeTargetApp = useAppStore(state => state.removeTargetApp);

    const toggleApp = (appId) => {
        if (targetApps.includes(appId)) {
            removeTargetApp(appId);
        } else {
            addTargetApp(appId);
        }
    };

    const renderItem = ({ item }) => {
        const isSelected = targetApps.includes(item.id);

        return (
            <TouchableOpacity
                style={[styles.appItem, isSelected && styles.selectedItem]}
                onPress={() => toggleApp(item.id)}
                activeOpacity={0.7}
            >
                <Text style={styles.appName}>{item.name}</Text>
                {isSelected && <Check size={20} color={theme.colors.background} />}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Cibles d'Addiction</Text>
            </View>

            <Text style={styles.subtitle}>
                Sélectionne les applications que tu souhaites soumettre à la Friction Positive.
            </Text>

            <FlatList
                data={MOCK_APPS}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            <View style={styles.footer}>
                <Button title="Terminer" onPress={() => navigation.goBack()} />
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
        padding: 24,
        paddingBottom: 16,
    },
    backBtn: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    subtitle: {
        paddingHorizontal: 24,
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 24,
        lineHeight: 20,
    },
    list: {
        paddingHorizontal: 24,
    },
    appItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    selectedItem: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    appName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    footer: {
        padding: 24,
    }
});
