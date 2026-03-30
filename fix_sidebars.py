import os
import re
import glob

files = glob.glob('app/courses/[id]/**/*.tsx', recursive=True)

sidebar_pattern = re.compile(r'<aside className="fixed left-0 top-0 h-screen w-64.*?</aside>', re.DOTALL)
footer_pattern = re.compile(r'<footer className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5.*?</footer.*?>', re.DOTALL)

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to correctly handle the active link in the sidebar for each page...
    # Actually, it's easier to just do it manually with SearchReplace, since there are only 7 files and the active state differs.
