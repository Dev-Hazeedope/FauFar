import glob

files = glob.glob('src/games/**/MultiplayerManager.ts', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    seen_host_left = False
    
    # We only want to remove duplicates of hostLeft inside interfaces.
    # It's a quick hack, but `hostLeft?: boolean;` is very specific.
    for line in lines:
        if 'hostLeft?: boolean;' in line:
            if seen_host_left:
                continue
            seen_host_left = True
        new_lines.append(line)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

