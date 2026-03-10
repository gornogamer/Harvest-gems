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
  ChevronRight,
  Wallet,
  Gift,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Pickaxe,
  Mountain,
  Lock,
  PlusCircle,
  Hammer,
  Package,
  Sparkles,
  Wand2,
  Store,
  Zap,
  Wrench,
  Calendar,
  Menu
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';
import { 
  CROPS, 
  type Crop, 
  type Plot, 
  type CropType, 
  WIN_GEMS_THRESHOLD, 
  GEM_PRICE, 
  TOKEN_EXCHANGE_RATE, 
  DAILY_REWARD_COINS, 
  type Quest,
  MINING_NODES,
  type MiningNode,
  type ResourceType,
  LAND_EXPANSION_COSTS,
  INITIAL_PLOTS,
  MAX_PLOTS,
  CRAFTING_RECIPES,
  type CraftingRecipe,
  type InventoryItem,
  SHOP_ITEMS,
  type ShopItem,
  DAILY_LOGIN_REWARDS,
  type DailyReward,
  MARKET_PRICES
} from './constants';
import { getFarmingTips, chatWithAssistant } from './services/geminiService';

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

// Sound Service using Web Audio API
const playSound = (type: 'plant' | 'harvest' | 'mine' | 'buy' | 'reward' | 'click' | 'craft' | 'sell' | 'expand' | 'nav') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  
  switch (type) {
    case 'plant':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'harvest':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'mine':
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'buy':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'reward':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    case 'craft':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.1);
      osc.frequency.linearRampToValueAtTime(300, now + 0.2);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'sell':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'expand':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    case 'nav':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.1);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
  }
};

