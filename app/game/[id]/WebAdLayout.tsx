'use client'

export default function WebAdLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a1e] flex justify-center">

      {/* Left vertical banner — desktop only */}
      <div className="hidden lg:flex w-[160px] flex-shrink-0 items-start justify-center pt-20 px-2">
        <div
          id="left-skyscraper-slot"
          style={{
            width: '160px',
            height: '600px',
            background: 'rgba(99,102,241,0.08)',
            borderRadius: '8px',
            border: '1px solid rgba(99,102,241,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'sticky',
            top: '80px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.2)',
            writingMode: 'vertical-rl',
            letterSpacing: '2px',
          }}
        >
          Advertisement
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-[550px]">
        {children}
      </div>

      {/* Right vertical banner — desktop only */}
      <div className="hidden lg:flex w-[160px] flex-shrink-0 items-start justify-center pt-20 px-2">
        <div
          id="right-skyscraper-slot"
          style={{
            width: '160px',
            height: '600px',
            background: 'rgba(99,102,241,0.08)',
            borderRadius: '8px',
            border: '1px solid rgba(99,102,241,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'sticky',
            top: '80px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.2)',
            writingMode: 'vertical-rl',
            letterSpacing: '2px',
          }}
        >
          Advertisement
        </div>
      </div>

    </div>
  )
}
