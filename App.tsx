
import React, { useState, useRef } from 'react';
import { 
  Stethoscope, Building2, Home, Activity, Info, AlertCircle, Utensils, Scissors, Brain, PlayCircle, ClipboardCheck, Clock, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, AlertTriangle, Calculator, Phone, Bed, Sparkles, Layers, Wind, Bot, MessageSquare, HelpCircle, Move, X, ChevronDown, ChevronUp, BookHeart, Smile, Calendar, ExternalLink
} from 'lucide-react';
import { Phase, BorrmannType, NavItem } from './types';
import StomachVisual from './components/StomachVisual';
import AssistantChat, { AssistantChatRef } from './components/AssistantChat';
import { InfoCard } from './components/InfoCard';

const NAV_ITEMS: NavItem[] = [
  { id: Phase.DIAGNOSIS, label: '确诊阶段', icon: 'Stethoscope', description: '分型与治疗决策' },
  { id: Phase.HOSPITALIZATION, label: '住院阶段', icon: 'Building2', description: '手术与化疗护理' },
  { id: Phase.DISCHARGE, label: '出院阶段', icon: 'Home', description: '康复与饮食管理' },
  { id: Phase.FRAILTY, label: '衰弱管理', icon: 'Activity', description: '营养与运动干预' },
];

interface VideoSource { type: 'mp4' | 'iframe'; url: string; summary: string; }
const VIDEO_DATA: Record<string, VideoSource> = {
  "胃癌肿瘤介绍": {
    type: 'iframe',
    url: "//player.bilibili.com/player.html?isOutside=true&bvid=BV1qsVxefE5Z&page=1&high_quality=1&danmaku=0&autoplay=0", 
    summary: "本视频生动讲解了胃癌从慢性炎症到癌变的演变过程。重点介绍了幽门螺杆菌感染、不健康饮食（如高盐、腌制食品）以及吸烟饮酒如何协同作用，逐步破坏胃黏膜屏障。视频还特别强调了早期筛查的重要性，帮助您理解“早发现、早治疗”的黄金法则。"
  }
};

const ANATOMY_DATA: Record<string, { title: string, desc: string, icon: React.ReactNode }> = {
  "esophagus": {
    title: "食管 (Esophagus)",
    desc: "连接咽喉与胃的肌肉通道，全长约25cm。下端有食管下括约肌（LES），正常闭合防止胃酸反流。长期反流性食管炎可能增加癌变风险。",
    icon: <Activity size={24} className="text-teal-500"/>
  },
  "fundus": {
    title: "胃底 (Fundus)",
    desc: "胃的最上部，呈圆顶状，位于食管入口的左上方。进食时主要用于储存食物和气体。该部位的肿瘤早期较难发现。",
    icon: <Building2 size={24} className="text-teal-500"/>
  },
  "body": {
    title: "胃体 (Body)",
    desc: "胃的主体部分，容积最大。拥有丰富的胃腺，分泌胃酸（盐酸）和胃蛋白酶原进行化学消化。也是全胃切除术中必须移除的核心区域。",
    icon: <Utensils size={24} className="text-teal-500"/>
  },
  "antrum": {
    title: "胃窦 (Antrum)",
    desc: "胃的下部，肌肉层较厚，负责强力蠕动研磨食物并将其推入十二指肠。这里是幽门螺杆菌最喜欢定植的部位，也是胃癌的高发区（约占50%）。",
    icon: <AlertCircle size={24} className="text-teal-500"/>
  },
  "pylorus": {
    title: "幽门 (Pylorus)",
    desc: "胃的出口，含强有力的环形括约肌。它像一道阀门，控制食糜排空速度，并防止肠液反流进胃。幽门梗阻是晚期胃癌常见并发症。",
    icon: <CheckCircle2 size={24} className="text-teal-500"/>
  }
};

