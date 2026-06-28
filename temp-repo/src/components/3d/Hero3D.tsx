import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

export function RejuvenationMolecule() {
  const groupRef = useRef<THREE.Group>(null);

  // Generate points for a double helix (Collagen/DNA) representing cellular rejuvenation
  const helixElements = useMemo(() => {
    const elements = [];
    const numPairs = 24;
    const height = 10;
    const radius = 1.8;
    
    for (let i = 0; i < numPairs; i++) {
      const t = i / (numPairs - 1);
      const angle = t * Math.PI * 6; // 3 full turns
      const y = (t - 0.5) * height;
      
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      // First strand sphere (Pearl / Glass)
      elements.push(
        <mesh key={`s1-${i}`} position={[x1, y, z1]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <MeshTransmissionMaterial
            backside
            color="#FAFAF7"
            roughness={0.05}
            metalness={0.1}
            transmission={0.95}
            thickness={1}
            ior={1.5}
            clearcoat={1}
          />
        </mesh>
      );

      // Second strand sphere (Gold)
      elements.push(
        <mesh key={`s2-${i}`} position={[x2, y, z2]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <MeshTransmissionMaterial
            backside
            color="#C9A227"
            roughness={0.1}
            metalness={0.6}
            transmission={0.7}
            thickness={1.5}
            ior={1.5}
            clearcoat={1}
          />
        </mesh>
      );

      // Connection rod (peptide bond / collagen cross-link)
      elements.push(
        <mesh key={`conn-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, -angle]}>
          <cylinderGeometry args={[0.03, 0.03, radius * 2, 16]} />
          <meshStandardMaterial color="#E8E2D2" transparent opacity={0.5} metalness={0.5} />
        </mesh>
      );
    }
    return elements;
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!groupRef.current) return;
      
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      gsap.to(groupRef.current.rotation, {
        x: y * 0.15, // Subtle tilt
        y: x * 0.4,  // Rotate on X axis slightly
        duration: 2.5,
        ease: "power3.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Continuous slow rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        {helixElements}
      </Float>
    </group>
  );
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none md:pointer-events-auto opacity-80 mix-blend-multiply">
      <Canvas camera={{ position: [0, 0, 12], fov: 40 }}>
        <ambientLight intensity={0.8} color="#F7F3EA" />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          color="#ffffff"
        />
        <directionalLight
          position={[-10, -10, -5]}
          intensity={1.2}
          color="#C9A227" // Gold
        />
        <pointLight position={[0, 0, 5]} intensity={2} color="#D8B86A" distance={15} />
        
        <React.Suspense fallback={null}>
          <RejuvenationMolecule />
          {/* Subtle glowing particles representing hydration/serum */}
          <Sparkles count={80} scale={10} size={2.5} speed={0.3} opacity={0.4} color="#D8B86A" />
          <Environment preset="studio" />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
