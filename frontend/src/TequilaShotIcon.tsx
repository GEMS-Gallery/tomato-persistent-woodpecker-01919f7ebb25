import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

const TequilaShotIcon: React.FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M17,5V3H7v2l4.67,10H9v2h6v-2h-2.67L17,5z M13,13.5l-2-4.5h4L13,13.5z" />
    </SvgIcon>
  );
};

export default TequilaShotIcon;
