"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

interface GLTFModelProps {
  url: string;
  /** Diámetro aproximado final del modelo en unidades de escena. */
  targetSize?: number;
  /** Rotación de corrección en grados [x, y, z]. */
  rotationDeg?: [number, number, number];
  /** Desplazamiento extra en unidades de escena [x, y, z] (después de centrar/escalar). */
  positionOffset?: [number, number, number];
}

/**
 * Normalización robusta + reparación de materiales/texturas:
 * 1. Clona la escena
 * 2. Corrige texturas (colorSpace, anisotropy) y materiales (transparencia real)
 * 3. Calcula bbox → centra + escala a targetSize
 * 4. Aplica rotación de corrección
 * 5. Aplica offset de posición
 *
 * Caso especial DualSense / botones: muchos GLB exportan plástico sólido
 * con alphaMode = BLEND. Eso hace que los botones se vean totalmente
 * transparentes. Si hay mapa de color, opacity ≈ 1 y no hay alphaMap
 * dedicado, se convierte a MASK (alphaTest) para conservar la textura.
 */
export default function GLTFModel({
  url,
  targetSize = 1.6,
  rotationDeg = [0, 0, 0],
  positionOffset = [0, 0, 0],
}: GLTFModelProps) {
  const { scene } = useGLTF(url);
  const wrapperRef = useRef<Group>(null);

  const cloned = useMemo(() => {
    const c = scene.clone(true);

    c.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;

      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      mesh.visible = true;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      mats.forEach((mat) => {
        if (!mat) return;

        // --- Texturas: color space + anisotropy ---
        const maps = [
          "map",
          "emissiveMap",
          "aoMap",
          "metalnessMap",
          "roughnessMap",
          "normalMap",
          "bumpMap",
          "displacementMap",
          "alphaMap",
          "lightMap",
        ] as const;

        maps.forEach((key) => {
          const tex = (mat as any)[key] as THREE.Texture | null | undefined;
          if (!tex || !tex.isTexture) return;

          if (key === "map" || key === "emissiveMap") {
            tex.colorSpace = THREE.SRGBColorSpace;
          }
          tex.anisotropy = Math.max(tex.anisotropy || 1, 8);
          tex.needsUpdate = true;
        });

        // --- Transparencia ---
        const hasAlphaMap = !!(mat as any).alphaMap;
        const hasColorMap = !!(mat as any).map;
        const opacity = typeof mat.opacity === "number" ? mat.opacity : 1;
        const lowOpacity = opacity < 0.99;
        const markedTransparent = mat.transparent === true;

        // Caso típico DualSense / botones: export con alphaMode=BLEND
        // pero es plástico sólido con textura. Convertir a MASK.
        const looksLikeFalseBlend =
          markedTransparent &&
          !lowOpacity &&
          hasColorMap &&
          !hasAlphaMap;

        if (looksLikeFalseBlend) {
          // Conserva bordes suaves de la textura sin volver el mesh de cristal
          mat.transparent = true;
          (mat as any).alphaTest = 0.5;
          mat.opacity = 1;
          mat.depthWrite = true;
        } else if (markedTransparent || lowOpacity || hasAlphaMap) {
          // Transparencia real (vidrio, pantallas, etc.)
          mat.transparent = true;
          if (hasAlphaMap && (mat as any).alphaTest === 0) {
            (mat as any).alphaTest = 0.01;
          }
          mat.depthWrite = opacity >= 0.95 && !hasAlphaMap;
        } else {
          // Opaco limpio
          mat.transparent = false;
          mat.opacity = 1;
          mat.depthWrite = true;
          if ("alphaTest" in mat) (mat as any).alphaTest = 0;
        }

        // --- Standard / Physical ---
        if (
          mat.type === "MeshStandardMaterial" ||
          mat.type === "MeshPhysicalMaterial"
        ) {
          const std = mat as THREE.MeshStandardMaterial;
          if (std.envMapIntensity === undefined || std.envMapIntensity === 0) {
            std.envMapIntensity = 1;
          }
          if (std.metalness === 0 && std.roughness === 1 && !std.metalnessMap && !std.roughnessMap) {
            std.metalness = Math.min(1, Math.max(0, std.metalness));
            std.roughness = Math.min(1, Math.max(0, std.roughness));
          }
        }

        mat.side = mat.side ?? THREE.FrontSide;
        mat.needsUpdate = true;
      });
    });

    return c;
  }, [scene]);

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    cloned.position.set(0, 0, 0);
    cloned.rotation.set(0, 0, 0);
    cloned.scale.set(1, 1, 1);
    cloned.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
    const scale = targetSize / maxDim;

    cloned.scale.setScalar(scale);
    cloned.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    wrapperRef.current.rotation.set(
      (rotationDeg[0] * Math.PI) / 180,
      (rotationDeg[1] * Math.PI) / 180,
      (rotationDeg[2] * Math.PI) / 180
    );
    wrapperRef.current.position.set(
      positionOffset[0],
      positionOffset[1],
      positionOffset[2]
    );

    cloned.updateMatrixWorld(true);
    wrapperRef.current.updateMatrixWorld(true);
  }, [cloned, targetSize, rotationDeg, positionOffset]);

  return (
    <group ref={wrapperRef}>
      <primitive object={cloned} />
    </group>
  );
}
