'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { playSfx } from '@/lib/sfx';
import { preloadAllSprites } from '@/lib/spriteProcessor';
import { PlayerEntity, PlayerEntityRef } from '@/components/game/world/PlayerEntity';
import { NpcBot, NpcBotRef } from '@/components/game/world/NpcBot';
import { NPCS } from '@/config/npcs';
import { ZoneNode } from '@/components/game/world/ZoneNode';
import { DevRuler } from '@/components/game/DevRuler';
import { CLASSROOM_OBSTACLES } from '@/config/classroomObstacles';
import { Zone } from '@/types/game';
import type { Obstacle } from '@/types/game';
import { DoorOpen, LogOut, ArrowDown, Sparkles } from 'lucide-react';
import { loadSavePoint, saveClassroomPos } from '@/lib/savepoint';
import { loadMapLayers, loadMapObstacles } from '@/lib/editorStorage';
import { OBJECT_Z_OFFSET } from '@/lib/layerZ';
import { SegmentedLayers } from '@/components/game/world/SegmentedLayers';
import type { SegmentedLayer } from '@/types/editor';

interface ClassroomWorldProps {
  onExitClassroom: () => void;
  onOpenModal: (modal: 'school' | 'vendor' | 'board' | 'help' | 'invite' | 'reviewer') => void;
  joystickVec?: { x: number; y: number };
}

interface FloatText {
  id: string;
  txt: string;
  x: number;
  y: number;
}

const CLASSROOM_W = 1840;
const CLASSROOM_H = 1036;

// Exit Door Zone definition for Classroom (centered bottom, shifted 20px higher)
const EXIT_ZONE = {
  id: 'classroom_exit',
  x: 920,
  y: 956,
  r: 90,
  label: '🚪 Exit Classroom',
};

// Interactive Classroom Zones (Teacher's Desk & Bookshelves)
const CLASSROOM_ZONES: Zone[] = [
  {
    id: 'teacher_desk',
    x: 413,
    y: 358,
    r: 130,
    w: 180,
    label: "🏫 Teacher's Desk",
    modal: 'school',
    hideLabelUnlessNear: true,
  },
  {
    id: 'book_shelf_1',
    x: 1219,
    y: 216,
    r: 110,
    w: 128,
    label: '📚 Study Reviewer',
    modal: 'reviewer',
    hideLabelUnlessNear: true,
  },
  {
    id: 'book_shelf_2',
    x: 1366,
    y: 216,
    r: 110,
    w: 128,
    label: '📚 Study Reviewer',
    modal: 'reviewer',
    hideLabelUnlessNear: true,
  },
  {
    id: 'book_shelf_3',
    x: 1518,
    y: 216,
    r: 110,
    w: 128,
    label: '📚 Study Reviewer',
    modal: 'reviewer',
    hideLabelUnlessNear: true,
  },
  {
    id: 'book_shelf_4',
    x: 1737,
    y: 491,
    r: 110,
    w: 100,
    label: '📚 Study Reviewer',
    modal: 'reviewer',
    hideLabelUnlessNear: true,
  },
  {
    id: 'book_shelf_5',
    x: 1737,
    y: 769,
    r: 110,
    w: 100,
    label: '📚 Study Reviewer',
    modal: 'reviewer',
    hideLabelUnlessNear: true,
  },
];

