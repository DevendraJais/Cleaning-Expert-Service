import React from 'react';
import { FiLoader } from 'react-icons/fi';
import { themeColors } from '../../../../theme';

import LogoLoader from '../../../../components/common/LogoLoader';

const LoadingSpinner = ({ fullScreen = true, message = 'Loading...' }) => {
  if (fullScreen) {
    return <LogoLoader />;
  }

  return <LogoLoader fullScreen={false} size="w-16 h-16" />;
};

export default LoadingSpinner;
