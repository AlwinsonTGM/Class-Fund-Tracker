'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ClipboardList, X, Check } from 'lucide-react'

// ─── Patch Note Data ─────────────────────────────────────────────────────────
const CURRENT_VERSION = '1.34'
const STORAGE_KEY = `cft_patch_seen_v${CURRENT_VERSION}`

interface PatchEntry {
  version: string
  date: string
  title: string
  emoji: string
  changes: { type: 'new' | 'fix' | 'improve'; text: string }[]
}

const PATCH_NOTES: PatchEntry[] = [
  {
    version: '1.34',
    date: 'August 3, 2026',
    title: 'Design Polish, Accessibility & Keyboard Navigation Upgrades',
    emoji: '🎨',
    changes: [
      { type: 'improve', text: 'Scrubbed AI-Slop & Vibe-Coding Giveaways - removed artificial border-l-4 side-tab borders and upgraded bouncy spring curves to smooth exponential deceleration curves.' },
      { type: 'new', text: 'Unread Patch Notes Dot Badge - converted auto-opening patch notes modal on page mount into an unread notification dot badge on the trigger button.' },
      { type: 'new', text: 'URL & Keyboard Navigation Sync - active tabs now sync to URL search parameters (?tab=...) and support instant numeric keyboard shortcuts (1-5).' },
      { type: 'improve', text: 'Accessibility & Clean Typography - removed restrictive viewport zoom locks (userScalable) for WCAG compliance, cleaned up em-dashes, and removed unused external font imports.' },
    ],
  },
  {
    version: '1.33',
    date: 'August 3, 2026',
    title: 'Freedom Wall Temporary Rework & Maintenance Screen',
    emoji: '🚧',
    changes: [
      { type: 'new', text: 'Freedom Wall Rework Notice - temporarily restricted public and officer access to Freedom Wall posts and note editor, replacing the tab with a modern maintenance & rework screen.' },
      { type: 'improve', text: 'Personal Apology & Rework Context - added a personal note ("I\'m sorry, I didn\'t mean to...") and transparent roadmap of ongoing upgrades for safer, cleaner, and better canvas physics & moderation.' },
      { type: 'improve', text: 'Modular Subcomponent Architecture - added components/freedom-wall/under-rework.tsx while preserving full component structure and code optimization.' }
    ],
  },
  {
    version: '1.32',

    date: 'July 30, 2026',
    title: 'Study Hub Layout Overhaul, Subject Dropdown Accordions & Staggered Animations',
    emoji: '📚',
    changes: [
      { type: 'new', text: 'Full-Width Subject Accordions - redesigned Study Hub layout to full width, organizing reviewers under subject-based collapsible accordions that are closed by default.' },
      { type: 'new', text: 'Eye-Friendly Soft Color Coding - styled subject accordion headers with soft, comfortable pastel color themes (emerald, sky blue, violet, amber, teal, rose, indigo) optimized for both light and dark mode.' },
      { type: 'improve', text: 'Simplified Reviewer Cards - optimized reviewer cards by removing category and topic badges, focusing on contributor details, title editing, and clear file indicators (📄 PDF File / 🔗 Web Link).' },
      { type: 'improve', text: 'Streamlined Submission Modal - simplified "Submit Reviewer" form by removing description, category, and scope inputs while displaying full subject names (e.g. CS 101 - Intro to CS).' },
      { type: 'new', text: 'Hardware-Accelerated Entrance Animations - added smooth opening entrance animations with staggered accordion reveals and card scale-ins.' }
    ],
  },
  {
    version: '1.31',
    date: 'July 30, 2026',
    title: 'Study Hub Redesign, Class Documents Streamlining & Approved Materials Multi-Column Grid',
    emoji: '📚',
    changes: [
      { type: 'improve', text: 'Study Hub Streamlining - removed unused Class Documents subtabs to focus Study Hub 100% on Review Materials (quiz notes, exam reviewers, study resources).' },
      { type: 'new', text: 'Approved Materials Multi-Column Grid - converted the approved materials list from a narrow vertical side panel into a full-width, responsive CSS grid (2-4 columns) positioned directly under the viewer.' },
      { type: 'fix', text: 'PDF Viewer Layout & Whitespace Fix - eliminated excessive forced vertical blank space below the PDF embed viewer container on desktop screens.' },
      { type: 'new', text: 'Sticky Search & Filter Sidebar & Zoom Controls - added sticky positioning with collapse toggle for the search & filter panel, plus interactive PDF zoom controls (75%-150%).' }
    ],
  },
  {
    version: '1.30',
    date: 'July 30, 2026',
    title: 'Game Suite Decoupling, Token Optimization & Core Feature Focus',
    emoji: '🚀',
    changes: [
      { type: 'new', text: 'Decoupled Game Suite & Standalone Export - Flappy Bird Arcade & Multiverse of Sadness II have been fully exported into a dedicated standalone repository (multiverse-of-sadness).' },
      { type: 'improve', text: 'Token & Performance Optimization - removed ~60 MB of game video/audio assets and 20+ game components to drastically reduce bundle size and preserve development token budget.' },
      { type: 'improve', text: 'Developer Statement - "Decoupled the games to focus token budget and development time on core class fund tools and transparency features. I cant sustain developing the game suite while building class fund tools and vibe-coding, but I have a lot of fun ideas for class features to build ahead. Hope yall understand!"' },
      { type: 'improve', text: 'Clean Codebase & Documentation - scrubbed game references across README, documentation, and interface toolbars to keep the Transparency Portal 100% focused on class fund tracking.' }
    ],
  },
  {
    version: '1.28',
    date: 'July 28, 2026',
    title: 'Desktop Approval Queue Placement, Mobile Queue Notification Sign & Week Selector Layout Fix',
    emoji: '🔔',
    changes: [
      { type: 'fix', text: 'Financial Audit PDF Print Isolation - fixed PDF print export where background dashboard pages were included prior to the statement. Dashboard elements are now completely hidden during print, generating a clean PDF statement starting on page 1.' },
      { type: 'improve', text: 'Digital Proof Approval Queue Desktop Placement - moved the digital proof approval queue directly under the Total Fund Balance on desktop screens for quick access.' },
      { type: 'new', text: 'Mobile Queue Notification Sign & Badges - added an animated glowing notification sign badge to the approval queue panel header and Portal bottom nav icon whenever pending proof uploads exist.' },
      { type: 'fix', text: 'Mobile Week Selector Alignment & Truncation - fixed mobile edge overflow and text alignment for the "Selected Week" dropdown so long date range options fit cleanly without spilling over.' },
    ],
  },
  {
    version: '1.27',
    date: 'July 28, 2026',
    title: 'Portal UI Refinements, Current Week Automation, Classmate CRUD & Completion Confetti',
    emoji: '🎉',
    changes: [
      { type: 'new', text: 'Full Classmate Management (Add, Edit & Delete) - moderators and officers can now add new classmates, edit student details, and moderators can remove classmates with audit logging.' },
      { type: 'new', text: 'Auto-Select Week for Today - automatically detects and selects the active week corresponding to today\'s date so you don\'t have to switch weeks manually each session.' },
      { type: 'new', text: 'Celebratory Week Completion & Confetti - when 100% of class fund contributions for a week are collected, falling confetti and a Thank You statement pop up, displaying a completion badge and freezing the list from further edits.' },
      { type: 'improve', text: 'Mobile Portal Tab Layout & Collapsible Containers - Officer Student Checklist is positioned directly below Total Balance on mobile screens, and all management panels start neatly collapsed by default.' },
      { type: 'fix', text: 'No More "Updated live" Text Flickering - fixed layout wrapping where "Updated live" would break into two lines when payment delta badges (+₱5.00/-₱5.00) popped in.' },
      { type: 'fix', text: 'Financial Audit Report Current Week Sync - Outstanding Dues in the financial statement now dynamically reflects the active week (e.g. As of Wk 2) instead of defaulting to Week 1.' },
      { type: 'improve', text: 'Compact CSV Export Buttons - optimized CSV export buttons into horizontal flex/grid rows on PC to save space.' },
    ],
  },
  {
    version: '1.26',
    date: 'July 28, 2026',
    title: 'Officer Student Checklist: Real-Time Balance Sync, Animated Counters & Mobile Corner Toast',
    emoji: '⚡',
    changes: [
      { type: 'new', text: 'Mobile Floating Corner Balance Toast - mobile users get a floating corner widget displaying total balance changes in real-time with counting animation and +₱5.00/-₱5.00 delta badges when checking/unchecking items.' },
      { type: 'improve', text: 'Real-Time Animated Total Fund Balance - Total Balance Card now smoothly animates numeric transitions over 400ms with glow pulse highlights and floating delta badges.' },
      { type: 'fix', text: 'Instantaneous Checklist Toggles & Real-Time Balance Sync - toggling payment status updates the total fund balance across the portal instantaneously (0ms UI latency) with smooth optimistic state sync. (Special thanks to Dandan for reporting checklist feedback!)' },
      { type: 'fix', text: 'Week Selection Persistence - fixed an issue where marking a checklist item in Week 2 automatically reset the view back to Week 1 upon server revalidation.' },
      { type: 'improve', text: 'Non-Blocking Background Synchronization - replaced global UI lock with fine-grained per-item pending states and smooth background sync indicators.' },
      { type: 'improve', text: 'Parallel Officer Verification - optimized server authentication checks to run database queries concurrently for faster response times.' },
    ],
  },
  {
    version: '1.17',
    date: 'July 27, 2026',
    title: 'Dashboard Filter Alignments, Mobile Ergonomics & Manage Weeks Refactoring',
    emoji: '🎨',
    changes: [
      { type: 'fix', text: 'Approval Queue Filter Search Bar Width - expanded the digital proof search input to max-w-sm flex-1, perfectly matching the student search bar directly below it.' },
      { type: 'fix', text: 'Filter Tab Text Wrapping - enforced whitespace-nowrap and optimized padding across filter status buttons to prevent "Pending (0)" text from wrapping onto two lines.' },
      { type: 'improve', text: 'Equal Filter Tab Distribution - converted All, Unpaid, and Paid filter tabs to a 3-column equal grid layout (33.3% per segment) across mobile and PC.' },
      { type: 'improve', text: 'Inline Recent Activity Moderator Buttons - aligned Edit and Delete action buttons with Pencil and Trash icons on the exact same header row as officer email and timestamp.' },
      { type: 'improve', text: 'Mobile Dashboard Toolbar Alignment - aligned all mobile dashboard header action buttons to start on the left, while maintaining right-alignment on PC.' },
      { type: 'improve', text: 'Manage Class Weeks Layout & Full-Width Add Button - wrapped week management panel in a CollapsibleSection and aligned the Add Week button to span full container width.' },
    ],
  },

  {
    version: '1.15',
    date: 'July 27, 2026',
    title: 'Spontaneous Note Spawning & Tab Entrance Animations',
    emoji: '🎬',
    changes: [
      { type: 'new', text: 'Spontaneous Note Spawning - Freedom Wall sticky notes now spawn one-by-one with a smooth spring zoom-out effect in both Scatter and Grid view modes.' },
      { type: 'improve', text: 'Smooth Tab Entrance Animations - Tasks Tab, Freedom Wall Tab, and Study Hub Tab now share polished fade and slide-in entrance transitions across Public and Officer viewports.' },
      { type: 'improve', text: 'Staggered Task Card Animations - task cards slide and fade in with cascading delays when switching to or filtering the Tasks board.' },
      { type: 'improve', text: 'Patch Notes Modal Entrance - opening Patch Notes triggers a smooth backdrop blur fade, spring modal card zoom, and staggered version list entrance.' },
    ],
  },
  {
    version: '1.14',
    date: 'July 27, 2026',
    title: 'Mobile Swiping Glitch Fix & Clean Tab Transitions',
    emoji: '📱',
    changes: [
      { type: 'fix', text: 'Removed Mobile Left/Right Swiping - eliminated horizontal CSS scroll snap and scroll listener sync to stop layout flickering and glitches when swiping on mobile.' },
      { type: 'improve', text: 'Clean Tab Switching - mobile and desktop tabs now transition instantly via state switching with automatic window scroll reset to top.' },
      { type: 'fix', text: 'Modal Close Button Alignment - adjusted patch notes modal header layout flex positioning to prevent the circular close button from overlapping the version badge.' },
    ],
  },
  {
    version: '1.13',
    date: 'July 27, 2026',
    title: 'Direct PDF Reviewer Submissions & Anti-Spam Queue Protection',
    emoji: '📄',
    changes: [
      { type: 'new', text: 'Direct PDF Reviewer File Uploads - students and officers can now upload .pdf files (up to 3MB) directly from their local device when submitting reviewers in Study Hub.' },
      { type: 'new', text: 'Embedded PDF Viewer & 1-Click Download - approved PDF reviewers render directly inside the embedded projection viewer iframe and include a 1-click PDF download button.' },
      { type: 'new', text: 'Visual PDF File Badges - reviewer cards on the board and in the moderator approval queue feature prominent red 📄 PDF File badges for quick file type identification.' },
      { type: 'improve', text: 'Anti-Spam Queue Protection - enforced a strict maximum limit of 5 pending unapproved reviewer submissions to prevent submission queue flooding and spam.' },
      { type: 'improve', text: 'Automatic PDF Rejection Cleanup - rejecting or deleting a reviewer submission permanently purges the stored PDF file content from database storage.' },
    ],
  },
  {
    version: '1.12',
    date: 'July 27, 2026',
    title: 'Natural Header Scroll & Mobile Dashboard Parity',
    emoji: '✨',
    changes: [
      { type: 'fix', text: 'Resolved Header Scroll Flickering - eliminated sticky header scroll oscillation on mobile by replacing unstable conditional component swapping with a single, stable header container.' },
      { type: 'improve', text: 'Mobile & PC Dashboard Parity - standardized header scroll behavior across Officer Dashboard and Public Dashboard, ensuring a smooth, natural page scroll experience on all screen sizes.' },
      { type: 'improve', text: 'Eliminated Sticky Viewport Obstruction - allowed full header to scroll naturally with page content on mobile, freeing up valuable screen space and preventing backdrop blur overlaps.' },
      { type: 'fix', text: 'Removed Redundant Officer Menu - removed redundant slide-over officer sidebar menu, streamlining officer actions directly into the main header toolbar.' },
    ],
  },
  {
    version: '1.11',
    date: 'July 27, 2026',
    title: 'Mobile Officer Ergonomics, Slide-Over Sidebar & Header Refactoring',
    emoji: '📱',
    changes: [
      { type: 'new', text: 'Officer Sidebar Menu Drawer - added a slide-over navigation drawer providing single-tap access to officer tools, financial audit exports, expense recording, theme preferences, and sign out.' },
      { type: 'improve', text: 'Spacious Dashboard Header - restored full unscrolled header layout with prominent left-aligned "Officer Dashboard" heading and portal subtitle.' },
      { type: 'improve', text: 'Logical Toolbar Grouping - organized essential financial actions (Financial Audit Report & Record Expense) on the left side, and settings/extras (Patch Notes, Theme Toggle, Sidebar Drawer) on the right side.' },
      { type: 'improve', text: 'Compact Mobile Logo Buttons - optimized Record Expense and Financial Audit Report buttons to sleek circular logo icon buttons on mobile screens with hold/hover tooltips.' },
      { type: 'fix', text: 'Hysteresis Anti-Flicker Scroll - resolved sticky header scroll oscillation by implementing a hysteresis scroll threshold (> 45px enter, < 10px exit).' },
      { type: 'fix', text: 'Sticky Bar Mobile Alignment - fixed scrolled sticky bar layout so the Officer Dashboard title and action icons remain aligned horizontally on a single row without truncation or layout shifts.' },
      { type: 'improve', text: 'Streamlined Recent Activity Padding - reduced button heights and vertical whitespace across activity log items and load more actions.' },
      { type: 'improve', text: 'Freedom Wall Cleanliness - removed local reaction palette UI while preserving 100% of post content, author details, song previews, and database models.' },
      { type: 'improve', text: 'Future Mobile Optimizations Notice - the interface will further be optimized for mobile viewports across upcoming updates.' },
    ],
  },
  {
    version: '1.10',
    date: 'July 26, 2026',
    title: 'Digital Payment Receipts, Financial Audit Reports & Mobile Ergonomics Overhaul',
    emoji: '💳',
    changes: [
      { type: 'new', text: 'Digital Proof of Payment Uploads - students can upload screenshot proof of payment (GCash/Maya receipts) with reference numbers when submitting weekly dues.' },
      { type: 'new', text: 'Officer Receipt Approval Queue - whitelisted officers on /officer-dashboard receive a pending receipts queue with image preview, zoom modal, and 1-click Approve or Reject actions.' },
      { type: 'new', text: 'Exportable Financial Audit Reports - 1-click RFC 4180-compliant CSV exports for payment matrices/history and printable PDF financial statements summarizing fund balances.' },
      { type: 'improve', text: 'Mobile Responsiveness & Container Layouts - dynamic typography scaling, line heights, text wrapping, and compact container padding across 320px–480px viewports with zero horizontal overflow.' },
      { type: 'improve', text: 'Mobile Tab Scroll Reset & Fatigue Prevention - instant vertical scroll reset upon tab switching in bottom navigation and top tab bars, eliminating scroll overshoot across sections.' },
      { type: 'improve', text: 'Sleek Button Sizing & Touch Ergonomics - refined button heights, icon controls, and filter chips for clean visual proportion while enforcing accessible touch targets.' },
      { type: 'fix', text: 'Nav Bar Rapid Switch Glitch - fixed horizontal container scroll race condition when spamming navigation tabs, ensuring smooth instant tab transitions.' },
      { type: 'fix', text: 'Freedom Wall Hydration Mismatch - resolved React 19 hydration mismatch error in FreedomPostCard by safely deferring localStorage reaction loads until post-mount.' },
      { type: 'fix', text: 'Root Layout Script Warning - upgraded theme initializer script in app/layout.tsx to Next.js Script (beforeInteractive) strategy.' },
      { type: 'fix', text: 'Officer Dashboard Header Toolbar - reorganized header action buttons into clean toolbar flex groups, eliminating orphaned Sign Out button placement on mobile.' },
      { type: 'improve', text: 'Component Refactoring & Dynamic Imports - split monolithic components into sub-components with next/dynamic lazy loading for improved initial page load performance.' },
    ],
  },
  {
    version: '1.9',
    date: 'July 24, 2026',
    title: 'Multiverse of Sadness Mode & Dynamic Video Backgrounds',
    emoji: '🌀',
    changes: [
      { type: 'new', text: 'Multiverse of Sadness Game Mode - introduced a brand-new Flappy Bird mode featuring dynamic background video streaming and multi-world pipe skins.' },
      { type: 'new', text: 'Dynamic Video Crossfade Backgrounds - upon reaching 6 points in Multiverse mode, background seamlessly transitions into randomized TikTok video edits from /multiverse/ with unmuted audio and zero-gap crossfades.' },
      { type: 'new', text: 'Doggie Easter Egg Animations - periodic background pop-ups featuring animated Doggie GIFs from /akosidogie/ with random Zoom In/Out and Fade In/Out motion effects.' },
      { type: 'new', text: 'Multi-World Randomized Pipe Skins - each pipe pair in Multiverse mode spawns with a random skin: Farm Green, Cyberpunk Neon, Desert Sunset, Deep Ocean, Gold, Cosmic Void, Sakura Pink, or Rainbow Spectrum.' },
      { type: 'new', text: 'Dedicated Multiverse Leaderboard - full central database & offline fallback leaderboard support with a dedicated Multiverse tab.' },
      { type: 'fix', text: 'Game Over Score Display - updated Game Over screen score labels so Round Score is clearly distinguished from mode-specific High Scores when toggling mode pills.' },
      { type: 'fix', text: 'Death Video Stop & Reset - background videos automatically pause and reset upon player death to ensure clean gameplay restarts.' },
    ],
  },
  {
    version: '1.8',
    date: 'July 24, 2026',
    title: 'Realtime Leaderboard & Mobile Control Polish',
    emoji: '🏆',
    changes: [
      { type: 'new', text: 'Realtime Leaderboard Synchronization - live updates stream automatically across all active sessions whenever a high score is set.' },
      { type: 'fix', text: 'Leaderboard Mode Switch Loading Screen - added a dedicated loading screen and button locks during mode transitions (Classic ↔ Zen) to prevent rapid switch spamming.' },
      { type: 'fix', text: 'Supabase Score Updates & RLS Policies - fixed missing UPDATE RLS policies on flappy_bird_scores, resolving silent score update failures and duplicate rows.' },
      { type: 'fix', text: 'Mobile Game Over Input Protection - fixed an issue on mobile where tapping Game Over buttons would restart games unintentionally, adding touch event propagation guards and input cooldowns.' },
      { type: 'new', text: 'Leaderboard Table Reset - added a Clear Table server action and interactive modal button to reset score entries.' },
    ],
  },
  {
    version: '1.7',
    date: 'July 23, 2026',

    title: 'Flappy Bird Arcade, Multi-Theme & Leaderboard Upgrades',
    emoji: '🎮',
    changes: [
      { type: 'new', text: 'Flappy Bird Arcade Mini-Game - integrated a full HTML5 Canvas Flappy Bird game with original gravity, flap physics, and infinite parallax scrolling background.' },
      { type: 'new', text: 'Multi-Theme Environmental Rendering - experience 4 distinct visual themes (Classic Farm, Cyberpunk Night, Desert Sunset, Deep Ocean) with custom sky gradients, environment silhouettes, glowing neon grid lines, and thematic pipe designs.' },
      { type: 'new', text: 'Automatic Theme Randomization - every new game round automatically picks a fresh visual theme, with a manual theme selector available on the start menu.' },
      { type: 'fix', text: 'Game Over Mode Switching - fixed an issue where players could not change game modes (Classic vs Zen) after dying, adding mode toggle pills and a Main Menu option directly on the Game Over screen.' },
      { type: 'fix', text: 'Leaderboard Score Overwriting & Deduplication - high scores are now automatically overwritten on new personal bests and deduplicated per player to prevent duplicate leaderboard entries.' },
      { type: 'improve', text: 'Consistent UI & Refrained Emojis - replaced raw emojis across Flappy Bird UI with clean Lucide vector icons and styled rank badges.' },
      { type: 'new', text: 'Online Sync & Offline Fallback Indicator - real-time status mark displaying database connection status.' },
      { type: 'new', text: 'Guest & User Account Handles - signed-in users automatically save custom display handles, while guest players can customize their handle anytime.' },
    ],
  },
  {
    version: '1.6',
    date: 'July 23, 2026',
    title: '☁️ Cloud Sync & Fluid Glass Navigation',
    emoji: '🔄',
    changes: [
      { type: 'new', text: 'Interactive Toast Notifications - added sliding popup notifications on the side of the screen to alert you instantly when changes happen.' },
      { type: 'new', text: 'Transaction Sound Effects - integrated audio feedback for transactions and user activities to make interactions more engaging.' },
      { type: 'improve', text: 'Freedom Wall Optimization - limited floating notes to the 10 latest entries to enhance performance on low-end and mobile devices.' },
      { type: 'improve', text: 'Symmetrical Liquid Glass Navigation - refined mobile bottom navigation capsule into a perfectly rounded glass bubble with top specular highlights.' },
      { type: 'improve', text: 'Static Idle Posture - removed continuous asymmetrical morphing keyframes for a clean, stable idle state.' },
      { type: 'fix', text: 'Zero-Lag Tab Sliding - eliminated state-delay hitches for instant, responsive GPU hardware-accelerated tab transitions.' },
      { type: 'fix', text: 'Officer Authentication Route Protection - forced authenticated officers to load the Officer Dashboard directly rather than landing on the normal dashboard.' },
      { type: 'fix', text: 'Task Creation Redirects - fixed a routing issue where adding a task occasionally redirected to a "Page Not Found" screen.' },
      { type: 'new', text: 'Database-Backed Class Documents - class files are now stored in Supabase instead of local storage, making them visible to all users across all devices.' },
      { type: 'new', text: 'Cloud Song Attachments - song previews attached to Freedom Wall posts are now saved to the database (song_data column), ensuring everyone hears the same tracks.' },
      { type: 'fix', text: 'Cross-Device Synchronization - eliminated the "local-only" bug where documents and songs added on your phone were invisible to other users.' },
      { type: 'improve', text: 'Server Actions Integration - updated addPostAction and addClassDocumentAction to store data centrally in Supabase for secure, real-time collaboration.' },
      { type: 'improve', text: 'Schema Updates - added song_data JSONB column to freedom_posts table and restructured class_documents with proper RLS policies.' },
    ],
  },
  {
    version: '1.5',
    date: 'July 18, 2026',
    title: 'Customizable Study Hub & Easter Eggs',
    emoji: '🌧️',
    changes: [
      { type: 'new', text: 'Custom Class Files (Officers Only) - officers can now add PDF links or write Markdown files directly within the UI, stored securely in local storage.' },
      { type: 'new', text: 'Draggable Reviewer Panels - desktop users can now click and drag the splitter bar to dynamically resize the Approved Materials list width.' },
      { type: 'new', text: 'Dogie Falling Easter Egg - secret interaction unlocked by tapping the settings gear 10 times, causing animated gifs to fall slowly behind everything.' },
      { type: 'new', text: 'Direct Blob Downloads - custom-written Markdown guides can be downloaded on-the-fly as structured .md files in the browser.' },
      { type: 'improve', text: 'Standardized 5-Button Bottom Nav - replaced mobile float quick menu with standard aligned tabs matching the active indicator slide.' },
      { type: 'improve', text: 'Expanded Document Viewport - increased preview frame size heights to 680px for documents and 500px for reviewers, optimizing readability.' },
      { type: 'improve', text: 'Clean Settings Response - settings dropdown click-outside checks now ignore clicks targeting the trigger gear, resolving instant close bugs.' },
      { type: 'improve', text: 'Physics Repulsion - added repulsion forces in the Freedom Wall note physics to prevent notes from stacking directly on top of each other.' },
      { type: 'improve', text: 'Canvas Weather ResizeObserver - replaced window resize listeners with element-bound ResizeObservers for distortion-free mobile displays.' },
      { type: 'fix', text: 'Redundant Code & File Cleanup - merged Next configurations, deleted boilerplate SVGs, unused placeholder assets, and pnpm lock files.' }
    ],
  },
  {
    version: '1.4',
    date: 'July 17, 2026',
    title: 'Public KLD Sign-Up & Spam-Free Wall',
    emoji: '🔐',
    changes: [
      { type: 'new', text: 'School-Restricted Public Sign-Up - any student can now create an account using their school email domain (@kld.edu.ph).' },
      { type: 'new', text: 'Forgot Password / Reset Link - request a password reset email in the login panel, redirecting securely to a dedicated update password form.' },
      { type: 'new', text: 'Dedicated Reset Password Form Page - custom secure route (/auth/reset-password) to enter and confirm new credentials.' },
      { type: 'new', text: 'SignUp & Password Recovery Actions - backend server actions validating domains and requesting resets through Supabase Auth.' },
      { type: 'new', text: 'Secure Officer Dashboard Block - added real-time database queries to verify if logged-in accounts exist in officers/moderators tables, redirecting general users to the homepage immediately.' },
      { type: 'improve', text: 'Spam-Free Emoji Reactions - clicking an emoji reaction toggles it (adds 1 or removes 1) instead of allowing infinite spam.' },
      { type: 'improve', text: 'Authenticated Wall Reactions - emoji reactions now require logging in first to identify users and count reactions uniquely.' },
      { type: 'improve', text: 'Highlighted Emoji Selection - reaction chips actively highlight with a custom border and theme color matching if the user has selected it.' },
      { type: 'improve', text: 'Multi-View Inline Login Portal - login form updated with clean tab switching for Sign In, Sign Up, and Forgot Password views.' }
    ],
  },
  {
    version: '1.3',
    date: 'July 17, 2026',
    title: 'Personal Tasks & UX Polish',
    emoji: '🔒',
    changes: [
      { type: 'new', text: 'Personal (Private) Tasks - any logged-in student can now create tasks visible only to their own account. Public viewers cannot see them.' },
      { type: 'new', text: 'Task Visibility Toggle - officers can choose Public (visible to all) or Private (Only Me) during task creation. Standard students are locked to Private.' },
      { type: 'new', text: 'Lock badge on private task cards - personal tasks display a 🔒 Personal chip next to the type badge in the feed.' },
      { type: 'new', text: 'Custom Task Deletion Confirmation - deleted tasks now trigger a styled warning card modal with a smooth scale animation instead of the default browser alert.' },
      { type: 'new', text: 'Custom Recent Activity Deletion Confirmation - same polished warning modal added to the audit log deletion flow.' },
      { type: 'new', text: 'Task Background Image Customization - pick from 6 preselected covers or upload your own custom photo (max 1 MB) that fills the entire task card.' },
      { type: 'new', text: 'Task Edit / Modify Button - officers and task creators can now edit any task by clicking an Edit icon on the card. The creation form reopens pre-filled and converts its submit button to "Save Changes".' },
      { type: 'improve', text: 'Rolling linear progress bar at the top of the tasks panel animates during all database operations so you know work is happening.' },
      { type: 'improve', text: '"Updating..." card overlay - task cards show a spinning indicator backdrop when a toggle or edit is in-flight.' },
      { type: 'improve', text: '"Deleting..." card overlay - the target card dims and shows a spinner while a delete is pending, removing the awkward disappear delay.' },
      { type: 'improve', text: '"Signing out..." feedback - both public and officer sign-out buttons now instantly replace their label with a spinner + "Signing out..." text on click.' },
      { type: 'improve', text: 'Card replica live preview in task form - the card preview in the right column now reflects Private/Personal badge changes in real time.' },
      { type: 'improve', text: 'Private task ownership checks - edit, toggle, and delete server actions verify the logged-in user email matches created_by before proceeding.' },
      { type: 'improve', text: 'Sign-out button is disabled immediately after clicking to prevent double submission.' },
      { type: 'improve', text: 'data-scroll-behavior attribute added to <html> to silence Next.js route-transition scroll warning.' },
      { type: 'fix', text: 'Eliminated all React key prop console warnings by moving sign-out and login form elements natively inside their tab containers.' },
      { type: 'fix', text: 'Check icon (lucide) was not imported, causing a ReferenceError when selecting a background photo - now properly imported.' },
    ],
  },
  {
    version: '1.2',
    date: 'July 17, 2026',
    title: 'Freedom Wall Upgrades',
    emoji: '🎵',
    changes: [
      { type: 'new', text: 'Discord-style emoji reactions - tap any existing reaction to increment its count, or use the + button to open the emoji palette picker.' },
      { type: 'new', text: 'Emoji palette picker - 24 curated emojis available per note with a smooth slide-in dropdown.' },
      { type: 'new', text: 'Song attachment - before posting, search iTunes for any track and attach a 30-second preview clip to your note.' },
      { type: 'new', text: 'Inline mini music player - notes with songs show album artwork, track title, artist, a tappable progress bar, and a play/pause button.' },
      { type: 'new', text: 'Global audio singleton - only one song can play at a time. Starting a new track auto-pauses the previous one.' },
      { type: 'fix', text: 'Song artwork and the music player no longer disappear after re-render due to optimistic UI overwriting server data.' },
      { type: 'improve', text: 'Reactions and song data persist in localStorage between page refreshes for a seamless experience.' },
      { type: 'improve', text: 'Freedom Wall posts display timestamps formatted as relative time (e.g. "2 hours ago").' },
    ],
  },
  {
    version: '1.1',
    date: 'July 17, 2026',
    title: 'Unified Task System',
    emoji: '🎯',
    changes: [
      { type: 'new', text: 'Unified Multi-Dimensional Task Board - create tasks with course links, due dates, task types, participation modes, group sizes, and priorities.' },
      { type: 'new', text: 'Live due-date countdown badges - cards show "2d 4h left", "3h 20m left", or "Overdue" in real time.' },
      { type: 'new', text: 'Priority glow borders - Urgent (rose), High (amber), Medium (emerald), Low (muted) left-edge borders on every card.' },
      { type: 'new', text: 'Filter Dock - filter tasks by course code, task type, priority level, and participation type. Multiple filters stack simultaneously.' },
      { type: 'new', text: 'Active filter chips - active filters appear as removable tag pills above the grid. A Clear All button resets everything.' },
      { type: 'new', text: 'Search bar - fuzzy match tasks by title in real time.' },
      { type: 'new', text: 'Completed tasks toggle - a "Show Completed" switch separates done from pending tasks.' },
      { type: 'new', text: 'Course badge tooltip - hovering a course badge shows the full course name.' },
      { type: 'new', text: 'Patch notes popup - this window, with per-version localStorage tracking so it only auto-opens once per version.' },
      { type: 'improve', text: 'Inline Login - logging in no longer navigates to a separate page. The login form slides inline within the public dashboard.' },
      { type: 'improve', text: 'Officer Dashboard Home tab renders inline - no more full-page navigation to switch between dashboard sections.' },
      { type: 'improve', text: 'Bottom nav bar is fixed to the visible screen with a liquid glass blur backdrop.' },
      { type: 'improve', text: 'Nav tab icons no longer shift layout when selected - active state uses a thin underline dot instead of resizing the icon.' },
      { type: 'improve', text: 'Desktop widescreen layout - the dashboard now uses dual-column layouts on large screens (stats left, checklist right) for a less stretched appearance.' },
      { type: 'improve', text: 'All raw OS emojis replaced with Lucide vector icons across nav bars, payment lists, activity logs, task cards, and modal buttons.' },
      { type: 'fix', text: 'Supabase schema cache relation error (tasks → courses) no longer crashes the tasks section - fetched and joined in memory instead.' },
      { type: 'fix', text: 'Local Fallback Mode now only activates when a real DB error is detected, not when the tasks table is simply empty.' },
    ],
  },
  {
    version: '1.0',
    date: 'July 16, 2026',
    title: 'Initial Launch',
    emoji: '🚀',
    changes: [
      { type: 'new', text: 'Student payment tracker - weekly contribution checklist with public and officer views.' },
      { type: 'new', text: 'Officer Dashboard - protected portal for toggling payments, recording expenses, and managing calendar weeks.' },
      { type: 'new', text: 'Real-time balance card - Net Balance = (Paid students × ₱5) − Total Expenses, computed live.' },
      { type: 'new', text: 'Freedom Wall - anonymous sticky-note style posts with customizable pastel backgrounds.' },
      { type: 'new', text: 'Dark / Light mode toggle - flash-free, persisted in localStorage with head-script hydration.' },
      { type: 'new', text: 'Audit log - all officer actions (payment toggles, expense records, week edits) are stamped with email and timestamp.' },
      { type: 'new', text: 'Google OAuth - sign in with your school Google account through Supabase Auth.' },
      { type: 'new', text: 'Privacy-safe names - public view shows "First Name + Last Initial" while the officer panel shows the full roster name.' },
      { type: 'new', text: 'Calendar week management - officers can add, edit, or delete weekly date ranges and mark weeks as suspended.' },
      { type: 'new', text: 'Moderator role - accounts in the moderators table can edit log descriptions and delete entries (reversing the linked DB transaction).' },
    ],
  },
]

