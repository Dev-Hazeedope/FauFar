import re

# Update layout.ts colors
with open('src/games/NumberHunt/layout.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"const colors = \['text-\[\#FF5757\]', 'text-\[\#5CE1E6\]', 'text-\[\#C1FF72\]', 'text-slate-900', 'text-\[\#FFDE59\]', 'text-\[\#FF914D\]'\];",
    "const colors = ['#FF5757', '#5CE1E6', '#9ddb4e', '#0f172a', '#e8c946', '#FF914D'];",
    content
)

with open('src/games/NumberHunt/layout.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Update Board.tsx to use inline color
with open('src/games/NumberHunt/Board.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'isFound \? "text-slate-300 pointer-events-none opacity-50" : cn\(item\.colorClass, "active:scale-95 transition-transform"\),',
    'isFound ? "text-slate-300 pointer-events-none opacity-50" : "active:scale-95 transition-transform",',
    content
)

content = re.sub(
    r'fontSize: `\$\{item\.fontSize\}px`,',
    'fontSize: `${item.fontSize}px`,\n              color: isFound ? undefined : item.colorClass,',
    content
)

with open('src/games/NumberHunt/Board.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

