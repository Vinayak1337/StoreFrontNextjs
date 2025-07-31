import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import React from 'react';

const loading = () => {
	return <FullScreenLoader message='Loading Dashboard...' />;
};

export default loading;
