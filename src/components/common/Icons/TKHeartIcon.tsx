import React from 'react';

interface HeartIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const TKHeartIcon: React.FC<HeartIconProps> = ({
  width = 20,
  height = 20,
  color = '#262626',
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none">
      <path
        d="M8.87512 16.9227C9.50845 17.4977 10.4834 17.4977 11.1168 16.9143L11.2084 16.831C15.5834 12.8727 18.4418 10.281 18.3334 7.04767C18.2834 5.631 17.5584 4.27267 16.3834 3.47267C14.1834 1.97267 11.4668 2.67267 10.0001 4.38934C8.53345 2.67267 5.81678 1.96434 3.61678 3.47267C2.44178 4.27267 1.71678 5.631 1.66678 7.04767C1.55012 10.281 4.41678 12.8727 8.79178 16.8477L8.87512 16.9227Z"
        fill={color}
      />
    </svg>
  );
};
