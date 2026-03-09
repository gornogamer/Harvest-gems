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
}

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

export const WIN_GEMS_THRESHOLD = 10;
export const GEM_PRICE = 5000;
