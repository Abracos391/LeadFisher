import React, { useState, useEffect } from 'react';
import { generateMarketingPlan } from './services/geminiService';
import { MarketingPlan, AppState } from './types';
import { IconSearch, IconTarget, IconMessage, IconBot, IconArrowRight, IconCopy, IconCheck, IconMagnet, IconVideo, IconImage, IconZap, IconCreditCard, IconLock, IconStar, IconPlatform, IconMoney, IconExport, IconAlert, IconTools, IconList } from './components/Icons';
import StepCard from './components/StepCard';

// --------------------------------------------------------
// CONFIGURAÇÃO DO STRIPE
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_5kA039"; 
const LOCAL_TEST_PAYMENT = "?payment_success=true"; 

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleCopy} 
        className="p-1.5 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700 relative group/btn"
        title="Copiar texto"
      >
        {copied ? <IconCheck className="w-4 h-4 text-emerald-400" /> : <IconCopy className="w-4 h-4" />}
      </button>
      {copied && <span className="text-[10px] text-emerald-400 animate-fade-in font-bold">Copiado!</span>}
    </div>
  );
};

const App: React.FC = () => {
  const [segment, setSegment] = useState('');
  const [language, setLanguage] = useState('Português');
  const [region, setRegion] = useState(''); 
  const [radius, setRadius] = useState('Cidade (Local)');
  
  // New Strategic Fields (Deep Diagnosis)
  const [usp, setUsp] = useState(''); // Unique Selling Proposition
  const [painPoints, setPainPoints] = useState(''); // Customer Pain
  
  const [platform, setPlatform] = useState('Meta Ads (Facebook/Instagram)');
  const [budget, setBudget] = useState('Micro-Teste (R$ 6 - R$ 20/dia)');
  const [objective, setObjective] = useState('Captura de Leads (Cadastro)');

  // API Key Management
  const [credits, setCredits] = useState<number>(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Confirmation before credit use

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [plan, setPlan] = useState<MarketingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Credits
    const storedCredits = localStorage.getItem('lf_credits');
    if (storedCredits === null) {
      localStorage.setItem('lf_credits', '1');
      setCredits(1);
    } else {
      setCredits(parseInt(storedCredits));
    }

    // Payment Callback
    const query = new URLSearchParams(window.location.search);
    if (query.get('payment_success') === 'true') {
       const current = parseInt(localStorage.getItem('lf_credits') || '0');
       const newBalance = current + 5;
       localStorage.setItem('lf_credits', newBalance.toString());
       setCredits(newBalance);
       
       window.history.replaceState({}, document.title, window.location.pathname);
       alert("🎉 Pagamento confirmado! 5 Créditos foram adicionados à sua conta.");
       setShowPremiumModal(false);
    }
  }, []);

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          // We set it as a string, but the user can overwrite it
          setRegion(`Minha Localização GPS (${coords})`);
        },
        () => {
          alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
        }
      );
    } else {
      alert("Geolocalização não suportada neste navegador.");
    }
  };

  const handleValidation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Strong validation
    if (!segment.trim()) {
      alert("Por favor, preencha o campo do nicho/segmento.");
      return;
    }
    if (!region.trim()) {
      alert("Por favor, digite a cidade ou região alvo.");
      return;
    }
    // New validation for deep diagnosis
    if (!usp.trim() || !painPoints.trim()) {
       alert("O Diagnóstico Profundo é obrigatório. Preencha o Diferencial e as Dores do Cliente para evitar resultados genéricos.");
       return;
    }

    // Credit Check
    if (credits <= 0) {
      setShowPremiumModal(true);
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const executeGeneration = async () => {
    setShowConfirmModal(false);
    setAppState(AppState.LOADING);
    setError(null);
    
    try {
      // Pass the new deep diagnosis fields
      const result = await generateMarketingPlan(segment, language, region, radius, platform, budget, objective, usp, painPoints);
      setPlan(result);
      setAppState(AppState.SUCCESS);
      
      const newBalance = credits - 1;
      setCredits(newBalance);
      localStorage.setItem('lf_credits', newBalance.toString());

    } catch (err: any) {
      console.error(err);
      let msg = "Falha ao gerar o plano.";
      
      if (err.message?.includes('403') || err.message?.includes('API key')) {
         msg = "Erro de Autenticação: Verifique a configuração da API Key.";
      } else if (err.message?.includes('429')) {
         msg = "Muitas requisições. Aguarde um momento.";
      } else {
         msg = "Erro inesperado na IA. Tente novamente.";
      }
      
      setError(msg);
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setPlan(null);
    setSegment('');
    setUsp('');
    setPainPoints('');
    // Keep user preferences (region, platform, etc)
  };

  const handleExport = () => {
    // Calls the browser's print function which allows "Save as PDF"
    window.print();
  };

  const openAdsLib = (query: string) => {
    const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&q=${encodeURIComponent(query)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&media_type=all`;
    window.open(url, '_blank');
  };

  // Common option style to fix visibility issues
  const optionStyle = "bg-slate-900 text-slate-50";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-emerald-500/30 font-sans relative print:bg-white print:text-black">
      
      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in print:hidden">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                <IconAlert className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Confirmar Geração</h3>
              <p className="text-slate-400 text-sm mb-6">
                Isso consumirá <strong>1 Crédito</strong>. Tem certeza que os dados estão corretos?
              </p>
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={executeGeneration}
                  className="flex-1 py-2 px-4 bg-emerald-500 hover:bg-emerald-600 rounded text-white font-bold transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM MODAL */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in print:hidden">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-600 to-teal-800 opacity-20"></div>
             <button 
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
             >
               ✕
             </button>
             <div className="p-8 relative">
               <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-slate-800 shadow-xl">
                 <IconLock className="w-8 h-8 text-emerald-400" />
               </div>
               <h2 className="text-2xl font-bold text-center text-white mb-2">Seus Créditos Acabaram</h2>
               <p className="text-center text-slate-400 mb-6 text-sm">
                 Você usou sua isca gratuita. Para continuar gerando estratégias profissionais, adquira um pacote.
               </p>
               <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-6 hover:border-emerald-500/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-emerald-400 font-bold flex items-center gap-2">
                       <IconStar className="w-4 h-4 fill-current" /> Premium Pack
                    </span>
                    <span className="text-white font-bold text-lg">R$ 10,00</span>
                  </div>
                  <ul className="space-y-2 mb-0">
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <IconCheck className="w-3 h-3 text-emerald-500" /> 5 Consultas Completas
                    </li>
                  </ul>
               </div>
               <a 
                 href={STRIPE_PAYMENT_LINK === "https://buy.stripe.com/test_5kA039" ? LOCAL_TEST_PAYMENT : STRIPE_PAYMENT_LINK} 
                 className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-lg text-center transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2"
               >
                 <IconCreditCard className="w-5 h-5" />
                 Comprar Créditos Agora
               </a>
             </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <IconMagnet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Lead<span className="text-emerald-400">Fisher</span> <span className="text-xs font-normal text-slate-500 ml-1">Estratégia & Copy</span></span>
          </div>
          <div className="flex items-center gap-3">
             <div 
               onClick={() => setShowPremiumModal(true)}
               className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1 rounded cursor-pointer transition-colors"
               title="Clique para comprar mais"
             >
                <IconZap className={`w-3 h-3 ${credits > 0 ? 'text-yellow-400' : 'text-slate-500'}`} />
                <span className={`text-sm font-bold font-mono ${credits > 0 ? 'text-white' : 'text-red-400'}`}>
                  {credits}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">créditos</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {appState === AppState.IDLE && (
          <div className="max-w-3xl mx-auto mt-4 animate-fade-in">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                Gere Estratégias de Marketing <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Sob Medida (Sem Lero-Lero)</span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Esqueça o genérico. Insira seus diferenciais reais e receba um plano de batalha (Copy, Vídeos, Isca) pronto para executar.
              </p>
            </div>

            <form onSubmit={handleValidation} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
              
              {/* Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 
                 {/* Platform */}
                 <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block flex items-center gap-1">
                      <IconPlatform className="w-3 h-3" /> Plataforma
                    </label>
                    <select 
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-slate-900 text-white text-sm focus:outline-none cursor-pointer border-none"
                    >
                      <option className={optionStyle} value="Meta Ads (Facebook/Instagram)">Meta Ads (Face/Insta)</option>
                      <option className={optionStyle} value="TikTok Ads">TikTok Ads</option>
                      <option className={optionStyle} value="Kwai Business">Kwai Business</option>
                      <option className={optionStyle} value="YouTube Ads">YouTube Ads</option>
                      <option className={optionStyle} value="LinkedIn Ads">LinkedIn Ads</option>
                    </select>
                 </div>

                 {/* Budget */}
                 <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block flex items-center gap-1">
                      <IconMoney className="w-3 h-3" /> Orçamento
                    </label>
                    <select 
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-slate-900 text-white text-sm focus:outline-none cursor-pointer border-none"
                    >
                      <option className={optionStyle} value="Micro-Teste (R$ 6 - R$ 20/dia)">Micro-Teste (R$ 6 - R$ 20/dia)</option>
                      <option className={optionStyle} value="Pequeno (R$ 600 - R$ 1.500/mês)">Pequeno (R$ 600 - R$ 1.500/mês)</option>
                      <option className={optionStyle} value="Médio (R$ 2.000 - R$ 5.000/mês)">Médio (R$ 2.000 - R$ 5.000/mês)</option>
                      <option className={optionStyle} value="Alto (> R$ 5.000/mês)">Alto (&gt; R$ 5.000/mês)</option>
                    </select>
                 </div>

                 {/* Location */}
                 <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cidade / Região Alvo</label>
                      <button 
                        type="button" 
                        onClick={handleGeolocation}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        title="Usar minha localização atual como alvo"
                      >
                        📍 Usar GPS Atual
                      </button>
                    </div>
                    <input 
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Digite a cidade... (Ex: Belo Horizonte, MG)"
                      className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-slate-600 border-b border-transparent focus:border-emerald-500 transition-colors pb-1"
                    />
                 </div>

                 {/* Objective */}
                 <div className="bg-slate-900 p-3 rounded-lg border border-slate-700/50">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 block flex items-center gap-1">
                      <IconTarget className="w-3 h-3" /> Objetivo Principal
                    </label>
                    <select 
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="w-full bg-slate-900 text-white text-sm focus:outline-none cursor-pointer border-none"
                    >
                      <option className={optionStyle} value="Captura de Leads (Cadastro)">Captura de Leads</option>
                      <option className={optionStyle} value="Vendas Diretas (E-commerce)">Vendas Diretas</option>
                      <option className={optionStyle} value="Mensagens (WhatsApp/Direct)">Mensagens (WhatsApp)</option>
                      <option className={optionStyle} value="Reconhecimento de Marca">Branding / Alcance</option>
                    </select>
                 </div>
              </div>

              {/* DEEP DIAGNOSIS SECTION (NEW) */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 mb-6">
                 <h3 className="text-emerald-400 font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                    <IconSearch className="w-4 h-4" /> Diagnóstico Profundo (Obrigatório)
                 </h3>
                 
                 <div className="space-y-4">
                    {/* Nicho */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Qual seu Nicho exato? (Ex: Dentista especializado em Lentes de Resina)</label>
                      <input
                        type="text"
                        placeholder="Seja específico. Não coloque apenas 'Dentista'."
                        className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                        value={segment}
                        onChange={(e) => setSegment(e.target.value)}
                      />
                    </div>

                    {/* USP */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Qual seu Diferencial Único? (O que você tem que o concorrente não tem?)</label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Atendimento 24h, Método sem dor, Garantia de 10 anos, Frete grátis..."
                        className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-emerald-500 transition-colors text-sm resize-none"
                        value={usp}
                        onChange={(e) => setUsp(e.target.value)}
                      />
                    </div>

                    {/* Pain Points */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Qual a Maior Dor/Medo do seu cliente hoje?</label>
                      <textarea
                        rows={2}
                        placeholder="Ex: Medo de ficar artificial, medo de sentir dor, urgência em resolver..."
                        className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded focus:outline-none focus:border-emerald-500 transition-colors text-sm resize-none"
                        value={painPoints}
                        onChange={(e) => setPainPoints(e.target.value)}
                      />
                    </div>
                 </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 transform hover:scale-[1.01]"
              >
                Gerar Estratégia Sob Medida <IconArrowRight className="w-5 h-5" />
              </button>
              
              <div className="flex justify-center mt-4 gap-4">
                 <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-slate-500 text-xs hover:text-white cursor-pointer focus:outline-none"
                 >
                    <option className={optionStyle} value="Português">🇧🇷 Português</option>
                    <option className={optionStyle} value="English">🇺🇸 English</option>
                    <option className={optionStyle} value="Español">🇪🇸 Español</option>
                 </select>
                 <select 
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="bg-transparent text-slate-500 text-xs hover:text-white cursor-pointer focus:outline-none"
                 >
                    <option className={optionStyle} value="Cidade (Local)">🏙️ Apenas a Cidade</option>
                    <option className={optionStyle} value="Bairro (5km)">🏘️ Raio de 5km (Bairro)</option>
                    <option className={optionStyle} value="Estadual">🗺️ Todo o Estado</option>
                    <option className={optionStyle} value="Nacional">🌐 Nacional (País)</option>
                 </select>
              </div>

            </form>
          </div>
        )}

        {appState === AppState.LOADING && (
          <div className="max-w-2xl mx-auto text-center mt-24">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Analisando Diferenciais...</h2>
            <div className="space-y-2 mt-4">
               <p className="text-slate-400 text-sm animate-pulse">Diagnosticiando Dores: <strong>{painPoints.substring(0, 30)}...</strong></p>
               <p className="text-slate-500 text-xs">Cruzando dados com concorrentes em {region}...</p>
               <p className="text-slate-500 text-xs">Desenhando ganchos visuais para {platform}...</p>
            </div>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-2xl mx-auto text-center mt-12">
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl mb-6 inline-block max-w-lg">
              <div className="flex justify-center mb-4">
                 <span className="text-3xl">⚠️</span>
              </div>
              <p className="text-red-400 font-bold mb-2">Erro na Análise</p>
              <p className="text-slate-300 text-sm mb-4">{error}</p>
            </div>
            <br />
            <button onClick={() => setAppState(AppState.IDLE)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600 transition-colors">
              Tentar Novamente
            </button>
          </div>
        )}

        {appState === AppState.SUCCESS && plan && (
          <div className="animate-fade-in-up pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 print:hidden">
              <div>
                <h2 className="text-3xl font-bold text-white">Estratégia: <span className="text-emerald-400">{plan.segment}</span></h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                   <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 flex items-center gap-1"><IconPlatform className="w-3 h-3"/> {platform}</span>
                   <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{region} ({radius})</span>
                   <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{objective}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleExport} 
                  className="text-sm bg-slate-700 text-white hover:bg-slate-600 px-4 py-2 rounded shadow transition-colors flex items-center gap-2 font-medium border border-slate-600"
                >
                   <IconExport className="w-4 h-4" /> Imprimir / Salvar PDF
                </button>
                <button onClick={handleReset} className="text-sm bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 transition-colors font-bold shadow-lg">
                  Nova Pesquisa
                </button>
              </div>
            </div>

            {/* Platform Advice Alert */}
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg mb-8 flex gap-3 items-start print:border-gray-300 print:bg-white print:text-black">
               <div className="p-1 bg-blue-500/20 rounded mt-0.5 print:bg-gray-100 print:border print:border-gray-200">
                 <IconPlatform className="w-5 h-5 text-blue-400 print:text-black" />
               </div>
               <div>
                 <h4 className="text-blue-400 font-bold text-sm mb-1 print:text-black">Estratégia Adaptada para {platform}</h4>
                 <p className="text-slate-300 text-sm print:text-gray-800">{plan.platformStrategy}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:space-y-6">
              
               {/* Step 1: Lead Magnet */}
               <StepCard 
                stepNumber={1} 
                title="Isca Digital (Sua Moeda de Troca)" 
                icon={<IconMagnet className="w-5 h-5 text-emerald-400" />}
                colorClass="text-emerald-400"
              >
                <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 mb-2 print:border-slate-300 print:bg-white print:text-black">
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs text-emerald-500 font-bold uppercase tracking-wide border border-emerald-500/30 px-2 py-0.5 rounded-full print:border-black print:text-black">{plan.leadMagnet.format}</span>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2 print:text-black">{plan.leadMagnet.title}</h3>
                   <p className="text-slate-300 text-sm mb-4 leading-relaxed print:text-gray-700">{plan.leadMagnet.description}</p>
                   
                   <div className="bg-emerald-900/10 border-l-2 border-emerald-500 pl-3 py-1 print:bg-gray-100 print:border-black">
                      <span className="text-xs text-emerald-400 font-bold block print:text-black">Por que funciona?</span>
                      <p className="text-xs text-slate-400 print:text-gray-600">{plan.leadMagnet.whyItWorks}</p>
                   </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 print:border-gray-300">
                   <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1 uppercase tracking-wide print:text-black">
                     <IconTools className="w-3 h-3" /> Ferramentas para Criar:
                   </h4>
                   <div className="flex flex-wrap gap-2">
                     {plan.leadMagnet.creationTools.map((tool, idx) => (
                       <span key={idx} className="text-xs px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-300 print:bg-gray-100 print:text-black print:border-gray-300">
                         {tool}
                       </span>
                     ))}
                   </div>
                </div>
              </StepCard>

              {/* Step 2: Creative Prompts */}
              <StepCard 
                stepNumber={2} 
                title="Fábrica de Criativos (Prompts)" 
                icon={<IconVideo className="w-5 h-5 text-purple-400" />}
                colorClass="text-purple-400"
              >
                <div className="space-y-4">
                  
                  {/* Video Prompt */}
                  <div className="bg-slate-900 rounded p-3 border border-slate-700 print:bg-white print:border-slate-300">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                         <IconVideo className="w-4 h-4 text-purple-400 print:text-black" />
                         <span className="text-sm font-bold text-white print:text-black">Prompt para Vídeo (IA)</span>
                      </div>
                      <div className="print:hidden"><CopyButton text={plan.creativePrompts.videoPrompt} /></div>
                    </div>
                    <p className="text-xs text-slate-400 font-mono line-clamp-4 hover:line-clamp-none transition-all cursor-pointer bg-black/30 p-2 rounded print:text-black print:bg-gray-100 print:line-clamp-none">
                      {plan.creativePrompts.videoPrompt}
                    </p>
                    <span className="text-[10px] text-slate-600 mt-1 block">Use em: Veo, Sora, Runway, Kling.</span>
                  </div>

                  {/* Image Prompt */}
                  <div className="bg-slate-900 rounded p-3 border border-slate-700 print:bg-white print:border-slate-300">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                         <IconImage className="w-4 h-4 text-pink-400 print:text-black" />
                         <span className="text-sm font-bold text-white print:text-black">Prompt para Imagem (IA)</span>
                      </div>
                      <div className="print:hidden"><CopyButton text={plan.creativePrompts.imagePrompt} /></div>
                    </div>
                    <p className="text-xs text-slate-400 font-mono line-clamp-4 hover:line-clamp-none transition-all cursor-pointer bg-black/30 p-2 rounded print:text-black print:bg-gray-100 print:line-clamp-none">
                      {plan.creativePrompts.imagePrompt}
                    </p>
                    <span className="text-[10px] text-slate-600 mt-1 block">Use em: Midjourney, Dall-E 3, Flux.</span>
                  </div>

                   {/* Thumbnail Text */}
                   <div className="bg-slate-900 rounded p-3 border border-slate-700 flex items-center justify-between print:bg-white print:border-slate-300">
                     <div>
                       <span className="text-xs text-orange-400 font-bold block print:text-black">Texto para Capa/Thumbnail</span>
                       <p className="text-white font-bold text-sm print:text-black">"{plan.creativePrompts.thumbnailText}"</p>
                     </div>
                     <div className="print:hidden"><CopyButton text={plan.creativePrompts.thumbnailText} /></div>
                   </div>

                </div>
              </StepCard>

              {/* Step 3: Ad Copy with A/B Testing */}
              <StepCard 
                stepNumber={3} 
                title="Copy do Anúncio (Teste A/B)" 
                icon={<IconMessage className="w-5 h-5 text-blue-400" />}
                colorClass="text-blue-400"
              >
                <div className="space-y-4">
                  {plan.adCopy.variations.map((variant, idx) => (
                    <div key={idx} className="bg-slate-900 rounded-lg p-4 border border-slate-700 font-mono text-sm print:bg-white print:border-slate-300">
                       <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2 print:border-slate-200">
                          <span className="text-xs text-blue-400 uppercase font-bold tracking-wide print:text-blue-700">Variação {idx + 1}</span>
                          <div className="print:hidden"><CopyButton text={`${variant.headline}\n\n${variant.body}`} /></div>
                       </div>
                       
                       <div className="mb-3">
                          <span className="text-[10px] text-slate-500 block mb-1">Headline</span>
                          <p className="text-white font-bold print:text-black">{variant.headline}</p>
                       </div>
                       
                       <div>
                          <span className="text-[10px] text-slate-500 block mb-1">Texto</span>
                          <p className="text-slate-300 whitespace-pre-wrap print:text-gray-800">{variant.body}</p>
                       </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center bg-blue-900/20 p-3 rounded border border-blue-500/20 print:bg-gray-100 print:border-gray-300">
                     <span className="text-xs text-blue-300 uppercase font-bold tracking-wide print:text-black">Botão (CTA)</span>
                     <span className="px-3 py-1 bg-slate-800 text-white rounded text-xs border border-slate-600 print:bg-white print:text-black print:border-black">{plan.adCopy.cta}</span>
                  </div>
                </div>
              </StepCard>
              
              {/* Step 4: Audience (Context) */}
              <StepCard 
                stepNumber={4} 
                title="Onde Pescar (Público)" 
                icon={<IconTarget className="w-5 h-5 text-amber-400" />}
                colorClass="text-amber-400"
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2 text-sm print:text-black">Segmentação (Interesses)</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.audienceStrategy.interests.map((int, idx) => (
                        <span key={idx} className="px-2 py-1 bg-amber-900/20 border border-amber-500/20 text-amber-300 rounded text-xs print:bg-gray-100 print:text-black print:border-black">{int}</span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-white mb-2 text-sm print:text-black">Comportamentos</h4>
                        <div className="flex flex-wrap gap-1">
                            {plan.audienceStrategy.behaviors.slice(0, 3).map((beh, idx) => (
                                <span key={idx} className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded print:text-black print:bg-gray-100">{beh}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-2 text-sm print:text-black">Lookalike</h4>
                        <p className="text-sm text-slate-400 print:text-gray-700">{plan.audienceStrategy.lookalikeSource}</p>
                    </div>
                  </div>
                </div>
              </StepCard>

              {/* Step 5: Competitors - Updated with Spy Links */}
              <StepCard 
                stepNumber={5} 
                title="Espionar Concorrentes (Ads Lib)" 
                icon={<IconSearch className="w-5 h-5 text-sky-400" />}
                colorClass="text-sky-400"
              >
                <p className="text-sm text-slate-400 mb-4 print:text-gray-700">Clique para ver os anúncios ativos na Meta Ads Library:</p>
                
                <div className="space-y-4">
                  {/* Competidores Diretos */}
                  <div className="grid gap-2">
                    {plan.competitorAnalysis.bigCompetitors.map((comp, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => openAdsLib(comp)} 
                        className="flex items-center justify-between w-full p-3 bg-slate-900 border border-slate-700 hover:border-sky-500 hover:bg-slate-800 rounded-lg text-left transition-all group print:bg-white print:border-slate-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse print:hidden"></span>
                          <span className="text-slate-200 font-medium group-hover:text-white print:text-black">{comp}</span>
                        </div>
                        <span className="text-xs bg-sky-500/10 text-sky-400 px-2 py-1 rounded border border-sky-500/20 flex items-center gap-1 group-hover:bg-sky-500 group-hover:text-white transition-colors print:hidden">
                          Ver Ads <IconArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Palavras-Chave */}
                  <div>
                     <h4 className="text-xs uppercase text-slate-500 font-bold mb-2 tracking-wider">Palavras-chave</h4>
                     <div className="flex flex-wrap gap-2">
                        {plan.competitorAnalysis.searchKeywords.map((kw, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => openAdsLib(kw)} 
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 hover:border-sky-400 text-sm text-slate-300 hover:text-white transition-all flex items-center gap-2 print:bg-white print:text-black print:border-black"
                          >
                             <IconSearch className="w-3 h-3 text-slate-500" /> {kw}
                          </button>
                        ))}
                     </div>
                  </div>
                </div>
              </StepCard>

              {/* Step 6: Automation Flow */}
              <StepCard 
                stepNumber={6} 
                title="Automação da Captura" 
                icon={<IconBot className="w-5 h-5 text-pink-400" />}
                colorClass="text-pink-400"
              >
                <div className="space-y-4">
                   <div className="bg-slate-900/80 p-4 rounded-lg border-l-2 border-pink-500 print:bg-white print:border-pink-300">
                      <h4 className="text-sm font-bold text-white mb-3 print:text-black">Qualificação (Chatbot)</h4>
                      <div className="space-y-3">
                         {plan.agentFlow.qualificationQuestions.map((q, idx) => (
                           <div key={idx} className="flex gap-2">
                              <span className="text-pink-500 font-mono text-xs pt-1">{idx + 1}.</span>
                              <p className="text-sm text-slate-300 print:text-gray-700">{q}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="p-3 bg-emerald-900/10 border border-emerald-500/20 rounded print:bg-gray-100 print:border-black">
                       <span className="text-xs text-emerald-400 font-bold block mb-1 print:text-black">Entrega da Isca (Sucesso)</span>
                       <p className="text-xs text-slate-400 leading-tight print:text-gray-700">"{plan.agentFlow.successMessage}"</p>
                   </div>
                </div>
              </StepCard>

              {/* Step 7: Implementation Guide (NEW) */}
              <StepCard 
                stepNumber={7} 
                title="Guia de Implementação (Passo a Passo)" 
                icon={<IconList className="w-5 h-5 text-teal-400" />}
                colorClass="text-teal-400"
              >
                <div className="space-y-6">
                   
                   {/* Budget Instructions */}
                   <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 print:bg-white print:border-slate-300">
                     <h4 className="flex items-center gap-2 font-bold text-teal-400 mb-2 print:text-black">
                       <IconMoney className="w-4 h-4" /> Configuração de Orçamento
                     </h4>
                     <p className="text-slate-300 text-sm leading-relaxed print:text-gray-800">
                       {plan.implementationGuide.budgetSetup}
                     </p>
                   </div>

                   {/* Platform Walkthrough */}
                   <div className="space-y-3">
                      <h4 className="font-bold text-white text-sm uppercase tracking-wide print:text-black">Como Criar a Campanha ({platform}):</h4>
                      {plan.implementationGuide.platformWalkthrough.map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                           <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-900/50 border border-teal-500/30 text-teal-400 flex items-center justify-center text-xs font-bold print:bg-gray-100 print:text-black print:border-gray-400">
                             {idx + 1}
                           </span>
                           <p className="text-slate-300 text-sm pt-0.5 print:text-gray-800">{step}</p>
                        </div>
                      ))}
                   </div>

                   {/* Best Practices */}
                   <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg print:bg-gray-50 print:border-gray-300">
                      <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2 print:text-red-700">
                        ⚠️ Evite estes erros:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.implementationGuide.bestPractices.map((tip, idx) => (
                          <li key={idx} className="text-slate-300 text-xs print:text-gray-800">{tip}</li>
                        ))}
                      </ul>
                   </div>

                </div>
              </StepCard>

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-8 text-center text-slate-600 text-sm print:hidden">
        <p>LeadFisher MVP &copy; {new Date().getFullYear()} - Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
