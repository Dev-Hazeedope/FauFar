import re
import os

# NumberHunt
with open('src/games/NumberHunt/index.tsx', 'r') as f:
    content = f.read()
old_select = re.search(r"if \(mode === 'SELECT'\) \{.*?return \(\s*<div className=\"game-screen.*?</HowToPlayModal>\s*<header.*?</header>\s*<div.*?Multiplayer.*?</button>\s*</div>\s*</div>\s*\);\s*\}", content, re.DOTALL)
if old_select:
    new_select = """if (mode === 'SELECT') {
    return (
      <div className="game-screen items-center justify-center relative">
        <HowToPlayModal 
          isOpen={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          title="Number Hunt"
          instructions={[
            "Find and tap the numbers in sequential order.",
            "In single-player, race against the clock or play casually.",
            "In multiplayer, race against friends to find the most numbers before the time runs out.",
            "You get points for every correct number you find.",
            "Look carefully, the numbers are scattered all over the board!"
          ]}
        />
        <div className="w-full max-w-md game-panel">
          <div className="flex justify-between items-start mb-6">
            <Illustration emoji="🔢" shape="circle" color="#FFDE59" className="scale-[0.5] -ml-6 -mt-6" />
            <div className="flex gap-2">
              <button onClick={() => setShowHowToPlay(true)} className="game-avatar text-white !bg-[#5CE1E6] hover:!bg-[#4bd8dd] cursor-pointer transition-transform active:scale-95">
                <Info className="w-6 h-6" />
              </button>
              <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer transition-transform active:scale-95">
                <Home className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-2">Number Hunt</h1>
          <p className="text-slate-500 font-medium mb-8 text-center leading-relaxed">Find and tap numbers in order as fast as you can.</p>

          <div className="space-y-4">
            <button 
              onClick={() => setMode('SINGLE')}
              className="w-full p-6 game-card bg-white p-6 flex items-center gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🎮" shape="square" color="#5CE1E6" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Single Player</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Find the numbers on your own</div>
              </div>
            </button>
            <button 
              onClick={() => { setMode('MULTI'); setState('SETUP'); }}
              className="w-full p-6 game-card bg-white p-6 flex items-center gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🌍" shape="blob" color="#C1FF72" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Multiplayer</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Race against your friends</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }"""
    content = content.replace(old_select.group(0), new_select)
    with open('src/games/NumberHunt/index.tsx', 'w') as f:
        f.write(content)

# CrackTheCode
with open('src/games/CrackTheCode/index.tsx', 'r') as f:
    content = f.read()
old_select = re.search(r"if \(selectMode === 'SELECT'\) \{.*?return \(\s*<div className=\"game-screen.*?</HowToPlayModal>\s*<header.*?</header>\s*<div.*?Online Multiplayer.*?</button>\s*</div>\s*</div>\s*\);\s*\}", content, re.DOTALL)
if old_select:
    new_select = """if (selectMode === 'SELECT') {
    return (
      <div className="game-screen items-center justify-center relative">
        <HowToPlayModal 
          isOpen={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          title="Crack the Code"
          instructions={[
            "The app hides 4 distinct numbers (1-8) in a secret order.",
            "You have 4 slots to fill with your guesses.",
            "Submit your guess to receive a clue:",
            "'Exact': The number is correct and in the right position.",
            "'Misplaced': The number is in the code but in the wrong position.",
            "Use the clues to deduce the secret code!"
          ]}
        />
        <div className="w-full max-w-md game-panel">
          <div className="flex justify-between items-start mb-6">
            <Illustration emoji="🔐" shape="circle" color="#FFDE59" className="scale-[0.5] -ml-6 -mt-6" />
            <div className="flex gap-2">
              <button onClick={() => setShowHowToPlay(true)} className="game-avatar text-white !bg-[#5CE1E6] hover:!bg-[#4bd8dd] cursor-pointer transition-transform active:scale-95">
                <Info className="w-6 h-6" />
              </button>
              <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer transition-transform active:scale-95">
                <Home className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-2">Crack the Code</h1>
          <p className="text-slate-500 font-medium mb-8 text-center leading-relaxed">Guess the 4-digit code using logic and clues.</p>

          <div className="space-y-4">
            <button 
              onClick={() => setSelectMode('LOCAL')}
              className="w-full p-6 game-card bg-white p-6 flex items-center gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🎮" shape="square" color="#5CE1E6" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Local Play</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Play solo on this device</div>
              </div>
            </button>
            <button 
              onClick={() => setSelectMode('MULTI')}
              className="w-full p-6 game-card bg-white p-6 flex items-center gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🌍" shape="blob" color="#C1FF72" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Online Multiplayer</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Race to crack the code first</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }"""
    content = content.replace(old_select.group(0), new_select)
    with open('src/games/CrackTheCode/index.tsx', 'w') as f:
        f.write(content)

