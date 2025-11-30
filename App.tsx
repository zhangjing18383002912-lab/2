
import React, { useState, useRef } from 'react';
import { 
  Stethoscope, Building2, Home, Activity, Info, AlertCircle, Utensils, Scissors, Brain, PlayCircle, ClipboardCheck, Clock, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, AlertTriangle, Calculator, Phone, Bed, Sparkles, Layers, Wind, Bot, MessageSquare, HelpCircle, Move, X
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
    summary: "本视频详细讲解了胃癌的预防与早期筛查知识。通过生动的讲解，帮助大家了解日常生活中的伤胃习惯，以及如何通过科学的生活方式远离胃癌威胁。"
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

  const getContext = () => {
    switch (activePhase) {
      case Phase.DIAGNOSIS: return `确诊阶段 (Borrmann ${activeBorrmann}型)。用户关注TNM分期、早期vs晚期症状。`;
      case Phase.HOSPITALIZATION: return "住院阶段。关注术后72小时康复、疼痛管理及并发症。";
      case Phase.DISCHARGE: return "出院阶段。关注居家护理、饮食红绿灯及紧急就医。";
      case Phase.FRAILTY: return `衰弱管理阶段。Fried评分: ${friedItems.length}分。体重${userWeight}kg。`;
      default: return "胃癌科普首页";
    }
  };

  const openVideo = (title: string) => { setVideoTitle(title); setShowVideoModal(true); };
  const currentVideoData = VIDEO_DATA[videoTitle] || { type: 'mp4', url: "", summary: "暂无资源" };

  const handleFriedSubmit = () => {
    const selectedLabels = ['非意愿体重下降', '自觉疲乏', '握力减弱', '行走缓慢', '低体力活动']
      .filter((_, i) => friedItems.includes(i));
    const score = friedItems.length;
    let status = '健康';
    if (score >= 3) status = '衰弱 (Frail)';
    else if (score >= 1) status = '衰弱前期 (Pre-frail)';

    const prompt = `我的 Fried 衰弱评估得分为 ${score} 分 (${status})。\n出现的症状包括：${selectedLabels.join('、') || '无'}。\n请根据此结果，为我生成一份简要的康复与营养建议方案。`;
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
                        {key === 'I' ? '隆起型' : key === 'II' ? '溃疡局限' : key === 'III' ? '溃疡浸润' : '弥漫浸润'}
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
                       胃癌起源于胃黏膜上皮细胞。本视频生动讲解了从慢性炎症到癌变的演变过程，帮助您理解“早发现、早治疗”的黄金法则。
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
                   <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 p-5 rounded-xl border border-slate-100">
                      {/* Visual Onion SVG */}
                      <div className="w-32 h-32 relative shrink-0">
                         <svg viewBox="0 0 100 100" className="w-full h-full">
                           <circle cx="50" cy="50" r="48" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1" />
                           <text x="50" y="20" textAnchor="middle" fontSize="8" fill="#b91c1c" fontWeight="bold">M 远处转移</text>
                           
                           <circle cx="50" cy="50" r="32" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1" />
                           <text x="50" y="35" textAnchor="middle" fontSize="8" fill="#b45309" fontWeight="bold">N 淋巴结</text>
                           
                           <circle cx="50" cy="50" r="16" fill="#bfdbfe" stroke="#93c5fd" strokeWidth="1" />
                           <text x="50" y="54" textAnchor="middle" fontSize="10" fill="#1d4ed8" fontWeight="bold">T</text>
                         </svg>
                      </div>
                      <div className="flex-1 space-y-3">
                         <div className="flex items-start gap-3 text-sm">
                           <span className="w-6 h-6 shrink-0 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mt-0.5">T</span> 
                           <div><span className="font-bold block">Tumor (浸润深度)</span> 肿瘤钻得有多深？从黏膜层到浆膜层。</div>
                         </div>
                         <div className="flex items-start gap-3 text-sm">
                           <span className="w-6 h-6 shrink-0 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mt-0.5">N</span> 
                           <div><span className="font-bold block">Node (淋巴结)</span> 肿瘤跑到了附近的淋巴结吗？</div>
                         </div>
                         <div className="flex items-start gap-3 text-sm">
                           <span className="w-6 h-6 shrink-0 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs mt-0.5">M</span> 
                           <div><span className="font-bold block">Metastasis (远处转移)</span> 肿瘤飞到肝、肺等远处器官了吗？</div>
                         </div>
                      </div>
                   </div>
                </InfoCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard title="确诊检查清单" icon={<ClipboardCheck/>}>
                     <ul className="text-sm space-y-2">
                        <li className="flex gap-2 items-center"><CheckCircle2 size={14} className="text-teal-500"/> <span className="font-bold">胃镜 + 活检</span> (诊断金标准)</li>
                        <li className="flex gap-2 items-center"><CheckCircle2 size={14} className="text-teal-500"/> <span>腹部增强 CT</span> (评估分期)</li>
                        <li className="flex gap-2 items-center"><CheckCircle2 size={14} className="text-teal-500"/> <span>超声胃镜 (EUS)</span> (判断浸润深度)</li>
                        <li className="flex gap-2 items-center"><CheckCircle2 size={14} className="text-teal-500"/> <span>HER2 免疫组化</span> (指导靶向治疗)</li>
                     </ul>
                  </InfoCard>
                  <InfoCard title="误区粉碎机" icon={<HelpCircle/>} className="bg-slate-50 border-slate-200">
                     <ul className="text-sm space-y-2">
                        <li className="flex gap-2"><XCircle size={16} className="text-rose-500 shrink-0"/> <span>“胃癌会传染？” - <span className="font-bold">不会</span>，但幽门螺杆菌会。</span></li>
                        <li className="flex gap-2"><XCircle size={16} className="text-rose-500 shrink-0"/> <span>“喝粥能养胃防癌？” - <span className="font-bold">长期喝粥</span>反而可能削弱消化功能。</span></li>
                        <li className="flex gap-2"><XCircle size={16} className="text-rose-500 shrink-0"/> <span>“确诊就是绝症？” - 早期胃癌治愈率可达 <span className="font-bold text-teal-600">90%</span>。</span></li>
                     </ul>
                  </InfoCard>
                </div>
             </div>
           )}

           {activePhase === Phase.HOSPITALIZATION && (
             <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <InfoCard title="术后 72小时 黄金康复时间轴" icon={<Clock/>}>
                   <div className="space-y-6 pl-4 border-l-2 border-slate-200 ml-2 py-2">
                      {[
                        { day: 'Day 0 (手术日)', title: '麻醉苏醒与监测', desc: '任务：配合医护监测生命体征；有痰尽量咳出；疼痛评分&gt;3分及时告知护士。' },
                        { day: 'Day 1 (术后第1天)', title: '拔管与早期活动', desc: '任务：尝试在床边站立或小范围走动；进行踝泵运动预防血栓。' },
                        { day: 'Day 2-3 (排气期)', title: '下床排气与进水', desc: '任务：增加下床活动频次促进肠蠕动；肛门排气后可遵医嘱少量饮水。' }
                      ].map((item, i) => (
                        <div key={i} className="relative pl-6">
                           <div className="absolute -left-[21px] top-0 w-3 h-3 bg-teal-500 rounded-full ring-4 ring-white"></div>
                           <div className="text-xs font-bold text-teal-600 mb-1 uppercase tracking-wider">{item.day}</div>
                           <div className="font-bold text-slate-800 mb-1">{item.title}</div>
                           <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2 rounded">{item.desc}</div>
                        </div>
                      ))}
                   </div>
                </InfoCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard title="疼痛管理：拒绝忍痛" icon={<Sparkles/>}>
                    <div className="mb-3">
                       <div className="h-2 w-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-500 rounded-full mb-1"></div>
                       <div className="flex justify-between text-[10px] text-slate-400">
                          <span>0 无痛</span>
                          <span>5 中度</span>
                          <span>10 剧痛</span>
                       </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">原则：<span className="font-bold text-teal-600">按时给药</span> (预防性止痛) 优于痛了再吃。良好的镇痛有利于早期下床活动。</p>
                  </InfoCard>
                  
                  <InfoCard title="重要护理清单" icon={<CheckCircle2/>}>
                    <div className="space-y-3">
                       <div className="flex gap-3 items-start">
                          <div className="p-1.5 bg-blue-50 rounded text-blue-600"><Wind size={16}/></div>
                          <div>
                             <div className="text-xs font-bold text-slate-700">肺康复 (吹气球)</div>
                             <div className="text-[10px] text-slate-500">深吸气后用力吹气球，预防肺部感染。</div>
                          </div>
                       </div>
                       <div className="flex gap-3 items-start">
                          <div className="p-1.5 bg-indigo-50 rounded text-indigo-600"><Move size={16}/></div>
                          <div>
                             <div className="text-xs font-bold text-slate-700">防血栓 (踝泵运动)</div>
                             <div className="text-[10px] text-slate-500">反复用力勾脚尖、绷脚尖，促进血液回流。</div>
                          </div>
                       </div>
                    </div>
                  </InfoCard>
                </div>

                <InfoCard title="警惕！并发症红色信号" icon={<AlertTriangle/>} className="border-red-100 bg-red-50/30">
                   <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white p-2 rounded border border-red-100 text-center">
                           <span className="block text-xs font-bold text-slate-700 mb-1">持续高热</span>
                           <span className="text-[10px] text-red-500 bg-red-50 px-1 py-0.5 rounded">&gt; 38.5℃</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-red-100 text-center">
                           <span className="block text-xs font-bold text-slate-700 mb-1">剧烈腹痛</span>
                           <span className="text-[10px] text-slate-500">板状腹/拒按</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-red-100 text-center">
                           <span className="block text-xs font-bold text-slate-700 mb-1">引流异常</span>
                           <span className="text-[10px] text-slate-500">鲜红/浑浊/恶臭</span>
                        </div>
                   </div>
                   <p className="text-center text-xs text-red-600 mt-3 font-bold">出现以上情况请立即呼叫医生！</p>
                </InfoCard>
             </div>
           )}
           
           {activePhase === Phase.DISCHARGE && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                 <InfoCard title="术后饮食“红绿灯”" icon={<Utensils/>}>
                    <p className="text-xs text-slate-500 mb-4">遵循“少食多餐、细嚼慢咽”原则，每天 6-8 餐。</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                       <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
                            <ThumbsUp size={16} className="text-green-600"/>
                          </div>
                          <div className="text-xs font-bold text-green-800 mb-1">绿灯：推荐</div>
                          <div className="text-[10px] text-slate-600 leading-tight">烂面条、鸡蛋羹、鱼泥、豆腐、软饭</div>
                       </div>
                       <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                            <Info size={16} className="text-yellow-600"/>
                          </div>
                          <div className="text-xs font-bold text-yellow-800 mb-1">黄灯：谨慎</div>
                          <div className="text-[10px] text-slate-600 leading-tight">纯牛奶(易胀气)、豆浆、粗粮、韭菜</div>
                       </div>
                       <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mb-2">
                            <XCircle size={16} className="text-red-600"/>
                          </div>
                          <div className="text-xs font-bold text-red-800 mb-1">红灯：禁忌</div>
                          <div className="text-[10px] text-slate-600 leading-tight">油炸、辛辣、腌制、柿子、山楂、糯米</div>
                       </div>
                    </div>
                 </InfoCard>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="居家护理指南" icon={<Home/>}>
                        <ul className="space-y-3 text-sm text-slate-600">
                           <li className="flex gap-2 items-start"><Bed size={16} className="text-teal-500 shrink-0 mt-0.5"/> <div><span className="font-bold text-slate-700">半卧位休息</span><br/><span className="text-xs">餐后半小时勿平卧，防反流。</span></div></li>
                           <li className="flex gap-2 items-start"><Sparkles size={16} className="text-teal-500 shrink-0 mt-0.5"/> <div><span className="font-bold text-slate-700">伤口护理</span><br/><span className="text-xs">保持干燥，淋浴时使用防水贴。</span></div></li>
                           <li className="flex gap-2 items-start"><Clock size={16} className="text-teal-500 shrink-0 mt-0.5"/> <div><span className="font-bold text-slate-700">复查计划</span><br/><span className="text-xs">术后2年内每3个月复查一次。</span></div></li>
                        </ul>
                    </InfoCard>
                    <InfoCard title="紧急就医指征" icon={<Phone/>} className="border-rose-100">
                        <ul className="space-y-2 text-sm text-slate-600">
                           <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> 呕血或黑便</li>
                           <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> 进食后严重腹胀、呕吐</li>
                           <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> 皮肤巩膜黄染</li>
                           <li className="flex gap-2 items-center"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> 腹部触及包块</li>
                        </ul>
                    </InfoCard>
                 </div>
              </div>
           )}
           
           {activePhase === Phase.FRAILTY && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                 <InfoCard title="肌少症简易筛查：指环试验" icon={<Scissors className="rotate-90"/>}>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                       <div className="w-32 h-32 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
                          {/* Animated SVG Finger Ring Test */}
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Calf */}
                            <circle cx="50" cy="50" r="30" fill="#fca5a5" />
                            {/* Hands Animation */}
                            <g className="animate-pulse">
                              {/* Left Hand (Thumb & Index) */}
                              <path d="M 20 80 Q 10 50 20 20" stroke="#64748b" strokeWidth="4" fill="none" />
                              {/* Right Hand */}
                              <path d="M 80 80 Q 90 50 80 20" stroke="#64748b" strokeWidth="4" fill="none" />
                              {/* Fingers closing in */}
                              <path d="M 20 20 Q 50 5 80 20" stroke="#64748b" strokeWidth="4" fill="none" strokeDasharray="4,2" opacity="0.5"/>
                              <path d="M 20 80 Q 50 95 80 80" stroke="#64748b" strokeWidth="4" fill="none" strokeDasharray="4,2" opacity="0.5"/>
                            </g>
                            <text x="50" y="52" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">小腿围</text>
                          </svg>
                       </div>
                       <div className="text-sm text-slate-600 space-y-2">
                          <p>用双手拇指和食指围成圈，套在小腿最粗处：</p>
                          <div className="p-2 bg-green-50 rounded border border-green-100">
                             <span className="font-bold text-green-700">🟢 围不住</span>：肌肉量尚可（风险低）
                          </div>
                          <div className="p-2 bg-red-50 rounded border border-red-100">
                             <span className="font-bold text-red-700">🔴 围得住/有空隙</span>：肌肉流失（肌少症风险高）
                          </div>
                       </div>
                    </div>
                 </InfoCard>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="Fried 衰弱评估量表" icon={<ClipboardCheck/>}>
                        <div className="space-y-2">
                          {['非意愿体重下降 (1年>4.5kg)', '自觉疲乏/精力下降', '握力明显减弱', '行走缓慢', '体力活动水平低'].map((t, i) => (
                              <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-white transition-colors group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${friedItems.includes(i) ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-slate-300 group-hover:border-indigo-300'}`}>
                                  {friedItems.includes(i) && <CheckCircle2 size={14}/>}
                                </div>
                                <input type="checkbox" className="hidden" checked={friedItems.includes(i)} onChange={() => toggleFriedItem(i)}/>
                                <span className="text-sm font-medium text-slate-700">{t}</span>
                              </label>
                          ))}
                        </div>
                        <button onClick={handleFriedSubmit} className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                          <Bot size={18}/> 生成 AI 康复方案
                        </button>
                    </InfoCard>

                    <InfoCard title="精准营养计算器" icon={<Calculator/>}>
                        <div className="space-y-4">
                           <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">输入您的体重 (kg)</label>
                              <input 
                                type="number" 
                                value={userWeight} 
                                onChange={(e) => setUserWeight(e.target.value)} 
                                placeholder="例如: 60"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-200 outline-none"
                              />
                           </div>
                           
                           {nutritionResult ? (
                             <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 space-y-2 animate-in fade-in">
                                <div className="flex justify-between items-center border-b border-teal-100 pb-2">
                                   <span className="text-xs text-teal-700 font-bold">每日能量目标</span>
                                   <span className="text-sm font-bold text-slate-800">{nutritionResult.minEnergy} - {nutritionResult.maxEnergy} kcal</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                   <span className="text-xs text-teal-700 font-bold">每日蛋白质目标</span>
                                   <span className="text-sm font-bold text-slate-800">{nutritionResult.minProtein} - {nutritionResult.maxProtein} g</span>
                                </div>
                                <p className="text-[10px] text-teal-600 mt-2 text-center">* 仅供参考，请遵医嘱调整</p>
                             </div>
                           ) : (
                             <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                               请输入体重查看建议
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
