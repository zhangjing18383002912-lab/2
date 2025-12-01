
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BorrmannType, StomachProps } from '../types';

const StomachVisual: React.FC<StomachProps> = ({ viewMode, borrmannType, highlightPart, onClickPart }) => {
  
  // More accurate anatomical path (Anterior View)
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

  // Define anatomy interactive zones
  const anatomyZones = [
    { id: 'esophagus', label: '食管', x: 160, y: 40, r: 25 },
    { id: 'fundus', label: '胃底', x: 260, y: 110, r: 40 },
    { id: 'body', label: '胃体', x: 220, y: 220, r: 50 },
    { id: 'antrum', label: '胃窦', x: 130, y: 320, r: 35 },
    { id: 'pylorus', label: '幽门', x: 80, y: 300, r: 20 },
  ];

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

  const isTypeIV = viewMode === 'borrmann' && borrmannType === BorrmannType.IV;

  return (
    <div className="relative w-full h-[450px] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 400 450" className="w-full h-full max-w-[500px] drop-shadow-2xl">
        <defs>
          <filter id="tissue-texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0" in="noise" result="coloredNoise" />
            <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
            <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
          </filter>

          <filter id="rigid-texture">
             <feTurbulence type="turbulence" baseFrequency="0.08" numOctaves="4" result="noise" />
             <feDiffuseLighting in="noise" lightingColor="#e2e8f0" surfaceScale="1.2">
               <feDistantLight azimuth="45" elevation="60" />
             </feDiffuseLighting>
             <feComposite operator="in" in2="SourceGraphic" />
             <feBlend mode="overlay" in2="SourceGraphic" />
          </filter>

          <radialGradient id="grad-normal" cx="60%" cy="40%" r="80%" fx="60%" fy="40%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="90%" stopColor="#991b1b" />
          </radialGradient>
          
          <radialGradient id="grad-healthy" cx="60%" cy="40%" r="80%" fx="60%" fy="40%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </radialGradient>

          <radialGradient id="grad-stiff" cx="50%" cy="50%" r="90%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </radialGradient>
        </defs>

        <motion.g
           initial={{ scale: 0.95, opacity: 0 }}
           animate={{ 
             scale: isTypeIV ? 0.85 : 1, // Shrink significantly for Type IV (Linitis Plastica)
             opacity: 1 
           }}
           transition={{ duration: 0.8 }}
        >
          {/* Main Stomach Shape */}
          <path
            d={stomachPath}
            fill={`url(#${getGradientId()})`}
            stroke={isTypeIV ? "#475569" : "#7f1d1d"}
            strokeWidth={isTypeIV ? "3" : "2"}
            filter={isTypeIV ? "url(#rigid-texture)" : "url(#tissue-texture)"}
            className="drop-shadow-lg transition-all duration-700"
          />
          
          {/* Rugae - Only show if NOT Type IV (Linitis Plastica smooths them out) */}
          {!isTypeIV && (
            <g opacity="0.3">
               {rugaePaths.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="#7f1d1d" strokeWidth="2" strokeLinecap="round" />
               ))}
            </g>
          )}

          {/* Type IV Overlay Detail - Mesh/Grid effect to show stiffness */}
          {isTypeIV && (
             <g opacity="0.4">
               <path d={stomachPath} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
               {/* Cross hatching to suggest fibrosis */}
               <path d="M 120 100 L 200 180 M 140 300 L 220 220" stroke="#334155" strokeWidth="2" strokeOpacity="0.5"/>
             </g>
          )}
        </motion.g>

        {viewMode === 'anatomy' && (
          <g>
            {/* Clickable Zones */}
            {anatomyZones.map((zone) => (
              <g 
                key={zone.id} 
                onClick={(e) => { e.stopPropagation(); onClickPart?.(zone.id); }}
                className="cursor-pointer hover:opacity-100 transition-all group"
              >
                {/* Invisible Hit Area */}
                <circle cx={zone.x} cy={zone.y} r={zone.r} fill="transparent" />
                
                {/* Visual Indicator - Pulsing */}
                <circle 
                  cx={zone.x} 
                  cy={zone.y} 
                  r="6" 
                  fill="#fbbf24" 
                  className="animate-pulse"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle 
                  cx={zone.x} 
                  cy={zone.y} 
                  r="12" 
                  fill="#fbbf24" 
                  opacity="0.3"
                  className="animate-ping"
                />
                
                {/* Label Line */}
                <line 
                  x1={zone.x} 
                  y1={zone.y} 
                  x2={zone.x + (zone.x > 200 ? 40 : -40)} 
                  y2={zone.y - 25} 
                  stroke="#334155" 
                  strokeWidth="1" 
                />
                
                {/* Text Label */}
                <rect 
                  x={zone.x + (zone.x > 200 ? 35 : -95)} 
                  y={zone.y - 45}
                  width="60"
                  height="22"
                  rx="4"
                  fill="white"
                  className="shadow-sm"
                  stroke="#e2e8f0"
                  strokeWidth="0.5"
                />
                <text 
                  x={zone.x + (zone.x > 200 ? 65 : -65)} 
                  y={zone.y - 30} 
                  textAnchor="middle"
                  className="font-sans text-xs font-bold fill-slate-700 pointer-events-none"
                  dominantBaseline="middle"
                >
                  {zone.label}
                </text>
              </g>
            ))}
            <text x="200" y="420" textAnchor="middle" fontSize="11" fill="#64748b" className="animate-bounce font-medium bg-white/80 px-3 py-1 rounded-full">👆 点击黄色热点查看详情</text>
          </g>
        )}

        {viewMode === 'surgery' && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             {/* Distal Gastrectomy Line */}
             <path d="M 90 260 L 320 320" stroke="white" strokeWidth="3" strokeDasharray="6,4" />
             {/* Adjusted coordinates to center-left align text so it isn't cut off */}
             <text x="315" y="340" textAnchor="end" fill="white" fontSize="12" fontWeight="bold" style={{textShadow: "0px 1px 2px black"}}>远端切除 (保留上部)</text>
             
             {/* Total Gastrectomy Line */}
             <path d="M 160 80 L 220 80" stroke="white" strokeWidth="3" strokeDasharray="6,4" />
             <text x="230" y="85" fill="white" fontSize="12" fontWeight="bold" style={{textShadow: "0px 1px 2px black"}}>全胃切除 (R-Y吻合)</text>
          </motion.g>
        )}

        <AnimatePresence mode='wait'>
          {viewMode === 'borrmann' && borrmannType === BorrmannType.I && (
            <motion.g key="type1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
              <motion.g
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <line x1="180" y1="260" x2="280" y2="260" stroke="#334155" strokeWidth="1" />
                <rect x="280" y="245" width="100" height="30" rx="4" fill="white" className="shadow-sm" />
                <text x="290" y="265" fontSize="12" fontWeight="bold" fill="#1e293b">Borrmann I (隆起型)</text>
              </motion.g>
            </motion.g>
          )}

          {viewMode === 'borrmann' && borrmannType === BorrmannType.II && (
            <motion.g key="type2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <g transform="translate(180, 260)">
                 <circle cx="0" cy="0" r="25" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
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
                <rect x="280" y="245" width="110" height="30" rx="4" fill="white" className="shadow-sm" />
                <text x="285" y="265" fontSize="12" fontWeight="bold" fill="#1e293b">Borrmann II (局限溃疡)</text>
              </motion.g>
            </motion.g>
          )}

           {viewMode === 'borrmann' && borrmannType === BorrmannType.III && (
            <motion.g key="type3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <g transform="translate(180, 260)">
                 <path d="M -30 -10 Q 0 -30 30 -10 Q 40 20 0 30 Q -40 20 -30 -10" fill="#7f1d1d" opacity="0.6" />
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
               <rect x="280" y="245" width="110" height="30" rx="4" fill="white" className="shadow-sm" />
               <text x="285" y="265" fontSize="12" fontWeight="bold" fill="#1e293b">Borrmann III (浸润溃疡)</text>
              </motion.g>
            </motion.g>
          )}

           {viewMode === 'borrmann' && borrmannType === BorrmannType.IV && (
            <motion.g key="type4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               {/* Note: The main shape changes style via props above (isTypeIV) */}
               <g transform="translate(200, 200)">
                 <text x="0" y="0" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold" style={{textShadow: "0 0 10px white"}}>
                   皮革胃 (弥漫浸润)
                 </text>
                 <text x="0" y="20" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="500">
                   胃壁僵硬 / 皱襞消失 / 腔隙缩小
                 </text>
               </g>
               {/* Overlay hints for stiffness */}
               <circle cx="150" cy="150" r="100" fill="transparent" stroke="white" strokeWidth="2" strokeDasharray="4,4" opacity="0.3" className="animate-pulse"/>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
      
      <div className="absolute bottom-2 right-2 text-[10px] text-slate-400">
         Anterior View (前视)
      </div>
    </div>
  );
};

export default StomachVisual;