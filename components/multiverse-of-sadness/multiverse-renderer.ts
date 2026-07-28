import { UniverseConfig, UNIVERSE_CONFIGS } from './multiverse-config'
import { GameStateRef, PipeObj, SceneryState } from './multiverse-types'

export const W = 480
export const H = 640
export const GROUND = 72
export const TAU = Math.PI * 2
export const PIPE_W = 74

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)

export function drawPipe(ctx: CanvasRenderingContext2D, p: PipeObj, isVoid = false, t = 0) {
  const top = p.gapY
  const bot = p.gapY + p.gapH
  const style = p.style || (isVoid ? 'void' : 'classic')

  ctx.save()

  // Hologram translucent mode
  if (p.hologram) {
    ctx.globalAlpha = 0.45
    ctx.strokeStyle = '#38bdf8'
    ctx.shadowColor = '#0284c7'
    ctx.shadowBlur = 10
  }

  // Determine palette base colors per style
  let bodyColor = '#31493f'
  let capColor = '#3a564a'
  let highlightColor = 'rgba(190,225,205,0.10)'
  let strokeColor = 'rgba(0,0,0,0.4)'

  if (p.gold) {
    bodyColor = '#ca8a04'
    capColor = '#eab308'
    highlightColor = 'rgba(254,240,138,0.3)'
  } else {
    switch (style) {
      case 'rust':
        bodyColor = '#5c3a21'
        capColor = '#7c4d2b'
        highlightColor = 'rgba(234,179,8,0.2)'
        strokeColor = '#3a2211'
        break
      case 'neon':
        bodyColor = '#0b1329'
        capColor = '#152347'
        highlightColor = 'rgba(56,189,248,0.3)'
        strokeColor = '#06b6d4'
        break
      case 'gothic':
        bodyColor = '#1e2025'
        capColor = '#2a2d34'
        highlightColor = 'rgba(217,164,65,0.15)'
        strokeColor = '#454a54'
        break
      case 'crystal':
        bodyColor = '#164e63'
        capColor = '#0891b2'
        highlightColor = 'rgba(165,243,252,0.4)'
        strokeColor = '#67e8f9'
        break
      case 'cosmic':
        bodyColor = '#0f172a'
        capColor = '#1e1b4b'
        highlightColor = 'rgba(192,132,252,0.3)'
        strokeColor = '#818cf8'
        break
      case 'overgrown':
        bodyColor = '#243324'
        capColor = '#324732'
        highlightColor = 'rgba(134,239,172,0.2)'
        strokeColor = '#152315'
        break
      case 'retro':
        bodyColor = '#2e1065'
        capColor = '#3b0764'
        highlightColor = 'rgba(249,115,22,0.35)'
        strokeColor = '#f97316'
        break
      case 'origami':
        bodyColor = '#cbd5e1'
        capColor = '#94a3b8'
        highlightColor = 'rgba(255,255,255,0.5)'
        strokeColor = '#334155'
        break
      case 'quantum':
        bodyColor = '#31124b'
        capColor = '#4c1d95'
        highlightColor = 'rgba(236,72,153,0.35)'
        strokeColor = '#c084fc'
        break
      case 'void':
        bodyColor = '#0f172a'
        capColor = '#1e293b'
        highlightColor = 'rgba(56,189,248,0.15)'
        strokeColor = '#38bdf8'
        break
    }
  }

  // ----------------------------------------------------------------
  // TOP PIPE BODY & CAP
  // ----------------------------------------------------------------
  if (top > 0) {
    ctx.fillStyle = bodyColor
    ctx.fillRect(p.x, -20, PIPE_W, top + 5)

    // Style Specific Body Details (Top Pipe)
    if (style === 'retro') {
      ctx.strokeStyle = 'rgba(249,115,22,0.4)'
      ctx.lineWidth = 1
      for (let yG = 0; yG < top; yG += 14) {
        ctx.beginPath()
        ctx.moveTo(p.x, yG)
        ctx.lineTo(p.x + PIPE_W, yG)
        ctx.stroke()
      }
    } else if (style === 'rust') {
      // Steampunk rivets
      ctx.fillStyle = '#b45309'
      for (let yR = 10; yR < top - 15; yR += 22) {
        ctx.fillRect(p.x + 4, yR, 3, 3)
        ctx.fillRect(p.x + PIPE_W - 7, yR, 3, 3)
      }
    } else if (style === 'overgrown') {
      // Vines on top pipe
      ctx.strokeStyle = '#4ade80'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(p.x + 2, -10)
      ctx.quadraticCurveTo(p.x + 25, top * 0.4, p.x + PIPE_W - 8, top - 10)
      ctx.stroke()
    } else if (style === 'cosmic') {
      // Star particles inside body
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      for (let i = 0; i < 4; i++) {
        const sx = p.x + 8 + ((i * 19 + Math.sin(t + i) * 10) % (PIPE_W - 16))
        const sy = (i * 25) % top
        ctx.fillRect(sx, sy, 2, 2)
      }
    }

    // Body Highlight & Shadow
    ctx.fillStyle = highlightColor
    ctx.fillRect(p.x + 7, -20, 7, top + 5)
    ctx.fillStyle = 'rgba(0,0,0,0.30)'
    ctx.fillRect(p.x + PIPE_W - 11, -20, 11, top + 5)
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = style === 'neon' || style === 'quantum' ? 1.5 : 1
    ctx.strokeRect(p.x + 0.5, -19.5, PIPE_W - 1, top + 4)

    // Top Cap
    ctx.fillStyle = capColor
    ctx.fillRect(p.x - 6, top - 15, PIPE_W + 12, 15)
    ctx.fillStyle = highlightColor
    ctx.fillRect(p.x - 6, top - 15, PIPE_W + 12, 2)
    ctx.fillStyle = 'rgba(0,0,0,0.32)'
    ctx.fillRect(p.x - 6, top - 3, PIPE_W + 12, 3)
    ctx.strokeRect(p.x - 5.5, top - 14.5, PIPE_W + 11, 14)

    // Gothic Spire Accents
    if (style === 'gothic') {
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(p.x + 12, top - 12, 4, 4)
      ctx.fillRect(p.x + PIPE_W - 16, top - 12, 4, 4)
    }

    if (p.wedding) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(p.x + 10, top - 25, PIPE_W - 20, 10)
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.fillRect(p.x - 10, top - 15, 12, 40)
    }
  }

  // ----------------------------------------------------------------
  // BOTTOM PIPE CAP & BODY
  // ----------------------------------------------------------------
  ctx.fillStyle = capColor
  ctx.fillRect(p.x - 6, bot, PIPE_W + 12, 15)
  ctx.fillStyle = highlightColor
  ctx.fillRect(p.x - 6, bot, PIPE_W + 12, 2)
  ctx.fillStyle = 'rgba(0,0,0,0.32)'
  ctx.fillRect(p.x - 6, bot + 12, PIPE_W + 12, 3)
  ctx.strokeStyle = strokeColor
  ctx.strokeRect(p.x - 5.5, bot + 0.5, PIPE_W + 11, 14)

  if (style === 'gothic') {
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(p.x + 12, bot + 4, 4, 4)
    ctx.fillRect(p.x + PIPE_W - 16, bot + 4, 4, 4)
  }

  if (p.wedding) {
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(p.x + 18, bot - 18, 38, 18)
    ctx.fillRect(p.x + 10, bot - 4, 54, 4)
    ctx.fillStyle = '#f43f5e'
    ctx.fillRect(p.x + 18, bot - 7, 38, 3)
  }

  if (p.hasCake) {
    ctx.fillStyle = '#f472b6'
    ctx.fillRect(p.x + 16, bot - 16, 42, 16)
    ctx.fillStyle = '#fef08a'
    ctx.fillRect(p.x + 35, bot - 24, 4, 8)
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.arc(37 + p.x, bot - 26, 3, 0, TAU)
    ctx.fill()
  }

  const botH = H - GROUND - bot - 15
  if (botH > 0) {
    ctx.fillStyle = bodyColor
    ctx.fillRect(p.x, bot + 15, PIPE_W, botH)

    if (style === 'retro') {
      ctx.strokeStyle = 'rgba(249,115,22,0.4)'
      ctx.lineWidth = 1
      for (let yG = bot + 15; yG < H - GROUND; yG += 14) {
        ctx.beginPath()
        ctx.moveTo(p.x, yG)
        ctx.lineTo(p.x + PIPE_W, yG)
        ctx.stroke()
      }
    } else if (style === 'rust') {
      ctx.fillStyle = '#b45309'
      for (let yR = bot + 25; yR < H - GROUND - 10; yR += 22) {
        ctx.fillRect(p.x + 4, yR, 3, 3)
        ctx.fillRect(p.x + PIPE_W - 7, yR, 3, 3)
      }
    } else if (style === 'overgrown') {
      ctx.strokeStyle = '#4ade80'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(p.x + PIPE_W - 6, bot + 20)
      ctx.quadraticCurveTo(p.x + 10, bot + botH * 0.5, p.x + 6, bot + botH - 10)
      ctx.stroke()
    } else if (style === 'cosmic') {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      for (let i = 0; i < 4; i++) {
        const sx = p.x + 8 + ((i * 23 + Math.cos(t + i) * 8) % (PIPE_W - 16))
        const sy = bot + 15 + ((i * 30) % botH)
        ctx.fillRect(sx, sy, 2, 2)
      }
    }

    ctx.fillStyle = highlightColor
    ctx.fillRect(p.x + 7, bot + 15, 7, botH)
    ctx.fillStyle = 'rgba(0,0,0,0.30)'
    ctx.fillRect(p.x + PIPE_W - 11, bot + 15, 11, botH)
    ctx.strokeStyle = strokeColor
    ctx.strokeRect(p.x + 0.5, bot + 15.5, PIPE_W - 1, botH - 1)
  }

  // ----------------------------------------------------------------
  // UNIVERSE SHIFT HERALD / PORTAL RIFT INDICATOR
  // ----------------------------------------------------------------
  if (p.isHerald) {
    ctx.save()
    // Swirling portal energy beam in pipe gap
    const pulse = 0.5 + 0.5 * Math.sin(t * 8)
    const portalG = ctx.createLinearGradient(p.x, top, p.x + PIPE_W, bot)
    portalG.addColorStop(0, `rgba(217, 164, 65, ${0.25 + pulse * 0.25})`)
    portalG.addColorStop(0.5, `rgba(168, 85, 247, ${0.4 + pulse * 0.3})`)
    portalG.addColorStop(1, `rgba(217, 164, 65, ${0.25 + pulse * 0.25})`)

    ctx.fillStyle = portalG
    ctx.fillRect(p.x - 4, top, PIPE_W + 8, p.gapH)

    // Pulsing Herald Border Glow
    ctx.strokeStyle = `rgba(217, 164, 65, ${0.6 + pulse * 0.4})`
    ctx.lineWidth = 2.5
    ctx.strokeRect(p.x - 7, top - 16, PIPE_W + 14, 16)
    ctx.strokeRect(p.x - 7, bot, PIPE_W + 14, 16)

    // Dimensional Herald Warning Badge
    ctx.fillStyle = '#d9a441'
    ctx.font = "10px 'Special Elite', monospace"
    ctx.textAlign = 'center'
    ctx.fillText('⚡ SHIFT HERALD ⚡', p.x + PIPE_W / 2, top - 22)
    if (p.targetUniName) {
      ctx.fillStyle = '#e9f0f7'
      ctx.font = "9px 'Space Grotesk', sans-serif"
      ctx.fillText(`WARP: ${p.targetUniName.toUpperCase()}`, p.x + PIPE_W / 2, top - 10)
    }

    ctx.restore()
  }

  ctx.restore()
}


