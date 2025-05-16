'use client';

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls, Instances, Instance } from '@react-three/drei';

const Cube = () => {
  const ref = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001125;
      ref.current.rotation.x += 0.000675;
    }
  });

  const gridMin = -1.5;
  const gridMax = 1.5;
  const step = 1.0;
  const tileSize = 0.8;
  const tileOffset = 0.46;
  const specialCubePos = [0, 0, 1];

  const tiles = [];

  for (let x = gridMin; x <= gridMax; x += step) {
    for (let y = gridMin; y <= gridMax; y += step) {
      for (let z = gridMin; z <= gridMax; z += step) {
        const isSpecial =
          x === specialCubePos[0] && y === specialCubePos[1] && z === specialCubePos[2];

        const color = isSpecial ? '#F6F5ED' : 'white';
        const pos: [number, number, number] = [x, y, z];

        // Чёрный корпус
        tiles.push(
          <Instance
            key={`box-${x}-${y}-${z}`}
            position={pos}
            scale={[0.9, 0.9, 0.9]}
            color="black"
          />
        );

        const faceOffsets: { pos: [number, number, number]; rot: [number, number, number] }[] = [
          { pos: [0, 0, tileOffset], rot: [0, 0, 0] },
          { pos: [0, 0, -tileOffset], rot: [0, 0, 0] },
          { pos: [0, tileOffset, 0], rot: [Math.PI / 2, 0, 0] },
          { pos: [0, -tileOffset, 0], rot: [Math.PI / 2, 0, 0] },
          { pos: [tileOffset, 0, 0], rot: [0, Math.PI / 2, 0] },
          { pos: [-tileOffset, 0, 0], rot: [0, Math.PI / 2, 0] },
        ];

        faceOffsets.forEach((f, i) => {
          const facePos: [number, number, number] = [
            x + f.pos[0],
            y + f.pos[1],
            z + f.pos[2],
          ];
          const faceRot: [number, number, number] = [...f.rot];

          tiles.push(
            <Instance
              key={`face-${x}-${y}-${z}-${i}`}
              position={facePos}
              rotation={faceRot}
              scale={[tileSize, tileSize, 0.05]}
              color={color}
            />
          );
        });
      }
    }
  }

  return (
    <group ref={ref} scale={[2, 2, 2]}>
      <Instances limit={1000}>
        <boxGeometry />
        <meshStandardMaterial />
        {tiles}
      </Instances>
    </group>
  );
};

export default function CubeCanvas() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#1A1E23]">
      <Canvas
        className="w-full h-full relative z-10"
        camera={{ position: [8, 8, 8] }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
        <Cube />
      </Canvas>
    </div>
  );
}
