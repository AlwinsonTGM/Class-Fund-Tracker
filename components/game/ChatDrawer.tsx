'use client';

import React, { useState, useRef } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { playSfx } from '@/lib/sfx';
import { EmotePicker } from '@/components/game/EmotePicker';
import { parseChatEmoteTokens, EmoteDef, findEmoteByShortcut } from '@/config/emotes';
import { Globe, Lock, Smile, Send, Star, Crown } from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'officer' | 'student' | 'guest';
}

const NAUGHTY = ['stupid', 'idiot', 'ugly', 'dumb', 'hate', 'loser'];

function filterText(t: string) {
  let hit = false;
  const o = t.replace(new RegExp('\\b(' + NAUGHTY.join('|') + ')\\b', 'gi'), (m) => {
    hit = true;
    return '✱'.repeat(m.length);
  });
  return { o, hit };
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, userRole = 'guest' }) => {
  const { gameState } = useGameState();
  const { profile, tagColor, equipped } = gameState;
  const [tab, setTab] = useState<'global' | 'members'>('global');
  const [inputMsg, setInputMsg] = useState('');
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const lastSendRef = useRef<number>(0);

  const isGuest = userRole === 'guest';

  const [messages, setMessages] = useState<
    Array<{ ch: 'global' | 'members'; author: string; color: string; pre?: string; text: string; ts: number }>
  >([
    { ch: 'global', author: 'Plaza Bot', color: '#ffd6e0', text: 'Welcome to the Plaza!', ts: Date.now() - 180000 },
  ]);

  // Listen for dynamic NPC chatter when player is near them
  React.useEffect(() => {
    const handleNpcChat = (e: CustomEvent<{ author: string; color: string; text: string }>) => {
      if (e.detail?.author && e.detail?.text) {
        setMessages((prev) => [
          ...prev,
          {
            ch: 'global',
            author: e.detail.author,
            color: e.detail.color || '#d7e9ff',
            text: e.detail.text,
            ts: Date.now(),
          },
        ]);
      }
    };
    window.addEventListener('npc-trigger-chat' as any, handleNpcChat as any);
    return () => window.removeEventListener('npc-trigger-chat' as any, handleNpcChat as any);
  }, []);

  if (!isOpen) return null;

  const triggerOverheadEmote = (imagePath: string) => {
    window.dispatchEvent(
      new CustomEvent('player-trigger-emote', {
        detail: { imagePath, ms: 3500 },
      })
    );
  };

  const handleSend = () => {
    if (isGuest) return;
    const raw = inputMsg.trim();
    if (!raw || !profile) return;

    if (Date.now() - lastSendRef.current < 1500) {
      return;
    }

    const f = filterText(raw);
    lastSendRef.current = Date.now();

    playSfx('click');

    // Check if message contains an emote to pop overhead
    const tokens = parseChatEmoteTokens(f.o);
    const firstEmote = tokens.find((t) => t.type === 'emote')?.emote;
    if (firstEmote) {
      triggerOverheadEmote(firstEmote.imagePath);
    }

    // Trigger overhead speech bubble over player
    window.dispatchEvent(
      new CustomEvent('player-trigger-chat', {
        detail: { text: f.o },
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        ch: tab,
        author: profile.nickname,
        color: equipped.goldtag ? '#ffe08a' : tagColor,
        text: f.o,
        ts: Date.now(),
      },
    ]);

    setInputMsg('');
    setShowEmotePicker(false);
  };

  const handleSelectEmote = (emote: EmoteDef) => {
    if (isGuest) return;
    // Append emote shortcut to input message
    setInputMsg((prev) => (prev ? `${prev} ${emote.shortcuts[0]}` : emote.shortcuts[0]));
    // Also trigger overhead emote directly
    triggerOverheadEmote(emote.imagePath);
  };

  const filteredMessages = messages.filter((m) => m.ch === tab);

  return (
    <div className="fixed right-3 top-[66px] bottom-[124px] w-[320px] z-40 flex flex-col bg-[#f7ecc8] border-4 border-[#5b3a17] rounded-xl shadow-xl overflow-hidden select-none">
      {/* Tabs */}
      <div className="flex gap-1 p-2 pb-0">
        <button
          onClick={() => {
            playSfx('click');
            setTab('global');
          }}
          className={`flex-1 font-pixel text-xs py-1.5 border-3 border-b-0 rounded-t-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'global' ? 'bg-[#f7ecc8] border-[#5b3a17] text-[#5b3a17]' : 'bg-[#e7d4a3] border-transparent text-[#6a5230]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Global</span>
        </button>
        <button
          onClick={() => {
            if (isGuest) return;
            playSfx('click');
            setTab('members');
          }}
          disabled={isGuest}
          title={isGuest ? "Members only — Log in to access" : "Members Chat"}
          className={`flex-1 font-pixel text-xs py-1.5 border-3 border-b-0 rounded-t-lg transition-colors flex items-center justify-center gap-1.5 ${
            isGuest
              ? 'bg-[#d5c292] text-[#8a7248] cursor-not-allowed border-transparent'
              : tab === 'members'
              ? 'bg-[#f7ecc8] border-[#5b3a17] text-[#5b3a17] cursor-pointer'
              : 'bg-[#e7d4a3] border-transparent text-[#6a5230] cursor-pointer'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Members {isGuest && '(Locked)'}</span>
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-2 overflow-y-auto space-y-2">
        {filteredMessages.map((m, idx) => {
          const tokens = parseChatEmoteTokens(m.text);
          return (
            <div key={idx} className="text-xs">
              <span
                className="font-pixel font-bold px-1.5 py-0.5 border-2 border-[#3a2a17] rounded text-[10px] mr-1.5 inline-block text-[#3a2a17]"
                style={{ backgroundColor: m.color, color: '#3a2a17' }}
              >
                {m.author}
              </span>
              <div className="font-nunito font-semibold text-[#4a3a22] mt-0.5 break-words inline-block align-middle">
                {tokens.map((token, tIdx) =>
                  token.type === 'emote' && token.emote ? (
                    <span
                      key={tIdx}
                      className="chat-inline-emote"
                      title={token.emote.name}
                      style={{ backgroundImage: `url(${token.emote.imagePath})` }}
                    />
                  ) : (
                    <span key={tIdx}>{token.value}</span>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popover Emote Picker */}
      {showEmotePicker && !isGuest && (
        <div className="absolute bottom-[52px] right-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <EmotePicker
            onSelect={handleSelectEmote}
            onClose={() => setShowEmotePicker(false)}
          />
        </div>
      )}

      {/* Input Row */}
      <div className="flex gap-1.5 p-2 border-t-3 border-dashed border-[#c9a86a] items-center">
        {isGuest ? (
          <div className="w-full text-center font-nunito text-xs text-[#8a5a2b] bg-[#efe0b0] py-2 px-3 rounded-lg border-2 border-[#8a5a2b]/30">
            Log in to participate in members chat
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                playSfx('click');
                setShowEmotePicker(!showEmotePicker);
              }}
              title="Open Emote Picker"
              className={`p-1.5 border-2 border-[#5b3a17] rounded-lg transition-transform active:scale-95 cursor-pointer ${
                showEmotePicker ? 'bg-[#ffb703]' : 'bg-[#fff8e1] hover:bg-[#fff2c2]'
              }`}
            >
              <Smile className="w-4 h-4 text-[#5b3a17]" />
            </button>

            <input
              type="text"
              maxLength={280}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Say something…"
              className="flex-1 font-nunito text-xs bg-[#fff8e1] border-2 border-[#5b3a17] rounded-lg px-2 py-1 text-[#3a2a17] focus:outline-none focus:border-[#ffb703]"
            />

            <button
              onClick={handleSend}
              className="bg-[#ffb703] border-2 border-[#5b3a17] rounded-lg px-2.5 py-1.5 hover:brightness-105 active:scale-95 cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-[#5b3a17]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
