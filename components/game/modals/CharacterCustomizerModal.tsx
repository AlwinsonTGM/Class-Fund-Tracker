'use client';

import React, { useState, useMemo } from 'react';
import { HUES, TAGCOLORS } from '@/config/avatars';
import { PIPOYA_AVATARS, filterAvatarsByRole } from '@/config/pipoyaSprites';
import { Avatar } from '@/types/game';
import { useGameState } from '@/context/GameStateContext';
import { playSfx } from '@/lib/sfx';
import { Shield, BookOpen, Gift, Lock, X, Check, User } from 'lucide-react';

const DEFAULT_AVATARS: Avatar[] = [
  { id: 'sprout', name: 'Sprout', img: '/assets/animated_characters/sprout.png', photo: '/assets/characters/sprout.png', isAnimated: true, category: 'Default' },
  { id: 'pebble', name: 'Pebble', img: '/assets/animated_characters/pebble.png', photo: '/assets/characters/pebble.png', isAnimated: true, category: 'Default' },
  { id: 'fern', name: 'Fern', img: '/assets/animated_characters/fern.png', photo: '/assets/characters/fern.png', isAnimated: true, category: 'Default' },
  { id: 'ember', name: 'Ember', img: '/assets/animated_characters/ember.png', photo: '/assets/characters/ember.png', isAnimated: true, category: 'Default' },
];

type CategoryTab = 'default' | 'male_female' | 'school' | 'officer' | 'teacher' | 'event';

