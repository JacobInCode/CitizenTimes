import React from 'react';
import CitizenCard from '@/components/CitizenCard';
import MinimalHeader from '@/components/MinimalHeader';
import type { Viewport } from 'next'
 
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Also supported by less commonly used
  // interactiveWidget: 'resizes-visual',
}

const CitizenPage = () => {
    return (
        <div className="flex-1 w-full flex flex-col gap-7 items-center mb-32 max-w-6xl">
            <MinimalHeader />
            <div className='mt-20 flex justify-center w-full'>
                <CitizenCard />
            </div>
        </div>
    );
};

export default CitizenPage;