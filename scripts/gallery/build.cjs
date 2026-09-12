#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '../..');
const RULES = {
  'work': ['work', '작업사진'],
  '작업사진': ['work', '작업사진'], '내설치사례': ['work', '작업사진'], '최근설치': ['work', '작업사진'],
  '파운데이션': ['bed', '파운데이션'], '투매트리스': ['bed', '투매트리스'], '투매트리스프레임': ['bed', '투매트리스'],
  '수납': ['bed', '수납프레임'], '수납프레임': ['bed', '수납프레임'], '단매트리스': ['bed', '단매트리스'],
  '단매트리스프레임': ['bed', '단매트리스'], '마이프레임': ['bed', '마이프레임'],
  '프레임': ['bed', '프레임'], '프레임별': ['bed', '프레임'], '침대': ['bed', '프레임'],
  '매트리스세트': ['bed', '매트리스 세트'], '매트리스': ['bed', '매트리스 세트'],
  '청정기': ['air', '공기청정기'], '공기청정기': ['air', '공기청정기'],
  '힐링': ['healing', '힐링'], '안마의자': ['healing', '안마의자'], '안마베드': ['healing', '안마베드'],
  '정수기': ['water', '정수기'], '패밀리': [null, '패밀리'], '가드': [null, '가드'],
  '가드설치': [null, '가드'], '2대설치': [null, '2대 설치'],
  '가드참고': ['bed', '가드 참고'], '패밀리참고': ['bed', '패밀리 참고']
};
const PRIORITY = { '파운데이션': 10, '투매트리스': 20, '수납프레임': 30, '단매트리스': 40, '마이프레임': 50, '프레임': 55, '매트리스 세트': 60 };
const normalize = value => value.normalize('NFC').trim();
const key = value => normalize(value).replace(/\s+/g, '').toLowerCase();
const COLORS = { '오트밀베이지': '오트밀 베이지', '차콜그레이': '차콜 그레이', '스노우화이트': '스노우 화이트', '네츄럴오크': '내추럴 오크', '내츄럴오크': '내추럴 오크' };

function classify(relativeFile) {
  const folders = relativeFile.split(/[\\/]/).slice(0, -1).map(normalize);
  const tags = new Set();
  const labels = [];
  let section = null, category = null;
  for (const folder of folders) {
    const pieces = folder.split('+').map(normalize).filter(Boolean);
    for (const piece of pieces) {
      const rule = RULES[key(piece)];
      if (!rule) { labels.push(piece); continue; }
      tags.add(rule[1]);
      if (rule[0] && rule[0] !== 'work') { section = rule[0]; category = rule[1]; }
    }
  }
  if (!section) section = tags.has('작업사진') || folders.length === 0 ? 'work' : 'bed';
  if (section === 'work') tags.add('작업사진');
  category = category || (section === 'work' ? '작업사진' : '프레임');
  const model = labels[0] || (section === 'work' ? '설치 작업' : category);
  const rawColor = section === 'bed' && category === '매트리스 세트' ? '' : labels[1] || '';
  const color = COLORS[key(rawColor)] || rawColor;
  let priority=PRIORITY[category] || 100;
  if(section==='air')priority=model.includes('스퀘어핏')?(model.includes('11평')?10:20):30;
  const referenceKind=category==='가드 참고'?'guard':category==='패밀리 참고'?'family':'';
  const referenceOnly=!!referenceKind;
  if(referenceKind==='family')priority=12;
  if(referenceOnly)tags.add(referenceKind==='guard'?'가드':'패밀리');
  return { section, category, model, color, tags: [...tags], own: tags.has('작업사진'), priority, referenceOnly, referenceKind };
}

