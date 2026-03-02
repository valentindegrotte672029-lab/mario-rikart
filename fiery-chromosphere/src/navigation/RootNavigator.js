import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useAppStore } from '../store/useAppStore';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AppSelectionScreen } from '../screens/AppSelectionScreen';
import { ChallengeBreatheScreen } from '../screens/ChallengeBreatheScreen';
import { ChallengeFitnessScreen } from '../screens/ChallengeFitnessScreen';
import { ExerciseSelectionScreen } from '../screens/ExerciseSelectionScreen';
import { ShortcutGuideScreen } from '../screens/ShortcutGuideScreen';

const Stack = createNativeStackNavigator();

const prefix = Linking.createURL('/');

export function RootNavigator() {
    const hasOnboarded = useAppStore((state) => state.hasOnboarded);

    const linking = {
        prefixes: [prefix, 'pushscroll://'],
        config: {
            screens: {
                ExerciseSelection: 'challenge/:appId',
            }
        }
    };

    return (
        <NavigationContainer linking={linking}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!hasOnboarded ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="AppSelection" component={AppSelectionScreen} />
                        <Stack.Screen name="ChallengeBreathe" component={ChallengeBreatheScreen} />
                        <Stack.Screen name="ExerciseSelection" component={ExerciseSelectionScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="ChallengeFitness" component={ChallengeFitnessScreen} />
                        <Stack.Screen name="ShortcutGuide" component={ShortcutGuideScreen} options={{ presentation: 'modal' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
