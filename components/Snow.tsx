import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Snow: React.FC<{ speed: number }> = ({ speed }) => {
  const count = 1000;
  const mesh = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 50; // x
      temp[i * 3 + 1] = Math.random() * 40 - 10; // y
      temp[i * 3 + 2] = (Math.random() - 0.5) * 50; // z
    }
    return temp;
  }, []);

  useFrame(() => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Y axis down
      positions[i * 3 + 1] -= speed * 0.1;
      
      // X drift
      positions[i * 3] += Math.sin(positions[i * 3 + 1] * 0.5) * 0.01;

      // Reset
      if (positions[i * 3 + 1] < -10) {
        positions[i * 3 + 1] = 30;
        positions[i * 3] = (Math.random() - 0.5) * 50;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
};
