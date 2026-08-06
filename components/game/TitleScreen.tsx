'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HUES, TAGCOLORS } from '@/config/avatars';
import { PIPOYA_AVATARS, filterAvatarsByRole } from '@/config/pipoyaSprites';
import { Avatar } from '@/types/game';
import { useGameState } from '@/context/GameStateContext';
import { playSfx } from '@/lib/sfx';
import { Leaf, Lightbulb, Mail, Shield, BookOpen, Gift, Lock, ArrowRight } from 'lucide-react';

const TIPS = [
  'Walk to the pond and fish — then sell at the General Store.',
  'Post on the Bulletin Board; it floats above your head!',
  'Perfect quiz scores unlock exclusive cosmetics.',
  'Reporting a real bug at the Help Desk earns coins.',
  'Invite friends with your code for bonus coins',
];

const DEFAULT_AVATARS: Avatar[] = [
  { id: 'sprout', name: 'Sprout', img: '/assets/animated_characters/sprout.png', photo: '/assets/characters/sprout.png', isAnimated: true, category: 'Default' },
  { id: 'pebble', name: 'Pebble', img: '/assets/animated_characters/pebble.png', photo: '/assets/characters/pebble.png', isAnimated: true, category: 'Default' },
  { id: 'fern', name: 'Fern', img: '/assets/animated_characters/fern.png', photo: '/assets/characters/fern.png', isAnimated: true, category: 'Default' },
  { id: 'ember', name: 'Ember', img: '/assets/animated_characters/ember.png', photo: '/assets/characters/ember.png', isAnimated: true, category: 'Default' },
];

type CategoryTab = 'default' | 'male_female' | 'school' | 'officer' | 'teacher' | 'event';

