import re

games_data = {
    'NumberHunt': {
        'file': 'src/games/NumberHunt/index.tsx',
        'emoji': '🎯',
        'shape': 'circle',
        'color': '#FF5757',
        'local_label': 'Single Player',
        'local_desc': 'Find the numbers on your own',
        'multi_label': 'Online Multiplayer',
        'multi_desc': 'Race against your friends'
    },
    'FindTheTwins': {
        'file': 'src/games/FindTheTwins/index.tsx',
        'emoji': '👯‍♀️',
        'shape': 'blob',
        'color': '#5CE1E6',
        'local_label': 'Local Play',
        'local_desc': 'Play solo on this device',
        'multi_label': 'Online Multiplayer',
        'multi_desc': 'Race against a friend online'
    },
    'MemoryPairs': {
        'file': 'src/games/MemoryPairs/index.tsx',
        'emoji': '🧠',
        'shape': 'square',
        'color': '#C1FF72',
        'local_label': 'Local Play',
        'local_desc': 'Play solo or pass & play',
        'multi_label': 'Online Multiplayer',
        'multi_desc': 'Race against a friend online'
    },
    'SecretNumber': {
        'file': 'src/games/SecretNumber/index.tsx',
        'emoji': '🤫',
        'shape': 'square',
        'color': '#FF914D',
        'local_label': 'Single Player',
        'local_desc': 'Play solo against the app',
        'multi_label': 'Online Multiplayer',
        'multi_desc': 'Play with a friend online'
    },
    'CrackTheCode': {
        'file': 'src/games/CrackTheCode/index.tsx',
        'emoji': '🔐',
        'shape': 'star',
        'color': '#FF5757',
        'local_label': 'Local Play',
        'local_desc': 'Play solo on this device',
        'multi_label': 'Online Multiplayer',
        'multi_desc': 'Race to crack the code first'
    }
}

for game_name, data in games_data.items():
    with open(data['file'], 'r') as f:
        content = f.read()

    # Fix header Illustration
    content = re.sub(
        r'<Illustration emoji="[^"]+" shape="[^"]+" color="#[^"]+" className="scale-\[0\.5\] -ml-6 -mt-6" />',
        f'<Illustration emoji="{data["emoji"]}" shape="{data["shape"]}" color="{data["color"]}" className="scale-[0.5] -ml-6 -mt-6" />',
        content
    )

    # Fix LOCAL_... and MULTI_... subtexts
    content = re.sub(
        r'<div className="text-sm text-slate-500 font-medium mt-1">LOCAL_[^<]+</div>',
        f'<div className="text-sm text-slate-500 font-medium mt-1">{data["local_desc"]}</div>',
        content
    )
    content = re.sub(
        r'<div className="text-sm text-slate-500 font-medium mt-1">MULTI_[^<]+</div>',
        f'<div className="text-sm text-slate-500 font-medium mt-1">{data["multi_desc"]}</div>',
        content
    )
    
    # Fix the actual labels if they differ
    content = re.sub(
        r'<div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Single Player</div>',
        f'<div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">{data["local_label"]}</div>',
        content
    )
    content = re.sub(
        r'<div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Local Play</div>',
        f'<div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">{data["local_label"]}</div>',
        content
    )

    # And for multi
    content = re.sub(
        r'<div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Multiplayer</div>',
        f'<div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">{data["multi_label"]}</div>',
        content
    )

    with open(data['file'], 'w') as f:
        f.write(content)

# For WhatsMissing (No multi mode, just fix header)
with open('src/games/WhatsMissing/index.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'<Illustration emoji="[^"]+" shape="[^"]+" color="#[^"]+" className="scale-\[0\.5\] -ml-6 -mt-6" />',
    f'<Illustration emoji="🕵️" shape="blob" color="#FFDE59" className="scale-[0.5] -ml-6 -mt-6" />',
    content
)

with open('src/games/WhatsMissing/index.tsx', 'w') as f:
    f.write(content)

print("Done fixing games.")
