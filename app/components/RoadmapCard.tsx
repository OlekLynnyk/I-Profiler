import React from 'react';
import Image from 'next/image';

type RoadmapCardProps = {
  item: {
    id: number;
    title: string;
    description: string;
    image: string;
  };
  size: 'sm' | 'md' | 'lg';
  isActive: boolean;
  onClick: () => void;
  stepNumber: number;
};

const sizeClasses = {
  sm: 'p-4 scale-95 opacity-70',
  md: 'p-6',
  lg: 'p-8 scale-105',
};

const RoadmapCard: React.FC<RoadmapCardProps> = ({
  item,
  size,
  isActive,
  onClick,
  stepNumber,
}) => {
  return (
    <div
      className={`bg-white/5 text-white rounded-2xl shadow-lg backdrop-blur-md cursor-pointer transition-transform duration-300 hover:scale-105 ${sizeClasses[size]} ${
        isActive ? 'ring-2 ring-white' : ''
      }`}
      onClick={onClick}
    >
      <div className="mb-4">
        <Image
          src={item.image}
          alt={item.title}
          width={80}
          height={80}
          className="mx-auto"
        />
      </div>
      <h3 className="text-xl font-semibold text-center mb-2">
        Step {stepNumber}: {item.title}
      </h3>
      <p className="text-gray-300 text-sm text-center">{item.description}</p>
    </div>
  );
};

export default RoadmapCard;
