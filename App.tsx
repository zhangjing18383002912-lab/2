import React, { useState, useRef } from 'react';
import { 
  Stethoscope, 
  Building2, 
  Home, 
  Activity, 
  Info, 
  AlertCircle, 
  Utensils, 
  Pill, 
  Scissors,
  Brain,
  BatteryCharging,
  PlayCircle,
  ClipboardCheck,
  Clock,
  Thermometer,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Calculator,
  Phone,
  Bed,
  Sparkles,
  Layers,
  Wind,
  Bot
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

export default function App() {
  const [activePhase, setActivePhase] = useState<Phase>(Phase.DIAGNOSIS);
  const [activeBorrmann, setActiveBorrmann] = useState<BorrmannType>(BorrmannType.I);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  
  // Frailty & Nutrition State
  const [friedItems, setFriedItems] = useState<number[]>([]);
  const [userWeight, setUserWeight] = useState<string>('');
  
  const chatRef = useRef<AssistantChatRef>(null);

  // Toggle function for Fried Scale items
  const toggleFriedItem = (index: number) => {
    setFriedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const calculateNutrition = () => {
    const w = parseFloat(userWeight);
    if (!w || w <= 0) return null;
    return {
      minEnergy: Math.round(w * 25),
      maxEnergy: Math.round(w * 30),
      minProtein: (w * 1.2).toFixed(1),
      maxProtein: (w * 1.5).toFixed(1)
    };
  };

  const nutritionResult = calculateNutrition();

  // Determine current context string for the AI Assistant
  const getContext = () => {
    switch (activePhase) {
      case Phase.DIAGNOSIS: return `当前在确诊阶段，查看 Borrmann ${activeBorrmann}型胃癌演示。用户关注TNM分期、早期vs晚期症状对比及检查项目。`;
      case Phase.HOSPITALIZATION: return "当前在住院阶段，关注术后72小时康复流程、疼痛管理及术后并发症预警。";
      case Phase.DISCHARGE: return "当前在出院阶段，关注居家护理、术后饮食红绿灯（宜忌）及紧急就医指征。";
      case Phase.FRAILTY: 
        const score = friedItems.length;
        const status = score === 0 ? '健康' : score <= 2 ? '衰弱前期' : '衰弱';
        return `当前在衰弱管理阶段。用户进行了Fried衰弱量表自测，选中了${score}项，评估结果为：${status}。体重为${userWeight || '未知'}kg。请针对此结果提供个性化营养和运动建议。`;
      default: return "胃癌科普首页";
    }
  };

  const openVideo = (title: string) => {
    setVideoTitle(title);
    setShowVideoModal(true);
  };

  const handleConsultAI = () => {
     const score = friedItems.length;
     const status = score === 0 ? '健康' : score <= 2 ? '衰弱前期' : '衰弱';
     const selectedSymptoms = [
         friedItems.includes(0) ? "体重下降" : "",
         friedItems.includes(1) ? "自觉疲乏" : "",
         friedItems.includes(2) ? "握力减弱" : "",
         friedItems.includes(3) ? "行走缓慢" : "",
         friedItems.includes(4) ? "活动量低" : ""
     ].filter(s => s).join("、");

     const prompt = `我刚刚完成了 Fried 衰弱量表评估，结果是【${status}】（${score}/5分）。${selectedSymptoms ? `我目前选中的问题是：${selectedSymptoms}。` : ""}我的体重是 ${userWeight || '未填写'} kg。请根据我的衰弱状况，为我制定一份简要的康复重点建议（包括饮食注意和适合我的运动强度）。`;
     
     if (chatRef.current) {
        chatRef.current.sendMessage(prompt);
     }
  };

  // Render different Visual Modes for the Stomach Component
  const getVisualProps = () => {
    if (activePhase === Phase.DIAGNOSIS) return { viewMode: 'borrmann' as const, borrmannType: activeBorrmann };
    if (activePhase === Phase.HOSPITALIZATION) return { viewMode: 'surgery' as const };
    if (activePhase === Phase.DISCHARGE) return { viewMode: 'anatomy' as const }; // Focus on remaining stomach
    return { viewMode: 'healthy' as const };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white font-bold">
                G
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">GastroEdu<span className="text-rose-500">3D</span></span>
            </div>
            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-8 items-center">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePhase(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activePhase === item.id 
                      ? 'bg-rose-50 text-rose-600' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: 3D Interaction Area */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 relative overflow-hidden min-h-[500px] flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600"></div>
              
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-slate-800">
                    {activePhase === Phase.DIAGNOSIS && "胃癌病理分型 (Borrmann)"}
                    {activePhase === Phase.HOSPITALIZATION && "手术与治疗示意"}
                    {activePhase === Phase.DISCHARGE && "术后恢复状态"}
                    {activePhase === Phase.FRAILTY && "机体能量与衰弱"}
                 </h2>
                 <span className="px-2 py-1 bg-slate-100 text-xs text-slate-500 rounded">交互演示</span>
              </div>

              {/* The Stomach Component */}
              <div className="flex-1 flex items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                 <StomachVisual {...getVisualProps()} />
              </div>

              {/* Controls for Diagnosis Phase */}
              {activePhase === Phase.DIAGNOSIS && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {(Object.keys(BorrmannType) as Array<keyof typeof BorrmannType>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveBorrmann(BorrmannType[key])}
                      className={`p-2 text-sm rounded-lg border transition-all ${
                        activeBorrmann === BorrmannType[key]
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md transform scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50'
                      }`}
                    >
                      <div className="font-bold">Borrmann {BorrmannType[key]}</div>
                      <div className="text-[10px] opacity-80">
                        {key === 'I' && '结节/息肉型'}
                        {key === 'II' && '溃疡局限型'}
                        {key === 'III' && '溃疡浸润型'}
                        {key === 'IV' && '弥漫浸润型'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
               
               {/* Legend for other phases */}
               {activePhase === Phase.HOSPITALIZATION && (
                 <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <p className="flex items-center gap-2"><Scissors size={14}/> 虚线表示常见切除范围（远端/全胃）</p>
                 </div>
               )}
            </div>
          </div>

          {/* Right Column: Information Content */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Phase 1: Diagnosis */}
            {activePhase === Phase.DIAGNOSIS && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">认识胃癌</h3>
                      <p className="text-slate-300 text-sm">早期发现，治愈率极高。了解敌人是战胜它的第一步。</p>
                    </div>
                    <button onClick={() => openVideo("胃癌肿瘤介绍")} className="bg-rose-500 hover:bg-rose-600 p-3 rounded-full shadow-lg transition-transform hover:scale-110">
                      <PlayCircle size={32} fill="white" className="text-rose-500" />
                    </button>
                 </div>

                 {/* Symptoms Atlas */}
                 <InfoCard title="症状图谱：别被假象蒙蔽" icon={<AlertCircle />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">早期 (Early)</div>
                          <h4 className="text-sm font-bold text-slate-700 mb-2">隐匿期：容易忽视</h4>
                          <ul className="text-xs text-slate-600 space-y-1.5">
                             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> 轻微腹胀、消化不良</li>
                             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> 偶尔反酸、嗳气</li>
                             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> 食欲稍减退</li>
                          </ul>
                          <p className="text-[10px] text-orange-600 mt-2 font-bold bg-orange-50 p-1 rounded border border-orange-100">
                             ⚠️ 常被误认为“老胃病”或胃炎
                          </p>
                       </div>
                       <div className="bg-red-50 p-3 rounded-lg border border-red-200 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-red-200 text-red-800 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">晚期 (Late)</div>
                          <h4 className="text-sm font-bold text-red-800 mb-2">报警期：必须就医</h4>
                          <ul className="text-xs text-red-900 space-y-1.5">
                             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 持续上腹痛、呕血</li>
                             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 黑便（柏油样便）</li>
                             <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> 不明原因消瘦、吞咽困难</li>
                          </ul>
                       </div>
                    </div>
                 </InfoCard>

                 {/* Visual TNM Staging - Onion Layer Style */}
                 <InfoCard title="可视化 TNM 分期：像剥洋葱一样看肿瘤" icon={<Layers />}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="relative w-40 h-40 shrink-0">
                         {/* M Layer (Outermost) */}
                         <div className="absolute inset-0 rounded-full border-2 border-dashed border-orange-300 flex items-start justify-center pt-1">
                            <span className="text-[10px] text-orange-400 font-bold bg-white px-1 -mt-2">M 远处转移</span>
                         </div>
                         {/* N Layer */}
                         <div className="absolute inset-4 rounded-full border-2 border-purple-300 flex items-start justify-center pt-1">
                            <span className="text-[10px] text-purple-400 font-bold bg-white px-1 -mt-2">N 淋巴扩散</span>
                         </div>
                         {/* T Layer (Core) */}
                         <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 flex items-center justify-center">
                            <div className="text-center">
                               <div className="text-xl font-bold text-blue-600">T</div>
                               <div className="text-[9px] text-blue-500">浸润深度</div>
                            </div>
                         </div>
                         {/* Interaction Dots */}
                         <div className="absolute top-1/2 -right-4 w-12 h-0.5 bg-orange-300"></div>
                         <div className="absolute top-1/2 -right-10 text-[9px] text-slate-500 w-16">肺、肝、骨</div>
                      </div>
                      <div className="flex-1 space-y-3">
                         <div className="flex gap-2 text-xs">
                            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">T (Tumor)</span>
                            <span className="text-slate-600">
                               肿瘤钻得有多深？<br/>
                               <span className="text-[10px] text-slate-400">黏膜层(T1) → 肌层(T2) → 浆膜层(T3/T4)</span>
                            </span>
                         </div>
                         <div className="flex gap-2 text-xs">
                            <span className="font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 shrink-0">N (Node)</span>
                            <span className="text-slate-600">
                               周围淋巴结有没有受到“污染”？<br/>
                               <span className="text-[10px] text-slate-400">数目越多(N0-N3)，分期越晚</span>
                            </span>
                         </div>
                         <div className="flex gap-2 text-xs">
                            <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 shrink-0">M (Metastasis)</span>
                            <span className="text-slate-600">
                               有没有跑到别的地方？<br/>
                               <span className="text-[10px] text-slate-400">一旦发生(M1)，即为晚期</span>
                            </span>
                         </div>
                      </div>
                    </div>
                 </InfoCard>

                 {/* Check List */}
                 <div className="bg-white rounded-xl border p-4">
                   <h3 className="font-bold mb-3 flex items-center gap-2 text-slate-800">
                     <CheckCircle2 size={18} className="text-teal-600"/> 必做检查清单
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {[
                       { text: '胃镜 + 活检', desc: '确诊金标准' },
                       { text: '腹部增强 CT', desc: '评估分期、淋巴结' },
                       { text: '超声胃镜 (EUS)', desc: '判断侵犯深度' },
                       { text: 'HER2 免疫组化', desc: '决定能否用靶向药' },
                       { text: '肿瘤标志物', desc: 'CEA, CA19-9, CA72-4' },
                       { text: '心肺功能评估', desc: '评估手术耐受力' }
                     ].map((item,i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded border border-slate-100">
                          <div className="w-5 h-5 rounded-full border border-teal-500 flex items-center justify-center shrink-0">
                             <div className="w-2.5 h-2.5 bg-teal-500 rounded-full"></div>
                          </div>
                          <div>
                             <div className="text-sm font-medium text-slate-700">{item.text}</div>
                             <div className="text-[10px] text-slate-500">{item.desc}</div>
                          </div>
                        </div>
                     ))}
                   </div>
                 </div>
              </div>
            )}

            {/* Phase 2: Hospitalization */}
            {activePhase === Phase.HOSPITALIZATION && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                
                {/* Pain Management */}
                <InfoCard title="疼痛管理：不要忍痛！" icon={<Sparkles />}>
                   <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                         <h4 className="text-sm font-bold text-slate-700 mb-2">VAS 疼痛评分尺</h4>
                         <div className="h-4 bg-gradient-to-r from-green-300 via-yellow-300 to-red-500 rounded-full relative mb-6">
                            <div className="absolute -bottom-5 left-0 text-[10px]">0 无痛</div>
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px]">5 中度</div>
                            <div className="absolute -bottom-5 right-0 text-[10px]">10 剧痛</div>
                         </div>
                         <p className="text-xs text-slate-600">
                            当评分 <span className="font-bold text-red-500">≥ 4分</span>（影响睡眠）时，必须告诉医生。
                         </p>
                      </div>
                      <div className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-100">
                         <div className="flex items-center gap-2 mb-1">
                            <Clock size={16} className="text-blue-600"/>
                            <span className="font-bold text-sm text-blue-800">黄金原则：按时给药</span>
                         </div>
                         <p className="text-[10px] text-blue-700">
                            现在的理念不是痛了再吃，而是<span className="font-bold">按时吃药</span>预防疼痛爆发。这能减少总药量，成瘾性极低。
                         </p>
                      </div>
                   </div>
                </InfoCard>

                {/* Pre/Post Op Checklist */}
                <InfoCard title="围手术期关键任务" icon={<ClipboardCheck />}>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Lung */}
                      <div className="border border-slate-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                         <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-cyan-100 rounded text-cyan-600"><Wind size={18}/></div>
                            <h4 className="font-bold text-sm text-slate-700">肺功能训练</h4>
                         </div>
                         <p className="text-xs text-slate-500 mb-2">防止术后肺炎、肺不张。</p>
                         <div className="text-[10px] bg-slate-50 p-2 rounded text-slate-600">
                            <strong>方法：</strong> 深吸气 → 吹气球/吹指套。每天 3-4 次，每次 10-15 分钟。
                         </div>
                      </div>
                      {/* DVT */}
                      <div className="border border-slate-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                         <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-rose-100 rounded text-rose-600"><Activity size={18}/></div>
                            <h4 className="font-bold text-sm text-slate-700">防血栓 (踝泵运动)</h4>
                         </div>
                         <p className="text-xs text-slate-500 mb-2">防止下肢深静脉血栓 (DVT)。</p>
                         <div className="text-[10px] bg-slate-50 p-2 rounded text-slate-600">
                            <strong>方法：</strong> 躺在床上，用力勾脚尖（保持10秒）→ 用力绷脚尖（保持10秒）。反复进行。
                         </div>
                      </div>
                   </div>
                </InfoCard>

                {/* 72h Timeline */}
                <InfoCard title="术后 72小时 黄金康复表" icon={<Clock />}>
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 my-2">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 bg-teal-500 rounded-full ring-4 ring-white"></div>
                      <h4 className="font-bold text-teal-700 text-sm">术后当日 (Day 0)</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        麻醉苏醒后，可能会有胃管、尿管、引流管。<br/>
                        <strong>任务：</strong> 配合医护监测生命体征；有痰尽量咳出；疼痛评分&gt;3分及时告知护士。
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 bg-teal-500 rounded-full ring-4 ring-white"></div>
                      <h4 className="font-bold text-teal-700 text-sm">术后第1天 (Day 1)</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        拔除尿管。<br/>
                        <strong>任务：</strong> <span className="text-rose-600 font-bold">早期活动！</span> 尝试床边坐起、站立甚至移步。这是预防血栓和肺炎的关键。
                      </p>
                    </div>
                     <div className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 bg-teal-500 rounded-full ring-4 ring-white"></div>
                      <h4 className="font-bold text-teal-700 text-sm">术后第2-3天 (Day 2-3)</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        肠道功能逐渐恢复。<br/>
                        <strong>任务：</strong> 下床走动促进排气（放屁）。排气后，遵医嘱可尝试少量饮水。
                      </p>
                    </div>
                  </div>
                </InfoCard>

                <div className="bg-red-50 border border-red-100 rounded-xl p-4 shadow-sm">
                   <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2 text-sm"><AlertTriangle size={18}/> 警惕！并发症信号</h3>
                   <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-2 rounded border border-red-100 text-center">
                         <span className="block text-xs font-bold text-slate-700 mb-1">持续高热</span>
                         <span className="text-[10px] text-red-500 bg-red-50 px-1 py-0.5 rounded">&gt; 38.5℃</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-red-100 text-center">
                         <span className="block text-xs font-bold text-slate-700 mb-1">腹部剧痛</span>
                         <span className="text-[10px] text-red-500 bg-red-50 px-1 py-0.5 rounded">拒按/板状</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-red-100 text-center">
                         <span className="block text-xs font-bold text-slate-700 mb-1">引流异常</span>
                         <span className="text-[10px] text-red-500 bg-red-50 px-1 py-0.5 rounded">鲜红/浑浊</span>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Phase 3: Discharge */}
            {activePhase === Phase.DISCHARGE && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                 
                 {/* Home Care */}
                 <InfoCard title="居家护理指南" icon={<Home />}>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex gap-3">
                          <Bed className="text-teal-500 shrink-0" size={20}/>
                          <div>
                             <h4 className="text-sm font-bold text-slate-700">半卧位休息</h4>
                             <p className="text-xs text-slate-500 mt-1">睡觉时垫高枕头或抬高床头，防止食物反流和烧心。</p>
                          </div>
                       </div>
                       <div className="flex gap-3">
                          <Sparkles className="text-teal-500 shrink-0" size={20}/>
                          <div>
                             <h4 className="text-sm font-bold text-slate-700">伤口护理</h4>
                             <p className="text-xs text-slate-500 mt-1">保持干燥。若伤口红肿、渗液，请及时就医。</p>
                          </div>
                       </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                       <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                          <Clock size={16} className="text-teal-500"/> 复查时间表
                       </h4>
                       <div className="flex justify-between text-[10px] text-slate-600 bg-slate-50 p-2 rounded">
                          <div className="text-center">
                             <div className="font-bold">术后1个月</div>
                             <div>首次复查</div>
                          </div>
                          <div className="text-slate-300">→</div>
                          <div className="text-center">
                             <div className="font-bold">每3个月</div>
                             <div>(术后1-2年)</div>
                          </div>
                          <div className="text-slate-300">→</div>
                          <div className="text-center">
                             <div className="font-bold">每6个月</div>
                             <div>(术后3-5年)</div>
                          </div>
                          <div className="text-slate-300">→</div>
                           <div className="text-center">
                             <div className="font-bold">每年</div>
                             <div>(5年后)</div>
                          </div>
                       </div>
                    </div>
                 </InfoCard>

                 {/* Diet Traffic Light */}
                 <InfoCard title="术后饮食红绿灯" icon={<Utensils />}>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Green */}
                      <div className="bg-green-50 p-2 rounded-lg border border-green-100 flex flex-col items-center text-center">
                         <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mb-2 shadow-sm"><ThumbsUp size={16}/></div>
                         <span className="font-bold text-xs text-green-800 mb-1">推荐 (绿灯)</span>
                         <div className="w-full h-px bg-green-200 my-1"></div>
                         <p className="text-[10px] text-slate-600 leading-tight">烂面条、蛋羹、鱼肉泥、豆腐、去皮鸡肉、软饭</p>
                      </div>
                      {/* Yellow */}
                      <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100 flex flex-col items-center text-center">
                         <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white mb-2 shadow-sm"><AlertCircle size={16}/></div>
                         <span className="font-bold text-xs text-yellow-800 mb-1">谨慎 (黄灯)</span>
                         <div className="w-full h-px bg-yellow-200 my-1"></div>
                         <p className="text-[10px] text-slate-600 leading-tight">牛奶(防腹胀)、豆浆、叶菜(必须切碎煮烂)、粗粮</p>
                      </div>
                       {/* Red */}
                      <div className="bg-red-50 p-2 rounded-lg border border-red-100 flex flex-col items-center text-center">
                         <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white mb-2 shadow-sm"><ThumbsDown size={16}/></div>
                         <span className="font-bold text-xs text-red-800 mb-1">禁忌 (红灯)</span>
                         <div className="w-full h-px bg-red-200 my-1"></div>
                         <p className="text-[10px] text-slate-600 leading-tight">柿子、黑枣、糯米粽子、油炸食品、辛辣、烟酒</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center bg-slate-50 p-1 rounded">
                       原则：少食多餐 (每日5-6餐)，干稀分食，细嚼慢咽 (每口20-30下)。
                    </p>
                 </InfoCard>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="倾倒综合征" icon={<Activity />} className="border-l-4 border-l-orange-400">
                       <p className="text-sm text-slate-600 mb-2">进食高糖流质后出现心慌、出汗、眩晕、无力。</p>
                       <div className="bg-orange-50 p-2 rounded text-xs text-orange-800 font-bold">
                          应对：饭后平卧20分钟；进餐时少喝汤，饭后半小时再喝水。
                       </div>
                    </InfoCard>
                    
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 border-l-4 border-l-rose-500">
                        <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                           <Phone size={20} className="text-rose-500"/> 紧急就医指征
                        </h3>
                        <ul className="space-y-2">
                          {[
                            '呕血或解柏油样黑便',
                            '进食后剧烈呕吐无法缓解',
                            '体重短期内急剧下降 (&gt;5kg/月)',
                            '严重贫血症状 (晕厥、极度乏力)'
                          ].map((text, i) => (
                             <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="text-rose-500 font-bold">•</span>
                                {text}
                             </li>
                          ))}
                        </ul>
                    </div>
                 </div>
              </div>
            )}

            {/* Phase 4: Frailty */}
            {activePhase === Phase.FRAILTY && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-4 items-start">
                    <div className="bg-amber-100 p-2 rounded-lg shrink-0">
                       <BatteryCharging className="text-amber-600" size={24} />
                    </div>
                    <div>
                       <h3 className="font-bold text-amber-800">什么是肿瘤相关衰弱？</h3>
                       <p className="text-sm text-amber-700 mt-1">
                         不仅仅是"虚弱"。它是指生理储备下降，抗打击能力减弱。早期干预可显著提高生存质量。
                         <button onClick={() => openVideo("衰弱的定义与危害")} className="ml-2 underline font-bold cursor-pointer">观看视频</button>
                       </p>
                    </div>
                 </div>

                 {/* Sarcopenia Screening - SVG Finger Ring Test */}
                 <InfoCard title="肌少症简易筛查：指环试验" icon={<Scissors className="rotate-90"/>}>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                       {/* Interactive-looking SVG */}
                       <div className="relative w-40 h-40 shrink-0 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center overflow-hidden">
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Calf */}
                            <path d="M 40 10 Q 30 50 40 90 L 60 90 Q 70 50 60 10 Z" fill="#fca5a5" stroke="#e11d48" strokeWidth="1" />
                            {/* Hands forming a ring */}
                            <path d="M 30 50 Q 10 40 30 30 Q 50 20 70 30 Q 90 40 70 50 Q 50 60 30 50" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse"/>
                            <circle cx="50" cy="40" r="22" stroke="#334155" strokeWidth="2" fill="none" opacity="0.5"/>
                            <text x="50" y="85" textAnchor="middle" fontSize="8" fill="#e11d48" fontWeight="bold">非优势小腿最粗处</text>
                          </svg>
                       </div>

                       <div className="flex-1 w-full">
                          <p className="text-sm text-slate-700 font-bold mb-2">测试方法：</p>
                          <p className="text-xs text-slate-600 mb-3">
                             坐在椅子上，双脚着地，大腿放松。用双手食指和拇指围成圈，套在小腿最粗处。
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                             <div className="bg-green-50 p-2 rounded border border-green-100 text-center">
                                <div className="text-green-700 font-bold text-xs mb-1">围不住</div>
                                <div className="text-[10px] text-slate-500">肌量充足 (低风险)</div>
                             </div>
                             <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-center">
                                <div className="text-yellow-700 font-bold text-xs mb-1">刚刚好</div>
                                <div className="text-[10px] text-slate-500">需关注 (中风险)</div>
                             </div>
                             <div className="bg-red-50 p-2 rounded border border-red-100 text-center">
                                <div className="text-red-700 font-bold text-xs mb-1">围得住</div>
                                <div className="text-[10px] text-slate-500">肌量不足 (高风险)</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </InfoCard>

                 {/* Nutrition Calculator */}
                 <InfoCard title="精准营养计算器" icon={<Calculator />}>
                    <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                       <label className="block text-sm font-bold text-slate-700 mb-2">输入体重 (kg)</label>
                       <div className="flex gap-2">
                          <input 
                             type="number" 
                             value={userWeight} 
                             onChange={(e) => setUserWeight(e.target.value)}
                             placeholder="例如: 60"
                             className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <button className="bg-teal-500 text-white px-4 py-2 rounded text-sm font-bold">计算</button>
                       </div>
                    </div>

                    {nutritionResult ? (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 relative">
                             <div className="absolute top-2 right-2 text-orange-300"><Sparkles size={16}/></div>
                             <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">推荐每日能量 (Energy)</h4>
                             <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-orange-600">{nutritionResult.minEnergy} ~ {nutritionResult.maxEnergy}</span>
                                <span className="text-xs text-orange-600 font-bold">kcal</span>
                             </div>
                             <p className="text-[10px] text-slate-500 mt-1">相当于 {Math.round(nutritionResult.maxEnergy / 300)} ~ {Math.round(nutritionResult.maxEnergy / 250)} 碗米饭的热量</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 relative">
                             <div className="absolute top-2 right-2 text-blue-300"><Utensils size={16}/></div>
                             <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">推荐每日蛋白质 (Protein)</h4>
                             <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-blue-600">{nutritionResult.minProtein} ~ {nutritionResult.maxProtein}</span>
                                <span className="text-xs text-blue-600 font-bold">g</span>
                             </div>
                             <p className="text-[10px] text-slate-500 mt-1">约等于 {Math.round(parseFloat(nutritionResult.maxProtein) / 7)} 个鸡蛋的蛋白质量</p>
                          </div>
                       </div>
                    ) : (
                       <p className="text-xs text-slate-400 text-center py-2">请输入体重以查看个性化营养目标</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-2 text-right">* 合并肾功能不全者请遵医嘱调整蛋白摄入。</p>
                 </InfoCard>

                 {/* Fried Scale */}
                 <InfoCard title="Fried 衰弱表型量表" icon={<ClipboardCheck />}>
                    <div className="space-y-4">
                      <p className="text-sm text-slate-500">请勾选您近期的真实情况（符合一项即勾选）：</p>
                      <div className="space-y-2">
                        {[
                          { text: "非意愿性体重下降", desc: "过去一年体重减少 >4.5kg 或 >5%" },
                          { text: "自觉疲乏", desc: "每周 >3天感到做事费力或精力不济" },
                          { text: "握力减弱", desc: "感觉手劲明显变小，如拧毛巾费力" },
                          { text: "行走缓慢", desc: "走4.5米的时间明显延长" },
                          { text: "低体力活动", desc: "极少运动，日常活动量极低" }
                        ].map((item, index) => (
                          <label key={index} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-slate-200 cursor-pointer transition-all">
                            <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${friedItems.includes(index) ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-slate-300'}`}>
                               {friedItems.includes(index) && <CheckCircle2 size={14} />}
                            </div>
                            <input 
                              type="checkbox" 
                              checked={friedItems.includes(index)}
                              onChange={() => toggleFriedItem(index)}
                              className="hidden" 
                            />
                            <div>
                               <div className={`font-medium text-sm ${friedItems.includes(index) ? 'text-teal-900' : 'text-slate-700'}`}>{item.text}</div>
                               <div className="text-xs text-slate-500">{item.desc}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                      
                      {/* Result & AI Action */}
                      <div className={`p-4 rounded-xl border flex flex-col gap-4 transition-colors duration-300 ${
                        friedItems.length === 0 ? 'bg-green-50 border-green-200' :
                        friedItems.length <= 2 ? 'bg-orange-50 border-orange-200' :
                        'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Activity size={20} className={
                                friedItems.length === 0 ? 'text-green-600' :
                                friedItems.length <= 2 ? 'text-orange-600' :
                                'text-red-600'
                              } />
                              <span className={`font-bold ${
                                friedItems.length === 0 ? 'text-green-800' :
                                friedItems.length <= 2 ? 'text-orange-800' :
                                'text-red-800'
                              }`}>
                                评估结果：
                                {friedItems.length === 0 ? '健康 (Robust)' :
                                friedItems.length <= 2 ? '衰弱前期 (Pre-frail)' :
                                '衰弱 (Frail)'}
                              </span>
                            </div>
                            <div className="text-xs px-2 py-1 bg-white/50 rounded-md font-medium text-slate-600">
                               已选 {friedItems.length} / 5 项
                            </div>
                        </div>

                        {/* AI Trigger Button */}
                        <button 
                           onClick={handleConsultAI}
                           className="w-full bg-white border border-slate-200 hover:bg-teal-50 hover:border-teal-200 text-teal-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-bold text-sm shadow-sm transition-all hover:shadow"
                        >
                           <Bot size={18} />
                           生成 AI 康复方案
                        </button>
                      </div>
                    </div>
                 </InfoCard>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around z-40 pb-safe">
        {NAV_ITEMS.map((item) => {
           const Icon = item.icon === 'Stethoscope' ? Stethoscope : 
                        item.icon === 'Building2' ? Building2 : 
                        item.icon === 'Home' ? Home : Activity;
           return (
             <button
               key={item.id}
               onClick={() => setActivePhase(item.id)}
               className={`flex flex-col items-center p-2 rounded-lg ${activePhase === item.id ? 'text-rose-600' : 'text-slate-400'}`}
             >
               <Icon size={24} />
               <span className="text-[10px] mt-1">{item.label}</span>
             </button>
           );
        })}
      </div>

      {/* Video Modal Placeholder */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center">
                 <h3 className="font-bold text-lg">{videoTitle}</h3>
                 <button onClick={() => setShowVideoModal(false)} className="text-slate-400 hover:text-slate-800">
                   关闭
                 </button>
              </div>
              <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                 <PlayCircle size={64} className="text-white/50" />
                 <p className="absolute bottom-4 text-white/70 text-sm">模拟视频播放器：此处将播放专业科普动画</p>
              </div>
              <div className="p-6">
                 <h4 className="font-bold mb-2">视频摘要</h4>
                 <p className="text-sm text-slate-600">
                   本视频详细讲解了{videoTitle}的核心概念。通过3D动画形式展示了病理变化过程，帮助患者直观理解疾病原理。
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* AI Assistant - Passed Ref */}
      <AssistantChat ref={chatRef} context={getContext()} />
    </div>
  );
}