import React from 'react';
import { motion } from 'framer-motion';
import { useDigitalTwinStore, SectorStatus } from '@/store/digitalTwinStore';

// Simple mapping of sector names to SVG path data (placeholder rectangles)
const sectorShapes: Record<string, string> = {
  'North Stand': 'M10 10 H190 V60 H10 Z',
  'South Stand': 'M10 210 H190 V260 H10 Z',
  'East Stand':  'M190 10 V260 H240 V10 Z',
  'West Stand':  'M10 10 V260 H-40 V10 Z',
  'VIP':        'M80 70 H120 V110 H80 Z',
  'Food Court': 'M130 70 H170 V110 H130 Z',
  'Medical Center': 'M80 130 H120 V170 H80 Z',
  'Parking':    'M130 130 H170 V170 H130 Z',
  'Gate A':     'M10 140 H40 V180 H10 Z',
  'Gate B':     'M160 140 H190 V180 H160 Z',
  'Gate C':     'M10 190 H40 V230 H10 Z',
  'Gate D':     'M160 190 H190 V230 H160 Z',
};

export const StadiumMap: React.FC = () => {
  const { sectorStatus, selectSector } = useDigitalTwinStore();

  const handleClick = (sector: string) => {
    selectSector(sector);
  };

  const getFill = (status: SectorStatus) => {
    switch (status) {
      case 'normal':
        return '#2b3747';
      case 'warning':
        return '#d97706'; // amber
      case 'critical':
        return '#dc2626'; // red
      case 'selected':
        return '#0061A4'; // primary blue
      default:
        return '#2b3747';
    }
  };

  return (
    <svg viewBox="0 0 200 270" className="w-full h-auto max-w-md mx-auto">
      {Object.entries(sectorShapes).map(([sector, d]) => {
        const status = sectorStatus[sector] ?? 'normal';
        const isCritical = status === 'critical';
        return (
          <motion.path
            key={sector}
            d={d}
            fill={getFill(status)}
            stroke="#0B1220"
            strokeWidth={1}
            initial={false}
            animate={isCritical ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={isCritical ? { repeat: Infinity, duration: 2 } : undefined}
            whileHover={{ opacity: 0.8, cursor: 'pointer' }}
            onClick={() => handleClick(sector)}
          />
        );
      })}
    </svg>
  );
};
