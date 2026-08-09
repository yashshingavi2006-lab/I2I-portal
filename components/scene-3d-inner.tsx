"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Sparkles, Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";

const AMBER = "#F2A93C";
const AMBER_SOFT = "#F5C878";
const AMBER_DEEP = "#B5762A";

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

type Shape = "sphere" | "icosahedron" | "torus";

function GlassShape({
  position,
  scale,
  shape,
  tint,
  floatSpeed,
}: {
  position: [number, number, number];
  scale: number;
  shape: Shape;
  tint: string;
  floatSpeed: number;
}) {
  return (
    <Float speed={floatSpeed} rotationIntensity={0.5} floatIntensity={1.1}>
      <mesh position={position} scale={scale}>
        {shape === "sphere" && <sphereGeometry args={[1, 64, 64]} />}
        {shape === "icosahedron" && <icosahedronGeometry args={[1, 4]} />}
        {shape === "torus" && <torusGeometry args={[0.9, 0.32, 32, 100]} />}
        <MeshTransmissionMaterial
          color={tint}
          thickness={0.4}
          roughness={0.04}
          transmission={1}
          ior={1.2}
          chromaticAberration={0.03}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.15}
          temporalDistortion={0.03}
          clearcoat={1}
          attenuationColor={tint}
          attenuationDistance={2.5}
        />
      </mesh>
    </Float>
  );
}

// Procedural studio lighting (no external HDR fetch) so the glass material
// has something to reflect/refract.
function GlassStudio() {
  return (
    <Environment resolution={256}>
      <group rotation={[-Math.PI / 3, 0, 0]}>
        <Lightformer form="circle" intensity={4} color={AMBER_SOFT} position={[0, 4, -4]} scale={6} />
        <Lightformer form="circle" intensity={2} color="#ffffff" position={[-4, 2, 2]} scale={4} />
        <Lightformer form="circle" intensity={2.5} color={AMBER} position={[4, -2, 2]} scale={4} />
        <Lightformer form="ring" intensity={3} color={AMBER_DEEP} position={[0, -4, 2]} scale={8} rotation={[Math.PI / 2, 0, 0]} />
      </group>
    </Environment>
  );
}

function HeroScene() {
  // The two-column hero content (headline + paragraph on the left, map card
  // on the right) occupies roughly world-y between +2.2 and -2.9 at this
  // camera distance — nearly the full width. So shapes are confined to the
  // horizontal margin strips above and below that band (not "far left/right",
  // which still lands on top of the columns), and kept small.
  const shapes = useMemo<{ position: [number, number, number]; scale: number; shape: Shape; tint: string; floatSpeed: number }[]>(
    () => [
      { position: [-3.2, 3.6, -4], scale: 0.32, shape: "icosahedron", tint: AMBER, floatSpeed: 1.1 },
      { position: [3.6, 3.3, -5], scale: 0.24, shape: "sphere", tint: AMBER_SOFT, floatSpeed: 1.4 },
      { position: [-2.8, -3.8, -3.5], scale: 0.2, shape: "torus", tint: AMBER_DEEP, floatSpeed: 1.7 },
      { position: [3.2, -3.6, -4.5], scale: 0.22, shape: "sphere", tint: AMBER, floatSpeed: 1.9 },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.9} />
      <GlassStudio />
      {shapes.map((s, i) => (
        <GlassShape key={i} {...s} />
      ))}
      <Sparkles count={35} scale={9} size={1.8} speed={0.25} color={AMBER_SOFT} opacity={0.35} />
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
