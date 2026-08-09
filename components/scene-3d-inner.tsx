"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const AMBER = "#F2A93C";
const AMBER_SOFT = "#F5C878";
const AMBER_DEEP = "#B5762A";
const INK_LIGHT = "#8A8578";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function Node({ position, scale, color }: { position: [number, number, number]; scale: number; color: string }) {
  return (
    <Float speed={1.4} rotationIntensity={1.1} floatIntensity={1.6}>
      <mesh position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} emissive={color} emissiveIntensity={0.15} />
      </mesh>
    </Float>
  );
}

function NetworkLines({ nodes }: { nodes: [number, number, number][] }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Connect each node to its two nearest neighbors for a network feel.
    for (let i = 0; i < nodes.length; i++) {
      const distances = nodes
        .map((n, j) => ({ j, d: j === i ? Infinity : new THREE.Vector3(...n).distanceTo(new THREE.Vector3(...nodes[i])) }))
        .sort((a, b) => a.d - b.d);
      for (const { j } of distances.slice(0, 2)) {
        points.push(new THREE.Vector3(...nodes[i]), new THREE.Vector3(...nodes[j]));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [nodes]);

  const ref = useRef<THREE.LineSegments>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color={AMBER_SOFT} transparent opacity={0.18} />
    </lineSegments>
  );
}

function NetworkScene() {
  const nodes = useMemo<[number, number, number][]>(() => {
    return Array.from({ length: 9 }, (_, i) => [
      (seededRandom(i * 3.1) - 0.5) * 8,
      (seededRandom(i * 7.7) - 0.5) * 5,
      (seededRandom(i * 5.3) - 0.5) * 3,
    ]);
  }, []);
  const colors = [AMBER, AMBER_SOFT, AMBER_DEEP];

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={60} color={AMBER_SOFT} />
      <NetworkLines nodes={nodes} />
      {nodes.map((pos, i) => (
        <Node key={i} position={pos} scale={0.18 + seededRandom(i * 1.9) * 0.22} color={colors[i % colors.length]} />
      ))}
      <Sparkles count={40} scale={9} size={2} speed={0.3} color={INK_LIGHT} opacity={0.4} />
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
      {variant === "network" ? <NetworkScene /> : <FieldScene />}
    </Canvas>
  );
}
