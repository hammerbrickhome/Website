
// Helper: toggle chat bubble
function toggleChat(){
  const el = document.getElementById('chatModal');
  el.classList.toggle('show');
}

// Filter services by text
function filterServices(){
  const q = (document.getElementById('search').value || '').toLowerCase();
  document.querySelectorAll('.services .card').forEach(card=>{
    const show = card.textContent.toLowerCase().includes(q);
    card.style.display = show ? '' : 'none';
  });
}

// Lightbox for gallery
const lightbox = document.getElementById('lightbox');
if (lightbox){
  lightbox.addEventListener('click', ()=> lightbox.classList.remove('show'));
}

// Build before/after + gallery from gallery.json
async function buildMedia(){
  try{
    const res = await fetch('gallery.json', {cache:'no-store'});
    const data = await res.json();
    const imgs = data.images || [];

    // BEFORE/AFTER pairs by number (beforeX / afterX)
    const pairs = {};
    imgs.forEach(name=>{
      const m = name.match(/(before|after)[-_]?(\d+|\w+)/i);
      if(m){
        const key = (m[2]||'').toString();
        pairs[key] = pairs[key] || {before:null, after:null};
        if (/before/i.test(m[1])) pairs[key].before = 'images/'+name;
        if (/after/i.test(m[1]))  pairs[key].after  = 'images/'+name;
      }
    });

    const cmpRow = document.getElementById('compareRow');
    if(cmpRow){
      Object.values(pairs).forEach(p=>{
        if(p.before && p.after){
          const wrap = document.createElement('div');
          wrap.className = 'compare';
          wrap.innerHTML = `<div class="cmp-wrap">
              <img class="cmp before" src="${p.before}" alt="before">
              <img class="cmp after"  src="${p.after}"  alt="after">
            </div>`;
          cmpRow.appendChild(wrap);
        }
      });
    }

    // GALLERY: everything except hero & QR
    const gallery = document.getElementById('galleryContainer');
    if(gallery){
      const skip = new Set(['hero.jpg','Homehero.png','qr-hammerbrick-membership.png']);
      imgs.forEach(name=>{
        if(skip.has(name)) return;
        const src = 'images/'+name;
        const a = document.createElement('a');
        a.href = src;
        a.onclick = (e)=>{e.preventDefault(); const lb=document.getElementById('lightbox'); lb.querySelector('img').src=src; lb.classList.add('show');};
        const img = document.createElement('img');
        img.src = src; img.loading = 'lazy'; img.alt = 'project photo';
        img.style.borderRadius='10px'; img.style.margin='6px'; img.style.border='1px solid rgba(255,235,185,.25)';
        a.appendChild(img);
        gallery.appendChild(a);
      });
    }
  }catch(e){
    console.error('gallery.json load error', e);
  }
}

document.addEventListener('DOMContentLoaded', buildMedia);
