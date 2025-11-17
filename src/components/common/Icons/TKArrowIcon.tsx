import React from 'react';

type Direction = 'left' | 'right' | 'up' | 'down';

interface ArrowIconProps {
  width?: number;
  height?: number;
  color?: string;
  direction?: Direction;
}

const getRotation = (direction: Direction): string => {
  switch (direction) {
    case 'left':
      return 'rotate(180 8 8)';
    case 'up':
      return 'rotate(270 8 8)';
    case 'down':
      return 'rotate(90 8 8)';
    case 'right':
    default:
      return '';
  }
};

export const TKArrowIcon: React.FC<ArrowIconProps> = ({
  width = 16,
  height = 16,
  color = '#4D4D4D',
  direction = 'right',
}) => {
  const rotation = getRotation(direction);

  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <path
        d="M4.71348 13.9962C5.04015 14.3195 5.56411 14.3168 5.88742 13.9902L11.3705 8.45017C11.6279 8.19017 11.6257 7.77232 11.3657 7.51499L5.82571 2.03187C5.49905 1.70856 4.97508 1.71127 4.65177 2.03793C4.32846 2.3646 4.33116 2.88856 4.65783 3.21187L9.48453 7.99562L4.70083 12.829C4.38411 13.149 4.38685 13.6795 4.71348 13.9962Z"
        fill={color}
        transform={rotation}
      />
    </svg>
  );
};