import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme/colors';
import { Button } from '../components/Button';
import { ShieldAlert, Brain, HandMetal } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
    {
        title: 'Le Pacte',
        description: "Je promets de limiter la consommation passive. Je reconnais que mon attention a de la valeur, et je choisis de la reconquérir aujourd'hui.",
        icon: <HandMetal size={64} color={theme.colors.primary} />,
        buttonText: "Je le promets"
    },
    {
        title: 'Friction Positive',
        description: 'Chaque fois que vous voudrez ouvrir une application distrayante, vous devrez payer le prix : un défi mental ou physique.',
        icon: <Brain size={64} color={theme.colors.alert} />,
        buttonText: "Compris"
    },
    {
        title: 'Autorisations Requises',
        description: 'Pour que la magie opère, nous avons besoin d\'accéder à l\'API Screen Time afin de bloquer les applications cibles (Simulé pour le MVP).',
        icon: <ShieldAlert size={64} color={theme.colors.primary} />,
        buttonText: "Autoriser l'accès et Commencer"
    }
];

export function OnboardingScreen() {
    const [step, setStep] = useState(0);
    const completeOnboarding = useAppStore((state) => state.completeOnboarding);

    const handleNext = () => {
        if (step < ONBOARDING_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            completeOnboarding();
        }
    };

    const currentContent = ONBOARDING_STEPS[step];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    {currentContent.icon}
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{currentContent.title}</Text>
                    <Text style={styles.description}>{currentContent.description}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.pagination}>
                        {ONBOARDING_STEPS.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    step === index ? styles.activeDot : null
                                ]}
                            />
                        ))}
                    </View>
                    <Button
                        title={currentContent.buttonText}
                        onPress={handleNext}
                        style={styles.button}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingBottom: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.border,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: theme.colors.primary,
        width: 24,
    },
    button: {
        width: '100%',
    }
});
