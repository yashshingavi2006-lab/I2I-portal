"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";

const AMBER = "#F2A93C";
const AMBER_SOFT = "#F5C878";
const AMBER_DEEP = "#B5762A";
const WHITE_SPARK = "#FFF4E0";

function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * A faceted "crystal" built from the vertex positions of a subdivided
 * icosahedron, rendered as glowing points. On mount, particles start
 * scattered in a sphere and converge into the crystal form over ~2.2s —
 * the "assembling from chaos" entrance (reference: a dark AI-product hero
 * where a particle cloud morphs into recognizable shapes), done for real
 * in WebGL rather than a pre-rendered video.
 */
function ParticleCrystal({ scale }: { scale: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const wireRef = useRef<THREE.LineSegments>(null);
  const mountTime = useRef<number | null>(null);
  const settled = useRef(false);

  const { startPositions, finalPositions, colors, count } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 4);
    const final = geo.attributes.position.array as Float32Array;
    const n = geo.attributes.position.count;
    const start = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      // Scatter each particle to a random point on a much larger sphere.
      const r = 4 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      start[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      start[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      start[i * 3 + 2] = r * Math.cos(phi);
    }
    const colorArray = new Float32Array(n * 3);
    const palette = [new THREE.Color(AMBER), new THREE.Color(AMBER_SOFT), new THREE.Color(AMBER_DEEP), new THREE.Color(WHITE_SPARK)];
    for (let i = 0; i < n; i++) {
      const rnd = Math.random();
      const c = rnd < 0.6 ? palette[0] : rnd < 0.85 ? palette[1] : rnd < 0.97 ? palette[2] : palette[3];
      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;
    }
    return { startPositions: start, finalPositions: final, colors: colorArray, count: n };
  }, []);

  const wireGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.001, 1), []);
  const workingPositions = useMemo(() => new Float32Array(startPositions), [startPositions]);

  const ASSEMBLE_DURATION = 2.2;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (mountTime.current === null) mountTime.current = t;
    const elapsed = t - mountTime.current;

    if (!settled.current) {
      const raw = Math.min(elapsed / ASSEMBLE_DURATION, 1);
      const eased = easeOutExpo(raw);
      const posAttr = pointsRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
      if (posAttr) {
        for (let i = 0; i < count * 3; i++) {
          workingPositions[i] = startPositions[i] + (finalPositions[i] - startPositions[i]) * eased;
        }
        posAttr.needsUpdate = true;
      }
      if (raw >= 1) settled.current = true;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.18;
      pointsRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    }
    if (wireRef.current) {
      wireRef.current.rotation.y = t * 0.18;
      wireRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
    }
  });

  return (
    <group scale={scale}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[workingPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      {/* Faint low-poly wireframe ghosting the facets underneath, for structure. */}
      <lineSegments ref={wireRef} geometry={new THREE.WireframeGeometry(wireGeometry)}>
        <lineBasicMaterial color={AMBER_SOFT} transparent opacity={0.1} />
      </lineSegments>
    </group>
  );
}

function HeroScene() {
  // Free-floating centerpiece on the right half of the frame — the compact
  // map card that used to live here is gone (the full map already has its
  // own section further down the page), so this now gets real room instead
  // of being squeezed into a margin.
  return (
    <>
      <ambientLight intensity={0.3} />
      <group position={[2.3, 0.3, -0.5]}>
        <ParticleCrystal scale={2.1} />
      </group>
      <Sparkles count={70} scale={13} size={1.6} speed={0.2} color={AMBER_SOFT} opacity={0.35} />
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
