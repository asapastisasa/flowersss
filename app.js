'use strict';
const WA = '6281234567890';
const CATS = ['Bouquet','Graduation','Birthday','Romantic','Flower Box','Hampers'];
const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=80`;
const P = [
 {id:1,name:'Blush Peony Bouquet',cat:'Bouquet',price:285000,img:'1526047932273-341f2a7631f9',best:1,desc:'Peony dan mawar pink lembut dibalut kertas cream premium.'},
 {id:2,name:'Garden Whisper',cat:'Bouquet',price:225000,img:'1455659817273-f96807779a8a',new:1,desc:'Rangkaian bunga musiman bergaya taman yang segar dan natural.'},
 {id:3,name:'Graduation Sunshine',cat:'Graduation',price:195000,img:'1508610048659-a06b669e3321',best:1,desc:'Buket cerah untuk merayakan kelulusan, lengkap dengan pita satin.'},
 {id:4,name:'Scholar Rose Bouquet',cat:'Graduation',price:245000,img:'1561181286-d3fee7d55364',new:1,desc:'Mawar elegan dengan aksen dried flower untuk hari wisuda.'},
 {id:5,name:'Sweet Birthday Bloom',cat:'Birthday',price:210000,img:'1469259943454-aa100abba6c1',best:1,desc:'Warna ceria penuh kebahagiaan untuk ulang tahun orang tersayang.'},
 {id:6,name:'Pastel Party Bouquet',cat:'Birthday',price:175000,img:'1444021465936-c6ca81d39b84',desc:'Perpaduan bunga pastel manis dengan kartu ucapan gratis.'},
 {id:7,name:'Eternal Red Roses',cat:'Romantic',price:350000,img:'1518895949257-7621c3c786d7',best:1,desc:'Sepuluh tangkai mawar merah premium, simbol cinta abadi.'},
 {id:8,name:'Love Letter Bouquet',cat:'Romantic',price:315000,img:'1494972308805-463bc619d34e',new:1,desc:'Mawar dusty rose dengan baby breath, romantis dan hangat.'},
 {id:9,name:'Rosé Flower Box',cat:'Flower Box',price:380000,img:'1525310072745-f49212b5ac6d',best:1,desc:'Flower box bundar berisi mawar segar yang tertata rapi.'},
 {id:10,name:'Petite Tulip Box',cat:'Flower Box',price:265000,img:'1520763185298-1b434c919102',new:1,desc:'Tulip segar dalam box mungil, hadiah manis yang praktis.'},
 {id:11,name:'Bloomé Gift Hampers',cat:'Hampers',price:425000,img:'1563241527-3004b7be0ffd',desc:'Bunga, cokelat, dan lilin aromaterapi dalam hampers eksklusif.'},
 {id:12,name:'Mini Joy Hampers',cat:'Hampers',price:299000,img:'1530103862676-de8c9debad1d',new:1,desc:'Hampers kecil berisi bunga dan snack manis untuk momen spesial.'}
];
const $ = s => document.querySelector(s);
const rp = n => 'Rp' + n.toLocaleString('id-ID');
const FB = 'assets/fallback.svg';
let cart = new Map(), cat = 'Semua', q = '';

function el(tag, cls, text, attrs) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function img(src, alt) {
  const i = el('img', '', undefined, {alt, loading: 'lazy', src});
  i.addEventListener('error', () => { if (!i.src.endsWith(FB)) i.src = FB; }, {once: true});
  return i;
}
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}
function save() { try { localStorage.setItem('bloome_cart', JSON.stringify([...cart])); } catch (e) {} }
function load() {
  try {
    const d = JSON.parse(localStorage.getItem('bloome_cart') || '[]');
    if (Array.isArray(d)) d.forEach(([id, n]) => {
      if (P.some(p => p.id === id) && Number.isInteger(n) && n > 0 && n < 100) cart.set(id, n);
    });
  } catch (e) { cart = new Map(); }
}

function card(p) {
  const c = el('article', 'card prod reveal');
  const ph = el('button', 'ph', undefined, {'aria-label': 'Lihat detail ' + p.name});
  ph.append(img(U(p.img), p.name));
  if (p.best) ph.append(el('span', 'tag', 'Bestseller'));
  else if (p.new) ph.append(el('span', 'tag', 'New'));
  ph.addEventListener('click', () => openModal(p));
  const b = el('div', 'pb');
  const add = el('button', 'btn', 'Add to Cart');
  add.addEventListener('click', () => addCart(p.id));
  b.append(el('small', '', p.cat), el('h3', '', p.name), el('div', 'price', rp(p.price)), add);
  c.append(ph, b);
  return c;
}
function fill(sel, list) { const g = $(sel); g.replaceChildren(...list.map(card)); observe(); }
function renderShop() {
  const list = P.filter(p => (cat === 'Semua' || p.cat === cat) && p.name.toLowerCase().includes(q));
  fill('#shopGrid', list);
  $('#empty').hidden = list.length > 0;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.textContent === cat));
}
function setCat(c) { cat = c; renderShop(); }

function openModal(p) {
  const box = $('#modalBox');
  const d = el('div', 'md');
  const add = el('button', 'btn full', 'Add to Cart');
  add.addEventListener('click', () => { addCart(p.id); closeModal(); });
  const close = el('button', 'btn ghost full', 'Tutup');
  close.addEventListener('click', closeModal);
  d.append(el('small', 'eyebrow', p.cat), el('h2', '', p.name), el('p', 'price', rp(p.price)), el('p', '', p.desc),
    el('p', '', 'Termasuk kartu ucapan gratis & kemasan premium.'), add, close);
  box.replaceChildren(img(U(p.img), p.name), d);
  $('#modal').hidden = false; $('#overlay').hidden = true;
}
function closeModal() { $('#modal').hidden = true; }

function addCart(id) { cart.set(id, Math.min(99, (cart.get(id) || 0) + 1)); renderCart(); toast('Ditambahkan ke keranjang 🌸'); }
function renderCart() {
  const box = $('#cartItems'); let total = 0, count = 0;
  const rows = [];
  cart.forEach((n, id) => {
    const p = P.find(x => x.id === id); if (!p) return;
    total += p.price * n; count += n;
    const r = el('div', 'item');
    const info = el('div'), qty = el('div', 'qty');
    const m = el('button', '', '−', {'aria-label': 'Kurangi'}), pl = el('button', '', '+', {'aria-label': 'Tambah'});
    m.addEventListener('click', () => { n > 1 ? cart.set(id, n - 1) : cart.delete(id); renderCart(); });
    pl.addEventListener('click', () => { cart.set(id, Math.min(99, n + 1)); renderCart(); });
    qty.append(m, el('span', '', String(n)), pl);
    info.append(el('b', '', p.name), el('div', 'price', rp(p.price)), qty);
    const del = el('button', 'icon-btn', '🗑', {'aria-label': 'Hapus ' + p.name});
    del.addEventListener('click', () => { cart.delete(id); renderCart(); });
    r.append(img(U(p.img), p.name), info, del);
    rows.push(r);
  });
  if (!rows.length) rows.push(el('p', 'empty', 'Keranjang masih kosong.'));
  box.replaceChildren(...rows);
  $('#cartTotal').textContent = rp(total);
  $('#cartCount').textContent = count;
  save();
}
function openCart(o) { $('#drawer').hidden = !o; $('#overlay').hidden = !o; }
function wa(text) { window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer'); }

function observe() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold: .12});
  document.querySelectorAll('.reveal:not(.in)').forEach(n => io.observe(n));
}

function init() {
  load();
  ['heroImg', 'aboutImg'].forEach(id => $('#' + id).addEventListener('error', e => { e.target.src = FB; }, {once: true}));
  $('#catGrid').replaceChildren(...CATS.map(c => {
    const b = el('button', 'cat', c);
    b.addEventListener('click', () => { setCat(c); $('#shop').scrollIntoView({behavior: 'smooth'}); });
    return b;
  }));
  $('#chips').replaceChildren(...['Semua', ...CATS].map(c => {
    const b = el('button', 'chip', c); b.addEventListener('click', () => setCat(c)); return b;
  }));
  fill('#bestGrid', P.filter(p => p.best).slice(0, 4));
  fill('#newGrid', P.filter(p => p.new).slice(0, 4));
  renderShop(); renderCart(); observe();
  $('#search').addEventListener('input', e => { q = e.target.value.trim().toLowerCase().slice(0, 60); renderShop(); });
  $('#menuBtn').addEventListener('click', e => {
    const o = $('#menu').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o);
  });
  document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', () => $('#menu').classList.remove('open')));
  $('#cartBtn').addEventListener('click', () => openCart(true));
  $('#closeCart').addEventListener('click', () => openCart(false));
  $('#overlay').addEventListener('click', () => openCart(false));
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); openCart(false); } });
  $('#clearCart').addEventListener('click', () => { cart.clear(); renderCart(); toast('Keranjang dikosongkan'); });
  $('#checkout').addEventListener('click', () => {
    if (!cart.size) return toast('Keranjang masih kosong');
    let t = 0, lines = [];
    cart.forEach((n, id) => { const p = P.find(x => x.id === id); t += p.price * n; lines.push(`- ${p.name} x${n} = ${rp(p.price * n)}`); });
    wa(`Halo Bloomé Flower Studio, saya ingin memesan:\n${lines.join('\n')}\n\nTotal: ${rp(t)}\n\nNama:\nAlamat kirim:\nTanggal & jam:\nKartu ucapan:`);
  });
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const n = $('#cName').value.trim(), m = $('#cMsg').value.trim();
    if (n.length < 2 || m.length < 5) return toast('Mohon isi nama dan pesan dengan benar');
    wa(`Halo Bloomé, saya ${n}.\n${m}`); e.target.reset(); toast('Mengarahkan ke WhatsApp…');
  });
}
document.addEventListener('DOMContentLoaded', init);
