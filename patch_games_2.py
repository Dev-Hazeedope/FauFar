import re
import os

# FindTheTwins
with open('src/games/FindTheTwins/index.tsx', 'r') as f:
    content = f.read()
old_select = re.search(r"if \(mode === 'SELECT'\) \{.*?return \(\s*<div className=\"game-screen.*?</HowToPlayModal>\s*<header.*?</header>\s*<div.*?Multiplayer.*?</button>\s*</div>\s*</div>\s*\);\s*\}", content, re.DOTALL)
if old_select:
    new_select = """if (mode === 'SELECT') {
    return (
      <div className="game-screen items-center justify-center relative">
        <HowToPlayModal 
          isOpen={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          title="Find the Twins"
          instructions={[
            "Scan the board to find the one pair of identical icons.",
            "Tap the first icon, then tap its match to win.",
            "In multiplayer, race against your friends to find the twins first!"
          ]}
        />
        <div className="w-full max-w-md game-panel">
          <div className="flex justify-between items-start mb-6">
            <Illustration emoji="👯" shape="circle" color="#FFDE59" className="scale-[0.5] -ml-6 -mt-6" />
            <div className="flex gap-2">
              <button onClick={() => setShowHowToPlay(true)} className="game-avatar text-white !bg-[#5CE1E6] hover:!bg-[#4bd8dd] cursor-pointer transition-transform active:scale-95">
                <Info className="w-6 h-6" />
              </button>
              <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer transition-transform active:scale-95">
                <Home className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-2">Find the Twins</h1>
          <p className="text-slate-500 font-medium mb-8 text-center leading-relaxed">Find the matching pair among the distractions.</p>

          <div className="space-y-4">
            <button 
              onClick={() => setMode('SINGLE')}
              className="w-full p-6 game-card bg-white p-6 flex items-center gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🎮" shape="square" color="#5CE1E6" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Local Play</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Play solo on this device</div>
              </div>
            </button>
            <button 
              onClick={() => setMode('MULTI')}
              className="w-full p-6 game-card bg-white p-6 flex items-center gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🌍" shape="blob" color="#C1FF72" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Online Multiplayer</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Race against a friend online</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }"""
    content = content.replace(old_select.group(0), new_select)
    with open('src/games/FindTheTwins/index.tsx', 'w') as f:
        f.write(content)

# MemoryPairs
with open('src/games/MemoryPairs/index.tsx', 'r') as f:
    content = f.read()
old_select = re.search(r"if \(mode === 'SELECT'\) \{.*?return \(\s*<div className=\"game-screen.*?</HowToPlayModal>\s*<header.*?</header>\s*<div.*?Multiplayer.*?</button>\s*</div>\s*</div>\s*\);\s*\}", content, re.DOTALL)
if old_select:
    new_select = """if (mode === 'SELECT') {
    return (
      <div className="game-screen items-center justify-center relative">
        <HowToPlayModal 
          isOpen={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          title="Memory Pairs"
          instructions={[
            "Flip cards over to find matching pairs.",
            "Remember their positions!",
            "Match all pairs to win the game."
          ]}
        />
        <div className="w-full max-w-md game-panel">
          <div className="flex justify-between items-start mb-6">
            <Illustration emoji="🃏" shape="circle" color="#FFDE59" className="scale-[0.5] -ml-6 -mt-6" />
            <div className="flex gap-2">
              <button onClick={() => setShowHowToPlay(true)} className="game-avatar text-white !bg-[#5CE1E6] hover:!bg-[#4bd8dd] cursor-pointer transition-transform active:scale-95">
                <Info className="w-6 h-6" />
              </button>
              <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer transition-transform active:scale-95">
                <Home className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-2">Memory Pairs</h1>
          <p className="text-slate-500 font-medium mb-8 text-center leading-relaxed">Test your memory by matching pairs of cards.</p>

          <div className="space-y-4">
            <button 
              onClick={() => setMode('SINGLE')}
              className="w-full p-6 game-card bg-white p-6 flex items-center gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🎮" shape="square" color="#5CE1E6" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Local Play</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Play solo on this device</div>
              </div>
            </button>
            <button 
              onClick={() => setMode('MULTI')}
              className="w-full p-6 game-card bg-white p-6 flex items-center gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🌍" shape="blob" color="#C1FF72" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Online Multiplayer</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Race against a friend online</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }"""
    content = content.replace(old_select.group(0), new_select)
    with open('src/games/MemoryPairs/index.tsx', 'w') as f:
        f.write(content)