async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }
async function walk(dir, root = dir) {
  if (!await exists(dir)) return [];
  let result = [];
  for (const item of (await fs.readdir(dir, { withFileTypes: true })).sort((a,b)=>a.name.localeCompare(b.name,'ko',{numeric:true}))) {
    if (item.name.startsWith('.') || item.isSymbolicLink()) continue;
    if (item.isDirectory() && ['_web','_thumbs','_보관'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...await walk(full, root));
    else if (/\.(jpe?g|png|webp|avif|tiff?|gif)$/i.test(item.name)) result.push({ full, relative: path.relative(root, full) });
    else if (/\.(hei[cf])$/i.test(item.name)) throw new Error(`HEIC는 JPG로 변환 후 추가해주세요: ${path.relative(root,full)}`);
  }
  return result;
}

function addedAt(root, file, fallback) {
  try {
    const value = execFileSync('git', ['log','--diff-filter=A','--format=%aI','-1','--',path.relative(root,file)], {cwd:root,stdio:['ignore','pipe','ignore'],encoding:'utf8'}).trim();
    if (value && Number.isFinite(Date.parse(value))) return value;
  } catch {}
  return fallback;
}

async function build(root = ROOT) {
  const source = path.join(root, 'img/gallery');
  const web = path.join(source, '_web');
  const thumb = path.join(source, '_thumbs');
  await fs.mkdir(web,{recursive:true});
  await fs.mkdir(thumb,{recursive:true});
  const files = await walk(source);
  // Earlier gallery versions used eleven loose root-level photos. Never move or delete them.
  for (const name of [...Array.from({length:6},(_,i)=>`pade${i+1}`),...Array.from({length:5},(_,i)=>`saje${i+1}`)]) {
    for (const ext of ['jpg','jpeg','png','JPG','JPEG','PNG']) {
      const full = path.join(root, `${name}.${ext}`);
      if (await exists(full)) files.push({full,relative:`작업사진/${name}.${ext}`});
    }
  }
  const unique = new Map();
  for (const file of files) {
    const bytes = await fs.readFile(file.full);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0,24);
    const metadata = classify(file.relative);
    const info = await sharp(bytes,{limitInputPixels:100000000,failOn:'error'}).metadata();
    if (info.pages > 1) console.warn(`첫 프레임만 사용: ${file.relative}`);
    const stat = await fs.stat(file.full);
    const date = addedAt(root,file.full,stat.mtime.toISOString());
    if (unique.has(hash)) {
      const old = unique.get(hash);
      old.tags = [...new Set([...old.tags,...metadata.tags])];
      old.own = old.own || metadata.own;
      if (metadata.referenceOnly || (old.section === 'work' && metadata.section !== 'work' && !old.referenceOnly)) Object.assign(old,{section:metadata.section,category:metadata.category,model:metadata.model,color:metadata.color,priority:metadata.priority,referenceOnly:metadata.referenceOnly,referenceKind:metadata.referenceKind});
      if (date > old.addedAt) old.addedAt = date;
      continue;
    }
    const viewPath = path.join(web,`${hash}.webp`);
    const thumbPath = path.join(thumb,`${hash}.webp`);
    const viewResult = await sharp(bytes).rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:84,effort:4}).toFile(viewPath);
    await sharp(bytes).rotate().resize({width:560,height:700,fit:'inside',withoutEnlargement:true}).webp({quality:78,effort:4}).toFile(thumbPath);
    unique.set(hash,{
      id:hash,...metadata,addedAt:date,order:unique.size,
      src:`img/gallery/_web/${hash}.webp`,thumb:`img/gallery/_thumbs/${hash}.webp`,
      width:viewResult.width,height:viewResult.height,bytes:viewResult.size
    });
  }
  const photos = [...unique.values()].sort((a,b)=> a.priority-b.priority || a.model.localeCompare(b.model,'ko',{numeric:true}) || a.order-b.order);
  const data = {version:1,generatedAt:new Date().toISOString(),photos};
  const serialized = JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  // Commit the list only after all selected images have been decoded and written successfully.
  await fs.writeFile(path.join(root,'gallery-data.js'),`/* 자동 생성: 사진은 img/gallery 폴더에 추가하세요. */\nwindow.COWAY_GALLERY_DATA=${serialized};\n`);
  // Remove only obsolete generated WebP cache files, never source photos or user folders.
  const keep = new Set(photos.map(p=>`${p.id}.webp`));
  for(const dir of [web,thumb]) for(const name of await fs.readdir(dir)) {
    if (/^[a-f0-9]{24}\.webp$/.test(name) && !keep.has(name)) await fs.unlink(path.join(dir,name));
  }
  console.log(`갤러리 생성 완료: 입력 ${files.length}장 → 중복 병합 후 ${photos.length}장`);
  return data;
}

module.exports = { classify, build, walk };
if (require.main === module) build(process.argv[2] ? path.resolve(process.argv[2]) : ROOT).catch(error=>{console.error(error.message);process.exitCode=1;});
