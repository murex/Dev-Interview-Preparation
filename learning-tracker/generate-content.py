"""Build the track content from the repository guides. No network required."""
import re
import json
import html
from pathlib import Path

app = Path(__file__).resolve().parent
categories = [
    dict(id='basics',name='Language basics',short='Language basics',color='#9981cf',background='#f3eefb',icon='code'),
    dict(id='structures',name='Data structures',short='Data structures',color='#65a59a',background='#edf7f2',icon='layers'),
    dict(id='oop',name='Object-oriented programming',short='Object-oriented',color='#ca9a72',background='#fff3e8',icon='box'),
    dict(id='algorithms',name='Algorithms',short='Algorithms',color='#7e9bd0',background='#edf3fc',icon='route'),
    dict(id='practice',name='Practice exercises',short='Practice exercises',color='#bc8da7',background='#faeef4',icon='terminal'),
    dict(id='sql',name='SQL essentials',short='SQL essentials',color='#9ca46a',background='#f4f5e9',icon='database'),
]
tracks = {}
for track, filename in [('java','JAVA.md'),('cpp','CPP.md')]:
    source = (app.parent / filename).read_text()
    tasks = []
    for index, table in enumerate(re.findall(r'<tbody>(.*?)</tbody>', source, re.S)):
        remaining, parent = 0, ''
        for row in re.findall(r'<tr>(.*?)</tr>', table, re.S):
            cells = [(attrs,re.sub(r'^\d+\.\s*','',html.unescape(re.sub('<.*?>','',text)).strip())) for attrs,text in re.findall(r'<td([^>]*)>(.*?)</td>',row,re.S)]
            if cells and re.match(r'^[IVX]+\. ',cells[0][1]):
                cells.pop(0)
            if remaining == 0:
                attrs, parent = cells.pop(0)
                match = re.search(r'rowspan="(\d+)"',attrs)
                remaining = int(match[1]) if match else 1
            sub = cells[0][1] if cells else ''
            title = sub or parent
            priority = 'high' if index in [2,3] else 'medium'
            if any(word in title.lower() for word in ['evolution','releases','standard error','operator precedence','differences between']):
                priority = 'low'
            tasks.append(dict(id=f'{track}-{len(tasks)}',title=title,parent=parent if sub else '',category=categories[index]['id'],priority=priority,status='todo',notes='',sources=[],due='',archived=False))
            remaining -= 1
    part = source.split('### II. Sample Exercises')[1]
    section = ''
    for line in part.splitlines():
        if line.startswith('#### '): section=line[5:]
        match = re.search(r'\| \d+ \| \[(.*?)\]\((.*?)\) \| (.*?) \|',line)
        if match:
            title,url,platform=match.groups()
            tasks.append(dict(id=f'{track}-practice-{len(tasks)}',title=title,parent=section,category='practice',priority='high' if 'Medium' in section else 'medium',status='todo',notes='',sources=[dict(label=platform,url=url)],due='',archived=False))
    if track=='java':
        for title in ['SELECT, filtering & ordering','JOINs and table relationships','GROUP BY & aggregate functions','Subqueries and HAVING','Complete a timed SQL practice problem']:
            tasks.append(dict(id=f'java-sql-{len(tasks)}',title=title,parent='Supplementary SQL preparation',category='sql',priority='high',status='todo',notes='Supplementary topic based on the SQL section in the README’s Java test outline.',sources=[],due='',archived=False))
    resources=[dict(title=m[1],url=m[2],focus=m[3]) for m in re.finditer(r'\| \[(.*?)\]\((.*?)\) \| (.*?) \|',source.split('### II. Sample Exercises')[0])]
    tracks[track]=dict(tasks=tasks,resources=resources)
data=dict(categories=categories,tracks=tracks)
(app/'dist').mkdir(exist_ok=True)
(app/'dist'/'curriculum.js').write_text('export const curriculum = '+json.dumps(data,ensure_ascii=False)+';\n')
print('Generated '+', '.join(f'{len(v["tasks"])} {k} topics' for k,v in tracks.items()))
