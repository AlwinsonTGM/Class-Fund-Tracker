'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameState, PlayerProfile, PlayerEquipped } from '@/types/game';

interface GameStateContextType {
  gameState: GameState;
  activeModal: 'school' | 'vendor' | 'board' | 'help' | 'invite' | 'results' | 'reviewer' | null;
  openModal: (modal: 'school' | 'vendor' | 'board' | 'help' | 'invite' | 'results' | 'reviewer') => void;
  closeModal: () => void;
  setProfile: (profile: PlayerProfile, tagColor: string) => void;
  addCoins: (amount: number) => void;
  updateEquipped: (equipped: PlayerEquipped, tagColor?: string) => void;
  updateInv: (inv: Record<string, number>) => void;
  updateOwned: (owned: Record<string, boolean>) => void;
  updateFlags: (flags: Partial<GameState['flags']>) => void;
  addBubbleNote: (author: string, color: string, text: string, pre?: string) => void;
  resetSave: () => void;
}

const DEFAULT_GAME_STATE: GameState = {
  profile: null,
  coins: 0,
  inv: {},
  owned: {},
  equipped: { hat: null, goldtag: false },
  tagColor: '#fef3c7',
  progress: {},
  subs: [],
  invites: { count: 0, joined: [], code: '' },
  bubbles: [],
  flags: { fished: false, sold: false, quiz: false, rookie: false },
};

const LOCAL_STORAGE_KEY = 'cozyPlazaSave_v2';

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [activeModal, setActiveModal] = useState<'school' | 'vendor' | 'board' | 'help' | 'invite' | 'results' | 'reviewer' | null>(null);

  // Load state from localStorage on mount + seed board bubbles
  useEffect(() => {
    let loaded = DEFAULT_GAME_STATE;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        loaded = {
          ...DEFAULT_GAME_STATE,
          ...parsed,
          equipped: { hat: null, goldtag: false, ...(parsed.equipped || {}) },
          invites: { count: 0, joined: [], code: '', ...(parsed.invites || {}) },
          flags: { fished: false, sold: false, quiz: false, rookie: false, ...(parsed.flags || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to load game state from localStorage', e);
    }

    // Seed default bulletin board notes if none exist
    if (loaded.bubbles.length === 0) {
      const now = Date.now();
      loaded = {
        ...loaded,
        bubbles: [
          { author: 'TransferSam', color: '#ffd6e0', text: 'first day here, this place is cozy!', ts: now - 400000 },
          { author: 'Gossip Gnome', color: '#d0f4de', pre: '🍄', text: 'premium gossip loading…', ts: now - 200000 },
          { author: 'Mayor Pixel', color: '#d7e9ff', pre: '⭐', text: 'Check the Schoolhouse! 🏫', ts: now - 100000 },
        ],
      };
    }

    setGameState(loaded);
  }, []);

  // Sync to localStorage on state change
  useEffect(() => {
    try {
      if (gameState.profile) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
      }
    } catch (e) {
      console.warn('Failed to save game state to localStorage', e);
    }
  }, [gameState]);

  const openModal = (modal: 'school' | 'vendor' | 'board' | 'help' | 'invite' | 'results' | 'reviewer') => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const setProfile = (profile: PlayerProfile, tagColor: string) => {
    setGameState((prev) => ({
      ...prev,
      profile,
      tagColor,
    }));
  };

  const addCoins = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  };

  const updateEquipped = (equipped: PlayerEquipped, tagColor?: string) => {
    setGameState((prev) => ({
      ...prev,
      equipped,
      ...(tagColor ? { tagColor } : {}),
    }));
  };

  const updateInv = (inv: Record<string, number>) => {
    setGameState((prev) => ({
      ...prev,
      inv,
    }));
  };

  const updateOwned = (owned: Record<string, boolean>) => {
    setGameState((prev) => ({
      ...prev,
      owned,
    }));
  };

  const updateFlags = (flags: Partial<GameState['flags']>) => {
    setGameState((prev) => ({
      ...prev,
      flags: { ...prev.flags, ...flags },
    }));
  };

  const addBubbleNote = (author: string, color: string, text: string, pre?: string) => {
    setGameState((prev) => {
      const newBubbles = [{ author, color, pre, text, ts: Date.now() }, ...prev.bubbles].slice(0, 40);
      return { ...prev, bubbles: newBubbles };
    });
  };

  const resetSave = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    setGameState(DEFAULT_GAME_STATE);
  };

  return (
    <GameStateContext.Provider
      value={{
        gameState,
        activeModal,
        openModal,
        closeModal,
        setProfile,
        addCoins,
        updateEquipped,
        updateInv,
        updateOwned,
        updateFlags,
        addBubbleNote,
        resetSave,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
