'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, LayoutDashboard, FileText, Target, Flag, Zap, Box, Languages, Save, Loader2, Image as ImageIcon, Globe, RotateCcw, BarChart } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import enData from '../../../locales/en.json';

const SCENES = [
  'HeroScene', 'BrandingScene', 'FilmScene', 'VFXScene', 'SoftwareScene',
  'PerformanceScene', 'AIScene', 'IcosahedronScene', 'RingScene', 
  'CapsuleScene', 'BoxScene', 'TorusKnotScene', 'TetrahedronScene', 
  'StatementScene', 'ProcessScene'
];

const TABS = [
  { id: 'hero', label: 'Hero Section', icon: LayoutDashboard },
  { id: 'about', label: 'Who We Are', icon: FileText },
  { id: 'vision', label: 'Our Vision', icon: Target },
  { id: 'mission', label: 'Our Mission', icon: Flag },
  { id: 'goals', label: 'What Sets Us Apart', icon: Zap },
  { id: 'philosophy', label: 'Our Philosophy', icon: Box },
  { id: 'process', label: 'How We Work', icon: Zap },
  { id: 'stats', label: 'Stats Manager', icon: BarChart },
];

export default function HomepageEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [generatingFields, setGeneratingFields] = useState<Record<string, boolean>>({});
  const [initialData, setInitialData] = useState<any>(null);

  const defaultContentEn = {
    hero: { badge: enData.hero.badge, titleLine1: enData.hero.titleLine1, titleLine2: enData.hero.titleLine2, titleLine3Prefix: enData.hero.titleLine3Prefix, titleLine3Highlight: enData.hero.titleLine3Highlight, sub: enData.hero.sub },
    about: { eyebrow: enData.about.eyebrow, titleLine1: enData.about.titleLine1, titleLine2: enData.about.titleLine2, intro: enData.about.intro },
    vision: { title: enData.about.vision.title, desc: enData.about.vision.desc },
    mission: { title: enData.about.mission.title, desc: enData.about.mission.desc },
    goals: { title: enData.about.goals.title, items: enData.about.goals.items.map((item: any) => ({ title: item.title, desc: item.desc })) },
    philosophy: { eyebrow: enData.statement.eyebrow, quoteLine1: enData.statement.quoteLine1, quoteLine2: enData.statement.quoteLine2, body: enData.statement.body, cta: enData.statement.cta, floatLabel: enData.statement.floatLabel, floatSub: enData.statement.floatSub },
    process: { eyebrow: enData.process.eyebrow, titleLine1: enData.process.titleLine1, titleLine2: enData.process.titleLine2, items: [
      {num: enData.process.step1Num, title: enData.process.step1Title, body: enData.process.step1Body},
      {num: enData.process.step2Num, title: enData.process.step2Title, body: enData.process.step2Body},
      {num: enData.process.step3Num, title: enData.process.step3Title, body: enData.process.step3Body},
      {num: enData.process.step4Num, title: enData.process.step4Title, body: enData.process.step4Body}
    ] }
  };

  const [data, setData] = useState<any>({
    scenes: { hero: '', about: '', vision: '', mission: '', goals: '', philosophy: '', process: '' },
    content: {
      en: defaultContentEn,
      ar: defaultContentEn
    },
    stats: {
      projectsValue: enData.stats.projectsValue,
      projectsLabel: enData.stats.projectsLabel,
      projectsNote: enData.stats.projectsNote,
      clientsValue: enData.stats.clientsValue,
      clientsLabel: enData.stats.clientsLabel,
      clientsNote: enData.stats.clientsNote,
      disciplinesValue: enData.stats.disciplinesValue,
      disciplinesLabel: enData.stats.disciplinesLabel,
      disciplinesNote: enData.stats.disciplinesNote,
      foundedValue: enData.stats.foundedValue,
      foundedLabel: enData.stats.foundedLabel,
      foundedNote: enData.stats.foundedNote,
    }
  });

  const loadData = () => {
    setLoading(true);
    fetch('/api/admin/homepage')
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          const loadedData = {
            scenes: { ...data.scenes, ...res.data.scenes },
            content: {
              en: { ...data.content.en, ...res.data.content?.en },
              ar: { ...data.content.ar, ...res.data.content?.ar }
            },
            stats: { ...data.stats, ...res.data.stats }
          };
          setData(loadedData);
          setInitialData(JSON.parse(JSON.stringify(loadedData)));
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Auto-Translate to 15 languages automatically
      const transRes = await fetch('/api/admin/homepage/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content.en })
      });
      const transResult = await transRes.json();
      
      let finalData = { ...data };
      if (transResult.success && transResult.translations) {
        finalData.content = {
          ...finalData.content,
          ...transResult.translations
        };
        setData(finalData);
      }

      // 2. Save everything to DB
      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      
      if (res.ok) {
        setInitialData(JSON.parse(JSON.stringify(finalData)));
        alert('Saved & Translated to 15 languages successfully! 🎉');
      } else {
        alert('Failed to save changes.');
      }
    } catch (e) {
      alert('Error saving changes.');
    }
    setSaving(false);
  };

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard all unsaved changes?")) {
      if (initialData) setData(JSON.parse(JSON.stringify(initialData)));
    }
  };

  const handleAiGenerate = async (sectionPath: string[], promptContext: string) => {
    try {
      const prompt = `You are an expert marketing copywriter for Pixelectro Studio. Write a highly engaging and professional text for the homepage section: ${promptContext}.
      CRITICAL RULES:
      1. Output the text in English ONLY.
      2. DO NOT include conversational filler, formatting (like **), or quotes. Just plain text.
      3. Keep it brief, powerful, and cinematic.`;

      const res = await fetch('/api/admin/generate-ai-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const result = await res.json();
      if (result.success && result.text) {
        updateField(sectionPath, result.text);
      } else {
        alert(result.error || 'Failed to generate');
      }
    } catch (e) {
      alert('Error generating text');
    }
  };

  const updateField = (path: string[], value: string) => {
    setData((prev: any) => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const renderField = (label: string, fieldPath: string[], isTextArea = false, aiPromptContext = "") => {
    // Force field path to always read from 'en' as we removed the language toggle
    const englishPath = ['content', 'en', ...fieldPath];
    const value = englishPath.reduce((acc, key) => acc[key], data);
    const fieldKey = englishPath.join('.');
    const isGeneratingAI = generatingFields[fieldKey] || false;

    const handleFieldAiGenerate = async () => {
      setGeneratingFields(prev => ({ ...prev, [fieldKey]: true }));
      await handleAiGenerate(englishPath, aiPromptContext);
      setGeneratingFields(prev => ({ ...prev, [fieldKey]: false }));
    };

    return (
      <div className="group relative bg-white dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors duration-200 shadow-sm">
        <label className="block text-base font-bold text-gray-800 dark:text-gray-200 mb-4">{label}</label>
        <div className="w-full bg-white dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-inner min-h-[120px]">
           <RichTextEditor 
             content={value} 
             onChange={val => updateField(englishPath, val)}
             onGenerateAI={aiPromptContext ? handleFieldAiGenerate : undefined}
             isGeneratingAI={isGeneratingAI}
           />
        </div>
      </div>
    );
  };

  const ActiveTabIcon = TABS.find(t => t.id === activeTab)?.icon || Box;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white dark:bg-[#1A1F2E] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-4 z-10">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">Homepage Studio</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Design your digital masterpiece with dynamic 3D scenes and AI.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Discard Button */}
          <button
            onClick={handleDiscard}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors shadow-sm disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" /> Unsave
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btnPrimary flex items-center gap-2 px-8 py-2.5"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving & Translating...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ─── SIDEBAR NAVIGATION ─── */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-2 bg-white dark:bg-[#1A1F2E] p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm h-fit sticky top-36">
          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 px-3">Sections</h3>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-[15px] font-bold transition-all shadow-sm ${
                  isActive 
                    ? 'bg-blue-600 text-white border-transparent transform scale-[1.02]' 
                    : 'bg-gray-50 dark:bg-[#23293B] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── EDITOR AREA ─── */}
        <div className="flex-1 space-y-8 animate-in slide-in-from-right-4 duration-300">
          
          {/* Section Header */}
          <div className="bg-white dark:bg-[#1A1F2E] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ActiveTabIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{TABS.find(t => t.id === activeTab)?.label}</h2>
                <p className="text-sm text-gray-500">Customize the text and visuals for this section.</p>
              </div>
            </div>

            {/* 3D Scene Selector */}
            {activeTab !== 'stats' && (
              <div className="w-full md:w-auto min-w-[280px] bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col justify-center">
                <label className="flex items-center gap-2 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">
                  <ImageIcon className="w-4 h-4 text-blue-500" /> Background 3D Scene
                </label>
                <div className="relative">
                  <select
                    value={data.scenes[activeTab]}
                    onChange={e => updateField(['scenes', activeTab], e.target.value)}
                    className="w-full p-3 pl-4 pr-10 bg-white dark:bg-[#1A1F2E] border-2 border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none shadow-sm"
                  >
                    <option value="">Default (None)</option>
                    {SCENES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields Container */}
          <div className="space-y-6">
            {activeTab === 'hero' && (
              <>
                {renderField('Badge', ['hero', 'badge'], false, "a short hero badge (e.g. 'Global Creative Studio')")}
                {renderField('Title Line 1', ['hero', 'titleLine1'], false, "the first line of a massive hero title (1-2 words)")}
                {renderField('Title Line 2', ['hero', 'titleLine2'], false, "the second line of a massive hero title (1-2 words)")}
                {renderField('Title Prefix', ['hero', 'titleLine3Prefix'], false, "the prefix of the third title line")}
                {renderField('Title Highlight', ['hero', 'titleLine3Highlight'], false, "the highlighted blue text of the third title line")}
                {renderField('Subtitle / Description', ['hero', 'sub'], true, "a 2-sentence subtitle explaining we are an elite creative agency doing 3D, web, and branding")}
              </>
            )}

            {activeTab === 'about' && (
              <>
                {renderField('Eyebrow', ['about', 'eyebrow'], false, "an eyebrow title like 'Who We Are'")}
                {renderField('Title Line 1', ['about', 'titleLine1'], false, "the first line of the about section title")}
                {renderField('Title Line 2', ['about', 'titleLine2'], false, "the second line of the about section title")}
                {renderField('Intro Text', ['about', 'intro'], true, "a 3-sentence introduction about Pixelectro studio's history and core values")}
              </>
            )}

            {activeTab === 'vision' && (
              <>
                {renderField('Title', ['vision', 'title'], false, "the title 'Our Vision'")}
                {renderField('Description', ['vision', 'desc'], true, "a powerful vision statement for a creative agency")}
              </>
            )}

            {activeTab === 'mission' && (
              <>
                {renderField('Title', ['mission', 'title'], false, "the title 'Our Mission'")}
                {renderField('Description', ['mission', 'desc'], true, "an actionable mission statement for a digital agency")}
              </>
            )}

            {activeTab === 'goals' && (
              <div className="space-y-8">
                {renderField('Section Title', ['goals', 'title'], false, "the title 'What Sets Us Apart'")}
                <div className="grid grid-cols-1 gap-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="bg-gray-50/50 dark:bg-[#131823] border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-black text-4xl opacity-20 p-4 leading-none rounded-bl-3xl">0{i + 1}</div>
                      <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-500" /> Goal / Feature {i + 1}
                      </h4>
                      <div className="space-y-4">
                        {renderField('Title', ['goals', 'items', i.toString(), 'title'], false, `a 2-word title for agency feature #${i+1}`)}
                        {renderField('Description', ['goals', 'items', i.toString(), 'desc'], true, `a 2-sentence description for agency feature #${i+1}`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'philosophy' && (
              <>
                {renderField('Eyebrow', ['philosophy', 'eyebrow'], false, "the eyebrow 'Our Philosophy'")}
                {renderField('Quote Line 1', ['philosophy', 'quoteLine1'], false, "the first half of a powerful agency quote")}
                {renderField('Quote Line 2', ['philosophy', 'quoteLine2'], false, "the second half of a powerful agency quote")}
                {renderField('Body', ['philosophy', 'body'], true, "a 3-sentence philosophy statement about engineering perception")}
                {renderField('CTA Button', ['philosophy', 'cta'], false, "the button text 'Start the Conversation'")}
                {renderField('Float Label', ['philosophy', 'floatLabel'], false, "a label for the floating 3D card")}
                {renderField('Float Sub', ['philosophy', 'floatSub'], false, "a subtitle for the floating 3D card")}
              </>
            )}

            {activeTab === 'process' && (
              <div className="space-y-8">
                {renderField('Eyebrow', ['process', 'eyebrow'], false, "the eyebrow 'How We Work'")}
                {renderField('Title Line 1', ['process', 'titleLine1'], false, "first half of process section title")}
                {renderField('Title Line 2', ['process', 'titleLine2'], false, "second half of process section title")}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50/50 dark:bg-[#131823] border border-gray-200 dark:border-gray-800 rounded-xl p-6 relative">
                      <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <Box className="w-5 h-5 text-purple-500" /> Step {i + 1}
                      </h4>
                      <div className="space-y-4">
                        {renderField('Number Label', ['process', 'items', i.toString(), 'num'])}
                        {renderField('Title', ['process', 'items', i.toString(), 'title'], false, `a 1-word title for process step #${i+1}`)}
                        {renderField('Description', ['process', 'items', i.toString(), 'body'], true, `a 1-sentence description of process step #${i+1}`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { key: 'projects', icon: LayoutDashboard },
                  { key: 'clients', icon: Globe },
                  { key: 'disciplines', icon: Sparkles },
                  { key: 'founded', icon: Target }
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.key} className="bg-white dark:bg-[#1A1F2E] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-lg mb-6 text-gray-900 dark:text-white flex items-center gap-3 capitalize">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        {stat.key} Stat
                      </h4>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Value (e.g. 200+)</label>
                          <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-medium"
                            value={data.stats[`${stat.key}Value`] || ''}
                            onChange={(e) => setData({ ...data, stats: { ...data.stats, [`${stat.key}Value`]: e.target.value }})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Label (e.g. Projects)</label>
                          <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-medium"
                            value={data.stats[`${stat.key}Label`] || ''}
                            onChange={(e) => setData({ ...data, stats: { ...data.stats, [`${stat.key}Label`]: e.target.value }})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Sub-note</label>
                          <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-medium"
                            value={data.stats[`${stat.key}Note`] || ''}
                            onChange={(e) => setData({ ...data, stats: { ...data.stats, [`${stat.key}Note`]: e.target.value }})}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
