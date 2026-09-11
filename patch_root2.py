import re

with open('src/index.css', 'r') as f:
    content = f.read()

root_css = """@layer base {
  :root {
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
  body {"""

content = re.sub(r'@layer base \{\s*body \{', root_css, content)

with open('src/index.css', 'w') as f:
    f.write(content)