export function drawBird(
  ctx: CanvasRenderingContext2D,
  y: number,
  rot: number,
  ghost: boolean,
  birdWing: number,
  birdBlink: number,
  isNoir = false,
  isVoid = false
) {
  ctx.save()
  ctx.translate(130, y)
  ctx.rotate(rot)

  if (ghost) ctx.globalAlpha = 0.28
  ctx.fillStyle = ghost ? '#8fb0c6' : isNoir ? '#94a3b8' : isVoid ? '#0284c7' : '#dfc076'
  ctx.beginPath()
  ctx.ellipse(0, 0, 13, 11, 0, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = isVoid ? '#38bdf8' : 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  ctx.fillStyle = ghost ? 'rgba(255,255,255,0.15)' : isNoir ? '#cbd5e1' : '#efd9a4'
  ctx.beginPath()
  ctx.ellipse(-1, 4, 8, 6, 0, 0, TAU)
  ctx.fill()

  ctx.save()
  ctx.translate(-4, 1)
  ctx.rotate(-0.3 - birdWing * 1.1)
  ctx.fillStyle = ghost ? '#7a9cb4' : isNoir ? '#64748b' : '#c7a457'
  ctx.beginPath()
  ctx.ellipse(-3, 0, 7, 4.5, -0.3, 0, TAU)
  ctx.fill()
  ctx.restore()

  if (!ghost) {
    if (birdBlink > 0) {
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(3.5, -4)
      ctx.lineTo(8.5, -4)
      ctx.stroke()
    } else {
      ctx.fillStyle = '#f4f1e6'
      ctx.beginPath()
      ctx.arc(6, -4, 3.6, 0, TAU)
      ctx.fill()
      ctx.fillStyle = '#20242c'
      ctx.beginPath()
      ctx.arc(6.8, -3.6, 1.7, 0, TAU)
      ctx.fill()
    }
    ctx.strokeStyle = 'rgba(60,45,20,0.8)'
    ctx.lineWidth = 1.3
    ctx.beginPath()
    ctx.moveTo(2.5, -7.8)
    ctx.lineTo(9, -9.5)
    ctx.stroke()

    ctx.fillStyle = isNoir ? '#475569' : '#d08548'
    ctx.beginPath()
    ctx.moveTo(11, -1)
    ctx.lineTo(17, 1)
    ctx.lineTo(11, 3.4)
    ctx.closePath()
    ctx.fill()

    // Noir Detective Hat
    if (isNoir) {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(-6, -18, 22, 5)
      ctx.fillRect(-2, -26, 14, 9)
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(-2, -20, 14, 2)
    }
  } else {
    ctx.fillStyle = 'rgba(20,30,40,0.5)'
    ctx.beginPath()
    ctx.arc(6, -4, 2, 0, TAU)
    ctx.fill()
  }
  ctx.restore()
}

export function renderGameFrame(
  ctx: CanvasRenderingContext2D,
  S: GameStateRef,
  scenery: SceneryState,
  pixelatedVideo: boolean,
  activeVideo: HTMLVideoElement | null,
  offscreenCanvas: HTMLCanvasElement | null,
  offscreenCtx: CanvasRenderingContext2D | null
) {
  const u = UNIVERSE_CONFIGS[S.uniIndex]

  ctx.save()

  // Insomnia 3-degree tilt
  if (u.insomnia) {
    ctx.translate(W / 2, H / 2)
    ctx.rotate((3 * Math.PI) / 180)
    ctx.translate(-W / 2, -H / 2)
  }

  if (S.shake > 0) {
    ctx.translate((Math.random() - 0.5) * S.shake * 12, (Math.random() - 0.5) * S.shake * 12)
  }

  // Rainbow Mode Animated Gradient Sky
  if (u.rainbow) {
    const rainbowG = ctx.createLinearGradient(0, 0, W, H)
    const hue = (S.t * 60) % 360
    rainbowG.addColorStop(0, `hsl(${hue}, 80%, 35%)`)
    rainbowG.addColorStop(1, `hsl(${(hue + 120) % 360}, 80%, 20%)`)
    ctx.fillStyle = rainbowG
    ctx.fillRect(-24, -24, W + 48, H + 48)
  } else {
    // Standard Sky Background
    ctx.save()
    if (S.score >= 6 && !pixelatedVideo) {
      ctx.globalAlpha = 0.55
    }
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, u.sky[0])
    g.addColorStop(1, u.sky[1])
    ctx.fillStyle = g
    ctx.fillRect(-24, -24, W + 48, H + 48)
    ctx.restore()
  }

  // Pixelated Background Video Downsampling Layer
  if (S.score >= 6 && pixelatedVideo && activeVideo && activeVideo.readyState >= 2 && offscreenCanvas && offscreenCtx) {
    offscreenCtx.drawImage(activeVideo, 0, 0, offscreenCanvas.width, offscreenCanvas.height)
    ctx.save()
    ctx.globalAlpha = 0.55
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(offscreenCanvas, -24, -24, W + 48, H + 48)
    ctx.restore()
  }

  // Soup Broth Particle Steam
  if (u.soup) {
    ctx.fillStyle = 'rgba(251, 146, 60, 0.08)'
    for (let i = 0; i < 5; i++) {
      const sy = (S.t * 30 + i * 120) % H
      ctx.beginPath()
      ctx.arc(80 + i * 90, H - sy, 35, 0, TAU)
      ctx.fill()
    }
  }

  // Moon & Clouds
  if (!u.voidMode) {
    ctx.fillStyle = 'rgba(205,222,240,0.10)'
    ctx.beginPath()
    ctx.arc(372, 92, 54, 0, TAU)
    ctx.fill()
    ctx.fillStyle = 'rgba(214,228,242,0.14)'
    ctx.beginPath()
    ctx.arc(372, 92, 36, 0, TAU)
    ctx.fill()

    ctx.fillStyle = 'rgba(148,166,190,0.07)'
    for (const c of scenery.clouds) {
      ctx.beginPath()
      ctx.ellipse(c.x, c.y, 46 * c.s, 13 * c.s, 0, 0, TAU)
      ctx.ellipse(c.x + 30 * c.s, c.y + 5 * c.s, 30 * c.s, 10 * c.s, 0, 0, TAU)
      ctx.fill()
    }

    // Buildings Skyline
    const off = (S.t * 11) % scenery.skyW
    for (const b of scenery.buildings) {
      let bx = b.x - off
      if (bx < -b.w) bx += scenery.skyW
      if (bx > W) continue
      ctx.fillStyle = '#0a101a'
      ctx.fillRect(bx, H - GROUND - b.h, b.w, b.h)
      if (b.win) {
        ctx.fillStyle = 'rgba(217,164,65,' + (0.25 + 0.2 * Math.sin(S.t * 1.7 + b.win.ph)).toFixed(2) + ')'
        ctx.fillRect(bx + b.win.x, H - GROUND - b.h + b.win.y, 3, 4)
      }
    }
  }

  // Unionizing Picket Birds
  if (u.unionizing) {
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '10px monospace'
    for (let i = 0; i < 3; i++) {
      const bx = (W - (S.t * 40 + i * 140)) % (W + 100)
      ctx.fillRect(bx, 140 + i * 30, 8, 6)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(bx - 12, 122 + i * 30, 30, 14)
      ctx.fillStyle = '#0f172a'
      ctx.fillText('STRIKE', bx - 10, 133 + i * 30)
    }
  }

  // Autumn Leaves
  if (u.autumn && S.leaves.length) {
    ctx.fillStyle = '#d97706'
    for (const l of S.leaves) {
      ctx.save()
      ctx.translate(l.x, l.y)
      ctx.rotate(l.rot || 0)
      ctx.beginPath()
      ctx.ellipse(0, 0, 5, 3, 0, 0, TAU)
      ctx.fill()
      ctx.restore()
    }
  }

  // Snow Particles
  if (u.snow && S.snow.length) {
    ctx.fillStyle = '#ffffff'
    for (const s of S.snow) {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size || 2, 0, TAU)
      ctx.fill()
    }
  }

  // Deep End Underwater Bubbles
  if (u.deepEnd && S.bubbles.length) {
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)'
    ctx.lineWidth = 1
    for (const b of S.bubbles) {
      ctx.beginPath()
      ctx.arc(b.x, b.y, b.size || 3, 0, TAU)
      ctx.stroke()
    }
  }

  // Rain Particles
  if (S.rain.length && !u.drought && !u.snow) {
    ctx.strokeStyle = 'rgba(152,184,216,0.27)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (const d of S.rain) {
      ctx.moveTo(d.x, d.y)
      ctx.lineTo(d.x + d.wx * 0.028, d.y - d.len)
    }
    ctx.stroke()
  }

  // Pipes
  for (const p of S.pipes) {
    drawPipe(ctx, p, u.voidMode, S.t)
  }


  // Fog Layer Mask
  if (u.fog) {
    const fogG = ctx.createLinearGradient(0, 0, W, 0)
    fogG.addColorStop(0, 'rgba(203, 213, 225, 0.0)')
    fogG.addColorStop(0.5, 'rgba(203, 213, 225, 0.75)')
    fogG.addColorStop(1, 'rgba(203, 213, 225, 0.95)')
    ctx.fillStyle = fogG
    ctx.fillRect(0, 0, W, H)
  }

  // Ground & Puddles
  ctx.fillStyle = u.voidMode ? '#020617' : '#141c27'
  ctx.fillRect(-24, H - GROUND, W + 48, GROUND)
  ctx.fillStyle = u.voidMode ? '#0f172a' : '#1e2a39'
  ctx.fillRect(-24, H - GROUND, W + 48, 5)

  if (!u.voidMode) {
    ctx.fillStyle = 'rgba(150,182,214,0.10)'
    for (let gx = -S.groundOff; gx < W + 48; gx += 48) {
      ctx.fillRect(gx, H - GROUND + 16, 22, 3)
    }
    ctx.fillStyle = 'rgba(140,178,214,0.06)'
    for (const p of scenery.puddles) {
      let px = (p.x - S.groundOff * 0.6) % (W + 160)
      if (px < -80) px += W + 160
      ctx.beginPath()
      ctx.ellipse(px - 80, H - GROUND + 40, p.w, 5, 0, 0, TAU)
      ctx.fill()
    }
  }

  // Spectator Ghost Bird
  if (u.spectator) {
    drawBird(ctx, S.spectatorY, 0, true, S.birdWing, 0)
  }

  // Ghost Echo
  if (u.id === 'echo' && S.lastRun && S.mode === 'play' && !S.ghostDead) {
    const f = S.lastRun[Math.min(S.ghostIdx, S.lastRun.length - 1)]
    if (f) drawBird(ctx, f.y, f.rot, true, S.birdWing, S.birdBlink)
  }

  // Main Bird
  drawBird(ctx, S.birdY, S.birdRot, false, S.birdWing, S.birdBlink, u.noir, u.voidMode)

  // Tears
  for (const p of S.tearPs) {
    ctx.fillStyle = 'rgba(158,205,242,0.95)'
    ctx.beginPath()
    ctx.arc(p.x, p.y, 2.3, 0, TAU)
    ctx.fill()
  }

  // Floating Quotes
  ctx.textAlign = 'center'
  for (const f of S.floats) {
    ctx.globalAlpha = clamp(1 - f.t / 2.4, 0, 1)
    ctx.font = "13px 'Special Elite', monospace"
    ctx.fillStyle = '#0a0f16'
    ctx.fillText(f.text, f.x + 1, f.y + 1)
    ctx.fillStyle = f.color || '#cfe0ef'
    ctx.fillText(f.text, f.x, f.y)
  }
  ctx.globalAlpha = 1

  // Sunday Night Dread Shadow Overlay
  if (u.sundayNight) {
    const dreadG = ctx.createLinearGradient(0, 0, W, 0)
    dreadG.addColorStop(0, 'rgba(0,0,0,0)')
    dreadG.addColorStop(1, `rgba(15, 23, 42, ${clamp(S.dreadMeter / 100, 0, 0.95)})`)
    ctx.fillStyle = dreadG
    ctx.fillRect(0, 0, W, H)
  }

  // Low Battery Dimming Overlay
  if (u.lowBattery) {
    const darkAlpha = clamp(1 - S.batteryLevel / 100, 0, 0.85)
    ctx.fillStyle = `rgba(0, 0, 0, ${darkAlpha})`
    ctx.fillRect(0, 0, W, H)

    // Battery Icon in Top Right
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(W - 45, 15, 30 * (S.batteryLevel / 100), 12)
    ctx.strokeStyle = '#ffffff'
    ctx.strokeRect(W - 46, 14, 32, 14)
    ctx.fillStyle = '#ffffff'
    ctx.font = '10px monospace'
    ctx.fillText(`${Math.round(S.batteryLevel)}%`, W - 30, 42)
  }

  // VHS Scanline & PLAY Timestamp
  if (u.vhs) {
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(30, 30, 5, 0, TAU)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px monospace'
    ctx.fillText('PLAY ▶ 00:04:12', 80, 34)

    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    for (let y = 0; y < H; y += 4) {
      ctx.fillRect(0, y, W, 1)
    }
  }

  // Memory Vignette
  if (u.memory) {
    const vigG = ctx.createRadialGradient(W / 2, H / 2, W / 4, W / 2, H / 2, W * 0.7)
    vigG.addColorStop(0, 'rgba(0,0,0,0)')
    vigG.addColorStop(1, 'rgba(40, 20, 10, 0.75)')
    ctx.fillStyle = vigG
    ctx.fillRect(0, 0, W, H)
  }

  // Thought Bubble
  if (S.thought.t > 0 && S.mode === 'play') {
    const txt = S.thought.text
    ctx.font = "11px 'Special Elite', monospace"
    const tw = ctx.measureText(txt).width + 16
    const bx = clamp(130 - tw / 2 + 8, 6, W - tw - 6)
    const by = S.birdY - 48
    const a = clamp(Math.min((2.8 - S.thought.t) * 3, S.thought.t * 2), 0, 1)

    ctx.globalAlpha = a
    ctx.fillStyle = 'rgba(228,236,244,0.92)'
    ctx.beginPath()
    if (ctx.roundRect) ctx.roundRect(bx, by, tw, 20, 8)
    else ctx.rect(bx, by, tw, 20)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(bx + tw * 0.3, by + 24, 3, 0, TAU)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(bx + tw * 0.22, by + 30, 1.8, 0, TAU)
    ctx.fill()

    ctx.fillStyle = '#2c3947'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(txt, bx + tw / 2, by + 11)
    ctx.globalAlpha = 1
    ctx.textBaseline = 'alphabetic'
  }

  // Movie Subtitle
  if (S.mode !== 'start') {
    const shown = S.subText.slice(0, Math.floor(S.subT * 26))
    if (shown) {
      const sy = u.drama ? H - 58 : H - 30
      ctx.font = "15px 'Special Elite', monospace"
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.9)'
      ctx.shadowBlur = 5
      ctx.fillStyle = 'rgba(222,232,242,0.92)'
      ctx.fillText(shown, W / 2, sy)
      ctx.shadowBlur = 0
    }
  }

  // CRT Film Noise & Flash Overlay
  for (let i = 0; i < 28; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.fillRect(Math.random() * W, Math.random() * H, 1.4, 1.4)
  }
  if (S.flash > 0) {
    ctx.fillStyle = 'rgba(188,208,232,' + (S.flash * 0.45).toFixed(2) + ')'
    ctx.fillRect(-24, -24, W + 48, H + 48)
  }

  ctx.restore()
}
