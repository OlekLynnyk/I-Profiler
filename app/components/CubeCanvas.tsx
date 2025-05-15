'use client';

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { OrbitControls, RoundedBox } from '@react-three/drei';

const Cube = () => {
  const ref = useRef<THREE.Group>(null);

  // Сохраняем анимацию
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001125;
      ref.current.rotation.x += 0.000675;
    }
  });

  const cubes = [];
  const gridMin = -1.5;
  const gridMax = 1.5;
  const step = 1.0;
  const specialCubePos = [0, 0, 1]; // Специальный кубик

  // Функция для создания одной плитки на каждой грани с зазорами для чёрных линий
  const createFaceTiles = (isSpecial: boolean) => {
    const tiles = [];
    const tileSize = 0.8; // Уменьшаем размер плитки, чтобы увеличить зазор (линии на 100% шире)
    const tileOffset = 0.46; // Смещение плиток для эффекта закругления
    const tileColor = isSpecial ? 0xF6F5ED : 0xffffff; // Ванильно-белый для специального, белый для остальных

    // Одна плитка на каждую грань с RoundedBox для скругления углов
    // Передняя грань (z+)
    tiles.push(
      <mesh key="z+" position={[0, 0, tileOffset]}>
        <RoundedBox args={[tileSize, tileSize, 0.05]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color={tileColor} />
        </RoundedBox>
      </mesh>
    );
    // Задняя грань (z-)
    tiles.push(
      <mesh key="z-" position={[0, 0, -tileOffset]}>
        <RoundedBox args={[tileSize, tileSize, 0.05]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color={tileColor} />
        </RoundedBox>
      </mesh>
    );
    // Верхняя грань (y+)
    tiles.push(
      <mesh key="y+" position={[0, tileOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <RoundedBox args={[tileSize, tileSize, 0.05]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color={tileColor} />
        </RoundedBox>
      </mesh>
    );
    // Нижняя грань (y-)
    tiles.push(
      <mesh key="y-" position={[0, -tileOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <RoundedBox args={[tileSize, tileSize, 0.05]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color={tileColor} />
        </RoundedBox>
      </mesh>
    );
    // Правая грань (x+)
    tiles.push(
      <mesh key="x+" position={[tileOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox args={[tileSize, tileSize, 0.05]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color={tileColor} />
        </RoundedBox>
      </mesh>
    );
    // Левая грань (x-)
    tiles.push(
      <mesh key="x-" position={[-tileOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox args={[tileSize, tileSize, 0.05]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color={tileColor} />
        </RoundedBox>
      </mesh>
    );

    return tiles;
  };

  // Создаём кубы (4x4x4 сетка)
  for (let x = gridMin; x <= gridMax; x += step) {
    for (let y = gridMin; y <= gridMax; y += step) {
      for (let z = gridMin; z <= gridMax; z += step) {
        const isSpecial =
          x === specialCubePos[0] && y === specialCubePos[1] && z === specialCubePos[2];

        cubes.push(
          <group key={`${x}${y}${z}`} position={[x, y, z]}>
            <mesh>
              <boxGeometry args={[0.9, 0.9, 0.9]} />
              <meshStandardMaterial color={0x000000} /> {/* Чёрная основа для линий */}
            </mesh>
            {createFaceTiles(isSpecial)}
          </group>
        );
      }
    }
  }

  return (
    <group ref={ref} scale={[2, 2, 2]} position={[0, 0, 0]}>
      {cubes}
    </group>
  );
};

export default function CubeCanvas() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#1A1E23]">
      <Canvas
        className="w-full h-full relative z-10"
        camera={{ position: [8, 8, 8] }}
        style={{ background: 'transparent' }} // Прозрачный фон Canvas
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
        <Cube />
      </Canvas>
    </div>
  );
}