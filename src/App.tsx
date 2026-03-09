/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Coins, 
  Gem, 
  MessageCircle, 
  X, 
  Send, 
  Info, 
  Trophy,
  ShoppingBag,
  Clock,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';
import { CROPS, type Crop, type Plot, type CropType, WIN_GEMS_THRESHOLD, GEM_PRICE } from './constants';
import { getFarmingTips, chatWithAssistant } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  // Game State
  const [coins, setCoins] = useState(100);
  const [gems, setGems] = useState(0);
  const [plots, setPlots] = useState<Plot[]>(
    Array.from({ length: 9 }, (_, i) => ({ id: i, crop: null, plantedAt: null, isReady: false }))
  );
  const [selectedSeed, setSelectedSeed] = useState<CropType | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  
  // UI State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Howdy, partner! I'm Barnaby. Ready to grow some gems?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTips, setActiveTips] = useState<string | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Game Loop: Check for ready crops
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPlots(prevPlots => 
        prevPlots.map(plot => {
          if (plot.crop && plot.plantedAt && !plot.isReady) {
            const elapsed = (now - plot.plantedAt) / 1000;
            if (elapsed >= plot.crop.growthTime) {
              return { ...plot, isReady: true };
            }
          }
          return plot;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const plantCrop = (plotId: number) => {
    if (!selectedSeed) return;
    const crop = CROPS[selectedSeed];
    if (coins < crop.cost) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "You don't have enough coins for that seed, partner!" }]);
      return;
    }

    setPlots(prev => prev.map(p => 
      p.id === plotId ? { ...p, crop, plantedAt: Date.now(), isReady: false } : p
    ));
    setCoins(prev => prev - crop.cost);
  };

  const harvestCrop = (plotId: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.isReady || !plot.crop) return;

    setCoins(prev => prev + plot.crop!.revenue);
    if (plot.crop.gemYield) {
      setGems(prev => prev + plot.crop!.gemYield!);
    }
    
    setPlots(prev => prev.map(p => 
      p.id === plotId ? { ...p, crop: null, plantedAt: null, isReady: false } : p
    ));

    // Check win condition
    if (gems + (plot.crop.gemYield || 0) >= WIN_GEMS_THRESHOLD) {
      setShowWinModal(true);
    }
  };

  const buyGem = () => {
    if (coins >= GEM_PRICE) {
      setCoins(prev => prev - GEM_PRICE);
      setGems(prev => {
        const newGems = prev + 1;
        if (newGems >= WIN_GEMS_THRESHOLD) setShowWinModal(true);
        return newGems;
      });
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    const response = await chatWithAssistant(userMsg, []);
    setChatMessages(prev => [...prev, { role: 'assistant', text: response || "I'm lost in the fields..." }]);
    setIsChatLoading(false);
  };

  const fetchTips = async (cropName: string) => {
    setIsLoadingTips(true);
    setActiveTips(null);
    const tips = await getFarmingTips(cropName);
    setActiveTips(tips || "No tips found.");
    setIsLoadingTips(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-black/5 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Sprout size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Gem Harvest</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
            <Coins size={18} className="text-amber-600" />
            <span className="font-mono font-bold text-amber-900">{coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
            <Gem size={18} className="text-purple-600" />
            <span className="font-mono font-bold text-purple-900">{gems}/{WIN_GEMS_THRESHOLD}</span>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shop & Seeds */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag size={20} className="text-emerald-600" />
              <h2 className="text-lg font-bold">Seed Shop</h2>
            </div>
            
            <div className="space-y-3">
              {(Object.values(CROPS) as Crop[]).map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedSeed(crop.type)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group",
                    selectedSeed === crop.type 
                      ? "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20" 
                      : "bg-white border-black/5 hover:border-emerald-200 hover:bg-emerald-50/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm", crop.color)}>
                      {crop.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{crop.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{crop.growthTime}s</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-amber-600">-{crop.cost}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cost</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-purple-900 text-white rounded-3xl p-6 shadow-xl shadow-purple-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Gem size={80} />
            </div>
            <h3 className="text-lg font-bold mb-2">Buy Victory Gem</h3>
            <p className="text-purple-200 text-sm mb-6">Short on time? Buy a gem directly to reach the goal faster.</p>
            <button 
              onClick={buyGem}
              disabled={coins < GEM_PRICE}
              className="w-full bg-white text-purple-900 font-bold py-3 rounded-xl hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Coins size={18} />
              <span>{GEM_PRICE.toLocaleString()} Coins</span>
            </button>
          </div>
        </div>

        {/* Middle Column: Farm Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#8B5E3C] rounded-[40px] p-8 shadow-2xl border-b-8 border-[#6D472B]">
            <div className="grid grid-cols-3 gap-4 aspect-square">
              {plots.map((plot) => (
                <div 
                  key={plot.id}
                  onClick={() => {
                    if (plot.isReady) harvestCrop(plot.id);
                    else if (!plot.crop) plantCrop(plot.id);
                  }}
                  className={cn(
                    "relative rounded-3xl cursor-pointer transition-all duration-300 flex items-center justify-center overflow-hidden",
                    !plot.crop ? "bg-[#7A5235] hover:bg-[#966542] border-2 border-dashed border-white/10" : "bg-[#6D472B]"
                  )}
                >
                  {plot.crop ? (
                    <div className="flex flex-col items-center gap-2">
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ 
                          scale: plot.isReady ? [1, 1.1, 1] : 1,
                          opacity: 1 
                        }}
                        transition={{ 
                          scale: plot.isReady ? { repeat: Infinity, duration: 1.5 } : { duration: 0.5 }
                        }}
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg",
                          plot.isReady ? plot.crop.color : "bg-gray-400/20 grayscale"
                        )}
                      >
                        {plot.crop.icon}
                      </motion.div>
                      
                      {!plot.isReady && (
                        <div className="w-16 h-1.5 bg-black/20 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: plot.crop.growthTime, ease: "linear" }}
                            className="h-full bg-emerald-400"
                          />
                        </div>
                      )}
                      
                      {plot.isReady && (
                        <motion.div 
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="absolute inset-0 bg-white/10 backdrop-blur-[2px] flex items-center justify-center"
                        >
                          <div className="bg-white text-emerald-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <ChevronRight size={12} />
                            Harvest
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-white/20 group-hover:text-white/40 transition-colors">
                      <Sprout size={32} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Tips Section */}
          <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info size={20} className="text-blue-500" />
                <h3 className="font-bold">Farming Knowledge</h3>
              </div>
              {selectedSeed && (
                <button 
                  onClick={() => fetchTips(CROPS[selectedSeed].name)}
                  disabled={isLoadingTips}
                  className="text-xs font-bold text-blue-600 hover:underline disabled:opacity-50"
                >
                  {isLoadingTips ? 'Researching...' : `Get tips for ${CROPS[selectedSeed].name}`}
                </button>
              )}
            </div>
            
            <div className="min-h-[80px] flex items-center justify-center text-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              {activeTips ? (
                <div className="text-sm text-blue-900 text-left w-full">
                  <Markdown>{activeTips}</Markdown>
                </div>
              ) : (
                <p className="text-sm text-blue-400 italic">
                  {selectedSeed 
                    ? `Click above to learn real-world facts about ${CROPS[selectedSeed].name}!` 
                    : "Select a seed in the shop to unlock farming knowledge."}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-200 flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-emerald-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                    👨‍🌾
                  </div>
                  <div>
                    <h3 className="font-bold">Barnaby</h3>
                    <p className="text-xs text-emerald-100">AI Farming Assistant</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-emerald-600 text-white rounded-tr-none" 
                        : "bg-gray-100 text-gray-900 rounded-tl-none"
                    )}>
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex gap-1 p-4 bg-gray-100 rounded-2xl w-16 items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 border-t border-black/5">
                <div className="flex gap-2">
                  <input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Barnaby anything..."
                    className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Win Modal */}
      <AnimatePresence>
        {showWinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-emerald-900/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative bg-white rounded-[40px] p-12 max-w-lg w-full text-center shadow-2xl"
            >
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl">
                🏆
              </div>
              <h2 className="text-3xl font-black mb-4">You Won!</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Congratulations, Master Farmer! You've successfully harvested {WIN_GEMS_THRESHOLD} gems and proven your skills. The kingdom is in awe of your emerald thumb.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-colors shadow-xl shadow-emerald-200"
              >
                Play Again
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
