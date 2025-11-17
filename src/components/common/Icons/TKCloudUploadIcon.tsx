import React from 'react';

interface CloudUploadIconProps {
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

export const TKCloudUploadIcon: React.FC<CloudUploadIconProps> = ({
  width = 23,
  height = 19,
  strokeWidth = 2,
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 23 19" fill="none">
      <path
        d="M5.99996 15C4.75223 15 3.55561 14.5259 2.67334 13.682C1.79107 12.8381 1.29541 11.6935 1.29541 10.5C1.29541 9.30654 1.79107 8.16195 2.67334 7.31803C3.55561 6.47412 4.75223 6.00001 5.99996 6.00001C6.29464 4.68719 7.15672 3.5335 8.39654 2.79273C9.01044 2.42594 9.6986 2.17156 10.4217 2.04412C11.1449 1.91669 11.8888 1.91869 12.6111 2.05001C13.3333 2.18133 14.0198 2.43941 14.6312 2.80949C15.2427 3.17958 15.7672 3.65443 16.1747 4.20694C16.5823 4.75945 16.8649 5.37879 17.0065 6.02961C17.1481 6.68043 17.1459 7.34997 17 8.00001H18C18.9282 8.00001 19.8185 8.36876 20.4748 9.02514C21.1312 9.68152 21.5 10.5718 21.5 11.5C21.5 12.4283 21.1312 13.3185 20.4748 13.9749C19.8185 14.6313 18.9282 15 18 15H17M8 12L11 9M11 9L14 12M11 9V18"
        stroke="#528E6B"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
