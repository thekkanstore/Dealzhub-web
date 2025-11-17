import React from 'react';

interface HeartSelectedIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const TKHeartSelectedIcon: React.FC<HeartSelectedIconProps> = ({
  width = 32,
  height = 32,
  color = '#315540',
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <path
        d="M17.7997 27.0762C16.7864 27.9962 15.2264 27.9962 14.213 27.0629L14.0664 26.9296C7.06638 20.5962 2.49305 16.4496 2.66638 11.2762C2.74638 9.00956 3.90638 6.83622 5.78638 5.55622C9.30638 3.15622 13.6531 4.27622 15.9997 7.02289C18.3464 4.27622 22.693 3.14289 26.213 5.55622C28.093 6.83622 29.253 9.00956 29.333 11.2762C29.5197 16.4496 24.9331 20.5962 17.9331 26.9562L17.7997 27.0762Z"
        fill={color}
      />
    </svg>
  );
};
