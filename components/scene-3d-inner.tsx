"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

const AMBER = "#F2A93C";
const AMBER_SOFT = "#F5C878";
const AMBER_DEEP = "#B5762A";
const WHITE_SPARK = "#FFF4E0";

/**
 * A single faceted "crystal" built from the vertex positions of a
 * subdivided icosahedron, rendered as glowing points rather than solid
 * faces — the particle-texture-on-a-defined-form look (references: a dark
 * AI-product hero with a morphing particle brain, and a light agency site
 * with one small rotating glowing crystal). Deliberately one restrained
 * object, not a scattered field — the whole point of this pass was to move
 * away from the earlier cluttered multi-shape attempt.
 */
function ParticleCrystal({ scale }: { scale: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const wireRef = useRef<THREE.LineSegments>(null);

  const { positions, colors } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 3);
    const pos = geo.attributes.position;
    const count = pos.count;
    const colorArray = new Float32Array(count * 3);
    const palette = [new THREE.Color(AMBER), new THREE.Color(AMBER_SOFT), new THREE.Color(AMBER_DEEP), new THREE.Color(WHITE_SPARK)];
    for (let i = 0; i < count; i++) {
      // Weighted so warm amber dominates; white kept rare since additive
      // blending washes dense overlapping points toward white regardless
      // of base hue — err heavily amber to compensate.
      const r = Math.random();
      const c = r < 0.6 ? palette[0] : r < 0.85 ? palette[1] : r < 0.97 ? palette[2] : palette[3];
      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;
    }
    return { positions: pos.array as Float32Array, colors: colorArray };
  }, []);

  const wireGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.001, 1), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.12;
      pointsRef.current.rotation.x = Math.sin(t * 0.15) * 0.1;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = t * 0.12;
      wireRef.current.rotation.x = Math.sin(t * 0.15) * 0.1;
    }
  });

  return (
    <group scale={scale}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Faint low-poly wireframe ghosting the facets underneath, for structure. */}
      <lineSegments ref={wireRef} geometry={new THREE.WireframeGeometry(wireGeometry)}>
        <lineBasicMaterial color={AMBER_SOFT} transparent opacity={0.08} />
      </lineSegments>
    </group>
  );
}

function HeroScene() {
  // Positioned in the empty top-right margin — above the map card, below
  // the navbar — confirmed clear of both text and the card at this camera
  // distance. Kept as one deliberate, moderately-sized focal object rather
  // than several small scattered accents.
  return (
    <>
      <ambientLight intensity={0.3} />
      <group position={[2.6, 1.7, -1]}>
        <ParticleCrystal scale={1.3} />
      </group>
      <Sparkles count={40} scale={11} size={1.4} speed={0.2} color={AMBER_SOFT} opacity={0.3} />
    </>
  );
}

function FieldScene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} intensity={40} color={AMBER_SOFT} />
      <Sparkles count={90} scale={11} size={3} speed={0.25} color={AMBER_SOFT} opacity={0.75} />
    </>
  );
}

export default function Scene3DInner({ variant }: { variant: "network" | "field" }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      {variant === "network" ? <HeroScene /> : <FieldScene />}
    </Canvas>
  );
}
