import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme/colors';
import { Wind, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export function ChallengeBreatheScreen({ navigation, route }) {
    const { appId } = route.params || {};
    const addDopamine = useAppStore(state => state.addDopamine);

    const [isBreathing, setIsBreathing] = useState(false);
    const [completed, setCompleted] = useState(false);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const timerRef = useRef(null);
    const CHALLENGE_DURATION_MS = 10000; // 10 seconds hold

    const startBreathing = () => {
        setIsBreathing(true);

        // Animate breathing circle (scale in and out slowly)
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.5, duration: 4000, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1, duration: 4000, useNativeDriver: true })
            ])
        ).start();

        // Progress bar animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: CHALLENGE_DURATION_MS,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                completeChallenge();
            }
        });
    };

    const stopBreathing = () => {
        if (completed) return;

        setIsBreathing(false);
        scaleAnim.stopAnimation();
        scaleAnim.setValue(1);

        progressAnim.stopAnimation();
        progressAnim.setValue(0);
    };

    const completeChallenge = () => {
        setCompleted(true);
        setIsBreathing(false);
        addDopamine(5); // Arbitrary points for completing friction challenge

        // Simulate unlock timeout
        setTimeout(() => {
            navigation.goBack(); // Will return to Home as a simulation of passing the blocker
        }, 2000);
    };

    const interpolatedWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%']
    });

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                <X size={28} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>Friction Positive</Text>
                <Text style={styles.subtitle}>
                    Appuie et maintiens pour prouver que cet ancrage sur {appId} est conscient.
                </Text>

                <View style={styles.challengeArea}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPressIn={startBreathing}
                        onPressOut={stopBreathing}
                        style={styles.touchArea}
                    >
                        <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }, completed && styles.circleCompleted]}>
                            <Wind size={48} color={theme.colors.background} />
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.instruction}>
                    {completed
                        ? "Accès autorisé. Profite."
                        : (isBreathing ? "Continue de maintenir..." : "Maintenir pour débloquer")}
                </Text>
            </View>

            <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBarFilled, { width: interpolatedWidth }]} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    closeBtn: {
        alignSelf: 'flex-start',
        padding: 24,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.alert,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 60,
        lineHeight: 24,
        textTransform: 'capitalize',
    },
    challengeArea: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    touchArea: {
        padding: 40,
    },
    circle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    circleCompleted: {
        backgroundColor: theme.colors.textPrimary,
    },
    instruction: {
        fontSize: 18,
        color: theme.colors.textPrimary,
        fontWeight: '600',
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: theme.colors.surface,
        width: '100%',
    },
    progressBarFilled: {
        height: '100%',
        backgroundColor: theme.colors.primary,
    }
});
