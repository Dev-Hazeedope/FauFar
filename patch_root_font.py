import re

with open('src/index.css', 'r') as f:
    content = f.read()

root_css = """@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Nunito:wght@400;700;900&display=swap');

@layer base {
  :root {
    /* Dynamic font-size scaling strategy for the entire application */
    font-size: 14px;
  }

  @media (min-width: 380px) {
    :root {
      font-size: 15px;
    }
  }

  @media (min-width: 640px) {
    :root {
      font-size: 16px;
    }
  }

  body {
"""

content = content.replace('@import "tailwindcss";\n@import url(\'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Nunito:wght@400;700;900&display=swap\');\n\n@layer base {\n  body {', root_css)

content = content.replace("font-size: 2.25rem;", "font-size: clamp(1.75rem, 6vw, 2.25rem);")
content = content.replace("font-size: 3rem;", "font-size: clamp(2.5rem, 5vw, 3rem);")
content = content.replace("font-size: 1.5rem;", "font-size: clamp(1.25rem, 5vw, 1.5rem);")

with open('src/index.css', 'w') as f:
    f.write(content)

