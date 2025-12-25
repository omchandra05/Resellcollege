import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function FloatingIcons({ count = 80 }) {
  const mesh = useRef();
  const light1 = useRef();
  const light2 = useRef();

  const particles = useMemo(() => {
    const temp = [];
    const shapes = ['box', 'sphere', 'torus'];
    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100;
      const factor = 8 + Math.random() * 15;
      const speed = 0.003 + Math.random() / 400;
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 40;
      const rotationSpeed = 0.002 + Math.random() * 0.005;
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const scale = 0.4 + Math.random() * 0.6;
      temp.push({ time, factor, speed, x, y, z, rotationSpeed, shape, scale });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    light1.current.position.set(
      Math.sin(t * 0.2) * 25,
      Math.cos(t * 0.15) * 25,
      15
    );
    light2.current.position.set(
      Math.cos(t * 0.25) * 25,
      Math.sin(t * 0.2) * 25,
      10
    );
    
    particles.forEach((particle, i) => {
      const { factor, speed, x, y, z, rotationSpeed } = particle;
      const t = (particle.time += speed);
      
      dummy.position.set(
        x + Math.sin(t) * factor,
        y + Math.cos(t * 0.8) * factor + Math.sin(t * 2) * 2,
        z + Math.sin(t * 0.6) * (factor * 0.5)
      );
      
      dummy.rotation.set(
        t * rotationSpeed * 3,
        t * rotationSpeed * 2,
        t * rotationSpeed
      );
      
      const pulse = 1 + Math.sin(t * 3) * 0.15;
      dummy.scale.setScalar(particle.scale * pulse);
      
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight ref={light1} distance={60} intensity={15} color="#10b981" />
      <pointLight ref={light2} distance={60} intensity={15} color="#f59e0b" />
      <instancedMesh ref={mesh} args={[null, null, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhongMaterial 
          color="#ffffff" 
          emissive="#22c55e"
          emissiveIntensity={0.4}
          shininess={80}
          specular="#ffffff"
          transparent
          opacity={0.85}
        />
      </instancedMesh>
    </>
  );
}

function BackgroundGrid() {
  const gridRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    gridRef.current.position.y = -20 + Math.sin(t * 0.3) * 2;
  });
  
  return (
    <group ref={gridRef}>
      <gridHelper args={[100, 30, '#10b981', '#065f46']} position={[0, -20, 0]} />
    </group>
  );
}

export default function MarketplaceBackground() {
  return (
    <div className="fixed inset-0 -z-20 h-screen w-full bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950">
      <Canvas camera={{ position: [0, 0, 35], fov: 70 }}>
        <BackgroundGrid />
        <FloatingIcons />
        <fog attach="fog" args={['#0a1f1a', 25, 70]} />
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            height={300} 
            intensity={1.8} 
            radius={0.7}
          />
        </EffectComposer>
      </Canvas>
      
      {/* Overlay gradient for better text readability */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}