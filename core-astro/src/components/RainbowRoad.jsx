import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

export default function RainbowRoad({ speed = 1 }) {
  const materialRef = useRef();

  useFrame((state, delta) => {
    if (materialRef.current) {
      // Pour éviter les à-coups sur mobile, deltaTime capé
      const safeDelta = Math.min(delta, 0.1);
      materialRef.current.uniforms.uTime.value += safeDelta * speed;
    }
  });

  const shaderArgs = {
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        
        // Moins de subdivisions pour soulager le GPU mobile
        // Légère inclinaison et courbure
        modelPosition.y += sin(modelPosition.z * 0.05) * 1.5;
        
        gl_Position = projectionMatrix * viewMatrix * modelPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;

      vec3 palette( in float t ) {
          // Couleurs plus néon et lumineuses pour le mode sombre
          vec3 a = vec3(0.5, 0.5, 0.5);
          vec3 b = vec3(0.5, 0.5, 0.5);
          vec3 c = vec3(1.0, 1.0, 1.0);
          vec3 d = vec3(0.0, 0.33, 0.67);
          return a + b*cos( 6.28318*(c*t+d) );
      }

      void main() {
        vec2 uv = vUv;
        
        // Arc-en-ciel plus doux (moins épileptique)
        vec3 col = palette(uv.y - uTime * 1.5);

        // Vitesse d'illusion (Lignes néon qui défilent)
        float speedLines = fract(uv.y * 30.0 - uTime * 15.0);
        float line = smoothstep(0.8, 1.0, speedLines);
        col += line * 0.4;

        // Bords de route estompés
        float edgeDamping = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x);
        
        // Fondu au fond
        float zFade = smoothstep(1.0, 0.0, uv.y);
        
        gl_FragColor = vec4(col * edgeDamping * zFade, edgeDamping * zFade);
      }
    `
  };

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -8]}>
      {/* Route de 16 de large, 100 de long, résolution abaissée: 16x64 (Perf Mobile) */}
      <Plane args={[16, 100, 16, 64]} position={[0, 0, 0]}>
        <shaderMaterial
          ref={materialRef}
          args={[shaderArgs]}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </Plane>
    </group>
  );
}
