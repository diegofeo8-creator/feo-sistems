"use client";

import { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import GLTFModel from "./GLTFModel";

/**
 * Ajuste fino FINAL según feedback + captura del Modelo 02:
 *
 * 01 Laptop:     perfecto → no tocar
 * 02 ROG:        muy abajo + vista cenital + boca abajo (apoyada en pantalla)
 *                → subir ~30% en Y, rotar para ver teclado de frente, tamaño ok
 * 03 RTX 3090:   centrado ok → acercar 20%
 * 04 PC Ryzen:   centrado ok → acercar 25%
 * 05 PS4:        fuera de centro vertical + lejos → subir 10% Y + acercar 30%
 * 06 DualSense:  un poco grande → reducir 10%
 */
const MODELS = [
  {
    id: "laptop",
    label: "ASUS Laptop",
    subtitle: "Diagnóstico · limpieza · pasta térmica",
    url: "/models/asus_laptop.glb",
    rotationDeg: [10, 0, 0] as [number, number, number],
    targetSize: 1.8,
    positionOffset: [0, 0.15, 0] as [number, number, number],
  },
  {
    id: "rog-strix",
    label: "ASUS ROG Strix Scar 17",
    subtitle: "Gama alta · rendimiento gaming",
    url: "/models/asus_rog_strix_scar_17_se_2022.glb",
    // Captura: vista desde arriba, apoyada sobre el borde de la pantalla,
    // teclado oculto hacia el fondo. Necesitamos:
    // - Rotar ~90° en X para pasar de cenital a frontal
    // - 180° en Y (o similar) para que el teclado mire a cámara
    // - Subir en Y (~0.55) para centrarla en el lienzo
    rotationDeg: [10, 0, 0] as [number, number, number],
    targetSize: 1.85,
    positionOffset: [0, 0.2, 0] as [number, number, number],
  },
  {
    id: "rtx-3090",
    label: "NVIDIA GeForce RTX 3090",
    subtitle: "Disipación · artefactos · potencia",
    url: "/models/nvidia_geforce_rtx_3090.glb",
    // Acercar 20% → 0.96 * 1.20 ≈ 1.15
    rotationDeg: [0, 0, 0] as [number, number, number],
    targetSize: 2.15,
    positionOffset: [0, 0.15, 0] as [number, number, number],
  },
  {
    id: "pc-gaming",
    label: "PC Gaming Ryzen + GTX 1660",
    subtitle: "Armado · refrigeración · optimización",
    url: "/models/pc_gaming_ryzen_nvidia_1660.glb",
    // Acercar 25% → 0.48 * 1.25 ≈ 0.60
    rotationDeg: [0, 0, 0] as [number, number, number],
    targetSize: 1.80,
    positionOffset: [0, 0.1, 0] as [number, number, number],
  },
  {
    id: "ps4",
    label: "PlayStation 4",
    subtitle: "Limpieza interna · pasta térmica",
    url: "/models/playstation_4.glb",
    // Subir 10% Y + acercar 30% → 0.48 * 1.30 ≈ 0.62
    rotationDeg: [20, 0, 0] as [number, number, number],
    targetSize: 1.80,
    positionOffset: [0, 0.18, 0] as [number, number, number],
  },
  {
    id: "ps5",
    label: "PlayStation 5 + DualSense",
    subtitle: "Mantenimiento · drift · HDMI",
    url: "/models/playstation_5_dualsense.glb",
    // Reducir 10% → 2.56 * 0.90 ≈ 2.30
    rotationDeg: [-15, 180, 0] as [number, number, number],
    targetSize: 1.90,
    positionOffset: [0, 0, 0] as [number, number, number],
  },
] as const;

useGLTF.preload(MODELS[0].url);

const CAMERA_POSITION: [number, number, number] = [0, 0.7, 4.2];
const CAMERA_FOV = 35;

function Scene({
  url,
  rotationDeg,
  targetSize,
  positionOffset,
}: {
  url: string;
  rotationDeg: [number, number, number];
  targetSize: number;
  positionOffset: [number, number, number];
}) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 3, -2]} intensity={0.45} />
      <directionalLight position={[0, 2, 6]} intensity={0.4} />

      <GLTFModel
        url={url}
        rotationDeg={rotationDeg}
        targetSize={targetSize}
        positionOffset={positionOffset}
      />

      <ContactShadows
        position={[0, -0.7, 0]}
        opacity={0.35}
        scale={12}
        blur={2.5}
        far={3}
      />

      <Environment resolution={256}>
        <Lightformer
          intensity={2.5}
          color="#EDEAE2"
          position={[0, 6, -5]}
          scale={[14, 14, 1]}
          form="rect"
        />
        <Lightformer
          intensity={1.5}
          color="#D9A32C"
          position={[-5, 1, 3]}
          scale={[6, 6, 1]}
          form="rect"
          rotation={[0, Math.PI / 3, 0]}
        />
        <Lightformer
          intensity={1.2}
          color="#7FB0CC"
          position={[5, 0, 3]}
          scale={[6, 6, 1]}
          form="rect"
          rotation={[0, -Math.PI / 3, 0]}
        />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minDistance={2.5}
        maxDistance={7}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 1.6}
        autoRotate
        autoRotateSpeed={0.5}
        rotateSpeed={0.85}
      />
    </>
  );
}

export default function TechOrbitViewer() {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const current = MODELS[index];

  function prev() {
    setIndex((i) => (i - 1 + MODELS.length) % MODELS.length);
  }
  function next() {
    const nextIndex = (index + 1) % MODELS.length;
    useGLTF.preload(MODELS[nextIndex].url);
    setIndex(nextIndex);
  }

  return (
    <div className="relative w-full h-full max-h-full overflow-hidden select-none">
      {ready && (
        <Canvas
          camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent", touchAction: "none" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Suspense fallback={null}>
            <Scene
              key={current.url}
              url={current.url}
              rotationDeg={current.rotationDeg}
              targetSize={current.targetSize}
              positionOffset={current.positionOffset}
            />
          </Suspense>
        </Canvas>
      )}

      <button
        type="button"
        onClick={prev}
        aria-label="Modelo anterior"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg/50 border border-paper/20 text-paper backdrop-blur-sm hover:bg-bg/70 hover:border-accent/50 transition-colors flex items-center justify-center"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Modelo siguiente"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg/50 border border-paper/20 text-paper backdrop-blur-sm hover:bg-bg/70 hover:border-accent/50 transition-colors flex items-center justify-center"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Título del modelo: arriba-izquierda del visor 3D */}
      <div className="absolute -top-1 left-3 md:top-0 md:left-5 max-w-[220px] text-left pointer-events-none z-10">
        <p className="font-heading text-[10px] tracking-[0.15em] text-accent uppercase mb-1">
          Modelo {String(index + 1).padStart(2, "0")}
        </p>
        <p className="font-heading font-bold text-paper text-sm md:text-base leading-tight drop-shadow-sm">
          {current.label}
        </p>
        <p className="text-paper/70 text-xs mt-1">{current.subtitle}</p>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
        <span className="font-heading text-[10px] tracking-[0.2em] text-paper/70 uppercase">
          ✦ Arrastra para girar
        </span>
        <span className="text-paper/40 text-[10px]">
          {index + 1} / {MODELS.length}
        </span>
      </div>
    </div>
  );
}