export default function App() {
  // Game State
  const [coins, setCoins] = useState(500); // Start with more for P2E feel
  const [gems, setGems] = useState(0);
  const [tokens, setTokens] = useState(0); // HTK Tokens (Play to Earn)
  const [plots, setPlots] = useState<Plot[]>(
    Array.from({ length: MAX_PLOTS }, (_, i) => ({ 
      id: i, 
      crop: null, 
      plantedAt: null, 
      isReady: false,
      isLocked: i >= INITIAL_PLOTS
    }))
  );
  const [selectedSeed, setSelectedSeed] = useState<CropType | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  
  // P2E State
  const [quests, setQuests] = useState<Quest[]>([
    { id: '1', description: 'Harvest 10 Wheat', target: 10, current: 0, reward: 200, type: 'harvest', completed: false },
    { id: '2', description: 'Earn 1000 Coins', target: 1000, current: 0, reward: 500, type: 'coins', completed: false },
    { id: '3', description: 'Collect 5 Gems', target: 5, current: 0, reward: 1000, type: 'gems', completed: false },
  ]);
  const [lastDailyClaim, setLastDailyClaim] = useState<number | null>(null);

  // Mining State
  const [miningNodes, setMiningNodes] = useState<(MiningNode & { currentHealth: number })[]>(
    Object.values(MINING_NODES).map(node => ({ ...node, currentHealth: node.health }))
  );

  // Crafting & Inventory State
  const [inventory, setInventory] = useState<Record<string, number>>({
    wheat: 0,
    corn: 0,
    carrot: 0,
    strawberry: 0,
    'gem-flower': 0,
    gem: 0
  });
  const [craftedItems, setCraftedItems] = useState<Record<string, number>>({});
  const [miningPower, setMiningPower] = useState(1);
  const [growthMultiplier, setGrowthMultiplier] = useState(1);
  const [activeTab, setActiveTab] = useState<'farm' | 'mine' | 'craft' | 'shop' | 'rewards' | 'wallet' | 'market'>('farm');
  const [streak, setStreak] = useState(1);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);

  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Welcome to the Gem Economy! I'm Barnaby. Here, your hard work turns into real Harvest Tokens (HTK). Ready to earn?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTips, setActiveTips] = useState<string | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Game Loop: Check for ready crops
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedLastClaim = localStorage.getItem('lastClaimDate');
    const savedStreak = localStorage.getItem('streak');

    if (savedLastClaim) {
      const lastDate = new Date(savedLastClaim);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        setHasClaimedToday(true);
        setStreak(parseInt(savedStreak || '1'));
      } else if (diffDays === 1) {
        const newStreak = (parseInt(savedStreak || '1') % 7) + 1;
        setStreak(newStreak);
        setHasClaimedToday(false);
      } else {
        setStreak(1);
        setHasClaimedToday(false);
      }
    }
    setLastClaimDate(savedLastClaim);
  }, []);

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

  const updateQuestProgress = (type: Quest['type'], amount: number) => {
    setQuests(prev => prev.map(q => {
      if (q.type === type && !q.completed) {
        const newCurrent = q.current + amount;
        if (newCurrent >= q.target) {
          setCoins(c => c + q.reward);
          setChatMessages(msgs => [...msgs, { role: 'assistant', text: `Quest Complete! You earned ${q.reward} coins for: ${q.description}` }]);
          return { ...q, current: q.target, completed: true };
        }
        return { ...q, current: newCurrent };
      }
      return q;
    }));
  };

  const plantCrop = (plotId: number) => {
    if (!selectedSeed) return;
    const crop = CROPS[selectedSeed];
    if (coins < crop.cost) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "You're a bit short on capital, partner! Grow some cheaper crops first." }]);
      return;
    }

    playSound('plant');
    setPlots(prev => prev.map(p => 
      p.id === plotId ? { ...p, crop, plantedAt: Date.now(), isReady: false } : p
    ));
    setCoins(prev => prev - crop.cost);
  };

  const harvestCrop = (plotId: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.isReady || !plot.crop) return;

    playSound('harvest');
    const revenue = plot.crop.revenue;
    const gemYield = plot.crop.gemYield || 0;

    setCoins(prev => prev + revenue);
    if (gemYield > 0) {
      setGems(prev => prev + gemYield);
      setInventory(prev => ({ ...prev, gem: prev.gem + gemYield }));
      updateQuestProgress('gems', gemYield);
    }
    
    // Add to inventory
    setInventory(prev => ({ ...prev, [plot.crop!.type]: prev[plot.crop!.type] + 1 }));
    
    updateQuestProgress('harvest', 1);
    updateQuestProgress('coins', revenue);

    setPlots(prev => prev.map(p => 
      p.id === plotId ? { ...p, crop: null, plantedAt: null, isReady: false } : p
    ));

    if (gems + gemYield >= WIN_GEMS_THRESHOLD) {
      setShowWinModal(true);
    }
  };

  const buyGem = () => {
    if (coins >= GEM_PRICE) {
      setCoins(prev => prev - GEM_PRICE);
      setGems(prev => {
        const newGems = prev + 1;
        updateQuestProgress('gems', 1);
        if (newGems >= WIN_GEMS_THRESHOLD) setShowWinModal(true);
        return newGems;
      });
      setInventory(prev => ({ ...prev, gem: prev.gem + 1 }));
    }
  };

  const claimDaily = () => {
    const now = Date.now();
    if (!lastDailyClaim || now - lastDailyClaim > 86400000) {
      playSound('reward');
      setCoins(prev => prev + DAILY_REWARD_COINS);
      setLastDailyClaim(now);
      setChatMessages(prev => [...prev, { role: 'assistant', text: `Daily bonus claimed! +${DAILY_REWARD_COINS} coins added to your wallet.` }]);
    }
  };

  const convertGemsToTokens = () => {
    if (gems > 0) {
      playSound('reward');
      const earnedTokens = gems * TOKEN_EXCHANGE_RATE;
      setTokens(prev => prev + earnedTokens);
      setGems(0);
      setInventory(prev => ({ ...prev, gem: 0 }));
      setChatMessages(prev => [...prev, { role: 'assistant', text: `Swapped ${gems} Gems for ${earnedTokens} HTK Tokens! Your wallet is looking heavy.` }]);
    }
  };

  const craftItem = (recipe: CraftingRecipe) => {
    // Check ingredients
    const canCraft = recipe.ingredients.every(ing => inventory[ing.type] >= ing.count);
    
    if (!canCraft) {
      setChatMessages(msgs => [...msgs, { role: 'assistant', text: `You don't have enough ingredients to craft ${recipe.name}.` }]);
      return;
    }

    playSound('craft');
    // Consume ingredients
    setInventory(prev => {
      const newInv = { ...prev };
      recipe.ingredients.forEach(ing => {
        newInv[ing.type] -= ing.count;
      });
      return newInv;
    });

    // Update gems state if gem was used
    const gemIngredient = recipe.ingredients.find(ing => ing.type === 'gem');
    if (gemIngredient) {
      setGems(prev => prev - gemIngredient.count);
    }

    // Add crafted item
    setCraftedItems(prev => ({
      ...prev,
      [recipe.id]: (prev[recipe.id] || 0) + 1
    }));

    setChatMessages(msgs => [...msgs, { role: 'assistant', text: `Successfully crafted ${recipe.result.icon} ${recipe.name}!` }]);
  };

  const mineNode = (nodeId: string) => {
    playSound('mine');
    setMiningNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        const newHealth = node.currentHealth - miningPower;
        if (newHealth <= 0) {
          // Reward
          if (node.reward.coins) setCoins(c => c + node.reward.coins!);
          if (node.reward.gems) setGems(g => g + node.reward.gems!);
          if (node.reward.tokens) setTokens(t => t + node.reward.tokens!);
          
          setChatMessages(msgs => [...msgs, { 
            role: 'assistant', 
            text: `Boom! You cracked the ${node.name} and found ${node.reward.coins ? node.reward.coins + ' coins' : ''} ${node.reward.gems ? node.reward.gems + ' gems' : ''} ${node.reward.tokens ? node.reward.tokens + ' HTK' : ''}!` 
          }]);
          
          return { ...node, currentHealth: node.maxHealth }; // Respawn
        }
        return { ...node, currentHealth: newHealth };
      }
      return node;
    }));
  };

  const expandLand = () => {
    const nextPlotIndex = plots.findIndex(p => p.isLocked);
    if (nextPlotIndex === -1) return;
    
    const cost = LAND_EXPANSION_COSTS[nextPlotIndex];
    if (coins >= cost) {
      playSound('expand');
      setCoins(prev => prev - cost);
      setPlots(prev => prev.map((p, i) => i === nextPlotIndex ? { ...p, isLocked: false } : p));
      setChatMessages(msgs => [...msgs, { role: 'assistant', text: `Land expanded! You've got more room to grow now, partner.` }]);
    } else {
      setChatMessages(msgs => [...msgs, { role: 'assistant', text: `You need ${cost} coins to expand your land.` }]);
    }
  };

  const claimDailyReward = () => {
    if (hasClaimedToday) return;

    playSound('reward');
    const today = new Date().toISOString().split('T')[0];
    const currentReward = DAILY_LOGIN_REWARDS.find(r => r.day === streak);

    if (currentReward) {
      if (currentReward.reward.coins) setCoins(c => c + currentReward.reward.coins!);
      if (currentReward.reward.gems) setGems(g => g + currentReward.reward.gems!);
      if (currentReward.reward.items) {
        setCraftedItems(prev => {
          const next = { ...prev };
          currentReward.reward.items?.forEach(item => {
            next[item.id] = (next[item.id] || 0) + item.count;
          });
          return next;
        });
      }

      setHasClaimedToday(true);
      setLastClaimDate(today);
      localStorage.setItem('lastClaimDate', today);
      localStorage.setItem('streak', streak.toString());

      setChatMessages(msgs => [...msgs, { 
        role: 'assistant', 
        text: `Howdy! You've claimed your Day ${streak} reward! Come back tomorrow for even better loot!` 
      }]);
    }
  };

  const buyShopItem = (item: ShopItem) => {
    if (coins < item.cost) {
      setChatMessages(msgs => [...msgs, { role: 'assistant', text: `You need ${item.cost} coins for that ${item.name}, partner!` }]);
      return;
    }

    playSound('buy');
    setCoins(prev => prev - item.cost);

    if (item.type === 'tool') {
      if (item.effect === 'mining_power') setMiningPower(p => p + 1);
      if (item.effect === 'mining_power_large') setMiningPower(p => p + 5);
      if (item.effect === 'growth_speed_permanent') setGrowthMultiplier(m => m * 0.9);
    } else {
      setCraftedItems(prev => ({
        ...prev,
        [item.id]: (prev[item.id] || 0) + 1
      }));
    }

    setChatMessages(msgs => [...msgs, { role: 'assistant', text: `Successfully purchased ${item.icon} ${item.name}!` }]);
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

  const sellResource = (resource: string, amount: number) => {
    if (!inventory[resource] || inventory[resource] < amount) return;
    
    playSound('sell');
    const price = MARKET_PRICES[resource] || 0;
    const htkEarned = price * amount;
    
    setInventory(prev => ({
      ...prev,
      [resource]: prev[resource] - amount
    }));
    setTokens(prev => prev + htkEarned);
    
    setChatMessages(msgs => [...msgs, { 
      role: 'assistant', 
      text: `Market Trade: Sold ${amount} ${resource} for ${htkEarned.toFixed(2)} HTK!` 
    }]);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1A1A] font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-black/5 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <TrendingUp size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">GEM HARVEST</h1>
            <p className="text-[10px] font-bold text-emerald-600 tracking-[0.2em] uppercase mt-1">Play to Earn Economy</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setIsMenuOpen(true); playSound('nav'); }}
            className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors text-gray-600"
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-black/5 shadow-sm">
            <Coins size={16} className="text-amber-500" />
            <span className="font-mono font-bold text-sm">{coins.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-600 px-4 py-2 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <Wallet size={16} />
            <span className="font-mono font-bold text-sm">{tokens.toLocaleString()} HTK</span>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-32 px-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'farm' && (
            <motion.div 
              key="farm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Shop */}
              <div className="space-y-6">
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={20} className="text-emerald-600" />
                      <h2 className="text-lg font-bold">Seed Market</h2>
                    </div>
                    <button onClick={claimDaily} className="text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full hover:bg-amber-200 transition-colors">
                      DAILY BONUS
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(Object.values(CROPS) as Crop[]).map((crop) => (
                      <button
                        key={crop.id}
                        onClick={() => { setSelectedSeed(crop.type); playSound('click'); }}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 group",
                          selectedSeed === crop.type 
                            ? "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/10" 
                            : "bg-white border-black/5 hover:border-emerald-200 hover:bg-emerald-50/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm", crop.color)}>
                            {crop.icon}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-sm">{crop.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock size={12} />
                              <span>{crop.growthTime}s</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-amber-600">-{crop.cost}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-black">Cost</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-900 text-white rounded-[32px] p-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <TrendingUp size={80} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Market Growth</h3>
                  <p className="text-emerald-200 text-sm mb-6">Harvest Gems to convert them into HTK tokens in your wallet.</p>
                  <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <Gem size={16} className="text-purple-400" />
                      <span className="text-xs font-bold">1 Gem</span>
                    </div>
                    <div className="w-4 h-px bg-white/20" />
                    <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-emerald-400" />
                      <span className="text-xs font-bold">{TOKEN_EXCHANGE_RATE} HTK</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column: Farm */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#5C4033] rounded-[48px] p-8 shadow-2xl border-b-[12px] border-[#3E2B22]">
                  <div className="grid grid-cols-3 gap-4 aspect-square">
                    {plots.map((plot) => (
                      <div 
                        key={plot.id}
                        onClick={() => {
                          if (plot.isLocked) expandLand();
                          else if (plot.isReady) harvestCrop(plot.id);
                          else if (!plot.crop) plantCrop(plot.id);
                        }}
                        className={cn(
                          "relative rounded-[32px] cursor-pointer transition-all duration-300 flex items-center justify-center overflow-hidden",
                          plot.isLocked ? "bg-black/20 border-2 border-dashed border-white/5" :
                          !plot.crop ? "bg-[#4A3329] hover:bg-[#6D4B3C] border-2 border-dashed border-white/5" : "bg-[#3E2B22]"
                        )}
                      >
                        {plot.isLocked ? (
                          <div className="flex flex-col items-center gap-1 text-white/20 group-hover:text-white/40">
                            <Lock size={24} />
                            <span className="text-[8px] font-black uppercase">{LAND_EXPANSION_COSTS[plot.id].toLocaleString()}</span>
                          </div>
                        ) : plot.crop ? (
                          <div className="flex flex-col items-center gap-2">
                            <motion.div 
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ 
                                scale: plot.isReady ? [1, 1.05, 1] : 1,
                                opacity: 1 
                              }}
                              transition={{ 
                                scale: plot.isReady ? { repeat: Infinity, duration: 2 } : { duration: 0.5 }
                              }}
                              className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg",
                                plot.isReady ? plot.crop.color : "bg-gray-400/10 grayscale opacity-50"
                              )}
                            >
                              {plot.crop.icon}
                            </motion.div>
                            
                            {!plot.isReady && plot.plantedAt && (
                              <div className="flex flex-col items-center gap-1 mt-1">
                                <div className="w-20 h-2 bg-black/40 rounded-full overflow-hidden border border-white/10 shadow-inner">
                                  <motion.div 
                                    key={`${plot.id}-${plot.plantedAt}`}
                                    initial={{ width: `${Math.min(100, ((Date.now() - plot.plantedAt) / (plot.crop.growthTime * 1000)) * 100)}%` }}
                                    animate={{ width: '100%' }}
                                    transition={{ 
                                      duration: Math.max(0, plot.crop.growthTime - (Date.now() - plot.plantedAt) / 1000), 
                                      ease: "linear" 
                                    }}
                                    className="h-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                                  />
                                </div>
                                <div className="flex items-center gap-1 text-[8px] font-black text-white/30 uppercase tracking-tighter">
                                  <Clock size={8} />
                                  <span className="tabular-nums">
                                    {Math.ceil(Math.max(0, plot.crop.growthTime - (Date.now() - plot.plantedAt) / 1000))}s
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {plot.isReady && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex items-center justify-center"
                              >
                                <div className="bg-white text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl flex items-center gap-1 uppercase tracking-wider">
                                  Harvest
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <div className="text-white/5 group-hover:text-white/10 transition-colors">
                            <Sprout size={40} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Tips Section */}
                <div className="bg-white rounded-[32px] p-6 border border-black/5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Info size={20} className="text-blue-500" />
                      <h3 className="font-bold">Farming Intelligence</h3>
                    </div>
                    {selectedSeed && (
                      <button 
                        onClick={() => fetchTips(CROPS[selectedSeed].name)}
                        disabled={isLoadingTips}
                        className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                      >
                        {isLoadingTips ? 'RESEARCHING...' : `TIPS FOR ${CROPS[selectedSeed].name.toUpperCase()}`}
                      </button>
                    )}
                  </div>
                  
                  <div className="min-h-[80px] flex items-center justify-center text-center p-5 bg-blue-50/30 rounded-2xl border border-blue-100/50">
                    {activeTips ? (
                      <div className="text-sm text-blue-900 text-left w-full prose prose-sm max-w-none">
                        <Markdown>{activeTips}</Markdown>
                      </div>
                    ) : (
                      <p className="text-sm text-blue-400 font-medium">
                        {selectedSeed 
                          ? `Unlock real-world farming insights for ${CROPS[selectedSeed].name}.` 
                          : "Select a seed to research its real-world properties."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'mine' && (
            <motion.div 
              key="mine"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 rounded-[48px] p-10 shadow-2xl border-b-[12px] border-slate-950 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {miningNodes.map((node) => (
                      <motion.div 
                        key={node.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => mineNode(node.id)}
                        className="bg-slate-800/50 backdrop-blur-md rounded-[40px] p-8 border border-white/5 hover:border-white/10 transition-all cursor-pointer flex flex-col items-center gap-6 group"
                      >
                        <div className={cn(
                          "w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 transition-transform",
                          node.color
                        )}>
                          {node.icon}
                        </div>
                        <div className="text-center w-full">
                          <h4 className="text-white font-black text-sm mb-4 uppercase tracking-widest">{node.name}</h4>
                          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              animate={{ width: `${(node.currentHealth / node.maxHealth) * 100}%` }}
                              className={cn("h-full transition-all duration-300", node.color)}
                            />
                          </div>
                          <p className="text-[10px] text-white/40 font-black mt-2 uppercase tracking-tighter">Health: {node.currentHealth} / {node.maxHealth}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <Pickaxe size={24} className="text-slate-600" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Mining Rewards</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(MINING_NODES).map(node => (
                      <div key={node.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{node.name}</p>
                        <div className="space-y-1">
                          {node.reward.coins && <div className="flex items-center gap-2 text-xs font-bold"><Coins size={12} className="text-amber-500" /> {node.reward.coins} Coins</div>}
                          {node.reward.gems && <div className="flex items-center gap-2 text-xs font-bold"><Gem size={12} className="text-purple-500" /> {node.reward.gems} Gems</div>}
                          {node.reward.tokens && <div className="flex items-center gap-2 text-xs font-bold"><Wallet size={12} className="text-emerald-500" /> {node.reward.tokens} HTK</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-100 rounded-[32px] p-8 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Mountain size={24} className="text-slate-600" />
                    <h3 className="text-lg font-black uppercase">Deep Mine</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    The mines are filled with rare resources. Tap the nodes to extract value. Granite is common, Gold is rare, and Special Stones are legendary.
                  </p>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400">Mining Efficiency</span>
                      <span className="text-xs font-black text-slate-900">100%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-slate-900" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-600 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy size={80} />
                  </div>
                  <h3 className="text-lg font-black mb-2 uppercase">Mining Master</h3>
                  <p className="text-indigo-100 text-sm">Discover all 3 types of resources to unlock the Mining Master achievement.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'craft' && (
            <motion.div 
              key="craft"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[40px] p-8 border border-black/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <Hammer size={24} className="text-amber-600" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Crafting Bench</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {CRAFTING_RECIPES.map((recipe) => {
                      const canCraft = recipe.ingredients.every(ing => inventory[ing.type] >= ing.count);
                      return (
                        <div 
                          key={recipe.id}
                          className={cn(
                            "p-6 rounded-[32px] border transition-all duration-300 flex flex-col justify-between",
                            canCraft ? "bg-white border-amber-200 shadow-lg shadow-amber-50" : "bg-gray-50 border-black/5 opacity-80"
                          )}
                        >
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">
                                {recipe.result.icon}
                              </div>
                              <div>
                                <h4 className="font-bold">{recipe.name}</h4>
                                <p className="text-[10px] text-gray-400 font-black uppercase">{recipe.result.type}</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-6 leading-relaxed">{recipe.description}</p>
                            
                            <div className="space-y-2 mb-8">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ingredients</p>
                              {recipe.ingredients.map((ing, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{ing.type === 'gem' ? '💎' : CROPS[ing.type as CropType].icon}</span>
                                    <span className="font-medium capitalize">{ing.type}</span>
                                  </div>
                                  <span className={cn(
                                    "font-mono font-bold",
                                    inventory[ing.type] >= ing.count ? "text-emerald-600" : "text-red-500"
                                  )}>
                                    {inventory[ing.type]} / {ing.count}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => craftItem(recipe)}
                            disabled={!canCraft}
                            className={cn(
                              "w-full py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2",
                              canCraft 
                                ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-100" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            )}
                          >
                            <Sparkles size={16} />
                            CRAFT ITEM
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-amber-900 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Package size={80} />
                  </div>
                  <h3 className="text-lg font-black mb-6 uppercase">Your Inventory</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(inventory).map(([type, count]) => (
                      <div key={type} className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{type === 'gem' ? '💎' : CROPS[type as CropType].icon}</span>
                          <span className="text-[10px] font-bold uppercase text-white/60">{type}</span>
                        </div>
                        <p className="text-xl font-black">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <Wand2 size={24} className="text-purple-600" />
                    <h3 className="text-lg font-black uppercase">Crafted Items</h3>
                  </div>
                  {Object.keys(craftedItems).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8 italic">No items crafted yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(craftedItems).map(([id, count]) => {
                        const recipe = CRAFTING_RECIPES.find(r => r.id === id);
                        return (
                          <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-black/5">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{recipe?.result.icon}</span>
                              <span className="font-bold text-sm">{recipe?.name}</span>
                            </div>
                            <span className="font-mono font-bold bg-white px-3 py-1 rounded-lg border border-black/5">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[40px] p-8 border border-black/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <Store size={24} className="text-indigo-600" />
                    <h3 className="text-xl font-black uppercase tracking-tight">General Store</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SHOP_ITEMS.map((item) => (
                      <div 
                        key={item.id}
                        className="p-6 rounded-[32px] border border-black/5 bg-white hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl">
                              {item.icon}
                            </div>
                            <div>
                              <h4 className="font-bold">{item.name}</h4>
                              <p className="text-[10px] text-gray-400 font-black uppercase">{item.type}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-6 leading-relaxed">{item.description}</p>
                        </div>
                        
                        <button 
                          onClick={() => buyShopItem(item)}
                          disabled={coins < item.cost}
                          className={cn(
                            "w-full py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2",
                            coins >= item.cost 
                              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100" 
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          )}
                        >
                          <Coins size={16} />
                          BUY FOR {item.cost}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-indigo-900 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap size={80} />
                  </div>
                  <h3 className="text-lg font-black mb-6 uppercase">Active Upgrades</h3>
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Pickaxe size={16} className="text-indigo-300" />
                          <span className="text-[10px] font-bold uppercase text-white/60">Mining Power</span>
                        </div>
                        <span className="text-xl font-black">{miningPower}</span>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-emerald-300" />
                          <span className="text-[10px] font-bold uppercase text-white/60">Growth Speed</span>
                        </div>
                        <span className="text-xl font-black">{(100 - (growthMultiplier * 100)).toFixed(0)}% Boost</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-black/5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Wrench size={24} className="text-slate-600" />
                    <h3 className="text-lg font-black uppercase">Shop Info</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Invest your coins in tools and fertilizers to grow your farm faster and mine more efficiently. Tools provide permanent boosts!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'rewards' && (
            <motion.div 
              key="rewards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="bg-white rounded-[40px] p-8 border border-black/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Calendar size={24} className="text-amber-600" />
                    <h3 className="text-xl font-black uppercase tracking-tight">Daily Login Rewards</h3>
                  </div>
                  <div className="px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                    <span className="text-xs font-black text-amber-700 uppercase">{streak} Day Streak</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                  {DAILY_LOGIN_REWARDS.map((reward) => {
                    const isClaimed = reward.day < streak || (reward.day === streak && hasClaimedToday);
                    const isCurrent = reward.day === streak && !hasClaimedToday;
                    
                    return (
                      <div 
                        key={reward.day}
                        className={cn(
                          "relative p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center",
                          isClaimed ? "bg-emerald-50 border-emerald-100 opacity-60" : 
                          isCurrent ? "bg-amber-50 border-amber-200 shadow-md ring-2 ring-amber-400 ring-offset-2" : 
                          "bg-gray-50 border-black/5"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase text-gray-400 mb-2">Day {reward.day}</span>
                        <div className="text-3xl mb-2">{reward.icon}</div>
                        <div className="text-[10px] font-bold text-gray-600">
                          {reward.reward.coins && `+${reward.reward.coins} Coins`}
                          {reward.reward.gems && `+${reward.reward.gems} Gems`}
                          {reward.reward.items && `+${reward.reward.items.length} Items`}
                        </div>
                        {isClaimed && (
                          <div className="absolute inset-0 flex items-center justify-center bg-emerald-50/40 rounded-3xl">
                            <CheckCircle2 size={24} className="text-emerald-600" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={claimDailyReward}
                  disabled={hasClaimedToday}
                  className={cn(
                    "w-full py-6 rounded-[32px] font-black text-lg transition-all flex items-center justify-center gap-3",
                    !hasClaimedToday 
                      ? "bg-amber-500 text-white hover:bg-amber-600 shadow-xl shadow-amber-100" 
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Gift size={24} />
                  {hasClaimedToday ? "REWARD CLAIMED" : "CLAIM DAY " + streak + " REWARD"}
                </button>
              </div>

              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black mb-2">Earning Quests</h2>
                  <p className="text-gray-500">Complete tasks to earn bonus coins and grow your farm faster.</p>
                </div>

              <div className="space-y-4">
                {quests.map((quest) => (
                  <div 
                    key={quest.id}
                    className={cn(
                      "bg-white p-6 rounded-[32px] border transition-all duration-300",
                      quest.completed ? "border-emerald-200 bg-emerald-50/30" : "border-black/5 shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          quest.completed ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
                        )}>
                          {quest.completed ? <CheckCircle2 size={24} /> : <Gift size={24} />}
                        </div>
                        <div>
                          <h4 className="font-bold">{quest.description}</h4>
                          <p className="text-xs text-gray-500">Reward: {quest.reward} Coins</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-bold">
                          {quest.current} / {quest.target}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(quest.current / quest.target) * 100}%` }}
                        className={cn(
                          "h-full transition-all duration-500",
                          quest.completed ? "bg-emerald-600" : "bg-amber-500"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

          {activeTab === 'market' && (
            <motion.div 
              key="market"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="bg-white rounded-[40px] p-8 border border-black/5 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp size={24} className="text-emerald-600" />
                  <h3 className="text-xl font-black uppercase tracking-tight">HTK Exchange Market</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(inventory).map(([resource, count]) => {
                    if (count === 0 && !MARKET_PRICES[resource]) return null;
                    const price = MARKET_PRICES[resource] || 0;
                    if (price === 0) return null;

                    return (
                      <div key={resource} className="bg-gray-50 rounded-3xl p-6 border border-black/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                            {resource === 'wheat' && '🌾'}
                            {resource === 'corn' && '🌽'}
                            {resource === 'carrot' && '🥕'}
                            {resource === 'strawberry' && '🍓'}
                            {resource === 'gem-flower' && '💎'}
                            {resource === 'gem' && '💎'}
                            {resource === 'rock' && '🪨'}
                            {resource === 'gold' && '🪙'}
                            {resource === 'special-stone' && '🔮'}
                          </div>
                          <div>
                            <h4 className="font-bold capitalize">{resource.replace('-', ' ')}</h4>
                            <p className="text-xs text-gray-500">Owned: {count}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-600 mb-2">{price} HTK / unit</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => sellResource(resource, 1)}
                              disabled={count < 1}
                              className="px-4 py-2 bg-white border border-black/10 rounded-xl text-[10px] font-black hover:bg-gray-100 disabled:opacity-50"
                            >
                              SELL 1
                            </button>
                            <button 
                              onClick={() => sellResource(resource, count)}
                              disabled={count < 1}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black hover:bg-emerald-700 disabled:opacity-50"
                            >
                              SELL ALL
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-indigo-900 text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <TrendingUp size={120} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-4 uppercase">Market Wisdom</h3>
                  <p className="text-indigo-200 leading-relaxed max-w-xl">
                    The HTK Exchange is where your physical labor turns into digital value. 
                    Resources harvested from your farm and mined from the depths can be traded here for Harvest Tokens (HTK). 
                    Keep an eye on your inventory and trade wisely to maximize your wallet!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'wallet' && (
            <motion.div 
              key="wallet"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="bg-black text-white rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Wallet size={160} />
                </div>
                <div className="relative z-10">
                  <p className="text-white/60 text-xs font-black tracking-widest uppercase mb-2">Total Earnings</p>
                  <h2 className="text-5xl font-black mb-8">{tokens.toLocaleString()} <span className="text-emerald-400">HTK</span></h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] border border-white/10">
                      <p className="text-white/40 text-[10px] font-black uppercase mb-1">Available Gems</p>
                      <div className="flex items-center gap-2">
                        <Gem size={20} className="text-purple-400" />
                        <span className="text-2xl font-black">{gems}</span>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-[32px] border border-white/10">
                      <p className="text-white/40 text-[10px] font-black uppercase mb-1">Coin Balance</p>
                      <div className="flex items-center gap-2">
                        <Coins size={20} className="text-amber-400" />
                        <span className="text-2xl font-black">{coins.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[40px] p-8 border border-black/5 shadow-sm">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <ArrowUpRight size={24} className="text-emerald-600" />
                  Token Swap
                </h3>
                <p className="text-gray-500 text-sm mb-8">Convert your harvested Gems into Harvest Tokens (HTK). HTK is the primary currency of the Gem Harvest ecosystem.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-black/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">💎</div>
                      <span className="font-bold">Gems to Swap</span>
                    </div>
                    <span className="text-xl font-black">{gems}</span>
                  </div>
                  
                  <button 
                    onClick={convertGemsToTokens}
                    disabled={gems === 0}
                    className="w-full bg-emerald-600 text-white font-black py-5 rounded-3xl hover:bg-emerald-700 disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
                  >
                    <TrendingUp size={20} />
                    SWAP FOR {(gems * TOKEN_EXCHANGE_RATE).toLocaleString()} HTK
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Chat Button */}
      <button 
        onClick={() => { setIsChatOpen(true); playSound('nav'); }}
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
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
                    <p className="text-xs text-emerald-100">AI Economy Expert</p>
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
                    placeholder="Ask about the HTK economy..."
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

      {/* Quick Menu Modal */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[48px] p-10 z-[70] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tight">Quick Menu</h2>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => { setActiveTab('farm'); setIsMenuOpen(false); playSound('nav'); }}
                  className="flex items-center gap-4 p-4 bg-emerald-50 rounded-3xl border border-emerald-100 hover:bg-emerald-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                    <Sprout size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm uppercase">Farm</h3>
                    <p className="text-[10px] text-emerald-600">Manage your crops.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setActiveTab('mine'); setIsMenuOpen(false); playSound('nav'); }}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-slate-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                    <Pickaxe size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm uppercase">Mining Hub</h3>
                    <p className="text-[10px] text-slate-500">Extract rare gems.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setActiveTab('craft'); setIsMenuOpen(false); playSound('nav'); }}
                  className="flex items-center gap-4 p-4 bg-rose-50 rounded-3xl border border-rose-100 hover:bg-rose-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                    <Hammer size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm uppercase">Crafting</h3>
                    <p className="text-[10px] text-rose-600">Create boosters.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setActiveTab('shop'); setIsMenuOpen(false); playSound('nav'); }}
                  className="flex items-center gap-4 p-4 bg-indigo-50 rounded-3xl border border-indigo-100 hover:bg-indigo-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                    <Store size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm uppercase">General Store</h3>
                    <p className="text-[10px] text-indigo-500">Buy tools & seeds.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setActiveTab('rewards'); setIsMenuOpen(false); playSound('nav'); }}
                  className="flex items-center gap-4 p-4 bg-amber-50 rounded-3xl border border-amber-100 hover:bg-amber-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                    <Gift size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm uppercase">Quests</h3>
                    <p className="text-[10px] text-amber-600">Claim rewards.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setActiveTab('market'); setIsMenuOpen(false); playSound('nav'); }}
                  className="flex items-center gap-4 p-4 bg-cyan-50 rounded-3xl border border-cyan-100 hover:bg-cyan-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-cyan-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                    <TrendingUp size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm uppercase">Market</h3>
                    <p className="text-[10px] text-cyan-600">Trade for HTK.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setActiveTab('wallet'); setIsMenuOpen(false); playSound('nav'); }}
                  className="flex items-center gap-4 p-4 bg-violet-50 rounded-3xl border border-violet-100 hover:bg-violet-100 transition-all group md:col-span-2"
                >
                  <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                    <Wallet size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-sm uppercase">Wallet</h3>
                    <p className="text-[10px] text-violet-600">View your earnings and swap gems.</p>
                  </div>
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-black/5 flex justify-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gem Harvest Economy v1.0</p>
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
                🚀
              </div>
              <h2 className="text-3xl font-black mb-4">Economy Mastered!</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You've reached the {WIN_GEMS_THRESHOLD} Gem milestone! Your farm is now a top-tier producer in the Gem Harvest ecosystem. Convert your gems to HTK and dominate the market.
              </p>
              <button 
                onClick={() => setShowWinModal(false)}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 transition-colors shadow-xl shadow-emerald-200"
              >
                Keep Earning
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