interface CharacterCustomizerModalProps {
  userRole: 'dev' | 'student' | 'officer' | 'guest';
  onClose: () => void;
}

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({ userRole, onClose }) => {
  const { gameState, setProfile } = useGameState();
  const [activeTab, setActiveTab] = useState<CategoryTab>('male_female');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(gameState.profile?.avatar || 'pipoya_male_01-1_png');
  const [pickHue, setPickHue] = useState<number>(gameState.profile?.hue || 0);
  const [pickTag, setPickTag] = useState<string>(gameState.tagColor || '#fef3c7');
  const [nickname, setNickname] = useState<string>(gameState.profile?.nickname || '');
  const [fullCatalogAvatars, setFullCatalogAvatars] = useState<Avatar[]>([]);

  // Asynchronously fetch full 1,000+ Pipoya catalog on-demand without memory bloat
  React.useEffect(() => {
    fetch('/assets/pipoya/pipoya_catalog.json')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped: Avatar[] = data.map((item: any) => ({
            id: `pipoya_${item.id}`,
            name: item.name,
            img: item.url,
            photo: item.url,
            isAnimated: true,
            category: item.category,
            accessRole: item.accessRole,
            gridType: item.gridType,
            isPipoya32: true,
          }));
          setFullCatalogAvatars(mapped);
        }
      })
      .catch((err) => console.warn('Failed to load full pipoya catalog:', err));
  }, []);

  const allAvailableAvatars = useMemo(() => {
    return fullCatalogAvatars.length > 0 ? [...DEFAULT_AVATARS, ...fullCatalogAvatars] : [...DEFAULT_AVATARS, ...PIPOYA_AVATARS];
  }, [fullCatalogAvatars]);

  // Filter avatars based on active tab and selected role
  const tabAvatars = useMemo(() => {
    let list: Avatar[] = [];
    if (activeTab === 'default') {
      list = DEFAULT_AVATARS;
    } else if (activeTab === 'male_female') {
      list = allAvailableAvatars.filter((a) => a.category === 'Male' || a.category === 'Female');
    } else if (activeTab === 'school') {
      list = allAvailableAvatars.filter((a) => a.category?.startsWith('School Uniform'));
    } else if (activeTab === 'officer') {
      list = allAvailableAvatars.filter((a) => a.accessRole === 'officer');
    } else if (activeTab === 'teacher') {
      list = allAvailableAvatars.filter((a) => a.accessRole === 'teacher');
    } else if (activeTab === 'event') {
      list = allAvailableAvatars.filter((a) => a.accessRole === 'dev_event' || a.accessRole === 'locked_event');
    }
    return filterAvatarsByRole(list, userRole === 'guest' ? 'student' : userRole);
  }, [activeTab, userRole, allAvailableAvatars]);

  // Selected avatar object
  const currentAvatar = useMemo(() => {
    return (
      allAvailableAvatars.find((a) => a.id === selectedAvatarId) || allAvailableAvatars[0] || DEFAULT_AVATARS[0]
    );
  }, [selectedAvatarId, allAvailableAvatars]);

  const handleSave = () => {
    playSfx('click');
    setProfile(
      {
        nickname: nickname.trim() || gameState.profile?.nickname || 'Player',
        avatar: currentAvatar.id,
        hue: pickHue,
      },
      pickTag
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm grid place-items-center p-4 select-none animate-fade-slide-in">
      <div className="bg-[#f7ecc8] border-4 border-[#5b3a17] rounded-3xl w-full max-w-[720px] max-h-[90vh] overflow-y-auto p-6 text-center text-[#3a2a17] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#ffe0e0] border-2 border-[#8b2626] text-[#8b2626] grid place-items-center font-bold hover:bg-[#ffd0d0] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Header */}
        <h2 className="font-pixel text-3xl font-bold text-[#5b3a17] drop-shadow-[0_2px_0_#ffb703] tracking-wide">
          Character Selection & Customizer
        </h2>
        <p className="font-nunito font-semibold text-[#7a5a2a] mt-1 text-xs">
          Choose your character avatar, outfit hue, and tag color!
        </p>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-4 mb-3 border-b-2 border-[#5b3a17]/20 pb-2">
          {[
            { id: 'male_female', label: 'Male / Female', icon: User },
            { id: 'school', label: 'School Uniforms', icon: null },
            { id: 'officer', label: 'Officers', icon: Shield },
            { id: 'default', label: 'Classic', icon: null },
            { id: 'teacher', label: 'Teachers', icon: BookOpen },
            { id: 'event', label: 'Events', icon: Gift },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playSfx('click');
                  setActiveTab(tab.id as CategoryTab);
                }}
                className={`font-pixel text-xs px-3 py-1.5 rounded-t-lg border-t-2 border-x-2 font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#fff8e1] text-[#5b3a17] border-[#5b3a17] -mb-[2px] z-10 scale-105 shadow-sm'
                    : 'bg-[#e2cb9c] text-[#7a5a2a] border-[#a38554] hover:bg-[#edd9b2]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Avatar Selection Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 my-2 max-h-[240px] overflow-y-auto p-2.5 bg-[#fff8e1]/80 rounded-2xl border-2 border-[#c9a86a]">
          {tabAvatars.map(({ avatar, isLocked, lockReason }) => {
            const isSelected = selectedAvatarId === avatar.id;
            return (
              <div
                key={avatar.id}
                onClick={() => {
                  if (isLocked) {
                    playSfx('click');
                    return;
                  }
                  playSfx('click');
                  setSelectedAvatarId(avatar.id);
                }}
                title={isLocked ? lockReason : avatar.name}
                className={`relative border-2 border-[#5b3a17] rounded-xl p-1 bg-[#fff8e1] flex items-center justify-center h-[64px] transition-all ${
                  isLocked
                    ? 'opacity-40 cursor-not-allowed bg-gray-200'
                    : 'cursor-pointer hover:-translate-y-0.5'
                } ${isSelected ? 'ring-4 ring-[#ffb703] -translate-y-0.5 bg-[#ffeec2]' : ''}`}
              >
                {/* Sprite Preview */}
                <div className="relative w-8 h-10 overflow-hidden flex items-center justify-center">
                  {avatar.isPipoya32 ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url('${avatar.img}')`,
                        backgroundSize: '300% 400%',
                        backgroundPosition: '50% 0%',
                        backgroundRepeat: 'no-repeat',
                        imageRendering: 'pixelated',
                        filter: `hue-rotate(${isSelected ? pickHue : 0}deg)`,
                      }}
                    />
                  ) : (
                    <img
                      src={avatar.photo}
                      alt={avatar.name}
                      className="w-8 h-10 object-contain mx-auto"
                      style={{ filter: `hue-rotate(${isSelected ? pickHue : 0}deg)` }}
                    />
                  )}
                </div>

                {isLocked && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full font-bold grid place-items-center">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Outfit Hue Picker */}
        <div className="text-left font-pixel text-xs text-[#5b3a17] font-semibold mt-3 mb-1">
          Outfit Hue:
        </div>
        <div className="flex flex-wrap gap-2 justify-start mb-3">
          {HUES.map((hue) => (
            <button
              key={hue}
              onClick={() => {
                playSfx('click');
                setPickHue(hue);
              }}
              className={`w-7 h-7 rounded-lg border-2 border-[#5b3a17] transition-transform cursor-pointer ${
                pickHue === hue ? 'scale-110 ring-2 ring-[#5b3a17]' : 'hover:scale-105'
              }`}
              style={{
                background: `hsl(${hue}, 70%, 55%)`,
              }}
            />
          ))}
        </div>

        {/* Tag Color Picker */}
        <div className="text-left font-pixel text-xs text-[#5b3a17] font-semibold mt-2 mb-1">
          Tag Color:
        </div>
        <div className="flex flex-wrap gap-2 justify-start mb-4">
          {TAGCOLORS.map((bg) => (
            <button
              key={bg}
              onClick={() => {
                playSfx('click');
                setPickTag(bg);
              }}
              className={`w-7 h-7 rounded-lg border-2 border-[#5b3a17] transition-transform cursor-pointer ${
                pickTag === bg ? 'scale-110 ring-2 ring-[#5b3a17]' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: bg }}
            />
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl bg-[#ffb703] border-3 border-[#5b3a17] text-[#5b3a17] font-pixel text-base font-bold shadow-[0_4px_0_#c98a00] hover:brightness-105 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 text-[#5b3a17]" /> Save Character & Play
        </button>
      </div>
    </div>
  );
};
