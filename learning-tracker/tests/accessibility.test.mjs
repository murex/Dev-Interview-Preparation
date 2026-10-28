import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../dist/styles.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const colors=Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(m=>[m[1],m[2]]));
function luminance(hex){return hex.slice(1).match(/../g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);}
function ratio(fg,bg){const values=[luminance(fg),luminance(bg)].sort((a,b)=>b-a);return (values[0]+.05)/(values[1]+.05);}

test('Text palettes meet WCAG AA 4.5:1 normal-text contrast',()=>{
  const pairs=[['ink','#ffffff'],['muted','#ffffff'],['muted','sidebar'],['muted','rose'],['muted','peach'],['#ffffff','primary'],['active-text','active-bg'],['status-todo-text','status-todo-bg'],['status-active-text','status-active-bg'],['status-done-text','status-done-bg'],['high-text','high-bg'],['medium-text','medium-bg'],['low-text','low-bg'],['primary','#f7f5fa']];
  for(const [foreground,background] of pairs){const value=ratio(colors[foreground]||foreground,colors[background]||background);assert.ok(value>=4.5,`${foreground} on ${background}: ${value.toFixed(2)}:1`);}
});
test('Essential control outlines and progress fill meet 3:1 contrast',()=>{
  for(const background of ['#ffffff',colors['status-todo-bg'],colors['status-active-bg'],colors['status-done-bg']])assert.ok(ratio(colors['control-border'],background)>=3,`Control border on ${background}`);
  assert.ok(ratio(colors.primary,'#e5dcd9')>=3);
});
test('Typography uses scalable units and no labels smaller than 14px at the default root size',()=>{
  for(const match of css.matchAll(/font-size:\s*([.\d]+)(rem|px)/g)){const pixels=Number(match[1])*(match[2]==='rem'?16:1);assert.ok(pixels>=14,`Font size ${match[0]}`);assert.equal(match[2],'rem','Font sizes must scale with the root preference.');}
  assert.match(css,/font:\s*1rem\/1\.6/);
  assert.match(css,/button, input, select, summary, \.checkbox-label, \.hide-completed\s*\{\s*min-height:\s*2\.75rem/);
  assert.match(css,/outline: 3px solid/);
});
test('Zoom and keyboard affordances are present without forced horizontal boards',()=>{
  assert.ok(!/maximum-scale|user-scalable=no/.test(html));
  assert.match(html,/class="skip-link" href="#main"/);
  assert.match(css,/\.board-columns, \.board-columns\.categories \{ grid-template-columns: 1fr;/);
  assert.ok(!/overflow-x:\s*(?:auto|scroll)|white-space:\s*nowrap/.test(css.replace(/\.sr-only \{[^}]+\}/g,'')));
  assert.match(html,/aria-pressed="true"/);
});
