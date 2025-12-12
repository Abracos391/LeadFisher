import React, { useState, useEffect } from 'react';
import { generateMarketingPlan } from './services/geminiService';
import { MarketingPlan, AppState } from './types';
import { IconSearch, IconTarget, IconMessage, IconBot, IconArrowRight, IconCopy, IconCheck, IconMagnet, IconVideo, IconImage, IconZap } from './components/Icons';
import StepCard from './components/StepCard';

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy} 
      className="p-1.5 text-slate-400 hover:text-white transition-colors rounded hover:bg-slate-700"
      title="Copiar texto"
    >
      {copied ? <IconCheck className="w-4 h-4 text-emerald-400" /> : <IconCopy className="w-4 h-4" />}
    </button>
  );
};

const App: React.FC = () => {
  const [segment, setSegment] = useState('');
  const [language, setLanguage] = useState('Português');
  const [region, setRegion] = useState('Brasil');
  const [radius, setRadius] = useState('Nacional (País Inteiro)');
  
  // API Key Management
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [plan, setPlan] = useState<MarketingPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setCustomApiKey(savedKey);
  }, []);

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          setRegion(`GPS: ${coords}`);
        },
        () => {
          alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
        }
      );
    } else {
      alert("Geolocalização não suportada neste navegador.");
    }
  };

  const getEffectiveApiKey = () => {
    if (customApiKey.trim()) return customApiKey.trim();
    // Use process.env.API_KEY if available (injected by Vite)
    return process.env.API_KEY || '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!segment.trim()) return;

    const apiKey = getEffectiveApiKey();

    if (!apiKey) {
      setShowApiKeyInput(true);
      setError("Chave API não encontrada. Por favor, insira sua chave Gemini API abaixo.");
      setAppState(AppState.ERROR);
      return;
    }

    setAppState(AppState.LOADING);
    setError(null);
    try {
      // Pass the specific apiKey to the service
      const result = await generateMarketingPlan(segment, language, region, radius, apiKey);
      setPlan(result);
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      let msg = "Falha ao gerar o plano.";
      
      // Smart error handling
      if (err.message?.includes('403') || err.message?.includes('API key') || err.message?.includes('invalid')) {
         msg = "Erro de Autenticação: A chave API é inválida ou expirou.";
         setShowApiKeyInput(true); // Automatically show input on auth error
      } else if (err.message?.includes('429')) {
         msg = "Muitas requisições (Quota Excedida). Aguarde um momento.";
      } else {
         msg = "Erro inesperado na IA. Tente novamente.";
      }
      
      setError(msg);
      setAppState(AppState.ERROR);
    }
  };

  const handleSaveApiKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    setCustomApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setPlan(null);
    setSegment('');
  };

  const openAdsLib = (query: string) => {
    const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&q=${encodeURIComponent(query)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&media_type=all`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-emerald-500/30 font-sans">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <IconMagnet className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Lead<span className="text-emerald-400">Fisher</span> <span className="text-xs font-normal text-slate-500 ml-1">Estratégia & Copy</span></span>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowApiKeyInput(!showApiKeyInput)}
               className={`text-xs px-2 py-1 rounded border ${customApiKey ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700 text-slate-500'} hover:text-white transition-colors`}
             >
               {customApiKey ? 'API Key Configurada' : 'Configurar API Key'}
             </button>
             <div className="text-xs font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded">
               v1.5.0
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* API Key Input Section (Conditional) */}
        {showApiKeyInput && (
          <div className="max-w-2xl mx-auto mb-8 bg-slate-800 p-4 rounded-lg border border-slate-700 animate-fade-in shadow-xl">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <IconZap className="w-4 h-4 text-yellow-400" /> Configuração da API (Gemini)
            </h3>
            <p className="text-slate-400 text-sm mb-3">
              Para garantir o funcionamento, insira sua chave da Google AI Studio. Ela será salva apenas no seu navegador.
            </p>
            <input 
              type="password" 
              placeholder="Cole sua API Key aqui (começa com AIza...)"
              value={customApiKey}
              onChange={handleSaveApiKey}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-emerald-500 focus:outline-none font-mono text-sm"
            />
            <div className="flex justify-end mt-2">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:underline">
                Obter chave gratuitamente &rarr;
              </a>
            </div>
          </div>
        )}
        
        {appState === AppState.IDLE && (
          <div className="max-w-2xl mx-auto text-center mt-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Gere Estratégias de Marketing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Para Captar Leads Reais</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Não vendemos listas. Nós criamos o <strong>plano completo</strong> (Copy, Criativos, Público e Isca Digital) para você rodar anúncios profissionais e atrair clientes qualificados.
            </p>

            <form onSubmit={handleSubmit} className="relative group">
              
              {/* Controls Row - Z-10 added here to ensure clickable above glow */}
              <div className="relative z-10 flex flex-col md:flex-row gap-2 mb-2">
                 <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-slate-800 text-white text-sm rounded border border-slate-700 px-3 py-2 focus:outline-none focus:border-emerald-500 md:w-1/4 cursor-pointer hover:border-slate-500"
                 >
                    <option value="Português">Português</option>
                    <option value="English">English</option>
                    <option value="Español">Español</option>
                    <option value="Français">Français</option>
                 </select>

                 <div className="flex bg-slate-800 rounded border border-slate-700 focus-within:border-emerald-500 md:w-1/2 overflow-hidden">
                    <input 
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Localização (Ex: São Paulo, Brasil)"
                      className="bg-transparent text-white text-sm px-3 py-2 focus:outline-none w-full placeholder-slate-500"
                    />
                    <button 
                      type="button" 
                      onClick={handleGeolocation}
                      title="Usar minha localização atual"
                      className="px-3 text-slate-400 hover:text-emerald-400 border-l border-slate-700 hover:bg-slate-700/50 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      📍
                    </button>
                 </div>

                 <select 
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="bg-slate-800 text-white text-sm rounded border border-slate-700 px-3 py-2 focus:outline-none focus:border-emerald-500 md:w-1/4 cursor-pointer hover:border-slate-500"
                 >
                    <option value="Nacional (País Inteiro)">Nacional</option>
                    <option value="Estadual">Estadual</option>
                    <option value="Cidade (Local)">Cidade (Local)</option>
                    <option value="5km (Bairro)">5km (Bairro)</option>
                    <option value="1km (Hiper-local)">1km (Hiper-local)</option>
                 </select>
              </div>

              {/* Main Search */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-slate-800 rounded-lg p-2 border border-slate-700 shadow-2xl z-0">
                <IconSearch className="w-6 h-6 text-slate-400 ml-3" />
                <input
                  type="text"
                  placeholder="Qual seu nicho? (Ex: Energia Solar, Estética, Pizzaria)"
                  className="w-full bg-transparent border-none text-white px-4 py-3 focus:outline-none text-lg placeholder-slate-500"
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!segment.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-md font-semibold transition-all flex items-center gap-2 cursor-pointer"
                >
                  Criar Isca <IconArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {appState === AppState.LOADING && (
          <div className="max-w-2xl mx-auto text-center mt-24">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Preparando a Isca...</h2>
            <p className="text-slate-400 animate-pulse">
              Criando estratégia para <strong>{region}</strong> ({radius}) em <strong>{language}</strong>...
            </p>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-2xl mx-auto text-center mt-12">
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl mb-6 inline-block max-w-lg">
              <div className="flex justify-center mb-4">
                 <span className="text-3xl">⚠️</span>
              </div>
              <p className="text-red-400 font-bold mb-2">Atenção</p>
              <p className="text-slate-300 text-sm mb-4">{error}</p>
            </div>
            <br />
            <button onClick={handleReset} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-600 transition-colors">
              Voltar
            </button>
          </div>
        )}

        {appState === AppState.SUCCESS && plan && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white">Estratégia: <span className="text-emerald-400">{plan.segment}</span></h2>
                <div className="flex gap-2 mt-2">
                   <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{region}</span>
                   <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{radius}</span>
                   <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">{language}</span>
                </div>
              </div>
              <button onClick={handleReset} className="text-sm text-slate-500 hover:text-white px-4 py-2 border border-slate-700 rounded hover:bg-slate-800 transition-colors">
                Nova Pesquisa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
               {/* Step 1: Lead Magnet */}
               <StepCard 
                stepNumber={1} 
                title="Isca Digital (Sua Moeda de Troca)" 
                icon={<IconMagnet className="w-5 h-5 text-emerald-400" />}
                colorClass="text-emerald-400"
              >
                <div className="bg-slate-900 rounded-lg p-5 border border-slate-700 mb-2">
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs text-emerald-500 font-bold uppercase tracking-wide border border-emerald-500/30 px-2 py-0.5 rounded-full">{plan.leadMagnet.format}</span>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">{plan.leadMagnet.title}</h3>
                   <p className="text-slate-300 text-sm mb-4 leading-relaxed">{plan.leadMagnet.description}</p>
                   
                   <div className="bg-emerald-900/10 border-l-2 border-emerald-500 pl-3 py-1">
                      <span className="text-xs text-emerald-400 font-bold block">Por que funciona?</span>
                      <p className="text-xs text-slate-400">{plan.leadMagnet.whyItWorks}</p>
                   </div>
                </div>
                <p className="text-xs text-slate-500 italic text-center">Ofereça isso GRATUITAMENTE em troca do Email ou WhatsApp.</p>
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
                  <div className="bg-slate-900 rounded p-3 border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                         <IconVideo className="w-4 h-4 text-purple-400" />
                         <span className="text-sm font-bold text-white">Prompt para Vídeo (IA)</span>
                      </div>
                      <CopyButton text={plan.creativePrompts.videoPrompt} />
                    </div>
                    <p className="text-xs text-slate-400 font-mono line-clamp-4 hover:line-clamp-none transition-all cursor-pointer bg-black/30 p-2 rounded">
                      {plan.creativePrompts.videoPrompt}
                    </p>
                    <span className="text-[10px] text-slate-600 mt-1 block">Use em: Veo, Sora, Runway, Kling.</span>
                  </div>

                  {/* Image Prompt */}
                  <div className="bg-slate-900 rounded p-3 border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                         <IconImage className="w-4 h-4 text-pink-400" />
                         <span className="text-sm font-bold text-white">Prompt para Imagem (IA)</span>
                      </div>
                      <CopyButton text={plan.creativePrompts.imagePrompt} />
                    </div>
                    <p className="text-xs text-slate-400 font-mono line-clamp-4 hover:line-clamp-none transition-all cursor-pointer bg-black/30 p-2 rounded">
                      {plan.creativePrompts.imagePrompt}
                    </p>
                    <span className="text-[10px] text-slate-600 mt-1 block">Use em: Midjourney, Dall-E 3, Flux.</span>
                  </div>

                   {/* Thumbnail Text */}
                   <div className="bg-slate-900 rounded p-3 border border-slate-700 flex items-center justify-between">
                     <div>
                       <span className="text-xs text-orange-400 font-bold block">Texto para Capa/Thumbnail</span>
                       <p className="text-white font-bold text-sm">"{plan.creativePrompts.thumbnailText}"</p>
                     </div>
                     <CopyButton text={plan.creativePrompts.thumbnailText} />
                   </div>

                </div>
              </StepCard>

              {/* Step 3: Ad Copy */}
              <StepCard 
                stepNumber={3} 
                title="Copy do Anúncio (Texto)" 
                icon={<IconMessage className="w-5 h-5 text-blue-400" />}
                colorClass="text-blue-400"
              >
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 font-mono text-sm space-y-4">
                   <div>
                      <span className="text-xs text-blue-400 uppercase font-bold tracking-wide">Headline</span>
                      <div className="flex justify-between items-start mt-1">
                        <p className="text-white font-bold">{plan.adCopy.headline}</p>
                        <CopyButton text={plan.adCopy.headline} />
                      </div>
                   </div>
                   
                   <div className="border-t border-slate-800 pt-3">
                      <span className="text-xs text-blue-400 uppercase font-bold tracking-wide">Legenda</span>
                      <div className="relative mt-1 group">
                         <p className="text-slate-300 whitespace-pre-wrap">{plan.adCopy.body}</p>
                         <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={plan.adCopy.body} />
                         </div>
                      </div>
                   </div>

                   <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                      <span className="text-xs text-blue-400 uppercase font-bold tracking-wide">Botão (CTA)</span>
                      <span className="px-3 py-1 bg-slate-800 text-white rounded text-xs border border-slate-600">{plan.adCopy.cta}</span>
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
                    <h4 className="font-semibold text-white mb-2 text-sm">Segmentação (Interesses)</h4>
                    <div className="flex flex-wrap gap-2">
                      {plan.audienceStrategy.interests.map((int, idx) => (
                        <span key={idx} className="px-2 py-1 bg-amber-900/20 border border-amber-500/20 text-amber-300 rounded text-xs">{int}</span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-white mb-2 text-sm">Comportamentos</h4>
                        <div className="flex flex-wrap gap-1">
                            {plan.audienceStrategy.behaviors.slice(0, 3).map((beh, idx) => (
                                <span key={idx} className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">{beh}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-2 text-sm">Lookalike</h4>
                        <p className="text-sm text-slate-400">{plan.audienceStrategy.lookalikeSource}</p>
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
                <p className="text-sm text-slate-400 mb-4">Clique para ver os anúncios ativos na Meta Ads Library:</p>
                
                <div className="space-y-4">
                  {/* Competidores Diretos */}
                  <div className="grid gap-2">
                    {plan.competitorAnalysis.bigCompetitors.map((comp, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => openAdsLib(comp)} 
                        className="flex items-center justify-between w-full p-3 bg-slate-900 border border-slate-700 hover:border-sky-500 hover:bg-slate-800 rounded-lg text-left transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-slate-200 font-medium group-hover:text-white">{comp}</span>
                        </div>
                        <span className="text-xs bg-sky-500/10 text-sky-400 px-2 py-1 rounded border border-sky-500/20 flex items-center gap-1 group-hover:bg-sky-500 group-hover:text-white transition-colors">
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
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 hover:border-sky-400 text-sm text-slate-300 hover:text-white transition-all flex items-center gap-2"
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
                   <div className="bg-slate-900/80 p-4 rounded-lg border-l-2 border-pink-500">
                      <h4 className="text-sm font-bold text-white mb-3">Qualificação (Chatbot)</h4>
                      <div className="space-y-3">
                         {plan.agentFlow.qualificationQuestions.map((q, idx) => (
                           <div key={idx} className="flex gap-2">
                              <span className="text-pink-500 font-mono text-xs pt-1">{idx + 1}.</span>
                              <p className="text-sm text-slate-300">{q}</p>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="p-3 bg-emerald-900/10 border border-emerald-500/20 rounded">
                       <span className="text-xs text-emerald-400 font-bold block mb-1">Entrega da Isca (Sucesso)</span>
                       <p className="text-xs text-slate-400 leading-tight">"{plan.agentFlow.successMessage}"</p>
                   </div>
                </div>
              </StepCard>

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-8 text-center text-slate-600 text-sm">
        <p>LeadFisher MVP &copy; {new Date().getFullYear()} - Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
