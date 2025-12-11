import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../constants';

// Shader to handle skinning on points and explosion effect
const particleVertexShader = `
  uniform float time;
  uniform float explosion;
  uniform float speed;
  
  attribute float size;
  attribute vec3 customColor;
  
  varying vec3 vColor;
  varying float vAlpha;

  // Three.js chunk for skinning parameters
  #include <common>
  #include <skinning_pars_vertex>

  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vColor = customColor;
    
    // Skinning magic
    #include <skinbase_vertex>
    #include <begin_vertex>
    #include <skinning_vertex>
    #include <project_vertex>

    // Explosion Effect
    vec3 noisePos = transformed * 2.0;
    float noiseVal = snoise(noisePos + time);
    vec3 explodeDir = normalize(transformed) * (explosion * 5.0 + noiseVal * explosion);
    
    vec4 mvPosition = modelViewMatrix * vec4(transformed + explodeDir, 1.0);
    
    gl_PointSize = size * (20.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    // Fade out as it explodes
    vAlpha = 1.0 - explosion;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

interface HorseProps {
  color: string;
  speed: number;
  exploded: boolean;
}

export const Horse: React.FC<HorseProps> = ({ color, speed, exploded }) => {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Horse.glb');
  const { actions } = useAnimations(animations, group);
  
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Parse mesh to points
  const pointsGeometry = useMemo(() => {
    // Robustly find the mesh. The node name is typically 'Horse' in this specific GLB, 
    // but we fallback to searching for a SkinnedMesh or Mesh to be safe.
    const originalMesh = (nodes.Horse || nodes.mesh_0 || Object.values(nodes).find((n: any) => n.isSkinnedMesh || n.isMesh)) as THREE.SkinnedMesh;
    
    if (!originalMesh || !originalMesh.geometry) {
      return new THREE.BufferGeometry();
    }
    
    const geo = originalMesh.geometry.clone();
    
    const count = geo.attributes.position.count;
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    
    const c = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      sizes[i] = Math.random() * 2.0 + 0.5;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    
    return geo;
  }, [nodes, color]);

  useEffect(() => {
    // Play animation
    const action = actions['gallop']; // Usually named 'gallop' or '0'
    if (action) {
      action.reset().fadeIn(0.5).play();
      action.timeScale = speed;
    }
    return () => action?.fadeOut(0.5);
  }, [actions, speed]);

  useFrame((state) => {
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.time.value = state.clock.elapsedTime;
      // Lerp explosion
      const targetExplosion = exploded ? 1.0 : 0.0;
      shaderMaterialRef.current.uniforms.explosion.value = THREE.MathUtils.lerp(
        shaderMaterialRef.current.uniforms.explosion.value,
        targetExplosion,
        0.1
      );
      
      // Update color uniform if prop changes significantly (or re-generate geometry)
      const c = new THREE.Color(color);
      // We are using attributes for color, so this is static unless we update attributes
      // But for a simple color change, let's just mult in shader or re-memo.
      // Re-memo handles it.
    }
  });

  return (
    <group ref={group} dispose={null} scale={[0.15, 0.15, 0.15]} position={[0, -1, 0]} rotation={[0, 0.5, 0]}>
      {pointsGeometry && (
        <points geometry={pointsGeometry}>
          <shaderMaterial
            ref={shaderMaterialRef}
            vertexShader={particleVertexShader}
            fragmentShader={particleFragmentShader}
            uniforms={{
              time: { value: 0 },
              explosion: { value: 0 },
              speed: { value: speed }
            }}
            transparent
            depthWrite={false}
            skinning={true} // Crucial: Enables skinning on the Points
          />
        </points>
      )}
      <Wings color={color} speed={speed} />
    </group>
  );
};

// Procedural Wings
const Wings: React.FC<{ color: string, speed: number }> = ({ color, speed }) => {
  const wingGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 20, 10, 20);
    // Rotate to lie flat or side
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  const wingMat = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (wingMat.current) {
      wingMat.current.uniforms.time.value = state.clock.elapsedTime;
      wingMat.current.uniforms.speed.value = speed;
    }
  });

  const vertexShader = `
    uniform float time;
    uniform float speed;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Flapping motion
      float flap = sin(time * 5.0 * speed + pos.x * 0.5) * 5.0 * (pos.x / 10.0);
      pos.y += flap;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
      float alpha = 1.0 - distance(vUv, vec2(0.0, 0.5));
      alpha = pow(alpha, 3.0);
      gl_FragColor = vec4(color, alpha * 0.5);
    }
  `;

  return (
    <group position={[0, 15, 0]}>
      {/* Left Wing */}
      <mesh geometry={wingGeo} position={[3, 5, 0]} rotation={[0, 0, -0.2]}>
        <shaderMaterial
          ref={wingMat}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            time: { value: 0 },
            speed: { value: speed },
            color: { value: new THREE.Color(color) }
          }}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Right Wing */}
      <mesh geometry={wingGeo} position={[-3, 5, 0]} rotation={[0, 0, 0.2]} scale={[-1, 1, 1]}>
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            time: { value: 0 },
            speed: { value: speed },
            color: { value: new THREE.Color(color) }
          }}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};