import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../constants';
import { AppState } from '../types';
import { Horse } from './Horse';
import { Snow } from './Snow';
import { SpiritSign } from './SpiritSign';

interface SceneProps {
  state: AppState;
}

const CinematicController: React.FC<{ progress: number }> = ({ progress }) => {
  const { camera, gl, scene } = useThree();
  const startPos = new THREE.Vector3(0, 0, 20);
  const endPos = new THREE.Vector3(0, 0, 6);
  
  const startColor = new THREE.Color(COLORS.DEEP_SEA);
  const endColor = new THREE.Color(COLORS.CINNABAR);

  useFrame(() => {
    // Camera Push
    camera.position.lerpVectors(startPos, endPos, progress);
    camera.lookAt(0, 0, 0);

    // Background Color Fade
    const currentColor = startColor.clone().lerp(endColor, progress * 0.8); // Mix slightly
    scene.background = currentColor;
    // Also set fog to match
    scene.fog = new THREE.FogExp2(currentColor.getHex(), 0.02 + (1-progress)*0.05);
  });

  return null;
};

export const Scene: React.FC<SceneProps> = ({ state }) => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <CinematicController progress={state.introProgress} />
      
      <PerspectiveCamera makeDefault fov={50} />

      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={state.primaryColor} />

      <Horse 
        color={state.primaryColor} 
        speed={state.horseSpeed} 
        exploded={state.isExploded}
      />
      
      <Snow speed={state.snowSpeed} />

      <SpiritSign 
        blessing={state.currentBlessing} 
        visible={state.isExploded} 
      />

      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
      
      <Environment preset="night" />
    </Canvas>
  );
};