export const TitleScreen: React.FC = () => {
  const { gameState, setProfile } = useGameState();
  const [selectedRole, setSelectedRole] = useState<'student' | 'officer' | 'teacher' | 'dev'>('student');
  const [activeTab, setActiveTab] = useState<CategoryTab>('default');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('sprout');
  const [pickHue, setPickHue] = useState(0);
  const [pickTag, setPickTag] = useState('#fef3c7');
  const [nickname, setNickname] = useState('');
  const [tipIdx, setTipIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % TIPS.length);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  // Filter avatars based on active tab and selected role
  const tabAvatars = useMemo(() => {
    let list: Avatar[] = [];
    if (activeTab === 'default') {
      list = DEFAULT_AVATARS;
    } else if (activeTab === 'male_female') {
      list = PIPOYA_AVATARS.filter((a) => a.category === 'Male' || a.category === 'Female');
    } else if (activeTab === 'school') {
      list = PIPOYA_AVATARS.filter((a) => a.category?.startsWith('School Uniform'));
    } else if (activeTab === 'officer') {
      list = PIPOYA_AVATARS.filter((a) => a.accessRole === 'officer');
    } else if (activeTab === 'teacher') {
      list = PIPOYA_AVATARS.filter((a) => a.accessRole === 'teacher');
    } else if (activeTab === 'event') {
      list = PIPOYA_AVATARS.filter((a) => a.accessRole === 'dev_event' || a.accessRole === 'locked_event');
    }
    return filterAvatarsByRole(list, selectedRole);
  }, [activeTab, selectedRole]);

  // Selected avatar object
  const currentAvatar = useMemo(() => {
    return (
      [...DEFAULT_AVATARS, ...PIPOYA_AVATARS].find((a) => a.id === selectedAvatarId) || DEFAULT_AVATARS[0]
    );
  }, [selectedAvatarId]);

  if (!mounted || gameState.profile) return null;

  const isNickValid = nickname.trim().length >= 3 && nickname.trim().length <= 16;

  const handleEnter = () => {
    if (!isNickValid) return;
    playSfx('join');
    setProfile(
      {
        nickname: nickname.trim(),
        avatar: currentAvatar.id,
        hue: pickHue,
        role: selectedRole,
      },
      pickTag
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[radial-gradient(ellipse_at_50%_38%,rgba(48,72,40,0.85),rgba(14,24,12,0.95))] grid place-items-center p-4 select-none">
      <div className="cozy-panel w-full max-w-[760px] max-h-[94vh] overflow-y-auto p-6 text-center text-[#3a2a17]">
        {/* Title & Badge */}
        <h1 className="font-pixel text-4xl md:text-5xl font-bold text-[#5b3a17] drop-shadow-[0_4px_0_#ffb703] tracking-wide">
          COZY PLAZA
        </h1>
        <p className="font-bold text-[#7a5a2a] mt-1 text-sm flex items-center justify-center gap-1.5">
          <span>the freedom wall, reborn cozy</span>
          <Leaf className="w-4 h-4 text-emerald-600 inline" />
        </p>
        <span className="inline-block font-pixel text-xs bg-[#3a2410] text-[#ffd23f] px-3 py-1 rounded-full mt-2 mb-3">
          capstone vertical slice • character customization & roles
        </span>

        {/* Role Selector */}
        <div className="flex items-center justify-center gap-2 mb-3 bg-[#fff3d0] p-2 rounded-xl border-2 border-[#5b3a17]/20">
          <span className="font-pixel text-xs text-[#5b3a17] font-bold">Your Role:</span>
          {(['student', 'officer', 'teacher', 'dev'] as const).map((role) => (
            <button
              key={role}
              onClick={() => {
                playSfx('click');
                setSelectedRole(role);
              }}
              className={`font-pixel text-xs px-3 py-1 rounded-lg border-2 font-bold capitalize transition-all ${
                selectedRole === role
                  ? 'bg-[#4c7c38] text-white border-[#2b4c1e] shadow-sm scale-105'
                  : 'bg-[#fffdf5] text-[#5b3a17] border-[#8c6d46] hover:bg-[#ffeec2]'
              }`}
            >
              {role === 'dev' ? 'Dev / Admin' : role}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-3 border-b-2 border-[#5b3a17]/20 pb-2">
          {[
            { id: 'default', label: 'Classic', icon: null },
            { id: 'male_female', label: 'Male / Female', icon: null },
            { id: 'school', label: 'School Uniforms', icon: null },
            { id: 'officer', label: 'Officers', icon: Shield },
            { id: 'teacher', label: 'Teachers', icon: BookOpen },
            { id: 'event', label: 'Special / Events', icon: Gift },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playSfx('click');
                  setActiveTab(tab.id as CategoryTab);
                }}
                className={`font-pixel text-xs px-3 py-1.5 rounded-t-lg border-t-2 border-x-2 font-bold transition-all flex items-center gap-1 ${
                  activeTab === tab.id
                    ? 'bg-[#fff8e1] text-[#5b3a17] border-[#5b3a17] -mb-[2px] z-10 scale-105'
                    : 'bg-[#e2cb9c] text-[#7a5a2a] border-[#a38554] hover:bg-[#edd9b2]'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 my-2 max-h-[220px] overflow-y-auto p-2 bg-[#fff8e1]/60 rounded-xl border-2 border-[#c9a86a]">
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
                    ? 'opacity-50 cursor-not-allowed bg-gray-200'
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

        {/* Outfit Hue */}
        <div className="text-left font-pixel text-sm text-[#5b3a17] font-semibold mt-2 mb-1">Outfit hue</div>
        <div className="flex flex-wrap gap-2 justify-start">
          {HUES.map((hue) => (
            <button
              key={hue}
              onClick={() => {
                playSfx('click');
                setPickHue(hue);
              }}
              className={`w-6 h-6 rounded-full border-2 border-[#3a2a17] transition-all cursor-pointer ${
                pickHue === hue ? 'ring-2 ring-[#ffb703] ring-offset-2 scale-110' : ''
              }`}
              style={{ backgroundColor: `hsl(${hue}, 65%, 55%)` }}
            />
          ))}
        </div>

        {/* Realtime Avatar Preview */}
        <div className="flex items-center justify-center gap-4 my-3 bg-[#fff8e1] border-2 border-dashed border-[#c9a86a] rounded-xl p-3">
          {/* Portrait Profile Preview */}
          <div className="w-12 h-14 bg-[#fff8e1] border-3 border-[#5b3a17] rounded-lg grid place-items-center overflow-hidden relative">
            {currentAvatar.isPipoya32 ? (
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url('${currentAvatar.photo}')`,
                  backgroundSize: '300% 400%',
                  backgroundPosition: '50% 0%',
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'pixelated',
                  filter: `hue-rotate(${pickHue}deg)`
                }}
              />
            ) : (
              <img
                src={currentAvatar.photo}
                alt="Portrait Preview"
                className="w-10 h-12 object-contain"
                style={{ filter: `hue-rotate(${pickHue}deg)` }}
              />
            )}
          </div>

          {/* Walking Sprite Preview */}
          <div className="relative w-16 h-[72px] overflow-hidden flex items-center justify-center border-l-2 border-[#c9a86a]/40">
            <div className="absolute left-1/2 bottom-2 w-0 h-0">
              {currentAvatar.isPipoya32 ? (
                <div
                  className="spr-pipoya-3x4 down moving"
                  style={{
                    backgroundImage: `url('${currentAvatar.img}')`,
                    filter: `hue-rotate(${pickHue}deg)`,
                  }}
                />
              ) : (
                <div
                  className="spr-animated down moving"
                  style={{
                    backgroundImage: `url('${currentAvatar.img}')`,
                    filter: `hue-rotate(${pickHue}deg)`,
                  }}
                />
              )}
            </div>
          </div>
          <span
            className="font-pixel text-sm px-3 py-1 rounded-md border-2 border-[#3a2a17] font-bold shadow-sm"
            style={{ backgroundColor: pickTag }}
          >
            {nickname.trim() || 'you'}
          </span>
          <span className="font-pixel text-xs bg-[#5b3a17] text-white px-2 py-0.5 rounded capitalize">
            {selectedRole}
          </span>
        </div>

        {/* Nametag Color */}
        <div className="text-left font-pixel text-sm text-[#5b3a17] font-semibold mt-2 mb-1">Nametag colour</div>
        <div className="flex flex-wrap gap-2 justify-start mb-3">
          {TAGCOLORS.map((col) => (
            <button
              key={col}
              onClick={() => {
                playSfx('click');
                setPickTag(col);
              }}
              className={`w-6 h-6 rounded-full border-2 border-[#3a2a17] transition-all cursor-pointer ${
                pickTag === col ? 'ring-2 ring-[#ffb703] ring-offset-2 scale-110' : ''
              }`}
              style={{ backgroundColor: col }}
            />
          ))}
        </div>

        {/* Nickname Input */}
        <div className="text-left font-pixel text-sm text-[#5b3a17] font-semibold mb-1">Your nickname</div>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="e.g. PixelFan"
          maxLength={16}
          className="w-full font-pixel text-base p-2.5 border-3 border-[#5b3a17] rounded-xl bg-[#fffdf5] focus:outline-none focus:ring-3 focus:ring-[#ffb703] text-[#3a2a17] font-bold"
        />

        {/* Enter Plaza Button */}
        <button
          onClick={handleEnter}
          disabled={!isNickValid}
          className={`w-full font-pixel text-xl font-bold py-3 mt-3 rounded-xl border-3 border-[#2b4c1e] text-white transition-all shadow-[0_4px_0_#1a3312] flex items-center justify-center gap-2 ${
            isNickValid
              ? 'bg-[#4c7c38] hover:bg-[#588e42] active:translate-y-1 cursor-pointer'
              : 'bg-[#8aa37e] opacity-60 cursor-not-allowed'
          }`}
        >
          <span>Enter the Plaza</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Tips Footer */}
        <div className="font-pixel text-xs text-[#7a5a2a] mt-3 min-h-[20px] transition-opacity duration-400 flex items-center justify-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{TIPS[tipIdx]}</span>
        </div>
      </div>
    </div>
  );
};
