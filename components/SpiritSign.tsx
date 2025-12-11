import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Blessing } from '../types';
import { drawSpiritSign } from './SpiritCanvas';

interface SpiritSignProps {
  blessing: Blessing | null;
  visible: boolean;
}

export const SpiritSign: React.FC<SpiritSignProps> = ({ blessing, visible }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.CanvasTexture>(null);
  const [targetScale, setTargetScale] = useState(0);

  // Canvas setup
  useEffect(() => {
    if (blessing && visible) {
      setTargetScale(1);
      const canvas = document.createElement('canvas');
      // Resolution for High DPI
      canvas.width = 512;
      canvas.height = 1024; // ~1:2 aspect ratio (1/2 iPhone 11)
      
      drawSpiritSign(canvas, blessing);
      
      if (textureRef.current) {
        textureRef.current.image = canvas;
        textureRef.current.needsUpdate = true;
      } else {
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace; // Modern color space setting
        
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.MeshStandardMaterial;
            material.map = tex;
            material.needsUpdate = true;
            // Store ref if we want to update it later instead of recreating
            // Note: Since we create new texture each time here for simplicity,
            // we could optimize by reusing textureRef if it existed.
        }
      }
    } else {
      setTargetScale(0);
    }
  }, [blessing, visible]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Animate scale (pop up)
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
      
      // Gentle float
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        visible ? 1 + Math.sin(state.clock.elapsedTime) * 0.1 : -5,
        delta * 2
      );

      // Rotate slightly
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 2]}>
      <planeGeometry args={[2, 4]} /> {/* Approx 1/2 iPhone 11 proportion */}
      <meshStandardMaterial
        side={THREE.DoubleSide}
        transparent
        roughness={0.8}
      />
    </mesh>
  );
};