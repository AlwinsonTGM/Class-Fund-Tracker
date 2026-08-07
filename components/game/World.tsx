'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { ZONES } from '@/config/zones';
import { NPCS } from '@/config/npcs';
import { OBSTACLES } from '@/config/obstacles';
import { Zone } from '@/types/game';
import type { Obstacle } from '@/types/game';
import { playSfx } from '@/lib/sfx';
import { preloadAllSprites } from '@/lib/spriteProcessor';

import { Ground } from '@/components/game/world/Ground';
import { SegmentedLayers } from '@/components/game/world/SegmentedLayers';
import { ZoneNode } from '@/components/game/world/ZoneNode';
import { NpcBot, NpcBotRef } from '@/components/game/world/NpcBot';
import { PlayerEntity, PlayerEntityRef } from '@/components/game/world/PlayerEntity';
import { RemotePlayerEntity } from '@/components/game/world/RemotePlayerEntity';
import { useSupabaseMultiplayer } from '@/lib/useSupabaseMultiplayer';
import { DevRuler } from '@/components/game/DevRuler';
import { loadSavePoint, saveWorldPos } from '@/lib/savepoint';
import { loadMapLayers, loadMapObstacles } from '@/lib/editorStorage';
import { OBJECT_Z_OFFSET } from '@/lib/layerZ';
import type { SegmentedLayer } from '@/types/editor';

interface WorldProps {
  onOpenModal: (modal: 'school' | 'vendor' | 'board' | 'help' | 'invite' | 'reviewer') => void;
  onEnterClassroom?: () => void;
  joystickVec?: { x: number; y: number };
  user?: any;
  userRole?: 'dev' | 'officer' | 'student' | 'guest';
}

interface FloatText {
  id: string;
  txt: string;
  x: number;
  y: number;
}

const WORLD_W = 2200;
const WORLD_H = 1500;
const COOLDOWN = 45000;

