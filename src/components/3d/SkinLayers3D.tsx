import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useTranslation } from "react-i18next";

interface LayerProps {
  position: [number, number, number];
  color: string;
  name: string;
  description: string;
  thickness: number;
  isActive: boolean;
  onHover: (name: string | null) => void;
}

/**
 * SkinLayer — a single visualized skin layer (Epidermis / Dermis / SMAS).
 *
 * Performance notes:
 *   - We NO LONGER use gsap.to() inside useFrame (was allocating a tween
 *     every frame → 60 allocations/sec per layer × 3 layers = memory churn).
 *   - Instead we lerp material.opacity/roughness directly toward the target
 *     values using THREE.MathUtils.lerp. Same visual effect, ~0 allocations.
 */
function SkinLayer({ position, color, name, description, thickness, isActive, onHover }: LayerProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (!materialRef.current) return;
    const targetOpacity = isActive ? 1 : 0.6;
    const targetRoughness = isActive ? 0.2 : 0.8;
    // Lerp factor 0.1 gives ~50ms settle time at 60fps — visually smooth
    materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, 0.1);
    materialRef.current.roughness = THREE.MathUtils.lerp(materialRef.current.roughness, targetRoughness, 0.1);
  });

  return (
    <group position={position}>
      <RoundedBox
        args={[4, thickness, 3]}
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
          <div className="bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-xl border border-gold/20 w-56 md:w-64 max-w-[70vw] animate-in fade-in slide-in-from-left-4 duration-300">
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
      beamRef.current.position.y = Math.sin(clock.getElapsedTime() * 4) * 0.05 - 0.5;
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
  // Pause auto-rotation when the tab is hidden — saves battery on mobile.
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const onVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const layers = [
    {
      name: t("ultraformer.3d.epidermis.name", "Epidermis"),
      description: t("ultraformer.3d.epidermis.desc", "The outer layer of the skin. Ultraformer III bypasses this layer to avoid surface damage."),
      color: "#F4E0C9",
      thickness: 0.2,
      position: [0, 0.4, 0] as [number, number, number],
    },
    {
      name: t("ultraformer.3d.dermis.name", "Dermis"),
      description: t("ultraformer.3d.dermis.desc", "The middle layer containing collagen and elastin. Targeted for wrinkle reduction and skin tightening."),
      color: "#E5B892",
      thickness: 0.6,
      position: [0, 0, 0] as [number, number, number],
    },
    {
      name: t("ultraformer.3d.smas.name", "SMAS Layer"),
      description: t("ultraformer.3d.smas.desc", "Superficial Muscular Aponeurotic System. The deep foundational layer lifted during surgical facelifts, now targeted non-invasively by Ultraformer III."),
      color: "#C28965",
      thickness: 0.4,
      position: [0, -0.6, 0] as [number, number, number],
    },
  ];

  return (
    <div className="w-full h-full absolute inset-0 bg-pearl cursor-move">
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 pointer-events-none">
        <h3 className="font-display text-xl md:text-2xl text-graphite mb-1">{t("ultraformer.3d.title", "Target Layers")}</h3>
        <p className="text-graphite/60 text-xs md:text-sm">{t("ultraformer.3d.subtitle", "Hover over layers to explore • Drag to rotate")}</p>
      </div>

      <Canvas
        camera={{ position: [5, 2, 5], fov: 45 }}
        // dpr=[1, 2] caps device pixel ratio at 2x — prevents retina screens
        // from rendering 4x the pixels (huge perf win on mobile).
        dpr={[1, 2]}
        // frameloop="demand" would only render on user interaction, but we
        // need continuous frames for the ultrasound beam animation. Use
        // "always" but pause when tab hidden (handled by autoRotate gate).
        frameloop="always"
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {/* Local light setup — replaces <Environment preset="city"> which
            fetched an external HDR file (~500 KB) from a CDN at runtime. */}
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#C9A227" />
        <directionalLight position={[-3, 4, 5]} intensity={0.3} color="#E8C87A" />

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
        </React.Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          autoRotate={!activeLayer && isTabVisible}
          autoRotateSpeed={1}
          // Disable damping on mobile — saves CPU
          enableDamping={false}
        />
      </Canvas>
    </div>
  );
}
