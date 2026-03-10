export type CropType = 'wheat' | 'corn' | 'carrot' | 'strawberry' | 'gem-flower';

export interface Crop {
  id: string;
  name: string;
  type: CropType;
  growthTime: number; // in seconds
  cost: number;
  revenue: number;
  gemYield?: number;
  color: string;
  icon: string;
}

export interface Plot {
  id: number;
  crop: Crop | null;
  plantedAt: number | null; // timestamp
  isReady: boolean;
  isLocked: boolean;
}

export type ResourceType = 'rock' | 'gold' | 'special-stone';

export interface MiningNode {
  id: string;
  type: ResourceType;
  name: string;
  health: number;
  maxHealth: number;
  reward: {
    coins?: number;
    gems?: number;
    tokens?: number;
  };
  icon: string;
  color: string;
}

export const MINING_NODES: Record<ResourceType, MiningNode> = {
  rock: {
    id: 'rock',
    type: 'rock',
    name: 'Granite Rock',
    health: 5,
    maxHealth: 5,
    reward: { coins: 50 },
    icon: '🪨',
    color: 'bg-gray-500'
  },
  gold: {
    id: 'gold',
    type: 'gold',
    name: 'Gold Vein',
    health: 15,
    maxHealth: 15,
    reward: { coins: 500, tokens: 10 },
    icon: '🪙',
    color: 'bg-yellow-500'
  },
  'special-stone': {
    id: 'special-stone',
    type: 'special-stone',
    name: 'Special Stone',
    health: 30,
    maxHealth: 30,
    reward: { gems: 2, tokens: 50 },
    icon: '🔮',
    color: 'bg-indigo-500'
  }
};

export const LAND_EXPANSION_COSTS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 5000, 10000, 25000, 50000, 100000, 250000];
export const INITIAL_PLOTS = 9;
export const MAX_PLOTS = 15;

export interface DailyReward {
  day: number;
  reward: {
    coins?: number;
    gems?: number;
    items?: { id: string; count: number }[];
  };
  icon: string;
}

export const DAILY_LOGIN_REWARDS: DailyReward[] = [
  { day: 1, reward: { coins: 100 }, icon: '🪙' },
  { day: 2, reward: { coins: 250 }, icon: '💰' },
  { day: 3, reward: { gems: 5 }, icon: '💎' },
  { day: 4, reward: { coins: 500 }, icon: '💵' },
  { day: 5, reward: { items: [{ id: 'basic-fertilizer', count: 2 }] }, icon: '🧪' },
  { day: 6, reward: { gems: 15 }, icon: '✨' },
  { day: 7, reward: { coins: 2000, gems: 50 }, icon: '🎁' },
];

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  type: 'seed' | 'tool' | 'fertilizer';
  effect?: string;
  cropType?: CropType;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'basic-fertilizer',
    name: 'Basic Fertilizer',
    description: 'Instantly grows the next crop you plant.',
    cost: 150,
    icon: '🧪',
    type: 'fertilizer',
    effect: 'instant_growth'
  },
  {
    id: 'sturdy-pickaxe',
    name: 'Sturdy Pickaxe',
    description: 'Increases mining damage by 1.',
    cost: 1000,
    icon: '⚒️',
    type: 'tool',
    effect: 'mining_power'
  },
  {
    id: 'golden-watering-can',
    name: 'Golden Watering Can',
    description: 'Reduces all crop growth times by 10% permanently.',
    cost: 5000,
    icon: '🚿',
    type: 'tool',
    effect: 'growth_speed_permanent'
  },
  {
    id: 'mining-drill',
    name: 'Industrial Drill',
    description: 'Increases mining damage by 5.',
    cost: 15000,
    icon: '🚜',
    type: 'tool',
    effect: 'mining_power_large'
  },
  {
    id: 'dynamite',
    name: 'Mining Dynamite',
    description: 'Instantly clears a mining node.',
    cost: 2500,
    icon: '🧨',
    type: 'fertilizer',
    effect: 'instant_mine'
  }
];

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: {
    type: CropType | 'gem';
    count: number;
  }[];
  result: {
    type: 'fertilizer' | 'decoration' | 'special';
    name: string;
    icon: string;
    effect?: string;
  };
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'speed-fertilizer',
    name: 'Speed Fertilizer',
    description: 'Reduces growth time of the next planted crop by 50%.',
    ingredients: [
      { type: 'wheat', count: 5 },
      { type: 'carrot', count: 2 }
    ],
    result: {
      type: 'fertilizer',
      name: 'Speed Fertilizer',
      icon: '🧪',
      effect: 'speed_boost'
    }
  },
  {
    id: 'gem-booster',
    name: 'Gem Booster',
    description: 'Increases gem yield of the next harvested crop.',
    ingredients: [
      { type: 'strawberry', count: 3 },
      { type: 'gem', count: 1 }
    ],
    result: {
      type: 'special',
      name: 'Gem Booster',
      icon: '✨',
      effect: 'gem_boost'
    }
  },
  {
    id: 'golden-scarecrow',
    name: 'Golden Scarecrow',
    description: 'A beautiful decoration for your farm.',
    ingredients: [
      { type: 'wheat', count: 20 },
      { type: 'corn', count: 10 },
      { type: 'gem', count: 5 }
    ],
    result: {
      type: 'decoration',
      name: 'Golden Scarecrow',
      icon: '👨‍🌾',
    }
  }
];

export const CROPS: Record<CropType, Crop> = {
  wheat: {
    id: 'wheat',
    name: 'Golden Wheat',
    type: 'wheat',
    growthTime: 10,
    cost: 10,
    revenue: 25,
    color: 'bg-yellow-400',
    icon: '🌾'
  },
  corn: {
    id: 'corn',
    name: 'Sweet Corn',
    type: 'corn',
    growthTime: 30,
    cost: 50,
    revenue: 120,
    color: 'bg-yellow-600',
    icon: '🌽'
  },
  carrot: {
    id: 'carrot',
    name: 'Crunchy Carrot',
    type: 'carrot',
    growthTime: 60,
    cost: 100,
    revenue: 250,
    color: 'bg-orange-500',
    icon: '🥕'
  },
  strawberry: {
    id: 'strawberry',
    name: 'Juicy Strawberry',
    type: 'strawberry',
    growthTime: 120,
    cost: 500,
    revenue: 1200,
    color: 'bg-red-500',
    icon: '🍓'
  },
  'gem-flower': {
    id: 'gem-flower',
    name: 'Gem Flower',
    type: 'gem-flower',
    growthTime: 300,
    cost: 2000,
    revenue: 5000,
    gemYield: 1,
    color: 'bg-purple-500',
    icon: '💎'
  }
};

export const WIN_GEMS_THRESHOLD = 50;
export const GEM_PRICE = 5000;
export const TOKEN_EXCHANGE_RATE = 100; // 1 Gem = 100 HTK
export const DAILY_REWARD_COINS = 500;

export const MARKET_PRICES: Record<string, number> = {
  wheat: 0.5,
  corn: 2,
  carrot: 5,
  strawberry: 25,
  'gem-flower': 100,
  gem: 500,
  rock: 1,
  gold: 10,
  'special-stone': 50
};

export interface Quest {
  id: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  type: 'harvest' | 'coins' | 'gems';
  completed: boolean;
}
