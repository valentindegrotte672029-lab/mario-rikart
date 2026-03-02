import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { theme } from '../theme/colors';
import { X, PlayCircle, Settings, Infinity, MoveRight } from 'lucide-react-native';

export function ShortcutGuideScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X size={28} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Configuration iOS</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.introBox}>
                    <Text style={styles.introText}>
                        Pour bloquer réellement vos applications et forcer la friction, nous allons utiliser une <Text style={styles.highlight}>Automatisation iOS officielle</Text>.
                        C'est 100% gratuit et sécurisé.
                    </Text>
                </View>

                <View style={styles.step}>
                    <View style={styles.stepHeader}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
                        <Text style={styles.stepTitle}>Ouvrir Raccourcis Apple</Text>
                    </View>
                    <Text style={styles.stepDesc}>Cherchez l'application "Raccourcis" (Shortcuts) pré-installée sur votre iPhone.</Text>
                </View>

                <View style={styles.step}>
                    <View style={styles.stepHeader}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
                        <Text style={styles.stepTitle}>Créer une Automatisation</Text>
                    </View>
                    <Text style={styles.stepDesc}>Allez dans l'onglet "Automatisation" en bas, puis cliquez sur le bouton <Text style={{ fontWeight: 'bold', color: 'white' }}>+</Text> en haut à droite.</Text>
                </View>

                <View style={styles.step}>
                    <View style={styles.stepHeader}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
                        <Text style={styles.stepTitle}>Choisir "App"</Text>
                    </View>
                    <Text style={styles.stepDesc}>Sélectionnez "App", choisissez l'application à bloquer (ex: Instagram), cochez "Est ouverte" et "Exécuter immédiatement".</Text>
                </View>

                <View style={styles.step}>
                    <View style={styles.stepHeader}>
                        <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>4</Text></View>
                        <Text style={styles.stepTitle}>Ajouter l'action URL</Text>
                    </View>
                    <Text style={styles.stepDesc}>Cherchez l'action <Text style={{ fontWeight: 'bold', color: 'white' }}>"Ouvrir les URL"</Text>. Tapez exactement ce lien :</Text>
                    <View style={styles.codeBlock}>
                        <Text style={styles.codeText}>pushscroll://challenge/Instagram</Text>
                    </View>
                    <Text style={styles.stepHint}>Remplacez "Instagram" par le nom de l'app si vous en bloquez une autre.</Text>
                </View>

                <View style={styles.successBox}>
                    <Text style={styles.successTitle}>C'est tout ! 🎉</Text>
                    <Text style={styles.successText}>
                        Désormais, à chaque fois que vous tenterez d'ouvrir Instagram,
                        votre iPhone ouvrira automatiquement Pushscroll pour vous faire faire vos pompes ou vos squats !
                    </Text>
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
        padding: 24,
    },
    introBox: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    introText: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        lineHeight: 22,
    },
    highlight: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    step: {
        marginBottom: 24,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.alert,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepBadgeText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 16,
    },
    stepTitle: {
        color: theme.colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    stepDesc: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        paddingLeft: 40,
    },
    stepHint: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
        paddingLeft: 40,
        marginTop: 8,
    },
    codeBlock: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        marginLeft: 40,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    codeText: {
        color: theme.colors.primary,
        fontFamily: 'Courier',
        fontSize: 14,
        fontWeight: 'bold',
    },
    successBox: {
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        padding: 20,
        borderRadius: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: 'rgba(52, 199, 89, 0.3)',
        alignItems: 'center',
    },
    successTitle: {
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    successText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    }
});
