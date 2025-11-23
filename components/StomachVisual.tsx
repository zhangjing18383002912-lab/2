import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BorrmannType, StomachProps } from '../types';

const StomachVisual: React.FC<StomachProps> = ({ viewMode, borrmannType, highlightPart, onClickPart }) => {
  
  // More accurate anatomical path (Anterior View)
  // Coordinates tuned for a realistic J-shape
  const stomachPath = `
    M 160 20 
    L 160 70 
    C 160 180 130 220 90 280 
    C 70 310 70 340 100 360 
    C 180 400 280 390 340 280 
    C 380 200 380 80 230 70 
    C 210 70 210 70 200 70
    L 200 20 
    Z
  `;

  // Internal rugae (folds) for realism
  const rugaePaths = [
    "M 180 100 Q 180 150 160 200",
    "M 220 120 Q 240 200 200 300",
    "M 260 150 Q 280 220 260 280",
    "M 140 250 Q 120 300 130 340"
  ];

  const getGradientId = () => {
    if (viewMode === 'healthy') return 'grad-healthy';
    if (viewMode === 'borrmann' && borrmannType === BorrmannType.IV) return 'grad-stiff';
    return 'grad-normal';
  };

  return (
    <div className="relative w-full h-[450px] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 400 450" className="w-full h-full max-w-[500px] drop-shadow-2xl">
        <defs>
          {/* Tissue Texture Filter */}
          <filter id="tissue-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0" in="noise" result="coloredNoise" />
            <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
            <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
          </filter>

          {/* Realistic Gradients */}
          <radialGradient id="grad-normal" cx="60%" cy="40%" r="80%" fx="60%" fy="40%">
            <stop offset="0%" stopColor="#f87171" /> {/* Lighter pink/red highlight */}
            <stop offset="50%" stopColor="#ef4444" /> {/* Base red */}
            <stop offset="90%" stopColor="#991b1b" /> {/* Dark red shadow */}
          </radialGradient>
          
          <radialGradient id="grad-healthy" cx="60%" cy="40%" r="80%" fx="60%" fy="40%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </radialGradient>

          <radialGradient id="grad-stiff" cx="60%" cy="40%" r="80%" fx="60%" fy="40%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </radialGradient>
          
          {/* Inner Shadow for depth */}
          <filter id="inner-shadow">
             <feOffset dx="0" dy="4" />
             <feGaussianBlur stdDeviation="4" result="offset-blur" />
             <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
             <feFlood floodColor="black" floodOpacity="0.3" result="color" />
             <feComposite operator="in" in="color" in2="inverse" result="shadow" />
             <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>

        {/* Stomach Body */}
        <motion.g
           initial={{ scale: 0.95, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.8 }}
        >
          <path
            d={stomachPath}
            fill={`url(#${getGradientId()})`}
            stroke={viewMode === 'borrmann' && borrmannType === BorrmannType.IV ? "#475569" : "#7f1d1d"}
            strokeWidth="2"
            filter="url(#tissue-texture)"
            className="drop-shadow-lg"
          />
          
          {/* Rugae (Folds) Details */}
          <g opacity="0.3">
             {rugaePaths.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
             ))}
          </g>
        </motion.g>

        {/* Anatomy Labels */}
        {viewMode === 'anatomy' && (
          <g className="font-sans text-xs font-bold fill-slate-800 pointer-events-none drop-shadow-md">
            <text x="180" y="50" textAnchor="middle">食管</text>
            <text x="280" y="100">胃底</text>
            <text x="240" y="220" textAnchor="middle" fontSize="14" fill="white">胃体</text>
            <text x="120" y="340">胃窦</text>
            <text x="80" y="300" fontSize="10" className="opacity-70">幽门</text>
          </g>
        )}

        {/* Surgery Lines - Updated for new shape */}
        {viewMode === 'surgery' && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             {/* Distal Gastrectomy: Cuts off lower part */}
             <path d="M 90 260 L 320 320" stroke="white" strokeWidth="3" strokeDasharray="6,4" />
             <text x="330" y="325" fill="white" fontSize="12" fontWeight="bold" style={{textShadow: "0px 1px 2px black"}}>远端切除线</text>
             
             {/* Total Gastrectomy: Cuts off top */}
             <path d="M 160 80 L 220 80" stroke="white" strokeWidth="3" strokeDasharray="6,4" />
             <text x="230" y="85" fill="white" fontSize="12" fontWeight="bold" style={{textShadow: "0px 1px 2px black"}}>全胃切除线</text>
          </motion.g>
        )}

        {/* Borrmann Lesions - Positioned in the "Body/Antrum" area (approx 180, 260) */}
        <AnimatePresence mode='wait'>
          {viewMode === 'borrmann' && borrmannType === BorrmannType.I && (
            <motion.g key="type1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Type I: Polypoid */}
              <g transform="translate(180, 260)">
                 <motion.path 
                    d="M -20 0 C -20 -30 20 -30 20 0 Z" 
                    fill="#7f1d1d" 
                    stroke="#fca5a5"
                    strokeWidth="1"
                    animate={{ scaleY: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }} 
                 />
                 <ellipse cx="0" cy="-5" rx="18" ry="12" fill="#991b1b" />
                 <circle cx="-5" cy="-8" r="3" fill="white" opacity="0.2" />
              </g>
              {/* Label */}
              <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <line x1="180" y1="260" x2="280" y2="260" stroke="#334155" strokeWidth="1" />
                <rect x="280" y="245" width="80" height="30" rx="4" fill="white" className="shadow-sm" />
                <text x="290" y="265" fontSize="12" fontWeight="bold" fill="#1e293b">隆起型 (I型)</text>
              </motion.g>
            </motion.g>
          )}

          {viewMode === 'borrmann' && borrmannType === BorrmannType.II && (
            <motion.g key="type2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Type II: Ulcerated with margins */}
              <g transform="translate(180, 260)">
                 {/* Raised edge */}
                 <circle cx="0" cy="0" r="25" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
                 {/* Crater */}
                 <motion.circle 
                   cx="0" cy="0" r="15" fill="#450a0a" 
                   animate={{ r: [15, 16, 15] }} 
                   transition={{ repeat: Infinity, duration: 3 }}
                 />
                 <path d="M -15 0 L 15 0" stroke="#fca5a5" strokeWidth="1" opacity="0.3" />
              </g>
              <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <line x1="205" y1="260" x2="280" y2="260" stroke="#334155" strokeWidth="1" />
                <rect x="280" y="245" width="90" height="30" rx="4" fill="white" className="shadow-sm" />
                <text x="285" y="265" fontSize="12" fontWeight="bold" fill="#1e293b">局限溃疡 (II型)</text>
              </motion.g>
            </motion.g>
          )}

           {viewMode === 'borrmann' && borrmannType === BorrmannType.III && (
            <motion.g key="type3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Type III: Infiltrating Ulcer */}
              <g transform="translate(180, 260)">
                 {/* Diffuse Spread */}
                 <path d="M -30 -10 Q 0 -30 30 -10 Q 40 20 0 30 Q -40 20 -30 -10" fill="#7f1d1d" opacity="0.6" />
                 {/* Messy Center */}
                 <path d="M -15 -5 L 10 5 L -5 15 Z" fill="#200505" />
                 <path d="M 10 -10 L -10 10" stroke="#450a0a" strokeWidth="2" />
                 <motion.circle r="30" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" fill="none" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
              </g>
              <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
               <line x1="210" y1="260" x2="280" y2="260" stroke="#334155" strokeWidth="1" />
               <rect x="280" y="245" width="90" height="30" rx="4" fill="white" className="shadow-sm" />
               <text x="285" y="265" fontSize="12" fontWeight="bold" fill="#1e293b">浸润溃疡 (III型)</text>
              </motion.g>
            </motion.g>
          )}

           {viewMode === 'borrmann' && borrmannType === BorrmannType.IV && (
            <motion.g key="type4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               {/* Leather Bottle / Diffuse */}
               <text x="240" y="200" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="bold" opacity="0.8">
                 胃壁僵硬 / 皱襞消失
               </text>
               {/* Overlay pattern handled by CSS class or gradient change in parent */}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
      
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-400">
         Anterior View
      </div>
    </div>
  );
};

export default StomachVisual;