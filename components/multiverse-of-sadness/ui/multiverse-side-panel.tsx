import React from 'react'
import { UNIVERSE_CONFIGS } from '../multiverse-config'

interface MultiverseSidePanelProps {
  currentUniIndex: number
  flapsCount?: number
  tearsCount?: number
  runsCount?: number
}

export function MultiverseSidePanel({
  currentUniIndex,
  flapsCount = 0,
  tearsCount = 0,
  runsCount = 0
}: MultiverseSidePanelProps) {
  return (
    <aside className="w-full lg:w-[302px] flex flex-col gap-4 text-[#c9d6e2] shrink-0 font-['Space_Grotesk']">
      
      {/* 1. NOW SHOWING PANEL (Original Design) */}
      <section className="bg-gradient-to-b from-[#111b29] to-[#0e1622] border border-[#22344a] rounded-[6px] p-[16px_18px] transition-all duration-400 hover:border-[#2f4a6b] hover:-translate-y-[2px]">
        <h3 className="font-['Special_Elite'] font-normal text-[12.5px] tracking-[2.5px] uppercase text-[#d9a441] mb-3 flex items-center gap-[10px]">
          <span>Now Showing</span>
          <span className="flex-1 h-[1px] bg-gradient-to-r from-[#22344a] to-transparent" />
        </h3>

        <ol className="list-none flex flex-col gap-[5px] max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {UNIVERSE_CONFIGS.map((u, i) => {
            const isNow = i === currentUniIndex
            return (
              <li
                key={u.id}
                className={`grid grid-cols-[32px_1fr] gap-x-[10px] gap-y-[1px] p-[8px_10px] border-t border-r border-b border-l-2 transition-all duration-300 cursor-default ${
                  isNow
                    ? 'border-l-[#d9a441] bg-[rgba(217,164,65,0.13)] border-t-transparent border-r-transparent border-b-transparent'
                    : 'border-l-[#22344a] border-t-transparent border-r-transparent border-b-transparent hover:border-l-[#96b6d6] hover:bg-[rgba(150,182,214,0.05)] hover:translate-x-[3px]'
                }`}
              >
                <span
                  className={`row-span-2 font-['Special_Elite'] text-[12px] pt-[2px] ${
                    isNow ? 'text-[#d9a441]' : 'text-[#7f93a8]'
                  }`}
                >
                  {u.num}
                </span>

                <span
                  className={`text-[13px] font-bold tracking-[0.3px] font-['Space_Grotesk'] ${
                    isNow ? 'text-[#f0d9a8]' : 'text-[#e9f0f7]'
                  }`}
                >
                  {u.name}
                  {isNow && (
                    <span className="text-[#d9a441] font-medium text-[10px] tracking-[1px] font-['Space_Grotesk']">
                      {' '}· now
                    </span>
                  )}
                </span>

                <span className="text-[11px] text-[#7f93a8] leading-tight truncate font-['Space_Grotesk']">
                  {u.sub}
                </span>
              </li>
            )
          })}
        </ol>

        <p className="text-[11px] text-[#7f93a8] italic mt-[10px] leading-[1.55] font-['Space_Grotesk']">
          the universe shifts every 5 pipes. there is no opting out. there is never an opting out.
        </p>
      </section>

      {/* 2. CONTROLS PANEL */}
      <section className="bg-gradient-to-b from-[#111b29] to-[#0e1622] border border-[#22344a] rounded-[6px] p-[16px_18px] transition-all duration-400 hover:border-[#2f4a6b] hover:-translate-y-[2px]">
        <h3 className="font-['Special_Elite'] font-normal text-[12.5px] tracking-[2.5px] uppercase text-[#d9a441] mb-3 flex items-center gap-[10px]">
          <span>Controls</span>
          <span className="flex-1 h-[1px] bg-gradient-to-r from-[#22344a] to-transparent" />
        </h3>

        <ul className="list-none flex flex-col gap-[9px] text-[12.5px] font-['Space_Grotesk']">
          <li className="flex items-center gap-1.5 flex-wrap">
            <kbd className="font-['Space_Grotesk'] text-[11px] border border-[#22344a] border-b-2 px-[7px] py-[2px] rounded-[4px] bg-[#111b29] text-[#e9f0f7]">
              space
            </kbd>{' '}
            /{' '}
            <kbd className="font-['Space_Grotesk'] text-[11px] border border-[#22344a] border-b-2 px-[7px] py-[2px] rounded-[4px] bg-[#111b29] text-[#e9f0f7]">
              ↑
            </kbd>{' '}
            / tap — flap (sigh)
          </li>
          <li className="text-[#7f93a8] text-[11.5px] font-['Space_Grotesk']">
            that's it. grief is simple.
          </li>
        </ul>
      </section>

      {/* 3. PORTING NOTES PANEL */}
      <section className="bg-gradient-to-b from-[#111b29] to-[#0e1622] border border-[#22344a] rounded-[6px] p-[16px_18px] transition-all duration-400 hover:border-[#2f4a6b] hover:-translate-y-[2px]">
        <h3 className="font-['Special_Elite'] font-normal text-[12.5px] tracking-[2.5px] uppercase text-[#d9a441] mb-3 flex items-center gap-[10px]">
          <span>Porting Notes</span>
          <span className="flex-1 h-[1px] bg-gradient-to-r from-[#22344a] to-transparent" />
        </h3>

        <ul className="list-none flex flex-col gap-[9px] text-[12px] text-[#7f93a8] leading-[1.55] font-['Space_Grotesk']">
          <li>
            <b className="text-[#c9d6e2]">Your sad videos:</b> put them on a{' '}
            <code className="font-mono text-[11px] text-[#96b6d6] bg-[rgba(150,182,214,0.08)] px-1.5 py-0.5 rounded">
              &lt;video&gt;
            </code>{' '}
            behind the canvas and lower the sky opacity — the rain, grain and subtitles sit right on top of your clips.
          </li>
          <li>
            <b className="text-[#c9d6e2]">Modular:</b> every universe is one small object (gravity, speed, rain, desat). adding yours is ~5 lines.
          </li>
          <li>
            <b className="text-[#c9d6e2]">Steal freely:</b> take one idea, take all of them. the tears are yours.
          </li>
        </ul>
      </section>

    </aside>
  )
}