export default function App() {
  const [activePhase, setActivePhase] = useState<Phase>(Phase.DIAGNOSIS);
  const [activeBorrmann, setActiveBorrmann] = useState<BorrmannType>(BorrmannType.I);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [showTnmDetails, setShowTnmDetails] = useState(false);
  
  const [friedItems, setFriedItems] = useState<number[]>([]);
  const [userWeight, setUserWeight] = useState<string>('');
  
  const chatRef = useRef<AssistantChatRef>(null);

  const toggleFriedItem = (index: number) => {
    setFriedItems(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const calculateNutrition = () => {
    const w = parseFloat(userWeight);
    if (!w || w <= 0) return null;
    return {
      minEnergy: Math.round(w * 25), maxEnergy: Math.round(w * 30),
      minProtein: (w * 1.2).toFixed(1), maxProtein: (w * 1.5).toFixed(1)
    };
  };

  const nutritionResult = calculateNutrition();

  const friedScore = friedItems.length;
  let friedStatus = { label: '健康 (Robust)', color: 'bg-green-100 text-green-800 border-green-200' };
  if (friedScore >= 3) {
    friedStatus = { label: '衰弱 (Frail)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
  } else if (friedScore >= 1) {
    friedStatus = { label: '衰弱前期 (Pre-frail)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  }

  const getContext = () => {
    switch (activePhase) {
      case Phase.DIAGNOSIS: return `确诊阶段 (Borrmann ${activeBorrmann}型)。用户关注TNM分期、早期vs晚期症状。`;
      case Phase.HOSPITALIZATION: return "住院阶段。关注术后72小时康复、疼痛管理及并发症。";
      case Phase.DISCHARGE: return "出院阶段。关注居家护理、饮食红绿灯及紧急就医。";
      case Phase.FRAILTY: return `衰弱管理阶段。Fried评分: ${friedScore}分 (${friedStatus.label})。体重${userWeight}kg。`;
      default: return "胃癌科普首页";
    }
  };

  const openVideo = (title: string) => { setVideoTitle(title); setShowVideoModal(true); };
  const currentVideoData = VIDEO_DATA[videoTitle] || { type: 'mp4', url: "", summary: "暂无资源" };

  const handleFriedSubmit = () => {
    const selectedLabels = ['非意愿体重下降', '自觉疲乏', '握力减弱', '行走缓慢', '低体力活动']
      .filter((_, i) => friedItems.includes(i));

    const prompt = `我的 Fried 衰弱评估得分为 ${friedScore} 分 (${friedStatus.label})。\n出现的症状包括：${selectedLabels.join('、') || '无'}。\n请根据此结果，为我生成一份简要的康复与营养建议方案。`;
    chatRef.current?.sendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans selection:bg-rose-100">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">G</div>
            <span className="font-bold text-xl tracking-tight text-slate-800">GastroEdu<span className="text-rose-500">3D</span></span>
          </div>
          <div className="hidden md:flex space-x-2">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} onClick={() => setActivePhase(item.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activePhase === item.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: 3D Visuals */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-1 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 to-rose-600 z-10"></div>
            <div className="bg-slate-50/50 rounded-[1.8rem] p-6 min-h-[500px] flex flex-col relative">
              <div className="flex justify-between items-center mb-6 z-10">
                 <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                    {activePhase === Phase.DIAGNOSIS && "病理分型演示"}
                    {activePhase === Phase.HOSPITALIZATION && "手术治疗示意"}
                    {activePhase === Phase.DISCHARGE && "术后恢复状态"}
                    {activePhase === Phase.FRAILTY && "机体能量与衰弱"}
                 </h2>
                 <span className="px-3 py-1 bg-white border border-slate-200 text-xs font-bold text-slate-500 rounded-full shadow-sm">3D View</span>
              </div>
              
              <div className="flex-1 flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-200/20 rounded-full blur-3xl"></div>
                 <StomachVisual 
                   viewMode={activePhase === Phase.DIAGNOSIS ? 'borrmann' : activePhase === Phase.HOSPITALIZATION ? 'surgery' : activePhase === Phase.DISCHARGE ? 'anatomy' : 'healthy'} 
                   borrmannType={activeBorrmann}
                   onClickPart={(part) => setSelectedPart(part)}
                 />
              </div>

              {activePhase === Phase.DIAGNOSIS && (
                <div className="grid grid-cols-2 gap-2 mt-6 z-10">
                  {Object.keys(BorrmannType).map((key) => (
                    <button key={key} onClick={() => setActiveBorrmann(BorrmannType[key as any])} 
                      className={`p-3 rounded-xl border transition-all text-left ${activeBorrmann === key ? 'bg-slate-800 text-white border-slate-800 shadow-lg scale-105' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}>
                      <div className="font-bold text-sm">Type {key}</div>
                      <div className="text-[10px] opacity-70">
                        {key === 'I' ? '隆起型' : key === 'II' ? '局限溃疡' : key === 'III' ? '浸润溃疡' : '弥漫浸润'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Info Content */}
        <div className="lg:col-span-7 space-y-6">
           {activePhase === Phase.DIAGNOSIS && (
             <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                   <div className="flex-1 z-10">
                     <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><PlayCircle className="text-rose-400"/> 什么是胃癌？</h3>
                     <p className="text-slate-300 text-sm leading-relaxed mb-4">
                       本视频详细解析了胃癌从早期炎症到晚期转移的全过程，重点讲解了幽门螺杆菌、饮食习惯等风险因素，以及胃镜检查的重要性。
                     </p>
                     <button onClick={() => openVideo("胃癌肿瘤介绍")} className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold rounded-full shadow-lg shadow-rose-900/20 transition-all hover:scale-105">
                       立即观看科普视频
                     </button>
                   </div>
                   <div className="absolute right-0 top-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                <InfoCard title="症状图谱：身体的求救信号" icon={<AlertCircle/>}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-100 relative overflow-hidden">
                         <div className="absolute top-0 right-0 px-2 py-1 bg-amber-200 text-amber-800 text-[10px] font-bold rounded-bl-lg">隐匿期</div>
                         <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><Activity size={16} className="text-amber-500"/> 早期症状</h4>
                         <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                           <li>上腹部轻微不适或隐痛</li>
                           <li>食欲减退、嗳气、反酸</li>
                           <li><span className="text-amber-600 font-bold">极易被误认为“老胃病”或消化不良</span></li>
                         </ul>
                      </div>
                      <div className="bg-red-50/60 p-4 rounded-xl border border-red-100 relative overflow-hidden">
                         <div className="absolute top-0 right-0 px-2 py-1 bg-red-200 text-red-800 text-[10px] font-bold rounded-bl-lg">报警期</div>
                         <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-red-500"/> 进展期症状</h4>
                         <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                           <li>持续性腹痛、进食梗阻感</li>
                           <li><span className="text-red-600 font-bold">黑便（柏油样便）、呕血</span></li>
                           <li>不明原因的体重骤降、消瘦</li>
                         </ul>
                      </div>
                   </div>
                </InfoCard>

                <InfoCard title="TNM 分期：像剥洋葱一样看懂病情" icon={<Layers/>}>
                   <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 p-6 rounded-xl border border-slate-100">
                      {/* Optimized Visual Onion SVG */}
                      <div className="w-40 h-40 relative shrink-0">
                         <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
                           {/* M Layer */}
                           <circle cx="60" cy="60" r="58" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2"/>
                           <path d="M 60 4 A 1 1 0 0 1 60 10" stroke="#ef4444" strokeWidth="2" />
                           <text x="60" y="18" textAnchor="middle" fontSize="9" fill="#b91c1c" fontWeight="bold">M (远处转移)</text>
                           
                           {/* N Layer */}
                           <circle cx="60" cy="60" r="42" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
                           <text x="60" y="34" textAnchor="middle" fontSize="9" fill="#b45309" fontWeight="bold">N (淋巴结)</text>
                           
                           {/* T Layer */}
                           <circle cx="60" cy="60" r="26" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.5" />
                           <text x="60" y="63" textAnchor="middle" fontSize="12" fill="#1d4ed8" fontWeight="bold">T</text>
                           <text x="60" y="73" textAnchor="middle" fontSize="7" fill="#1e40af">原发灶</text>
                         </svg>
                      </div>
                      <div className="flex-1 space-y-4">
                         <div className="flex items-start gap-3 text-sm group">
                           <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base mt-0.5 shadow-sm group-hover:scale-110 transition-transform">T</div> 
                           <div><span className="font-bold block text-blue-900">Tumor (浸润深度)</span> 肿瘤钻得有多深？从黏膜层(T1)到穿透浆膜(T4)。</div>
                         </div>
                         <div className="flex items-start gap-3 text-sm group">
                           <div className="w-8 h-8 shrink-0 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base mt-0.5 shadow-sm group-hover:scale-110 transition-transform">N</div> 
                           <div><span className="font-bold block text-amber-900">Node (淋巴结)</span> 肿瘤跑到了附近的淋巴结吗？数量越多，分期越晚。</div>
                         </div>
                         <div className="flex items-start gap-3 text-sm group">
                           <div className="w-8 h-8 shrink-0 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-base mt-0.5 shadow-sm group-hover:scale-110 transition-transform">M</div> 
                           <div><span className="font-bold block text-red-900">Metastasis (远处转移)</span> 肿瘤扩散到肝、肺、腹膜等远处器官了吗？</div>
                         </div>
                      </div>
                   </div>
                   
                   {/* Detailed Breakdown Toggle */}
                   <div className="mt-4 pt-4 border-t border-slate-100">
                     <button 
                       onClick={() => setShowTnmDetails(!showTnmDetails)} 
                       className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors w-full justify-center font-medium"
                     >
                       {showTnmDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                       {showTnmDetails ? "收起详细分期说明" : "查看 T / N / M 详细分级定义"}
                     </button>
                     
                     {showTnmDetails && (
                       <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-in fade-in slide-in-from-top-2">
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 shadow-sm">
                             <h5 className="font-bold text-blue-700 mb-2 border-b border-blue-200 pb-1">T - 浸润深度</h5>
                             <ul className="space-y-1.5 text-slate-600">
                               <li><span className="font-bold text-blue-800">Tis:</span> 原位癌 (仅在表层)</li>
                               <li><span className="font-bold text-blue-800">T1:</span> 侵犯固有层/粘膜下层</li>
                               <li><span className="font-bold text-blue-800">T2:</span> 侵犯固有肌层</li>
                               <li><span className="font-bold text-blue-800">T3:</span> 穿透浆膜下层</li>
                               <li><span className="font-bold text-blue-800">T4:</span> 穿透浆膜或侵犯邻近器官</li>
                             </ul>
                          </div>
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 shadow-sm">
                             <h5 className="font-bold text-amber-700 mb-2 border-b border-amber-200 pb-1">N - 淋巴结转移</h5>
                             <ul className="space-y-1.5 text-slate-600">
                               <li><span className="font-bold text-amber-800">N0:</span> 无区域淋巴结转移</li>
                               <li><span className="font-bold text-amber-800">N1:</span> 1-2 枚区域淋巴结转移</li>
                               <li><span className="font-bold text-amber-800">N2:</span> 3-6 枚区域淋巴结转移</li>
                               <li><span className="font-bold text-amber-800">N3:</span> ≥7 枚区域淋巴结转移</li>
                             </ul>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg border border-red-100 shadow-sm">
                             <h5 className="font-bold text-red-700 mb-2 border-b border-red-200 pb-1">M - 远处转移</h5>
                             <ul className="space-y-1.5 text-slate-600">
                               <li><span className="font-bold text-red-800">M0:</span> 无远处转移</li>
                               <li><span className="font-bold text-red-800">M1:</span> 有远处转移 (如肝、肺、骨、腹膜等)</li>
                             </ul>
                          </div>
                       </div>
                     )}
                   </div>
                </InfoCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard title="确诊检查清单" icon={<ClipboardCheck/>}>
                     <ul className="text-sm space-y-2">
                        <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-teal-500 shrink-0"/> <span><span className="font-bold text-slate-700">胃镜 + 活检</span> (诊断金标准)</span></li>
                        <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-teal-500 shrink-0"/> <span><span className="font-bold text-slate-700">腹部增强 CT</span> (评估分期)</span></li>
                        <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-teal-500 shrink-0"/> <span><span className="font-bold text-slate-700">超声胃镜 (EUS)</span> (判断浸润深度)</span></li>
                        <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-teal-500 shrink-0"/> <span><span className="font-bold text-slate-700">HER2 免疫组化</span> (指导靶向治疗)</span></li>
                     </ul>
                  </InfoCard>
                  <InfoCard title="误区粉碎机" icon={<HelpCircle/>} className="bg-slate-50 border-slate-200">
                     <ul className="text-sm space-y-3">
                        <li className="flex gap-2"><XCircle size={16} className="text-rose-500 shrink-0 mt-0.5"/> <span>“胃癌会传染？” - <span className="font-bold">不会</span>，但导致胃癌的<span className="text-amber-600">幽门螺杆菌</span>会传染。</span></li>
                        <li className="flex gap-2"><XCircle size={16} className="text-rose-500 shrink-0 mt-0.5"/> <span>“喝粥能养胃防癌？” - <span className="font-bold">长期喝粥</span>反而可能削弱消化功能，加重胃食管反流。</span></li>
                        <li className="flex gap-2"><XCircle size={16} className="text-rose-500 shrink-0 mt-0.5"/> <span>“确诊就是绝症？” - 早期胃癌治愈率可达 <span className="font-bold text-teal-600">90%</span>，关键在于早诊早治。</span></li>
                     </ul>
                  </InfoCard>
                </div>
             </div>
           )}

           {activePhase === Phase.HOSPITALIZATION && (
             <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <InfoCard title="术后 72小时 黄金康复时间轴" icon={<Clock/>}>
                   <div className="space-y-8 pl-4 border-l-2 border-slate-200 ml-2 py-4">
                      {[
                        { day: 'Day 0 (手术日)', title: '麻醉苏醒与监测', desc: '任务：配合医护监测生命体征；有痰尽量咳出；疼痛评分&gt;3分及时告知护士。' },
                        { day: 'Day 1 (术后第1天)', title: '拔管与早期活动', desc: '任务：尝试在床边站立或小范围走动；进行踝泵运动预防血栓。' },
                        { day: 'Day 2-3 (排气期)', title: '下床排气与进水', desc: '任务：增加下床活动频次促进肠蠕动；肛门排气后可遵医嘱少量饮水。' }
                      ].map((item, i) => (
                        <div key={i} className="relative pl-8">
                           <div className="absolute -left-[23px] top-1 w-4 h-4 bg-teal-500 rounded-full ring-4 ring-white shadow-sm"></div>
                           <div className="text-xs font-bold text-teal-600 mb-1 uppercase tracking-wider bg-teal-50 inline-block px-2 py-0.5 rounded-md">{item.day}</div>
                           <div className="font-bold text-slate-800 mb-2 text-lg">{item.title}</div>
                           <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">{item.desc}</div>
                        </div>
                      ))}
                   </div>
                </InfoCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard title="疼痛管理：拒绝忍痛" icon={<Sparkles/>}>
                    <div className="mb-4 bg-slate-50 p-3 rounded-lg">
                       <div className="h-3 w-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-500 rounded-full mb-2 shadow-inner"></div>
                       <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1">
                          <span>0 无痛</span>
                          <span>3 轻度</span>
                          <span>6 中度</span>
                          <span>10 剧痛</span>
                       </div>
                       <div className="mt-2 text-center text-xs text-slate-400">视觉模拟评分 (VAS)</div>
                    </div>
                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                       <span className="font-bold text-rose-600">错误观念：</span>“忍痛对身体好”。<br/>
                       <span className="font-bold text-teal-600">正确做法：</span><span className="font-bold">按时给药</span> (预防性止痛) 优于痛了再吃。良好的镇痛有利于早期下床活动，减少肺炎风险。
                    </p>
                  </InfoCard>
                  
                  <InfoCard title="重要护理清单" icon={<CheckCircle2/>}>
                    <div className="space-y-4">
                       <div className="flex gap-3 items-start p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0"><Wind size={20}/></div>
                          <div>
                             <div className="text-sm font-bold text-slate-700">肺康复 (吹气球)</div>
                             <div className="text-xs text-slate-500 mt-1">深吸气后用力吹气球，预防肺不张和肺炎。</div>
                          </div>
                       </div>
                       <div className="flex gap-3 items-start p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shrink-0"><Move size={20}/></div>
                          <div>
                             <div className="text-sm font-bold text-slate-700">防血栓 (踝泵运动)</div>
                             <div className="text-xs text-slate-500 mt-1">反复用力勾脚尖、绷脚尖，像踩刹车一样，促进下肢血液回流。</div>
                          </div>
                       </div>
                    </div>
                  </InfoCard>
                </div>

                <InfoCard title="警惕！并发症红色信号" icon={<AlertTriangle/>} className="border-red-100 bg-red-50/30">
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-xl border border-red-100 text-center shadow-sm">
                           <span className="block text-sm font-bold text-slate-700 mb-1">持续高热</span>
                           <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-bold">&gt; 38.5℃</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-red-100 text-center shadow-sm">
                           <span className="block text-sm font-bold text-slate-700 mb-1">剧烈腹痛</span>
                           <span className="text-xs text-slate-500">板状腹 / 拒按</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-red-100 text-center shadow-sm">
                           <span className="block text-sm font-bold text-slate-700 mb-1">引流异常</span>
                           <span className="text-xs text-slate-500">鲜红 / 浑浊 / 恶臭</span>
                        </div>
                   </div>
                   <p className="text-center text-sm text-red-600 mt-4 font-bold flex items-center justify-center gap-2">
                     <Phone size={16}/> 出现以上情况请立即呼叫医生！
                   </p>
                </InfoCard>
             </div>
           )}
           
           {activePhase === Phase.DISCHARGE && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard title="护理健康教育" icon={<BookHeart/>} className="md:col-span-2 border-indigo-100 bg-indigo-50/30">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                               <div className="flex items-center gap-2 mb-2 font-bold text-indigo-800">
                                   <Smile size={18}/> 心理调节
                               </div>
                               <p className="text-xs text-slate-600 leading-relaxed">
                                   保持乐观心态是康复的良药。术后可能会出现焦虑或抑郁情绪，请多与家人沟通，寻找兴趣爱好转移注意力，必要时寻求心理医生帮助。
                               </p>
                           </div>
                           <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                               <div className="flex items-center gap-2 mb-2 font-bold text-indigo-800">
                                   <Calendar size={18}/> 规律作息
                               </div>
                               <p className="text-xs text-slate-600 leading-relaxed">
                                   建立良好的生活作息，保证充足睡眠（每晚7-8小时）。避免熬夜和过度劳累，适量进行户外散步，促进身体机能恢复。
                               </p>
                           </div>
                           <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                               <div className="flex items-center gap-2 mb-2 font-bold text-indigo-800">
                                   <ClipboardCheck size={18}/> 自我监测
                               </div>
                               <p className="text-xs text-slate-600 leading-relaxed">
                                   建议记录“健康日记”，包含每日饮食内容、体重变化及不适症状。这能帮助医生在复查时更准确地评估您的康复情况。
                               </p>
                           </div>
                       </div>
                    </InfoCard>
                 
                    <InfoCard title="居家护理指南" icon={<Home/>}>
                        <ul className="space-y-4 text-sm text-slate-600">
                           <li className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-50">
                              <Bed size={20} className="text-teal-500 shrink-0 mt-0.5"/> 
                              <div><span className="font-bold text-slate-700 block">半卧位休息</span><span className="text-xs">餐后半小时勿平卧，防止胆汁反流性胃炎。</span></div>
                           </li>
                           <li className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-50">
                              <Sparkles size={20} className="text-teal-500 shrink-0 mt-0.5"/> 
                              <div><span className="font-bold text-slate-700 block">伤口护理</span><span className="text-xs">保持干燥，淋浴时使用防水贴。如红肿流脓及时就医。</span></div>
                           </li>
                           <li className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-50">
                              <Clock size={20} className="text-teal-500 shrink-0 mt-0.5"/> 
                              <div><span className="font-bold text-slate-700 block">复查计划</span><span className="text-xs">术后2年内每3个月复查一次，2-5年每6个月一次。</span></div>
                           </li>
                        </ul>
                    </InfoCard>
                    <InfoCard title="紧急就医指征" icon={<Phone/>} className="border-rose-100">
                        <ul className="space-y-3 text-sm text-slate-600 mt-2">
                           <li className="flex gap-3 items-center p-2 bg-rose-50/50 rounded-lg">
                             <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div> 
                             <span className="font-medium text-rose-900">呕血或黑便 (柏油样)</span>
                           </li>
                           <li className="flex gap-3 items-center p-2 bg-rose-50/50 rounded-lg">
                             <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div> 
                             <span className="font-medium text-rose-900">进食后严重腹胀、呕吐</span>
                           </li>
                           <li className="flex gap-3 items-center p-2 bg-rose-50/50 rounded-lg">
                             <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div> 
                             <span className="font-medium text-rose-900">皮肤巩膜黄染 (黄疸)</span>
                           </li>
                           <li className="flex gap-3 items-center p-2 bg-rose-50/50 rounded-lg">
                             <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div> 
                             <span className="font-medium text-rose-900">腹部触及包块或剧烈疼痛</span>
                           </li>
                        </ul>
                    </InfoCard>
                 </div>

                 <InfoCard title="术后饮食“红绿灯”" icon={<Utensils/>}>
                    <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg inline-block">遵循“少食多餐、细嚼慢咽”原则，每天 6-8 餐。</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                       <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
                            <ThumbsUp size={20} className="text-green-600"/>
                          </div>
                          <div className="text-sm font-bold text-green-800 mb-2">绿灯：推荐</div>
                          <div className="text-xs text-slate-600 leading-snug">烂面条、鸡蛋羹、鱼泥、豆腐、软饭</div>
                       </div>
                       <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex flex-col items-center hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
                            <Info size={20} className="text-yellow-600"/>
                          </div>
                          <div className="text-sm font-bold text-yellow-800 mb-2">黄灯：谨慎</div>
                          <div className="text-xs text-slate-600 leading-snug">纯牛奶(易胀气)、豆浆、粗粮、韭菜</div>
                       </div>
                       <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-3">
                            <XCircle size={20} className="text-red-600"/>
                          </div>
                          <div className="text-sm font-bold text-red-800 mb-2">红灯：禁忌</div>
                          <div className="text-xs text-slate-600 leading-snug">油炸、辛辣、腌制、柿子、山楂、糯米</div>
                       </div>
                    </div>
                 </InfoCard>
              </div>
           )}
           
           {activePhase === Phase.FRAILTY && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                 <InfoCard title="肌少症简易筛查：指环试验 (Yubi-wakka Test)" icon={<Scissors className="rotate-90"/>}>
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-2 rounded-xl">
                       <div className="w-48 h-48 bg-slate-50 rounded-full border-8 border-white shadow-inner flex items-center justify-center shrink-0 overflow-hidden relative">
                          {/* Vivid SVG Finger Ring Test */}
                          <svg viewBox="0 0 200 200" className="w-full h-full">
                            <defs>
                              <linearGradient id="skin-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#fecaca" />
                                <stop offset="100%" stopColor="#fca5a5" />
                              </linearGradient>
                              <filter id="drop-shadow">
                                <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.2"/>
                              </filter>
                            </defs>
                            
                            {/* Calf Section (Cross-section view for clarity) */}
                            <circle cx="100" cy="100" r="60" fill="url(#skin-gradient)" stroke="#e2e8f0" strokeWidth="1" />
                            <text x="100" y="105" textAnchor="middle" fontSize="14" fill="#881337" fontWeight="bold" opacity="0.6">小腿</text>
                            
                            {/* Hand Circle Animation - Fingers Encircling */}
                            <g className="animate-pulse" filter="url(#drop-shadow)">
                              {/* Thumb Left */}
                              <path d="M 45 130 C 20 100 20 60 55 45" stroke="#64748b" strokeWidth="12" fill="none" strokeLinecap="round" />
                              {/* Index Left */}
                              <path d="M 55 45 C 70 30 90 30 98 35" stroke="#64748b" strokeWidth="12" fill="none" strokeLinecap="round" />
                              
                              {/* Thumb Right */}
                              <path d="M 155 130 C 180 100 180 60 145 45" stroke="#64748b" strokeWidth="12" fill="none" strokeLinecap="round" />
                              {/* Index Right */}
                              <path d="M 145 45 C 130 30 110 30 102 35" stroke="#64748b" strokeWidth="12" fill="none" strokeLinecap="round" />
                              
                              {/* Knuckles/Hand connection at bottom (simplified) */}
                              <path d="M 45 130 Q 100 180 155 130" stroke="#94a3b8" strokeWidth="8" fill="none" strokeDasharray="4 4" opacity="0.5"/>
                            </g>
                          </svg>
                       </div>
                       <div className="flex-1 text-sm text-slate-600 space-y-4">
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 relative">
                             <a href="https://wjw.fujian.gov.cn/jggk/wsjsfc/sp/202304/t20230404_6144414.htm" target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1 font-bold text-xs">
                               <ExternalLink size={14} /> 观看演示视频
                             </a>
                             <h4 className="font-bold text-blue-800 mb-2">测试方法</h4>
                             <p className="leading-relaxed">端坐椅子上，用双手拇指和食指围成一个圈，套在您非优势腿（通常是左腿）的小腿<span className="font-bold text-blue-600">最粗处</span>。</p>
                          </div>
                          
                          <div className="space-y-3">
                             <h4 className="font-bold text-slate-700">测试结果解读：</h4>
                             <div className="flex items-center gap-4 p-3 bg-green-50 rounded-xl border border-green-100">
                                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-xl shrink-0">🟢</div>
                                <div>
                                   <span className="font-bold text-green-800 block">围不住 (Good)</span>
                                   <span className="text-xs text-green-700">小腿围度大，手指无法扣拢。<br/>说明肌肉储备充足，<span className="font-bold">肌少症风险低</span>。</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 p-3 bg-red-50 rounded-xl border border-red-100">
                                <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-xl shrink-0">🔴</div>
                                <div>
                                   <span className="font-bold text-red-800 block">围得住 / 有空隙 (Risk)</span>
                                   <span className="text-xs text-red-700">小腿围度小，手指能扣拢甚至有空隙。<br/>说明肌肉可能流失，<span className="font-bold">存在肌少症风险</span>。</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </InfoCard>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard title="Fried 衰弱评估量表" icon={<ClipboardCheck/>}>
                        {/* Dynamic Status Display */}
                        <div className={`mb-5 p-4 rounded-xl border flex flex-col items-center justify-center text-center shadow-sm animate-in fade-in duration-300 ${friedStatus.color}`}>
                          <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">当前评估结果</div>
                          <div className="text-2xl font-extrabold">{friedScore} 分</div>
                          <div className="text-sm font-bold mt-1">{friedStatus.label}</div>
                        </div>

                        <div className="space-y-3">
                          {['非意愿体重下降 (1年>4.5kg)', '自觉疲乏/精力下降', '握力明显减弱', '行走缓慢', '体力活动水平低'].map((t, i) => (
                              <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-white hover:border-indigo-200 transition-all group">
                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors shadow-sm ${friedItems.includes(i) ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300 group-hover:border-indigo-300'}`}>
                                  {friedItems.includes(i) && <CheckCircle2 size={16}/>}
                                </div>
                                <input type="checkbox" className="hidden" checked={friedItems.includes(i)} onChange={() => toggleFriedItem(i)}/>
                                <span className="text-sm font-medium text-slate-700">{t}</span>
                              </label>
                          ))}
                        </div>
                        <button onClick={handleFriedSubmit} className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                          <Bot size={20}/> 生成 AI 康复方案
                        </button>
                    </InfoCard>

                    <InfoCard title="精准营养计算器" icon={<Calculator/>}>
                        <div className="space-y-5">
                           <div>
                              <label className="block text-sm font-bold text-slate-600 mb-2">输入您的体重 (kg)</label>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  value={userWeight} 
                                  onChange={(e) => setUserWeight(e.target.value)} 
                                  placeholder="例如: 60"
                                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none text-lg font-medium shadow-sm"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">KG</span>
                              </div>
                           </div>
                           
                           {nutritionResult ? (
                             <div className="bg-teal-50 p-5 rounded-xl border border-teal-100 space-y-3 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex justify-between items-center border-b border-teal-200/50 pb-2">
                                   <span className="text-sm text-teal-800 font-bold">每日能量目标</span>
                                   <span className="text-lg font-extrabold text-teal-900">{nutritionResult.minEnergy} - {nutritionResult.maxEnergy} kcal</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                   <span className="text-sm text-teal-800 font-bold">每日蛋白质目标</span>
                                   <span className="text-lg font-extrabold text-teal-900">{nutritionResult.minProtein} - {nutritionResult.maxProtein} g</span>
                                </div>
                                <p className="text-xs text-teal-600 mt-3 flex items-center justify-center gap-1">
                                  <Info size={12}/> 仅供参考，请遵医嘱调整
                                </p>
                             </div>
                           ) : (
                             <div className="text-center py-8 text-slate-400 text-sm bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-2">
                               <Calculator size={24} className="opacity-20"/>
                               请输入体重以获取建议
                             </div>
                           )}
                        </div>
                    </InfoCard>
                 </div>
              </div>
           )}
        </div>
      </main>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowVideoModal(false)}>
           <div className="bg-black w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl relative">
              <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white z-10 p-2"><XCircle size={32}/></button>
              <iframe src={currentVideoData.url} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
           </div>
        </div>
      )}

      {/* Anatomy Detail Modal */}
      {selectedPart && ANATOMY_DATA[selectedPart] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedPart(null)}>
           <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <button 
                 onClick={() => setSelectedPart(null)} 
                 className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
              >
                 <X size={20} className="text-slate-500"/>
              </button>
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                    {ANATOMY_DATA[selectedPart].icon}
                 </div>
                 <h3 className="text-xl font-bold text-slate-800">{ANATOMY_DATA[selectedPart].title}</h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                 {ANATOMY_DATA[selectedPart].desc}
              </p>
           </div>
        </div>
      )}

      <AssistantChat ref={chatRef} context={getContext()} />
    </div>
  );
}