const TYPE_STYLES = {
  new: { label: 'NEW', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  fix: { label: 'FIX', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  improve: { label: 'IMPROVED', class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
interface PatchNotesModalProps {
  /** If true, always shows the modal (triggered by the manual button) */
  forceOpen?: boolean
  onClose?: () => void
}

export function PatchNotesModal({ forceOpen = false, onClose }: PatchNotesModalProps) {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Respond to force-open (from the button)
  useEffect(() => {
    if (forceOpen) {
      setVisible(true)
    }
  }, [forceOpen])

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
    onClose?.()
  }

  if (!mounted || !visible) return null

  const modal = (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 anim-modal-overlay-in"
      style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.45)' }}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-card border border-border rounded-3xl shadow-2xl overflow-hidden anim-modal-card-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-border/60 shrink-0 bg-gradient-to-br from-primary/5 to-transparent gap-2">
          <div className="flex flex-col gap-1 pr-2 text-left min-w-0">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary shrink-0" />
              <h2 className="text-lg font-bold text-foreground tracking-tight truncate">Patch Notes</h2>
            </div>
            <p className="text-xs text-muted-foreground truncate">Latest changes & improvements to BSIS 201 Section Hub</p>
          </div>

          {/* Version badge & Close button flex container */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex flex-col items-end gap-1">
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground whitespace-nowrap">
                v{CURRENT_VERSION} Latest
              </span>
              <button
                onClick={handleClose}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-medium whitespace-nowrap"
              >
                Don't show again
              </button>
            </div>

            {/* Close X */}
            <button
              onClick={handleClose}
              className="size-9 sm:size-10 flex items-center justify-center rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer press-spring shrink-0"
              aria-label="Close patch notes"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          {PATCH_NOTES.map((patch, patchIdx) => (
            <div
              key={patch.version}
              className="flex flex-col gap-3 anim-stagger-in"
              style={{ animationDelay: `${patchIdx * 70}ms` }}
            >
              {/* Version header */}
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{patch.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      patchIdx === 0
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      v{patch.version}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground shrink-0">{patch.date}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug">{patch.title}</h3>
                </div>
              </div>

              {/* Change list */}
              <ul className="flex flex-col gap-2 pl-2 sm:pl-9">
                {patch.changes.map((change, i) => {
                  const style = TYPE_STYLES[change.type]
                  return (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                      <span className={`shrink-0 mt-0.5 px-1.5 py-0.5 text-[9px] font-bold border rounded uppercase ${style.class}`}>
                        {style.label}
                      </span>
                      <span className="flex-1 min-w-0">{change.text}</span>
                    </li>
                  )
                })}
              </ul>

              {/* Divider between patches */}
              {patchIdx < PATCH_NOTES.length - 1 && (
                <div className="border-t border-border/40 mt-1" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 border-t border-border/60 flex items-center justify-between bg-muted/30">
          <p className="text-[10px] text-muted-foreground">BSIS 201 Section Hub · v{CURRENT_VERSION}</p>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold bg-foreground text-background rounded-full hover:opacity-90 transition-opacity cursor-pointer press-spring flex items-center justify-center gap-1"
          >
            <span>Got it!</span>
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

// ─── Trigger Button (exported separately to place next to theme toggle) ───────
interface PatchNotesButtonProps {
  className?: string
}

export function PatchNotesButton({ className }: PatchNotesButtonProps) {
  const [open, setOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem(STORAGE_KEY)
      if (!seen) setHasUnread(true)
    }
  }, [])

  return (
    <>
      <button
        id="patch-notes-button"
        onClick={() => {
          setOpen(true)
          setHasUnread(false)
        }}
        title="View patch notes"
        className={`relative size-9 sm:size-10 flex items-center justify-center rounded-full border border-border hover:bg-muted transition-colors cursor-pointer press-spring ${className ?? ''}`}
        aria-label="Open patch notes"
      >
        <ClipboardList className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute top-1 right-1 size-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </button>
      {open && <PatchNotesModal forceOpen={true} onClose={() => setOpen(false)} />}
    </>
  )
}
