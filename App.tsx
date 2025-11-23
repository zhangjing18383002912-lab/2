import React, { useState, useEffect } from 'react';
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
  ClipboardCheck
} from 'lucide-react';
import { Phase, BorrmannType, NavItem } from './types';
import StomachVisual from './components/StomachVisual';
import AssistantChat from './components/AssistantChat';
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
  const [friedItems, setFriedItems] = useState<number[]>([]);

  // Toggle function for Fried Scale items
  const toggleFriedItem = (index: number) => {
    setFriedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  // Determine current context string for the AI Assistant
  const getContext = () => {
    switch (activePhase) {
      case Phase.DIAGNOSIS: return `当前在确诊阶段，查看 Borrmann ${activeBorrmann}型胃癌演示。关注症状、分期、确诊方式。`;
      case Phase.HOSPITALIZATION: return "当前在住院阶段，关注术前准备、术后护理、引流管、饮食。";
      case Phase.DISCHARGE: return "当前在出院阶段，关注倾倒综合征、少食多餐、随访。";
      case Phase.FRAILTY: return "当前在衰弱管理，关注老年衰弱、营养补充、运动处方。";
      default: return "胃癌科普首页";
    }
  };

  const openVideo = (title: string) => {
    setVideoTitle(title);
    setShowVideoModal(true);
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

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="常见症状" icon={<AlertCircle />}>
                      <ul className="list-disc pl-4 space-y-1 text-sm marker:text-rose-500">
                        <li>上腹部疼痛或不适</li>
                        <li>食欲减退、消瘦</li>
                        <li>恶心、呕吐、黑便</li>
                        <li>早饱感（吃一点就饱）</li>
                      </ul>
                    </InfoCard>
                    <InfoCard title="确诊金标准" icon={<Stethoscope />}>
                      <p className="text-sm"><strong>胃镜 + 病理活检</strong> 是确诊的唯一金标准。</p>
                      <p className="text-xs text-slate-500 mt-2">辅助检查：CT（分期）、超声胃镜（浸润深度）、肿瘤标志物。</p>
                    </InfoCard>
                 </div>

                 <InfoCard title="治疗策略概览" icon={<Activity />}>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">早期</span>
                        <span className="text-sm">内镜下切除 (ESD) 或 微创手术</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">局部晚期</span>
                        <span className="text-sm">新辅助化疗 + 手术 + 术后辅助化疗</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-16 text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded">晚期</span>
                        <span className="text-sm">转化治疗、靶向/免疫治疗、姑息治疗</span>
                      </div>
                    </div>
                 </InfoCard>
                 
                 <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <div className="flex gap-2 text-rose-800 font-bold mb-2">
                       <Brain size={20}/> 心理调适
                    </div>
                    <p className="text-sm text-rose-700">确诊初期感到恐惧是正常的。建议：加入病友群获取正向支持，坦诚与医生沟通对副作用的担忧，相信规范化治疗。</p>
                 </div>
              </div>
            )}

            {/* Phase 2: Hospitalization */}
            {activePhase === Phase.HOSPITALIZATION && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <InfoCard title="手术治疗" icon={<Scissors />}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm mb-1">术前准备 (Pre-op)</h4>
                      <p className="text-sm text-slate-600">营养评估，练习<strong>腹式呼吸</strong>与有效咳嗽（预防肺部感染）。</p>
                    </div>
                    <div className="h-px bg-slate-100"></div>
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm mb-1">术后早期 (Post-op)</h4>
                      <ul className="list-disc pl-4 text-sm text-slate-600">
                        <li><strong>早期下床：</strong> 术后第1天即可尝试床边站立，促进肠道蠕动，预防血栓。</li>
                        <li><strong>引流管：</strong> 保持通畅，翻身时避免牵拉。</li>
                        <li><strong>疼痛管理：</strong> 敢于表达疼痛，合理使用镇痛泵。</li>
                      </ul>
                    </div>
                  </div>
                </InfoCard>

                <InfoCard title="化疗与药物" icon={<Pill />}>
                  <p className="mb-2 text-sm">常见方案：奥沙利铂 + 卡培他滨/替吉奥 (SOX/XELOX)</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-xs font-bold block mb-1">恶心呕吐</span>
                      <span className="text-xs text-slate-500">预防性止吐药，少食多餐，清淡饮食。</span>
                    </div>
                     <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-xs font-bold block mb-1">骨髓抑制</span>
                      <span className="text-xs text-slate-500">定期查血常规，必要时使用升白针。</span>
                    </div>
                  </div>
                </InfoCard>
              </div>
            )}

            {/* Phase 3: Discharge */}
            {activePhase === Phase.DISCHARGE && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="倾倒综合征" icon={<AlertCircle />} className="border-l-4 border-l-orange-400">
                       <p className="text-sm text-slate-600">进食后出现心慌、出汗、眩晕。</p>
                       <p className="text-sm font-bold mt-2 text-orange-600">应对：干稀分食（饭后半小时再喝汤），餐后平卧20分钟。</p>
                    </InfoCard>
                    <InfoCard title="随访计划" icon={<Building2 />} className="border-l-4 border-l-teal-400">
                       <p className="text-sm text-slate-600">术后2年内，每3个月复查一次。</p>
                       <p className="text-sm mt-2 text-slate-500">项目：血常规、肿瘤标志物、CT、胃镜（每年）。</p>
                    </InfoCard>
                 </div>

                 <InfoCard title="长期饮食原则" icon={<Utensils />}>
                    <div className="flex flex-wrap gap-2">
                      {['少食多餐', '细嚼慢咽', '高蛋白', '低糖', '补充维生素B12'].map((tag) => (
                        <span key={tag} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      切除胃部后，消化功能减弱。需长期补充铁剂、叶酸及维生素B12以预防贫血。
                    </p>
                 </InfoCard>
              </div>
            )}

            {/* Phase 4: Frailty */}
            {activePhase === Phase.FRAILTY && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-4 items-start">
                    <div className="bg-amber-100 p-2 rounded-lg">
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

                 <InfoCard title="衰弱自测 (Fried 表型量表)" icon={<ClipboardCheck />}>
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
                               {friedItems.includes(index) && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
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
                      
                      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-2 transition-colors duration-300 ${
                        friedItems.length === 0 ? 'bg-green-50 border-green-200' :
                        friedItems.length <= 2 ? 'bg-orange-50 border-orange-200' :
                        'bg-red-50 border-red-200'
                      }`}>
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
                        <div className="text-xs px-2 py-1 bg-white/50 rounded-md">
                           已选 {friedItems.length} / 5 项
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 text-right">* 该量表为简易筛查工具，准确诊断请咨询临床医生。</p>
                    </div>
                 </InfoCard>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Utensils size={16}/> 营养干预</h4>
                      <p className="text-sm text-slate-600">增加优质蛋白（鱼、蛋、乳清蛋白粉）。必要时使用特医食品 (FSMP) 口服营养补充。</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                      <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Activity size={16}/> 运动处方</h4>
                      <p className="text-sm text-slate-600">抗阻运动（举小哑铃、弹力带）结合有氧运动（散步）。预防跌倒至关重要。</p>
                    </div>
                 </div>
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

      {/* AI Assistant */}
      <AssistantChat context={getContext()} />
    </div>
  );
}