import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Html, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

interface LayerProps {
  position: [number, number, number];
  color: string;
  name: string;
  description: string;
  thickness: number;
  isActive: boolean;
  onHover: (name: string | null) => void;
}

function SkinLayer({ position, color, name, description, thickness, isActive, onHover }: LayerProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (materialRef.current) {
      gsap.to(materialRef.current, {
        opacity: isActive ? 1 : 0.6,
        roughness: isActive ? 0.2 : 0.8,
        duration: 0.5,
      });
    }
  });

  return (
    <group position={position}>
      <RoundedBox
        args={[4, thickness, 3]} // Width, Height (thickness), Depth
        radius={0.05}
        smoothness={4}
        onPointerOver={() => onHover(name)}
        onPointerOut={() => onHover(null)}
      >
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          transparent
          opacity={0.6}
          roughness={0.8}
          metalness={0.1}
        />
      </RoundedBox>
      {isActive && (
        <Html position={[2.5, 0, 0]} center>
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gold/20 w-64 animate-in fade-in slide-in-from-left-4 duration-300">
            <h4 className="text-gold font-medium mb-1 uppercase tracking-wider text-sm">{name}</h4>
            <p className="text-graphite/70 text-xs leading-relaxed">{description}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// Visualizes the ultrasound beams focusing on the SMAS layer
function UltrasoundBeams({ activeLayer }: { activeLayer: string | null }) {
  const beamRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (beamRef.current) {
      beamRef.current.position.y = Math.sin(clock.getElapsedTime() * 4) * 0.05 - 0.5; // Centers around -0.5
      beamRef.current.visible = activeLayer === "SMAS Layer";
    }
  });

  return (
    <group ref={beamRef} position={[0, -0.5, 0]}>
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[(i - 2) * 0.5, 1.5, 0]}>
          <coneGeometry args={[0.1, 2.5, 16]} />
          <meshBasicMaterial color="#C9A227" transparent opacity={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#C9A227" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

export function SkinLayers3DInteractive() {
  const { t } = useTranslation();
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  const layers = [
    {
      name: t("ultraformer.3d.epidermis.name", "Epidermis"),
      description: t("ultraformer.3d.epidermis.desc", "The outer layer of the skin. Ultraformer III bypasses this layer to avoid surface damage."),
      color: "#F4E0C9", // Light skin tone
      thickness: 0.2,
      position: [0, 0.4, 0] as [number, number, number],
    },
    {
      name: t("ultraformer.3d.dermis.name", "Dermis"),
      description: t("ultraformer.3d.dermis.desc", "The middle layer containing collagen and elastin. Targeted for wrinkle reduction and skin tightening."),
      color: "#E5B892", // Deeper tone
      thickness: 0.6,
      position: [0, 0, 0] as [number, number, number],
    },
    {
      name: t("ultraformer.3d.smas.name", "SMAS Layer"),
      description: t("ultraformer.3d.smas.desc", "Superficial Muscular Aponeurotic System. The deep foundational layer lifted during surgical facelifts, now targeted non-invasively by Ultraformer III."),
      color: "#C28965", // Deepest tone
      thickness: 0.4,
      position: [0, -0.6, 0] as [number, number, number],
    },
  ];

  return (
    <div className="w-full h-[500px] md:h-[600px] relative bg-pearl rounded-3xl overflow-hidden border border-graphite/5 cursor-move shadow-sm">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="font-display text-2xl text-graphite mb-1">{t("ultraformer.3d.title", "Target Layers")}</h3>
        <p className="text-graphite/60 text-sm">{t("ultraformer.3d.subtitle", "Hover over layers to explore • Drag to rotate")}</p>
      </div>
      
      <Canvas camera={{ position: [5, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#C9A227" />
        
        <React.Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            {layers.map((layer, index) => (
              <SkinLayer
                key={index}
                {...layer}
                isActive={activeLayer === layer.name}
                onHover={setActiveLayer}
              />
            ))}
            <UltrasoundBeams activeLayer={activeLayer} />
          </group>
          <Environment preset="city" />
        </React.Suspense>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          autoRotate={!activeLayer}
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}