export const World: React.FC<WorldProps> = ({ onOpenModal, onEnterClassroom, joystickVec, user, userRole = 'guest' }) => {
  const { gameState, updateInv, updateFlags, addCoins } = useGameState();
  const { profile, equipped, tagColor, owned, flags, progress } = gameState;

  const worldRef = useRef<HTMLDivElement>(null);
  const playerEntityRef = useRef<PlayerEntityRef | null>(null);
  const botRefs = useRef<Array<NpcBotRef | null>>([]);

  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatText[]>([]);
  const [busyZones, setBusyZones] = useState<Record<string, boolean>>({});
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [layers, setLayers] = useState<SegmentedLayer[]>([]);
  // Collisions come from the map editor (placed structures' hitboxes) when a
  // draft exists; otherwise the static config is used. Loaded once at mount.
  const [obstacles, setObstacles] = useState<Obstacle[]>(OBSTACLES);
  const obstaclesRef = useRef(OBSTACLES);
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  // Position state mutable refs for 60fps movement loop (spawns at last saved spot)
  const startPos = loadSavePoint().world;
  const spawnX = startPos.x;
  const spawnY = startPos.y;
  const posRef = useRef({ x: startPos.x, y: startPos.y, dir: 1, facing: 'down', walk: false, bubText: '', bubUntil: 0, bubEmote: '', bubEmoteUntil: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const camRef = useRef({ x: startPos.x, y: startPos.y });
  const lastSaveRef = useRef(0);

const formatBubbleText = (txt: string, maxLen: number = 80): string => {
  if (!txt) return '';
  const trimmed = txt.trim();
  if (trimmed.length > maxLen) {
    return trimmed.slice(0, maxLen - 3) + '...';
  }
  return trimmed;
};

  // Generate persistent local player ID
  const localPlayerId = React.useMemo(() => {
    if (user?.id) return user.id;
    if (typeof window !== 'undefined') {
      let saved = localStorage.getItem('freedom_guest_id');
      if (!saved) {
        saved = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('freedom_guest_id', saved);
      }
      return saved;
    }
    return 'guest_temp';
  }, [user]);

  const { remotePlayers, chatMessages, broadcastPosition, sendChat, sendEmote } = useSupabaseMultiplayer({
    localPlayerId,
    nickname: profile?.nickname || 'Guest',
    role: userRole,
    avatar: profile?.avatar || 'student1',
    hue: profile?.hue || 0,
    posRef
  });

  // Handle global emote & chat trigger events
  useEffect(() => {
    const handleEmote = (e: CustomEvent<{ imagePath: string; ms?: number }>) => {
      if (e.detail?.imagePath) {
        posRef.current.bubEmote = e.detail.imagePath;
        posRef.current.bubEmoteUntil = performance.now() + (e.detail.ms || 3500);
        sendEmote(e.detail.imagePath, e.detail.ms);
      }
    };
    const handleChat = (e: CustomEvent<{ text: string }>) => {
      if (e.detail?.text) {
        posRef.current.bubText = formatBubbleText(e.detail.text);
        posRef.current.bubUntil = performance.now() + 5000;
        sendChat(e.detail.text);
      }
    };
    window.addEventListener('player-trigger-emote' as any, handleEmote as any);
    window.addEventListener('player-trigger-chat' as any, handleChat as any);
    return () => {
      window.removeEventListener('player-trigger-emote' as any, handleEmote as any);
      window.removeEventListener('player-trigger-chat' as any, handleChat as any);
    };
  }, [sendChat, sendEmote]);

  // Filter NPCS specifically for Plaza Map
  const plazaNpcs = NPCS.filter((npc) => !npc.mapId || npc.mapId === 'plaza');

  // Bot states mutable ref
  const botsDataRef = useRef(
    plazaNpcs.map((npc) => ({
      data: npc,
      x: npc.home.x + (Math.random() * 60 - 30),
      y: npc.home.y + (Math.random() * 60 - 30),
      tx: npc.home.x,
      ty: npc.home.y,
      dir: 1,
      facing: 'down',
      walk: false,
      think: 0,
      bubText: '',
      bubUntil: 0,
    }))
  );

  // Floating text trigger
  const addFloatText = (txt: string, x: number, y: number) => {
    const id = Math.random().toString(36).substring(2);
    setFloatingTexts((prev) => [...prev, { id, txt, x, y }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1250);
  };

  // Trigger speech bubble on player
  const triggerPlayerBubble = (text: string, ms: number = 5000) => {
    posRef.current.bubText = formatBubbleText(text);
    posRef.current.bubUntil = performance.now() + ms;
  };

  // Resource gathering
  const tryGather = (z: Zone) => {
    if (!z.gather) return;

    const coolUntil = cooldowns[z.id] || 0;
    if (coolUntil > Date.now()) {
      const left = Math.ceil((coolUntil - Date.now()) / 1000);
      addFloatText(`⏳ Spot recovers in ${left}s`, posRef.current.x, posRef.current.y - 96);
      playSfx('click');
      return;
    }

    if (busyZones[z.id]) return;

    setBusyZones((prev) => ({ ...prev, [z.id]: true }));
    playSfx('click');

    setTimeout(() => {
      setBusyZones((prev) => ({ ...prev, [z.id]: false }));
      const bonus = Math.random() < 0.15;
      const qty = bonus ? 2 : 1;
      const currentQty = gameState.inv[z.gather!] || 0;

      updateInv({ ...gameState.inv, [z.gather!]: currentQty + qty });

      const itemNames: Record<string, string> = { carp: 'Carp', wood: 'Wood', stone: 'Stone' };
      const nm = itemNames[z.gather!] || z.gather;

      addFloatText(`+${qty} ${nm} ${z.tool || ''}`, posRef.current.x, posRef.current.y - 96);
      playSfx('pickup');

      triggerPlayerBubble(`${z.tool || ''} +${qty} ${nm}`, 4000);

      const nextCool = Date.now() + COOLDOWN;
      setCooldowns((prev) => ({ ...prev, [z.id]: nextCool }));

      if (!flags.fished && z.gather === 'carp') {
        updateFlags({ fished: true });
        addCoins(10);
      }
    }, 1000);
  };

  // Cooldown timer interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasChange = false;
      const next: Record<string, number> = {};

      Object.entries(cooldowns).forEach(([k, v]) => {
        if (v > now) {
          next[k] = v;
          hasChange = true;
        }
      });

      if (hasChange || Object.keys(cooldowns).length !== Object.keys(next).length) {
        setCooldowns(next);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [cooldowns]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const k = e.key.toLowerCase();
      keysRef.current[k] = true;

      if (k === 'e' || k === 'enter') {
        if (activeZone) {
          if (activeZone.id === 'board') {
            onOpenModal('board');
          } else if (activeZone.id === 'school') {
            playSfx('click');
            addFloatText('School building is locked under maintenance', posRef.current.x, posRef.current.y - 96);
          } else if (activeZone.id === 'portal') {
            playSfx('click');
            addFloatText('Dimensional Portal (Locked)', posRef.current.x, posRef.current.y - 96);
          } else {
            playSfx('click');
            addFloatText('Feature locked in Freedom Wall mode', posRef.current.x, posRef.current.y - 96);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeZone, gameState.inv, flags, onOpenModal, updateInv, updateFlags, cooldowns, busyZones]);

  // Bot Speech Bubble Scheduler
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    botsDataRef.current.forEach((bot) => {
      const scheduleBub = () => {
        const timeout = setTimeout(() => {
          if (bot.data.bub && bot.data.bub.length > 0) {
            const txt = bot.data.bub[Math.floor(Math.random() * bot.data.bub.length)];
            bot.bubText = formatBubbleText(txt);
            bot.bubUntil = performance.now() + (4000 + Math.random() * 2500);

            // If player is nearby, broadcast chat message to chat log
            const distToPlayer = Math.hypot(bot.x - posRef.current.x, bot.y - posRef.current.y);
            if (distToPlayer <= 180) {
              window.dispatchEvent(
                new CustomEvent('npc-trigger-chat', {
                  detail: { author: bot.data.name, color: bot.data.tag, text: txt },
                })
              );
            }
          }
          scheduleBub();
        }, 14000 + Math.random() * 16000);
        intervals.push(timeout);
      };
      scheduleBub();
    });

    return () => intervals.forEach(clearTimeout);
  }, []);

  const joystickVecRef = useRef(joystickVec);
  useEffect(() => {
    joystickVecRef.current = joystickVec;
  }, [joystickVec]);

  useEffect(() => {
    preloadAllSprites();
  }, []);

  // Load SAM2 segmented cutout layers authored for the world map in the editor.
  useEffect(() => {
    let mounted = true;
    loadMapLayers('plaza')
      .then((ls) => {
        if (mounted) setLayers(ls);
      })
      .catch((err) => console.error('Failed to load segmented layers:', err));
    // Collisions: prefer the editor-authored hitboxes so gameplay matches the
    // map editor without an AI/JSON hand-off.
    void Promise.resolve().then(() => {
      const editorObstacles = loadMapObstacles('plaza');
      if (mounted && editorObstacles && editorObstacles.length > 0) {
        setObstacles(editorObstacles);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Main 60fps Movement Loop
  useEffect(() => {
    if (!profile) return;

    let lastT = 0;
    let animFrameId: number;

    const tick = (t: number) => {
      if (!lastT) {
        lastT = t;
        animFrameId = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      const now = performance.now();

      // Read Input Vectors
      const keys = keysRef.current;
      let vx = joystickVecRef.current?.x || 0;
      let vy = joystickVecRef.current?.y || 0;

      if (keys['a'] || keys['arrowleft']) vx -= 1;
      if (keys['d'] || keys['arrowright']) vx += 1;
      if (keys['w'] || keys['arrowup']) vy -= 1;
      if (keys['s'] || keys['arrowdown']) vy += 1;

      // Pythagorean Vector Normalization: sqrt(vx^2 + vy^2)
      const len = Math.hypot(vx, vy);
      if (len > 0) {
        const scale = len > 1 ? 1 : len;
        vx = (vx / len) * scale;
        vy = (vy / len) * scale;

        const sp = 200;

        let nx = Math.max(40, Math.min(WORLD_W - 40, posRef.current.x + vx * sp * dt));
        let ny = Math.max(70, Math.min(WORLD_H - 30, posRef.current.y + vy * sp * dt));

        // Multi-pass Obstacle Collisions
        const PLAYER_RADIUS = 14;
        for (let iter = 0; iter < 2; iter++) {
          for (const obs of obstaclesRef.current) {
            if (obs.shape === 'circle') {
              const obW = obs.width || (obs.radius ? obs.radius * 2 : 1);
              const obH = obs.height || (obs.radius ? obs.radius * 2 : 1);
              const cx = obs.x + obW / 2;
              const cy = obs.y + obH / 2;
              const dx = nx - cx;
              const dy = ny - cy;
              const dist = Math.hypot(dx, dy);

              if (dist > 0) {
                const rx = obW / 2 || 1;
                const ry = obH / 2 || 1;
                const r_ellipse = (rx * ry * dist) / Math.sqrt(Math.pow(rx * dy, 2) + Math.pow(ry * dx, 2));
                const minDist = r_ellipse + PLAYER_RADIUS;

                if (dist < minDist) {
                  const push = minDist - dist;
                  nx += (dx / dist) * push;
                  ny += (dy / dist) * push;
                }
              } else {
                ny += (obH / 2) + PLAYER_RADIUS;
              }
            } else if (obs.shape === 'rect') {
              const rw = obs.width;
              const rh = obs.height;
              if (nx >= obs.x && nx <= obs.x + rw && ny >= obs.y && ny <= obs.y + rh) {
                // Inside rectangle: resolve along minimum penetration edge
                const dLeft = nx - obs.x;
                const dRight = obs.x + rw - nx;
                const dTop = ny - obs.y;
                const dBottom = obs.y + rh - ny;
                const min = Math.min(dLeft, dRight, dTop, dBottom);
                if (min === dLeft) nx = obs.x - PLAYER_RADIUS;
                else if (min === dRight) nx = obs.x + rw + PLAYER_RADIUS;
                else if (min === dTop) ny = obs.y - PLAYER_RADIUS;
                else ny = obs.y + rh + PLAYER_RADIUS;
              } else {
                const cx = Math.max(obs.x, Math.min(nx, obs.x + rw));
                const cy = Math.max(obs.y, Math.min(ny, obs.y + rh));
                const dx = nx - cx;
                const dy = ny - cy;
                const d2 = dx * dx + dy * dy;

                if (d2 < PLAYER_RADIUS * PLAYER_RADIUS) {
                  const d = Math.sqrt(d2) || 0.0001;
                  const push = PLAYER_RADIUS - d;
                  nx += (dx / d) * push;
                  ny += (dy / d) * push;
                }
              }
            }
          }
        }

        posRef.current.x = nx;
        posRef.current.y = ny;
        posRef.current.dir = vx < 0 ? -1 : 1;
        if (Math.abs(vy) >= Math.abs(vx)) {
          posRef.current.facing = vy > 0 ? 'down' : 'up';
        } else {
          posRef.current.facing = vx < 0 ? 'left' : 'right';
        }
        posRef.current.walk = true;
      } else {
        posRef.current.walk = false;
      }

      // Broadcast position to Supabase Realtime channel
      broadcastPosition();

      // 60fps Direct DOM Mutation for Player
      const pRef = playerEntityRef.current;
      if (pRef?.el) {
        pRef.el.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
        pRef.el.style.zIndex = `${OBJECT_Z_OFFSET + Math.round(posRef.current.y)}`;
      }
      if (pRef?.spr) {
        const isPip = pRef.spr.classList.contains('spr-pipoya-3x4');
        if (pRef.spr.classList.contains('spr-animated') || isPip) {
          const baseClass = isPip ? 'spr-pipoya-3x4' : 'spr-animated';
          pRef.spr.className = `${baseClass} ${posRef.current.facing}${posRef.current.walk ? ' moving' : ''}`;
          pRef.spr.style.transform = '';
        } else {
          pRef.spr.style.transform = posRef.current.dir < 0 ? 'scaleX(-1)' : '';
          pRef.spr.classList.toggle('walk', posRef.current.walk);
        }
      }
      if (pRef?.bub) {
        if (now < posRef.current.bubUntil) {
          pRef.bub.textContent = posRef.current.bubText;
          pRef.bub.classList.add('show');
        } else {
          pRef.bub.classList.remove('show');
        }
      }
      if (pRef?.emoteBub) {
        if (now < posRef.current.bubEmoteUntil && posRef.current.bubEmote) {
          pRef.emoteBub.style.backgroundImage = `url(${posRef.current.bubEmote})`;
          pRef.emoteBub.classList.add('show');
        } else {
          pRef.emoteBub.classList.remove('show');
        }
      }

      // 60fps Direct DOM Mutation for NPC Bots
      botsDataRef.current.forEach((b, idx) => {
        if (now > b.think) {
          b.think = now + (3000 + Math.random() * 4000);

          // Pick a target location that is NOT inside an obstacle
          let foundValid = false;
          for (let attempt = 0; attempt < 15; attempt++) {
            const a = Math.random() * Math.PI * 2;
            const dist = Math.random() * b.data.r;
            const tx = Math.max(60, Math.min(WORLD_W - 60, b.data.home.x + Math.cos(a) * dist));
            const ty = Math.max(90, Math.min(WORLD_H - 50, b.data.home.y + Math.sin(a) * dist));

            // Check candidate against obstacles
            let collides = false;
            for (const obs of obstaclesRef.current) {
              if (obs.shape === 'circle') {
                const obW = obs.width || (obs.radius ? obs.radius * 2 : 1);
                const obH = obs.height || (obs.radius ? obs.radius * 2 : 1);
                const cx = obs.x + obW / 2;
                const cy = obs.y + obH / 2;
                const dx = tx - cx;
                const dy = ty - cy;
                const distToCenter = Math.hypot(dx, dy);
                if (distToCenter > 0) {
                  const rx = obW / 2 || 1;
                  const ry = obH / 2 || 1;
                  const r_ellipse = (rx * ry * distToCenter) / Math.sqrt(Math.pow(rx * dy, 2) + Math.pow(ry * dx, 2));
                  if (distToCenter < r_ellipse + 20) {
                    collides = true;
                    break;
                  }
                } else {
                  collides = true;
                  break;
                }
              } else if (obs.shape === 'rect') {
                const rw = obs.width;
                const rh = obs.height;
                if (tx >= obs.x - 20 && tx <= obs.x + rw + 20 && ty >= obs.y - 20 && ty <= obs.y + rh + 20) {
                  const cx = Math.max(obs.x, Math.min(tx, obs.x + rw));
                  const cy = Math.max(obs.y, Math.min(ty, obs.y + rh));
                  const dx = tx - cx;
                  const dy = ty - cy;
                  if (dx * dx + dy * dy < 20 * 20 || (tx >= obs.x && tx <= obs.x + rw && ty >= obs.y && ty <= obs.y + rh)) {
                    collides = true;
                    break;
                  }
                }
              }
            }

            if (!collides) {
              b.tx = tx;
              b.ty = ty;
              foundValid = true;
              break;
            }
          }

          if (!foundValid) {
            b.tx = b.data.home.x;
            b.ty = b.data.home.y;
          }
        }

        const bdx = b.tx - b.x;
        const bdy = b.ty - b.y;
        const bdist = Math.hypot(bdx, bdy);

        if (bdist > 4) {
          const moveDist = Math.min(b.data.spd * dt, bdist);
          let nx = b.x + (bdx / bdist) * moveDist;
          let ny = b.y + (bdy / bdist) * moveDist;

          // Keep NPC inside world boundaries
          nx = Math.max(40, Math.min(WORLD_W - 40, nx));
          ny = Math.max(70, Math.min(WORLD_H - 30, ny));

          // Multi-pass Obstacle Collisions for NPC
          const NPC_RADIUS = 14;
          let hitObs = false;
          for (let iter = 0; iter < 2; iter++) {
            for (const obs of obstaclesRef.current) {
              if (obs.shape === 'circle') {
                const obW = obs.width || (obs.radius ? obs.radius * 2 : 1);
                const obH = obs.height || (obs.radius ? obs.radius * 2 : 1);
                const cx = obs.x + obW / 2;
                const cy = obs.y + obH / 2;
                const dx = nx - cx;
                const dy = ny - cy;
                const dist = Math.hypot(dx, dy);

                if (dist > 0) {
                  const rx = obW / 2 || 1;
                  const ry = obH / 2 || 1;
                  const r_ellipse = (rx * ry * dist) / Math.sqrt(Math.pow(rx * dy, 2) + Math.pow(ry * dx, 2));
                  const minDist = r_ellipse + NPC_RADIUS;

                  if (dist < minDist) {
                    const push = minDist - dist;
                    nx += (dx / dist) * push;
                    ny += (dy / dist) * push;
                    hitObs = true;
                  }
                }
              } else if (obs.shape === 'rect') {
                const rw = obs.width;
                const rh = obs.height;
                if (nx >= obs.x && nx <= obs.x + rw && ny >= obs.y && ny <= obs.y + rh) {
                  const dLeft = nx - obs.x;
                  const dRight = obs.x + rw - nx;
                  const dTop = ny - obs.y;
                  const dBottom = obs.y + rh - ny;
                  const min = Math.min(dLeft, dRight, dTop, dBottom);
                  if (min === dLeft) nx = obs.x - NPC_RADIUS;
                  else if (min === dRight) nx = obs.x + rw + NPC_RADIUS;
                  else if (min === dTop) ny = obs.y - NPC_RADIUS;
                  else ny = obs.y + rh + NPC_RADIUS;
                  hitObs = true;
                } else {
                  const cx = Math.max(obs.x, Math.min(nx, obs.x + rw));
                  const cy = Math.max(obs.y, Math.min(ny, obs.y + rh));
                  const dx = nx - cx;
                  const dy = ny - cy;
                  const d2 = dx * dx + dy * dy;

                  if (d2 < NPC_RADIUS * NPC_RADIUS) {
                    const d = Math.sqrt(d2) || 0.0001;
                    const push = NPC_RADIUS - d;
                    nx += (dx / d) * push;
                    ny += (dy / d) * push;
                    hitObs = true;
                  }
                }
              }
            }
          }

          b.x = nx;
          b.y = ny;
          if (hitObs) {
            // Instantly stop walking into obstacle and force picking a fresh clear target
            b.tx = b.x;
            b.ty = b.y;
            b.think = 0;
          }

          b.dir = bdx < 0 ? -1 : 1;
          if (Math.abs(bdy) >= Math.abs(bdx)) {
            b.facing = bdy > 0 ? 'down' : 'up';
          } else {
            b.facing = bdx < 0 ? 'left' : 'right';
          }
          b.walk = true;
        } else {
          b.walk = false;
        }

        const distToPlayer = Math.hypot(b.x - posRef.current.x, b.y - posRef.current.y);
        const isNear = distToPlayer <= 180;

        const botDOM = botRefs.current[idx];
        if (botDOM?.el) {
          botDOM.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
          botDOM.el.style.zIndex = `${OBJECT_Z_OFFSET + Math.round(b.y)}`;
        }
        if (botDOM?.spr) {
          const isPip = botDOM.spr.classList.contains('spr-pipoya-3x4');
          const isAnim = botDOM.spr.classList.contains('spr-animated');
          if (isAnim || isPip) {
            const baseClass = isPip ? 'spr-pipoya-3x4' : 'spr-animated';
            botDOM.spr.className = `${baseClass} ${b.facing}${b.walk ? ' moving' : ''}`;
            botDOM.spr.style.transform = '';
          } else {
            botDOM.spr.style.transform = b.dir < 0 ? 'scaleX(-1)' : '';
            botDOM.spr.classList.toggle('walk', b.walk);
          }
        }
        if (botDOM?.tagGroup) {
          botDOM.tagGroup.classList.toggle('near', isNear);
        }
        if (botDOM?.bub) {
          if (now < b.bubUntil && isNear) {
            botDOM.bub.textContent = b.bubText;
            botDOM.bub.classList.add('show');
          } else {
            botDOM.bub.classList.remove('show');
          }
        }
      });

      // Camera Smooth Tracking
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      camRef.current.x += (posRef.current.x - camRef.current.x) * Math.min(1, dt * 12);
      camRef.current.y += (posRef.current.y - camRef.current.y) * Math.min(1, dt * 12);

      const cx = WORLD_W > vw ? Math.max(vw / 2, Math.min(WORLD_W - vw / 2, camRef.current.x)) : WORLD_W / 2;
      const cy = WORLD_H > vh ? Math.max(vh / 2, Math.min(WORLD_H - vh / 2, camRef.current.y)) : WORLD_H / 2;

      if (worldRef.current) {
        worldRef.current.style.transform = `translate3d(${vw / 2 - cx}px, ${vh / 2 - cy}px, 0)`;
      }

      // Interactive Zone Proximity Check
      let near: Zone | null = null;
      let minDist = Infinity;

      for (const z of ZONES) {
        const d = Math.hypot(z.x - posRef.current.x, z.y - posRef.current.y);
        if (d < z.r && d < minDist) {
          minDist = d;
          near = z;
        }
      }

      setActiveZone((prev) => (prev?.id === near?.id ? prev : near));

      // Persist savepoint position (throttled to ~0.8s)
      if (now >= lastSaveRef.current + 800) {
        lastSaveRef.current = now;
        saveWorldPos(posRef.current.x, posRef.current.y);
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [profile]);

  if (!profile) return null;

  return (
    <div id="viewport" className="fixed inset-0 overflow-hidden touch-none select-none">
      <div id="world" ref={worldRef} className="absolute w-[2200px] h-[1500px] left-0 top-0 will-change-transform">
        {/* Map Ground & Structures */}
        <Ground />
        <SegmentedLayers layers={layers} worldW={WORLD_W} worldH={WORLD_H} />

        {/* Client-only Dev Ruler for measuring hitboxes */}
        <DevRuler posRef={posRef} obstacles={obstacles} />

        {/* Interactive Zone Nodes */}
        <div id="zones">
          {ZONES.map((z) => {
            const isBusy = busyZones[z.id];
            const coolUntil = cooldowns[z.id] || 0;
            const isCooling = coolUntil > Date.now();
            const leftSec = Math.ceil((coolUntil - Date.now()) / 1000);

            return (
              <ZoneNode
                key={z.id}
                zone={z}
                isActive={activeZone?.id === z.id}
                isBusy={!!isBusy}
                isCooling={isCooling}
                leftSec={leftSec}
                onInteract={(targetZone) => {
                  if (targetZone.id === 'board') {
                    onOpenModal('board');
                  } else if (targetZone.id === 'school') {
                    playSfx('click');
                    addFloatText('School building is locked under maintenance', posRef.current.x, posRef.current.y - 96);
                  } else if (targetZone.id === 'portal') {
                    playSfx('click');
                    addFloatText('Dimensional Portal (Locked)', posRef.current.x, posRef.current.y - 96);
                  } else {
                    playSfx('click');
                    addFloatText('Feature locked in Freedom Wall mode', posRef.current.x, posRef.current.y - 96);
                  }
                }}
              />
            );
          })}
        </div>

        {/* NPC & Player Entities */}
        <div id="ents">
          {/* NPC Bots */}
          {botsDataRef.current.map((bot, idx) => (
            <NpcBot
              key={bot.data.id}
              ref={(node) => {
                botRefs.current[idx] = node;
              }}
              data={bot.data}
              initialX={bot.x}
              initialY={bot.y}
            />
          ))}

          {/* Active Local Player Entity */}
          <PlayerEntity
            ref={playerEntityRef}
            profile={profile}
            equipped={equipped}
            tagColor={tagColor}
            owned={owned}
            progress={progress}
            initialX={spawnX}
            initialY={spawnY}
          />

          {/* Remote Multiplayer Players */}
          {Object.values(remotePlayers).map((rp) => (
            <RemotePlayerEntity key={rp.playerId} player={rp} />
          ))}
        </div>

        {/* Floating Text FX Layer */}
        <div id="fx">
          {floatingTexts.map((f) => (
            <div key={f.id} className="float font-pixel" style={{ left: `${f.x}px`, top: `${f.y}px` }}>
              {f.txt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
