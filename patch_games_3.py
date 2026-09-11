import re
import os

# WhatsMissing
with open('src/games/WhatsMissing/index.tsx', 'r') as f:
    content = f.read()
old_select = re.search(r"if \(phase === 'setup'\) \{.*?return \(\s*<div className=\"game-screen.*?</button>\s*</div>\s*</div>\s*</div>\s*\);\s*\}", content, re.DOTALL)
if old_select:
    new_select = """if (phase === 'setup') {
    return (
      <div className="game-screen items-center justify-center relative">
        <div className="w-full max-w-md game-panel">
          <div className="flex justify-between items-start mb-6">
            <Illustration emoji="👁️" shape="circle" color="#FFDE59" className="scale-[0.5] -ml-6 -mt-6" />
            <div className="flex gap-2">
              <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer transition-transform active:scale-95">
                <Home className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-2">What's Missing?</h1>
          <p className="text-slate-500 font-medium mb-8 text-center leading-relaxed">Study the objects. After they hide, identify what disappeared.</p>
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
          
          <div className="space-y-4 mt-6">
            <button onClick={() => startStudy(12, 2)} className="w-full p-4 game-button-secondary text-sm">12 Objects (2 Missing)</button>
            <button onClick={() => startStudy(16, 3)} className="w-full p-4 game-button-secondary text-sm">16 Objects (3 Missing)</button>
            <button onClick={() => startStudy(20, 4)} className="w-full p-4 game-button-secondary text-sm">20 Objects (4 Missing)</button>
          </div>
        </div>
      </div>
    );
  }"""
    content = content.replace(old_select.group(0), new_select)
    with open('src/games/WhatsMissing/index.tsx', 'w') as f:
        f.write(content)

