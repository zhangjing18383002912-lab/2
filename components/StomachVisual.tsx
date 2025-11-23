import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BorrmannType, StomachProps } from '../types';

const StomachVisual: React.FC<StomachProps> = ({ viewMode, borrmannType, highlightPart, onClickPart }) => {
  
  // Base SVG Path for the stomach (simplified J-shape)
  // M: Move to top of esophagus
  // C: Bezier curves to form the fundus, body, antrum
  const stomachPath = "M 80 20 L 80 80 C 80 120 40 140 30 200 C 20 280 60 350 150 380 C 240 410 320 350 350 300 L 360 280 L 360 280 C 330 310 280 340 200 320 C 130 300 110 240 120 160 C 125 100 130 80 130 20 Z";

  // Gradient definitions based on state
  const getGradientId = () => {
    if (viewMode === 'healthy') return 'grad-healthy';
    if (viewMode === 'borrmann' && borrmannType === BorrmannType.IV) return 'grad-stiff'; // Linitis plastica
    return 'grad-normal';
  };

  return (
    <div className="relative w-full h-[450px] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 400 450" className="w-full h-full max-w-[500px] drop-shadow-2xl">
        <defs>
          <radialGradient id="grad-normal" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#ef4444" />
          </radialGradient>
          <radialGradient id="grad-healthy" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#fb7185" />
          </radialGradient>
          <radialGradient id="grad-stiff" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stomach Body Layer */}
        <motion.path
          d={stomachPath}
          fill={`url(#${getGradientId()})`}
          stroke={viewMode === 'borrmann' && borrmannType === BorrmannType.IV ? "#64748b" : "#b91c1c"}
          strokeWidth="4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="cursor-pointer transition-colors duration-500"
        />

        {/* Anatomy Labels (Optional interactions) */}
        {viewMode === 'anatomy' && (
          <g className="font-sans text-xs font-bold fill-white pointer-events-none">
            <text x="90" y="60">食管 (Esophagus)</text>
            <text x="140" y="100">胃底 (Fundus)</text>
            <text x="140" y="200">胃体 (Body)</text>
            <text x="250" y="320">胃窦 (Antrum)</text>
          </g>
        )}

        {/* Surgery Lines */}
        {viewMode === 'surgery' && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <path d="M 80 180 L 300 250" stroke="white" strokeWidth="3" strokeDasharray="5,5" />
             <text x="310" y="250" fill="white" fontSize="14" fontWeight="bold">远端胃切除线</text>
             <path d="M 80 60 L 130 60" stroke="white" strokeWidth="3" strokeDasharray="5,5" />
             <text x="140" y="65" fill="white" fontSize="14" fontWeight="bold">全胃切除线</text>
          </motion.g>
        )}

        {/* Borrmann Lesions Overlay */}
        <AnimatePresence mode='wait'>
          {viewMode === 'borrmann' && borrmannType === BorrmannType.I && (
            <motion.g
              key="type1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              {/* Type I: Exophytic Growth (Mushroom-like) */}
              {/* Pulsing base to show vascularity/growth */}
              <motion.circle 
                cx="200" cy="220" r="28" 
                fill="#ef4444" 
                opacity="0.3"
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              {/* Main Mass */}
              <motion.circle 
                cx="200" cy="220" r="25" 
                fill="#7f1d1d" 
                stroke="#fecaca" 
                strokeWidth="2" 
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
              <circle cx="200" cy="220" r="20" fill="#991b1b" />
              {/* Highlight effect */}
              <circle cx="195" cy="215" r="5" fill="white" opacity="0.3" />
              
              {/* Label Line */}
              <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <line x1="175" y1="220" x2="80" y2="220" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
                <rect x="10" y="200" width="80" height="40" rx="4" fill="white" className="shadow-md" />
                <text x="20" y="225" fontSize="12" fill="#1e293b" fontWeight="bold">隆起型 (I型)</text>
              </motion.g>
            </motion.g>
          )}

          {viewMode === 'borrmann' && borrmannType === BorrmannType.II && (
            <motion.g
              key="type2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Type II: Ulcerated with Clear Margins */}
              {/* Inflammation Halo */}
              <motion.ellipse
                 cx="200" cy="220" rx="32" ry="22"
                 fill="transparent"
                 stroke="#dc2626"
                 strokeWidth="2"
                 opacity="0.5"
                 animate={{ opacity: [0.2, 0.6, 0.2], rx: [32, 34, 32], ry: [22, 24, 22] }}
                 transition={{ repeat: Infinity, duration: 2.5 }}
              />

              {/* Raised Margin */}
              <motion.ellipse 
                cx="200" cy="220" rx="30" ry="20" 
                fill="#450a0a" 
                stroke="#fecaca" 
                strokeWidth="2"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              
              {/* Deep Crater forming */}
              <motion.ellipse 
                cx="200" cy="225" rx="25" ry="15" 
                fill="#200505"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
              />

               <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                 <line x1="170" y1="220" x2="80" y2="220" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
                <rect x="10" y="200" width="80" height="40" rx="4" fill="white" className="shadow-md" />
                <text x="20" y="225" fontSize="12" fill="#1e293b" fontWeight="bold">局限溃疡 (II型)</text>
              </motion.g>
            </motion.g>
          )}

           {viewMode === 'borrmann' && borrmannType === BorrmannType.III && (
            <motion.g
              key="type3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Type III: Infiltrating Ulcer */}
              {/* Infiltration spread (shadowy/diffuse) */}
              <motion.path 
                d="M 160 200 Q 200 180 240 200 Q 250 250 210 260 Q 150 250 160 200" 
                fill="#7f1d1d" 
                opacity="0.2"
                animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />

              {/* Irregular Ulcer Mass */}
              <motion.path 
                d="M 170 210 Q 200 190 230 210 Q 240 240 210 250 Q 160 240 170 210" 
                fill="#450a0a" 
                stroke="#7f1d1d" 
                strokeWidth="4" 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              />

              {/* Active Bleeding/Messy center animation */}
              <motion.path 
                 d="M 180 220 L 220 220 L 200 240 Z"
                 fill="#200505"
                 opacity="0.5"
                 animate={{ opacity: [0.3, 0.7, 0.3] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
              />

              <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <line x1="170" y1="220" x2="80" y2="220" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
                <rect x="10" y="200" width="100" height="40" rx="4" fill="white" className="shadow-md" />
                <text x="15" y="225" fontSize="12" fill="#1e293b" fontWeight="bold">浸润溃疡 (III型)</text>
              </motion.g>
            </motion.g>
          )}

           {viewMode === 'borrmann' && borrmannType === BorrmannType.IV && (
            <motion.g
              key="type4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Diffuse pattern texture overlay */}
               <pattern id="pattern-diffuse" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#475569" opacity="0.5"/>
               </pattern>
               <motion.path 
                  d={stomachPath} 
                  fill="url(#pattern-diffuse)" 
                  opacity="0.3" 
                  pointerEvents="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 1 }}
               />
               <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
               >
                 <line x1="200" y1="220" x2="80" y2="220" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
                 <rect x="10" y="200" width="100" height="40" rx="4" fill="white" className="shadow-md" />
                <text x="15" y="225" fontSize="12" fill="#1e293b" fontWeight="bold">弥漫浸润 (IV型)</text>
               </motion.g>
            </motion.g>
          )}
        </AnimatePresence>

      </svg>

      {/* 3D-like controls or hints could go here */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur rounded-lg p-2 text-xs text-gray-500 shadow">
        * 示意模型仅供参考
      </div>
    </div>
  );
};

export default StomachVisual;