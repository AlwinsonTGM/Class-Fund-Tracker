'use client'

import React, { useState, useEffect } from 'react'
import { GameStateProvider, useGameState } from '@/context/GameStateContext'
import { World } from '@/components/game/World'
import { HUD } from '@/components/game/HUD'
import { ChatDrawer } from '@/components/game/ChatDrawer'
import { Joystick } from '@/components/game/Joystick'
import { FreedomPost } from '@/components/freedom-wall/types'
import { FreedomPostCard } from '@/components/freedom-wall/freedom-post-card'
import { AddPostModal } from '@/components/freedom-wall/add-post-modal'
import { TitleScreen } from '@/components/game/TitleScreen'
import { CharacterCustomizerModal } from '@/components/game/modals/CharacterCustomizerModal'
import { X, PenSquare, Radio, Gamepad2, Pin, MessageSquare, Lock, ArrowLeft } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface FreedomWallPlazaGameProps {
  posts: FreedomPost[]
  isOfficer: boolean
  user: User | null
  triggerAddOpen?: boolean
  onCloseAddTrigger?: () => void
  isDedicatedPage?: boolean
}

function PlazaGameContent({
  posts,
  isOfficer,
  user,
  triggerAddOpen = false,
  onCloseAddTrigger,
  isDedicatedPage = false
}: FreedomWallPlazaGameProps) {
  const { gameState, setProfile, activeModal, openModal, closeModal } = useGameState()

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [unreadChatCount, setUnreadChatCount] = useState(0)
  const [joystickVec, setJoystickVec] = useState({ x: 0, y: 0 })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCustomizerModal, setShowCustomizerModal] = useState(false)

  // Determine user role
  const userRole: 'officer' | 'student' | 'guest' = isOfficer
    ? 'officer'
    : user
    ? 'student'
    : 'guest'

  // Default nickname hint for TitleScreen
  let defaultNickname = ''
  if (user?.email) {
    defaultNickname = user.email.split('@')[0]
  } else if (typeof window !== 'undefined') {
    let guestNum = localStorage.getItem('freedom_guest_num')
    if (!guestNum) {
      guestNum = Math.floor(1000 + Math.random() * 9000).toString()
      localStorage.setItem('freedom_guest_num', guestNum)
    }
    defaultNickname = `Guest #${guestNum}`
  }

  useEffect(() => {
    if (triggerAddOpen) {
      setShowAddModal(true)
      if (onCloseAddTrigger) onCloseAddTrigger()
    }
  }, [triggerAddOpen, onCloseAddTrigger])

  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [selectedColor, setSelectedColor] = useState('yellow')
  const [selectedSong, setSelectedSong] = useState<any>(null)
  const [isPending, startTransition] = React.useTransition()

  const handleAddPostSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    startTransition(async () => {
      try {
        const { addPostAction } = await import('@/app/officer-dashboard/actions')
        const res = await addPostAction({
          content: content.trim(),
          author_name: authorName.trim() || 'Anonymous',
          color: selectedColor,
          song_data: selectedSong || null
        })
        if (res.success) {
          setShowAddModal(false)
          setContent('')
          setAuthorName('')
          if (typeof window !== 'undefined') window.location.reload()
        }
      } catch (err) {
        console.error('Failed to submit post', err)
      }
    })
  }

  // 1. PREVIEW LANDING STATE (When rendered on main Freedom Wall tab)
  if (!isDedicatedPage) {
    return (
      <div className="w-full flex flex-col gap-6 select-none">
        {/* Freedom Wall Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground font-pixel">Freedom Wall & Plaza</h2>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> Live Multiplayer
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Explore the 2D Pixel Plaza, chat live with classmates, and post/read notes on the Bulletin Board!
            </p>
          </div>

          <div>
            <a
              href="/plaza"
              className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-pixel text-sm font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer w-fit"
            >
              <Gamepad2 className="w-4.5 h-4.5" /> Enter 2D Freedom Plaza
            </a>
          </div>
        </div>

        {/* RPG Plaza Visual Preview Card */}
        <a
          href="/plaza"
          className="relative w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden border-4 border-[#5b3a17] shadow-xl bg-[#17301c] group cursor-pointer block"
        >
          {/* Static Background Preview */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-85 group-hover:scale-105 transition-transform duration-700"
            style={{
              backgroundImage: 'url(/assets/tiles/grass.png)',
              backgroundSize: '300px'
            }}
          >
            {/* Plaza Overlay Graphics */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          </div>

          {/* Centered Launch Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#f7ecc8] border-4 border-[#5b3a17] grid place-items-center shadow-2xl group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-8 h-8 text-[#5b3a17]" />
            </div>
            <div>
              <h3 className="font-pixel text-2xl font-bold text-[#fff8e1] drop-shadow-md">
                Launch Dedicated Freedom Plaza
              </h3>
              <p className="font-nunito text-sm text-[#f7ecc8]/90 max-w-md mt-1">
                Walk around as <strong className="text-amber-300">{gameState.profile?.nickname || 'Guest'}</strong> ({userRole.toUpperCase()}), talk with players, and post on the Bulletin Board.
              </p>
            </div>

            {/* Feature Chips */}
            <div className="flex items-center gap-2 flex-wrap justify-center mt-2">
              <span className="bg-[#f7ecc8] border-2 border-[#5b3a17] text-[#5b3a17] font-pixel text-xs font-bold px-3 py-1 rounded-xl shadow-sm flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" /> Bulletin Board (Active)
              </span>
              <span className="bg-[#f7ecc8] border-2 border-[#5b3a17] text-[#5b3a17] font-pixel text-xs font-bold px-3 py-1 rounded-xl shadow-sm flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Plaza Chat (Active)
              </span>
              <span className="bg-[#efe0b0]/70 border-2 border-[#7a4a1f] text-[#7a4a1f] font-pixel text-xs font-bold px-3 py-1 rounded-xl shadow-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Schoolhouse (Locked)
              </span>
            </div>
          </div>
        </a>
      </div>
    )
  }

  // 2. DEDICATED FULL-VIEWPORT GAMEPLAY STATE (Rendered inside /plaza)
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#17301c]">
      {/* Title Screen for Character Creation & Selection */}
      {!gameState.profile && (
        <TitleScreen
          userRole={userRole}
          defaultNickname={defaultNickname}
        />
      )}

      {/* World Map with Multiplayer Engine */}
      <World
        user={user}
        userRole={userRole}
        joystickVec={joystickVec}
        onOpenModal={(m) => {
          if (m === 'board') openModal('board')
        }}
      />

      {/* Top HUD Controls */}
      <HUD
        onToggleInv={() => {}}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        unreadChatCount={unreadChatCount}
        onOpenCharacterCustomizer={() => setShowCustomizerModal(true)}
      />

      {/* Touch Joystick for Mobile Controls */}
      <Joystick onMove={(x, y) => setJoystickVec({ x, y })} />

      {/* Multi-player Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userRole={userRole}
      />

      {/* Character Customizer Modal */}
      {showCustomizerModal && (
        <CharacterCustomizerModal
          userRole={userRole}
          onClose={() => setShowCustomizerModal(false)}
        />
      )}

      {/* Freedom Wall Bulletin Board Modal */}
      {activeModal === 'board' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-slide-in">
          <div className="bg-[#f7ecc8] border-4 border-[#5b3a17] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b-4 border-[#5b3a17] bg-[#efe0b0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pin className="w-5 h-5 text-[#5b3a17]" />
                <div>
                  <h3 className="font-pixel text-lg font-bold text-[#5b3a17]">Freedom Wall Bulletin Board</h3>
                  <p className="font-nunito text-xs text-[#8a5a2b]">Leave notes, read messages & connect with others!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#10b981] hover:bg-[#059669] text-white font-pixel text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-[#047857] flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <PenSquare className="w-3.5 h-3.5" /> Post Note
                </button>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-[#ffe0e0] border-2 border-[#8b2626] text-[#8b2626] flex items-center justify-center hover:bg-[#ffd0d0] font-bold cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Posts Grid Container */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fff8e1]">
              {posts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-[#8a5a2b] font-pixel text-sm">
                  No notes posted yet on the board. Be the first to leave a message!
                </div>
              ) : (
                posts.map((post) => (
                  <FreedomPostCard
                    key={post.id}
                    post={post}
                    isOfficer={isOfficer}
                    mode="grid"
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Post Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-slide-in">
          <div className="w-full max-w-lg relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-[#ffe0e0] border-2 border-[#8b2626] text-[#8b2626] flex items-center justify-center font-bold shadow-md hover:bg-[#ffd0d0] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <AddPostModal
              content={content}
              setContent={setContent}
              authorName={authorName}
              setAuthorName={setAuthorName}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedSong={selectedSong}
              setSelectedSong={setSelectedSong}
              onSubmit={handleAddPostSubmit}
              onReset={() => setShowAddModal(false)}
              isPending={isPending}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function FreedomWallPlazaGame(props: FreedomWallPlazaGameProps) {
  return (
    <GameStateProvider>
      <PlazaGameContent {...props} />
    </GameStateProvider>
  )
}
