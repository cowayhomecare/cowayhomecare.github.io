'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const sharp=require('sharp');
const {classify,build}=require('./build.cjs');

test('Korean folder names, arbitrary filenames and combined tags',()=>{
 const p=classify('작업사진+파운데이션+패밀리+가드/모던 파운데이션/오트밀베이지/카톡 2026 #1.JPG');
 assert.equal(p.own,true);assert.equal(p.section,'bed');assert.equal(p.category,'파운데이션');assert.equal(p.model,'모던 파운데이션');assert.equal(p.color,'오트밀 베이지');assert.deepEqual(p.tags,['작업사진','파운데이션','패밀리','가드']);
 assert.equal(classify('pade1.jpg').section,'work');
 assert.equal(classify('작업사진/아무이름.png').own,true);
 assert.equal(classify('Work/pade1.jpg').own,true);
 assert.equal(classify('Work+파운데이션+패밀리/모던 파운데이션/아이보리/새사진.jpg').section,'bed');
 assert.equal(classify('투매트리스/루나/피치 핑크/1.png').category,'투매트리스');
 assert.equal(classify('매트리스세트/모디/중간(Medium)/1.jpg').color,'');
 assert.equal(classify('청정기/스퀘어핏 11평형/퓨어 화이트/1.jpg').section,'air');
 assert.equal(classify('힐링/페블체어2/헤이지 블루/1.jpg').color,'헤이지 블루');
 const guard=classify('가드참고+패밀리/가드 설치 참고/아무 사진.jpg');
 assert.equal(guard.referenceOnly,true);assert.equal(guard.referenceKind,'guard');assert.equal(guard.own,false);assert(guard.tags.includes('가드'));assert(guard.tags.includes('패밀리'));
 const family=classify('패밀리참고/파운데이션 2대 설치/가족 침대.jpg');
 assert.equal(family.referenceOnly,true);assert.equal(family.referenceKind,'family');assert(family.tags.includes('패밀리'));assert.equal(family.color,'');assert(family.priority<20);
 assert.equal(classify('투매트리스/코지 프레임/아이보리/아무 이름.jpg').referenceOnly,false);
});

test('Build merges duplicate content, preserves source images, strips EXIF and supports moves/deletions',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'coway-gallery-test-'));
 const first=path.join(root,'img/gallery/파운데이션/테스트/아이보리');
 const second=path.join(root,'img/gallery/작업사진+패밀리');
 await fs.mkdir(first,{recursive:true});await fs.mkdir(second,{recursive:true});
 const bytes=await sharp({create:{width:2200,height:1400,channels:3,background:'#aa8855'}}).withExif({IFD0:{Artist:'private',Copyright:'test'}}).jpeg().toBuffer();
 await fs.writeFile(path.join(first,'자유 #파일.JPG'),bytes);await fs.writeFile(path.join(second,'같은사진.jpg'),bytes);
 const a=await build(root);assert.equal(a.photos.length,1);assert.equal(a.photos[0].own,true);assert.equal(a.photos[0].model,'테스트');assert(a.photos[0].tags.includes('패밀리'));assert(a.photos[0].width<=1800);assert(a.photos[0].height<=1800);
 const meta=await sharp(path.join(root,a.photos[0].src)).metadata();assert.equal(meta.exif,undefined);assert.equal(meta.xmp,undefined);
 assert.equal(await fs.readFile(path.join(first,'자유 #파일.JPG'),'hex'),bytes.toString('hex'));
 await fs.rename(path.join(first,'자유 #파일.JPG'),path.join(first,'이름변경.jpg'));
 const b=await build(root);assert.equal(b.photos[0].id,a.photos[0].id);
 await fs.unlink(path.join(first,'이름변경.jpg'));await fs.unlink(path.join(second,'같은사진.jpg'));
 const c=await build(root);assert.equal(c.photos.length,0);assert.deepEqual(await fs.readdir(path.join(root,'img/gallery/_web')),[]);
 // Preserve the last valid manifest when a new input cannot be read.
 const old=await fs.readFile(path.join(root,'gallery-data.js'),'utf8');await fs.writeFile(path.join(first,'깨진사진.jpg'),'invalid');
 await assert.rejects(build(root));assert.equal(await fs.readFile(path.join(root,'gallery-data.js'),'utf8'),old);
});

test('Legacy loose files become work photos; unsupported HEIC reports an actionable error',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'coway-gallery-legacy-'));
 const b=await sharp({create:{width:20,height:30,channels:3,background:'#000'}}).jpeg().toBuffer();await fs.writeFile(path.join(root,'pade1.jpg'),b);
 const data=await build(root);assert.equal(data.photos[0].own,true);assert.equal(data.photos.length,1);
 await fs.writeFile(path.join(root,'img/gallery/phone.heic'),'test');await assert.rejects(build(root),/JPG/);
});

test('Reference-only status survives duplicates and reserved folders remain private to the builder',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'coway-gallery-reference-'));
 for(const folder of ['파운데이션/확인 전 모델','가드참고/가드 설치 참고','_보관','_thumbs'])await fs.mkdir(path.join(root,'img/gallery',folder),{recursive:true});
 const bytes=await sharp({create:{width:32,height:28,channels:3,background:'#3156ab'}}).jpeg().toBuffer();
 for(const folder of ['파운데이션/확인 전 모델','가드참고/가드 설치 참고'])await fs.writeFile(path.join(root,'img/gallery',folder,'같은 파일.jpg'),bytes);
 await fs.writeFile(path.join(root,'img/gallery/_보관','미반영.jpg'),'invalid non-image');
 const result=await build(root);assert.equal(result.photos.length,1);assert.equal(result.photos[0].referenceOnly,true);assert.equal(result.photos[0].model,'가드 설치 참고');
});
