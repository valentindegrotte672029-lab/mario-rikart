import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Camera, CameraType } from 'expo-camera/legacy';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme/colors';
import { X, Camera as CameraIcon, Activity } from 'lucide-react-native';

const TensorCamera = cameraWithTensors(Camera);
const { width, height } = Dimensions.get('window');

// Texture dimensions for standard mobile cameras
const TEXTURE_SIZE = { width: 1080, height: 1920 };
const TENSOR_SIZE = { width: 152, height: 200 };

export function ChallengeFitnessScreen({ navigation, route }) {
    const { appId, exerciseType = 'pushup' } = route.params || {};
    const exerciseName = exerciseType === 'squat' ? 'Squats' : 'Pompes';
    const unlockApp = useAppStore(state => state.unlockApp);
    const addDopamine = useAppStore(state => state.addDopamine);

    const [hasPermission, setHasPermission] = useState(null);

    const [isTfReady, setIsTfReady] = useState(false);
    const [reps, setReps] = useState(0);
    const [currentAngle, setCurrentAngle] = useState(0);
    const [debugInfo, setDebugInfo] = useState('En attente du modèle...');
    const isPushingDownRef = useRef(false);
    const detectorRef = useRef(null);

    // Initialize TensorFlow and Pose Detection
    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');

            await tf.ready();

            const detector = await poseDetection.createDetector(
                poseDetection.SupportedModels.MoveNet,
                { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
            );

            detectorRef.current = detector;
            setIsTfReady(true);
        })();
    }, []);

    const handleCameraStream = (images) => {
        setDebugInfo("Flux caméra démarré...");
        const loop = async () => {
            const nextImageTensor = images.next().value;
            if (nextImageTensor && detectorRef.current) {
                try {
                    const poses = await detectorRef.current.estimatePoses(nextImageTensor);
                    if (poses && poses.length > 0) {
                        analyzePose(poses[0]);
                    } else {
                        setDebugInfo("Aucune personne détectée");
                    }
                } catch (e) {
                    console.warn("Pose estimation error:", e);
                    setDebugInfo("Erreur du modèle TF");
                }

                // Dispose tensor to avoid memory leaks
                tf.dispose([nextImageTensor]);
            }
            requestAnimationFrame(loop);
        };
        loop();
    };

    // Calculate angle between three points (A = shoulder, B = elbow, C = wrist)
    const calculateAngle = (p1, p2, p3) => {
        const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
        let angle = Math.abs(radians * 180.0 / Math.PI);
        if (angle > 180.0) {
            angle = 360 - angle;
        }
        return angle;
    };

    const analyzePose = (pose) => {
        const keypoints = pose.keypoints;
        let leftA, leftB, leftC, rightA, rightB, rightC;

        if (exerciseType === 'squat') {
            leftA = keypoints.find(k => k.name === 'left_hip');
            leftB = keypoints.find(k => k.name === 'left_knee');
            leftC = keypoints.find(k => k.name === 'left_ankle');
            rightA = keypoints.find(k => k.name === 'right_hip');
            rightB = keypoints.find(k => k.name === 'right_knee');
            rightC = keypoints.find(k => k.name === 'right_ankle');
        } else {
            // Pushup
            leftA = keypoints.find(k => k.name === 'left_shoulder');
            leftB = keypoints.find(k => k.name === 'left_elbow');
            leftC = keypoints.find(k => k.name === 'left_wrist');
            rightA = keypoints.find(k => k.name === 'right_shoulder');
            rightB = keypoints.find(k => k.name === 'right_elbow');
            rightC = keypoints.find(k => k.name === 'right_wrist');
        }

        // Dynamically choose the side with the best visibility/confidence
        let point1, point2, point3;
        const leftConfidence = (leftA?.score || 0) + (leftB?.score || 0) + (leftC?.score || 0);
        const rightConfidence = (rightA?.score || 0) + (rightB?.score || 0) + (rightC?.score || 0);

        if (leftConfidence > rightConfidence && leftConfidence > 1.2) {
            point1 = leftA; point2 = leftB; point3 = leftC;
            setDebugInfo(`G: ${leftConfidence.toFixed(1)} | D: ${rightConfidence.toFixed(1)} (Gauche)`);
        } else if (rightConfidence >= leftConfidence && rightConfidence > 1.2) {
            point1 = rightA; point2 = rightB; point3 = rightC;
            setDebugInfo(`G: ${leftConfidence.toFixed(1)} | D: ${rightConfidence.toFixed(1)} (Droite)`);
        } else {
            setDebugInfo(`Visibilité trop faible (G:${leftConfidence.toFixed(1)} D:${rightConfidence.toFixed(1)})`);
        }

        if (point1 && point2 && point3) {
            const angle = calculateAngle(point1, point2, point3);
            setCurrentAngle(Math.round(angle));

            // Valid mechanics:
            // DOWN: Joint bent at less than 90 degrees (Squat < 110, Pushup < 90)
            // UP: Joint almost fully extended, at least 150 degrees
            const downThreshold = exerciseType === 'squat' ? 100 : 90;
            const upThreshold = exerciseType === 'squat' ? 160 : 150;

            if (angle < downThreshold && !isPushingDownRef.current) {
                isPushingDownRef.current = true;
            } else if (angle > upThreshold && isPushingDownRef.current) {
                isPushingDownRef.current = false;
                setReps(prev => prev + 1);
            }
        }
    };

    const handleFinish = () => {
        if (reps > 0) {
            // 1 pushup = 1 minute unlocked, and 1 dopamine point
            unlockApp(appId, reps);
            addDopamine(reps);
            alert(`Bravo ! ${appId} débloquée pour ${reps} minutes.`);
        }
        navigation.goBack();
    };

    if (hasPermission === null) return <View style={styles.loadingContainer}><Text style={styles.text}>Demande caméra...</Text></View>;
    if (hasPermission === false) return <View style={styles.loadingContainer}><Text style={styles.text}>Accès caméra refusé.</Text></View>;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <X size={28} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Friction Physique</Text>
                <View style={{ width: 28 }} />
            </View>

            <Text style={styles.subtitle}>
                Fais des {exerciseName.toLowerCase()} devant la caméra pour débloquer {appId}.{'\n'}
                <Text style={styles.highlight}>1 {exerciseName.slice(0, -1)} = 1 Minute</Text>
            </Text>

            <View style={styles.cameraWrapper}>
                {!isTfReady ? (
                    <View style={styles.tfLoading}>
                        <Activity color={theme.colors.primary} size={48} />
                        <Text style={styles.tfText}>Chargement de l'IA...</Text>
                    </View>
                ) : (
                    <TensorCamera
                        style={styles.camera}
                        type={CameraType.front}
                        cameraTextureHeight={TEXTURE_SIZE.height}
                        cameraTextureWidth={TEXTURE_SIZE.width}
                        resizeHeight={TENSOR_SIZE.height}
                        resizeWidth={TENSOR_SIZE.width}
                        resizeDepth={3}
                        onReady={handleCameraStream}
                        autorender={true}
                    />
                )}
            </View>

            <View style={styles.debugPanel}>
                <Text style={styles.debugText}>IA : {debugInfo}</Text>
                <Text style={styles.debugText}>Angle : {currentAngle}° | État : {isPushingDownRef.current ? '↓ DESCENDU' : '↑ EN HAUT'}</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.repCounter}>
                    <Text style={styles.repNumber}>{reps}</Text>
                    <Text style={styles.repLabel}>{exerciseName.toUpperCase()}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.finishBtn, reps === 0 && styles.finishBtnDisabled]}
                    onPress={handleFinish}
                    disabled={reps === 0}
                >
                    <Text style={styles.finishBtnText}>Utiliser ({reps} min)</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    text: { color: theme.colors.textPrimary },
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
    subtitle: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginBottom: 24,
        fontSize: 14,
        lineHeight: 22,
    },
    highlight: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    cameraWrapper: {
        flex: 1,
        marginHorizontal: 16,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: theme.colors.surface,
    },
    camera: {
        flex: 1,
    },
    tfLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tfText: {
        marginTop: 16,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    debugPanel: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    debugText: {
        color: '#fff',
        fontFamily: 'Courier',
        fontSize: 12,
    },
    footer: {
        padding: 24,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    repCounter: {
        alignItems: 'center',
    },
    repNumber: {
        fontSize: 48,
        fontWeight: '900',
        color: theme.colors.alert,
    },
    repLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
        letterSpacing: 2,
    },
    finishBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    finishBtnDisabled: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
    },
    finishBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    }
});
