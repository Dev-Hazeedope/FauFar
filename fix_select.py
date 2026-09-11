import re
import os

def fix_game(file_path, mode_var, local_label, local_desc, multi_label, multi_desc, title, desc, instructions, emoji):
    with open(file_path, 'r') as f:
        content = f.read()
    
    pattern2 = r"if \(" + mode_var + r" === 'SELECT'\) \{[\s\S]*?</div>\s*</div>\s*\);\s*\}"

    match = re.search(pattern2, content)
    if not match:
        print(f"Could not find select block in {file_path}")
        return

    replacement = """if (MODE_VAR === 'SELECT') {
    return (
      <div className="game-screen items-center justify-center relative">
        <HowToPlayModal 
          isOpen={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          title="TITLE"
          instructions={[
            INSTRUCTIONS
          ]}
        />
        <div className="w-full max-w-md game-panel">
          <div className="flex justify-between items-start mb-6">
            <Illustration emoji="EMOJI" shape="circle" color="#FFDE59" className="scale-[0.5] -ml-6 -mt-6" />
            <div className="flex gap-2">
              <button onClick={() => setShowHowToPlay(true)} className="game-avatar text-white !bg-[#5CE1E6] hover:!bg-[#4bd8dd] cursor-pointer transition-transform active:scale-95">
                <Info className="w-6 h-6" />
              </button>
              <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer transition-transform active:scale-95">
                <Home className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-2">TITLE</h1>
          <p className="text-slate-500 font-medium mb-8 text-center leading-relaxed">DESC</p>

          <div className="space-y-4">
            <button 
              onClick={() => setMODE_SET('LOCAL_MODE')}
              className="w-full p-4 sm:p-6 game-card bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🎮" shape="square" color="#5CE1E6" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">LOCAL_LABEL</div>
                <div className="text-sm text-slate-500 font-medium mt-1">LOCAL_DESC</div>
              </div>
            </button>
            <button 
              onClick={() => { setMODE_SET('MULTI'); MULTI_STATE_RESET }}
              className="w-full p-4 sm:p-6 game-card bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🌍" shape="blob" color="#C1FF72" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">MULTI_LABEL</div>
                <div className="text-sm text-slate-500 font-medium mt-1">MULTI_DESC</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }"""
    
    local_mode_str = 'SINGLE' if mode_var == 'mode' else 'LOCAL'
    mode_set = mode_var[0].upper() + mode_var[1:]

    multi_state_reset = "setState('SETUP');" if file_path == 'src/games/NumberHunt/index.tsx' else ""
    
    replacement = replacement.replace('MODE_VAR', mode_var)
    replacement = replacement.replace('MODE_SET', mode_set)
    replacement = replacement.replace('TITLE', title)
    replacement = replacement.replace('INSTRUCTIONS', instructions)
    replacement = replacement.replace('EMOJI', emoji)
    replacement = replacement.replace('DESC', desc)
    replacement = replacement.replace('LOCAL_MODE', local_mode_str)
    replacement = replacement.replace('LOCAL_LABEL', local_label)
    replacement = replacement.replace('LOCAL_DESC', local_desc)
    replacement = replacement.replace('MULTI_LABEL', multi_label)
    replacement = replacement.replace('MULTI_DESC', multi_desc)
    replacement = replacement.replace('MULTI_STATE_RESET', multi_state_reset)
    
    content = content.replace(match.group(0), replacement)

    with open(file_path, 'w') as f:
        f.write(content)

fix_game(
    'src/games/CrackTheCode/index.tsx', 
    'selectMode', 
    'Local Play', 'Play solo on this device', 
    'Online Multiplayer', 'Race to crack the code first', 
    'Crack the Code', 'Guess the 4-digit code using logic and clues.', 
    '"The app hides 4 distinct numbers (1-8) in a secret order.",\n            "You have 4 slots to fill with your guesses.",\n            "Submit your guess to receive a clue:",\n            "\'Exact\': The number is correct and in the right position.",\n            "\'Misplaced\': The number is in the code but in the wrong position.",\n            "Use the clues to deduce the secret code!"', 
    '🔐'
)

fix_game(
    'src/games/NumberHunt/index.tsx', 
    'mode', 
    'Single Player', 'Find the numbers on your own', 
    'Multiplayer', 'Race against your friends', 
    'Number Hunt', 'Find and tap numbers in order as fast as you can.', 
    '"Find and tap the numbers in sequential order.",\n            "In single-player, race against the clock or play casually.",\n            "In multiplayer, race against friends to find the most numbers before the time runs out.",\n            "You get points for every correct number you find.",\n            "Look carefully, the numbers are scattered all over the board!"', 
    '🔢'
)

fix_game(
    'src/games/FindTheTwins/index.tsx', 
    'mode', 
    'Local Play', 'Play solo on this device', 
    'Online Multiplayer', 'Race against a friend online', 
    'Find the Twins', 'Find the matching pair among the distractions.', 
    '"Scan the board to find the one pair of identical icons.",\n            "Tap the first icon, then tap its match to win.",\n            "In multiplayer, race against your friends to find the twins first!"', 
    '👯'
)

fix_game(
    'src/games/MemoryPairs/index.tsx', 
    'selectMode', 
    'Local Play', 'Play solo on this device', 
    'Online Multiplayer', 'Race against a friend online', 
    'Memory Pairs', 'Test your memory by matching pairs of cards.', 
    '"Flip cards over to find matching pairs.",\n            "Remember their positions!",\n            "Match all pairs to win the game."', 
    '🃏'
)