export const ClassroomWorld: React.FC<ClassroomWorldProps> = ({ onExitClassroom, onOpenModal, joystickVec }) => {
  const { gameState } = useGameState();
  const { profile, equipped, tagColor, owned, progress } = gameState;

  const worldRef = useRef<HTMLDivElement>(null);
  const playerEntityRef = useRef<PlayerEntityRef | null>(null);
  const botRefs = useRef<Array<NpcBotRef | null>>([]);

  const [activeZone, setActiveZone] = useState<Zone | typeof EXIT_ZONE | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatText[]>([]);
  const [layers, setLayers] = useState<SegmentedLayer[]>([]);
  // Collisions come from the map editor when a draft exists, else static config.
  const [obstacles, setObstacles] = useState<Obstacle[]>(CLASSROOM_OBSTACLES);
  const obstaclesRef = useRef(CLASSROOM_OBSTACLES);
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  // Load SAM2 segmented cutout layers authored for the classroom in the editor.
  useEffect(() => {
    let mounted = true;
    loadMapLayers('classroom')
      .then((ls) => {
        if (mounted) setLayers(ls);
      })
      .catch((err) => console.error('Failed to load segmented layers:', err));
    void Promise.resolve().then(() => {
      const editorObstacles = loadMapObstacles('classroom');
      if (mounted && editorObstacles && editorObstacles.length > 0) {
        setObstacles(editorObstacles);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Position state mutable ref for 60fps movement loop
  const startPos = loadSavePoint().classroom;
  const spawnX = startPos.x;
  const spawnY = startPos.y;
  const posRef = useRef({
    x: startPos.x,
    y: startPos.y,
    dir: 1,
    facing: 'up',
    walk: false,
    bubText: '',
    bubUntil: 0,
    bubEmote: '',
    bubEmoteUntil: 0,
  });
  const keysRef = useRef<Record<string, boolean>>({});
  const camRef = useRef({ x: startPos.x, y: startPos.y });
  const lastSaveRef = useRef(0);

  // Filter NPCS specifically for Classroom Map
  const classroomNpcs = NPCS.filter((npc) => npc.mapId === 'classroom');

  // Bot states mutable ref for Classroom
  const botsDataRef = useRef(
    classroomNpcs.map((npc) => ({
      data: npc,
      x: npc.home.x + (Math.random() * 40 - 20),
      y: npc.home.y + (Math.random() * 40 - 20),
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

const formatBubbleText = (txt: string, maxLen: number = 80): string => {
  if (!txt) return '';
  const trimmed = txt.trim();
  if (trimmed.length > maxLen) {
    return trimmed.slice(0, maxLen - 3) + '...';
  }
  return trimmed;
};

  // Handle global emote & chat trigger events
  useEffect(() => {
    const handleEmote = (e: CustomEvent<{ imagePath: string; ms?: number }>) => {
      if (e.detail?.imagePath) {
        posRef.current.bubEmote = e.detail.imagePath;
        posRef.current.bubEmoteUntil = performance.now() + (e.detail.ms || 3500);
      }
    };
    const handleChat = (e: CustomEvent<{ text: string }>) => {
      if (e.detail?.text) {
        posRef.current.bubText = formatBubbleText(e.detail.text);
        posRef.current.bubUntil = performance.now() + 5000;
      }
    };
    window.addEventListener('player-trigger-emote' as any, handleEmote as any);
    window.addEventListener('player-trigger-chat' as any, handleChat as any);
    return () => {
      window.removeEventListener('player-trigger-emote' as any, handleEmote as any);
      window.removeEventListener('player-trigger-chat' as any, handleChat as any);
    };
  }, []);

  // Bot Speech Bubble Scheduler for Classroom
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    botsDataRef.current.forEach((bot) => {
      const scheduleBub = () => {
        const timeout = setTimeout(() => {
          if (bot.data.bub && bot.data.bub.length > 0) {
            const txt = bot.data.bub[Math.floor(Math.random() * bot.data.bub.length)];
            bot.bubText = formatBubbleText(txt);
            bot.bubUntil = performance.now() + (4000 + Math.random() * 2500);

            // Broadcast chat message if player is near NPC
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
        }, 12000 + Math.random() * 14000);
        intervals.push(timeout);
      };
      scheduleBub();
    });

    return () => intervals.forEach(clearTimeout);
  }, []);

  const addFloatText = (txt: string, x: number, y: number) => {
    const id = Math.random().toString(36).substring(2);
    setFloatingTexts((prev) => [...prev, { id, txt, x, y }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1250);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const k = e.key.toLowerCase();
      keysRef.current[k] = true;

      if (k === 'e' || k === 'enter') {
        if (activeZone) {
          if (activeZone.id === 'classroom_exit') {
            playSfx('click');
            onExitClassroom();
          } else if ('modal' in activeZone && activeZone.modal) {
            playSfx('click');
            onOpenModal(activeZone.modal);
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
  }, [activeZone, onExitClassroom, onOpenModal]);

  const joystickVecRef = useRef(joystickVec);
  useEffect(() => {
    joystickVecRef.current = joystickVec;
  }, [joystickVec]);

  useEffect(() => {
    preloadAllSprites();
  }, []);

  // Main 60fps Movement Loop for Classroom
  useEffect(() => {
    if (!profile) return;

    let lastT = performance.now();
    let animFrameId: number;

    const tick = (t: number) => {
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

      const len = Math.hypot(vx, vy);
      if (len > 0) {
        if (len > 1) {
          vx /= len;
          vy /= len;
        }
        const sp = 260; // Slightly faster movement inside classroom for comfortable traversal

        let nx = Math.max(40, Math.min(CLASSROOM_W - 40, posRef.current.x + vx * sp * dt));
        let ny = Math.max(70, Math.min(CLASSROOM_H - 30, posRef.current.y + vy * sp * dt));

        // Multi-pass Classroom Obstacle Collisions
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

      // 60fps Direct DOM Mutation for Classroom NPC Bots
      botsDataRef.current.forEach((b, idx) => {
        if (now > b.think) {
          b.think = now + (3000 + Math.random() * 4000);

          let foundValid = false;
          for (let attempt = 0; attempt < 15; attempt++) {
            const a = Math.random() * Math.PI * 2;
            const dist = Math.random() * b.data.r;
            const tx = Math.max(60, Math.min(CLASSROOM_W - 60, b.data.home.x + Math.cos(a) * dist));
            const ty = Math.max(90, Math.min(CLASSROOM_H - 50, b.data.home.y + Math.sin(a) * dist));

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

          nx = Math.max(40, Math.min(CLASSROOM_W - 40, nx));
          ny = Math.max(70, Math.min(CLASSROOM_H - 30, ny));

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

      // Camera Smooth Tracking with Automatic Centering
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      camRef.current.x += (posRef.current.x - camRef.current.x) * Math.min(1, dt * 5);
      camRef.current.y += (posRef.current.y - camRef.current.y) * Math.min(1, dt * 5);

      const offsetX = CLASSROOM_W <= vw
        ? (vw - CLASSROOM_W) / 2
        : vw / 2 - Math.max(vw / 2, Math.min(CLASSROOM_W - vw / 2, camRef.current.x));

      const offsetY = CLASSROOM_H <= vh
        ? (vh - CLASSROOM_H) / 2
        : vh / 2 - Math.max(vh / 2, Math.min(CLASSROOM_H - vh / 2, camRef.current.y));

      if (worldRef.current) {
        worldRef.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      }

      // Proximity check to Exit Zone & Interactive Classroom Zones
      let near: Zone | typeof EXIT_ZONE | null = null;
      let minDist = Infinity;

      const distToExit = Math.hypot(EXIT_ZONE.x - posRef.current.x, EXIT_ZONE.y - posRef.current.y);
      if (distToExit < EXIT_ZONE.r) {
        minDist = distToExit;
        near = EXIT_ZONE;
      }

      for (const z of CLASSROOM_ZONES) {
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
        saveClassroomPos(posRef.current.x, posRef.current.y);
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [profile]);

  if (!profile) return null;

  const isNearExit = activeZone?.id === EXIT_ZONE.id;

  return (
    <div id="viewport" className="fixed inset-0 overflow-hidden touch-none select-none">
      <div
        id="world"
        ref={worldRef}
        className="absolute left-0 top-0 will-change-transform"
        style={{ width: `${CLASSROOM_W}px`, height: `${CLASSROOM_H}px` }}
      >
        {/* Classroom Background Ground */}
        <div
          className="absolute inset-0 bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: 'url(/assets/backgrounds/classroom.png)',
            width: `${CLASSROOM_W}px`,
            height: `${CLASSROOM_H}px`,
            imageRendering: 'pixelated',
          }}
        />

        {/* SAM2 Segmented Cutout Layers authored in the editor */}
        <SegmentedLayers layers={layers} worldW={CLASSROOM_W} worldH={CLASSROOM_H} />

        {/* Client-only Dev Ruler for measuring hitboxes & obstacles */}
        <DevRuler posRef={posRef} obstacles={obstacles} />

        {/* Exit Classroom Interactive Button */}
        <div
          className="absolute pointer-events-auto cursor-pointer transition-all duration-200 z-10"
          style={{
            left: `${EXIT_ZONE.x}px`,
            top: `${EXIT_ZONE.y - 65}px`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => {
            playSfx('click');
            onExitClassroom();
          }}
        >
          <div
            className={`font-pixel bg-[#fff8e1] border-3 border-[#5b3a17] text-[#5b3a17] font-bold px-4 py-2.5 rounded-xl text-sm shadow-[0_4px_0_rgba(58,36,16,0.2)] hover:bg-[#fff0c4] active:translate-y-0.5 transition-all flex items-center gap-2 ${
              isNearExit ? 'bg-[#fff0c4] border-[#ffb703] shadow-[0_4px_0_#5b3a17,0_0_15px_rgba(255,183,3,0.4)]' : ''
            }`}
          >
            <DoorOpen className="w-4 h-4 text-[#5b3a17]" />
            <span>Exit Classroom</span>
          </div>
        </div>

        {/* Interactive Zone Nodes (Teacher's Desk & Bookshelves) */}
        <div id="zones">
          {CLASSROOM_ZONES.map((z) => (
            <ZoneNode
              key={z.id}
              zone={z}
              isActive={activeZone?.id === z.id}
              isBusy={false}
              isCooling={false}
              leftSec={0}
              onInteract={(targetZone) => {
                if (targetZone.modal) {
                  playSfx('click');
                  onOpenModal(targetZone.modal);
                }
              }}
            />
          ))}
        </div>

        {/* NPC & Player Entities Layer */}
        <div id="ents">
          {/* Classroom NPC Bots */}
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

          {/* Player Entity */}
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
