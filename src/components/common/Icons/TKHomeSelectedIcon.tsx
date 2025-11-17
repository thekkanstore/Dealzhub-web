import React from 'react';

interface HomeSelectedIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const TKHomeSelectedIcon: React.FC<HomeSelectedIconProps> = ({
  width = 32,
  height = 32,
  color = '#315540',
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <path
        d="M13.3303 25.7701V19.1034H18.6636V25.7701C18.6636 26.5034 19.2636 27.1034 19.997 27.1034H23.997C24.7303 27.1034 25.3303 26.5034 25.3303 25.7701V16.4367H27.597C28.2103 16.4367 28.5036 15.6767 28.037 15.2767L16.8903 5.23673C16.3836 4.7834 15.6103 4.7834 15.1036 5.23673L3.95696 15.2767C3.50362 15.6767 3.78362 16.4367 4.39696 16.4367H6.66362V25.7701C6.66362 26.5034 7.26362 27.1034 7.99696 27.1034H11.997C12.7303 27.1034 13.3303 26.5034 13.3303 25.7701Z"
        fill={color}
      />
    </svg>
  );
};
