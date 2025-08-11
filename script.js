const CONTRACT = "0x1B7BF3cf3080ea8b844E3834Fb8705bBF975600c";
const SYMBOL = "NOSHIT";
const DECIMALS = 18;

const buyUrl = `https://arena.trade/token/0x1b7bf3cf3080ea8b844e3834fb8705bbf975600c`;
const snowtraceUrl = `https://snowscan.xyz/token/${CONTRACT}`;

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  const buyBtn = document.getElementById("buyBtn");
  const snowtraceLink = document.getElementById("snowtraceLink");
  buyBtn.href = buyUrl;
  snowtraceLink.href = snowtraceUrl;

  document.getElementById("copyAddressBtn").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(CONTRACT); toast("Contract copied!"); }
    catch (e) { alert("Contract: " + CONTRACT); }
  });

  document.getElementById("watchAssetBtn").addEventListener("click", async () => {
    if (!window.ethereum) return toast("Open in a Web3 wallet (Core/MetaMask).");
    try {
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: { type: "ERC20", options: { address: CONTRACT, symbol: SYMBOL, decimals: DECIMALS } },
      });
      if (wasAdded) toast("Added to wallet!");
    } catch { toast("Unable to add. Try manually in your wallet."); }
  });

  const poop = document.getElementById("poop");
  const toilet = document.getElementById("toiletTarget");
  const info = document.querySelector(".info");
  const hero = document.querySelector(".hero");
  const heroHeight = hero.offsetHeight;

  function updatePoop() {
    const scrollY = window.scrollY;
    const start = heroHeight * 0.1;
    const end = document.body.scrollHeight; // Allow falling past toilet
    const clamped = Math.min(Math.max(scrollY - start, 0), end - start);
    let progress = clamped / (end - start);
    poop.style.opacity = progress > 0.02 ? 1 : 0;

    // Default fall position
    let fallDistance = progress * 600;

    // Check for collisions with windows or toilet
    const obstacles = document.querySelectorAll(".window, #toiletTarget"); 
    const poopRect = poop.getBoundingClientRect();

    for (let obs of obstacles) {
      const obsRect = obs.getBoundingClientRect();
      const closeHoriz = Math.abs((poopRect.left + poopRect.width / 2) - (obsRect.left + obsRect.width / 2)) < 90;
      const closeVert = poopRect.bottom >= obsRect.top;
      if (closeHoriz && closeVert) {
        // Stop falling when hitting this obstacle
        fallDistance = obsRect.top - poopRect.height;
        break;
      }
    }

    poop.style.transform = `translate(-50%, ${fallDistance}px) rotate(${progress * 20 - 10}deg) scale(1.4)`;
  }

  updatePoop();
  window.addEventListener("scroll", updatePoop, { passive: true });
  window.addEventListener("resize", updatePoop);

  const toastEl = document.createElement("div");
  toastEl.className = "toast";
  document.body.appendChild(toastEl);
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("show"); setTimeout(() => toastEl.classList.remove("show"), 1600); }
});

const style = document.createElement("style");
style.textContent = `.toast{position:fixed;left:50%;bottom:32px;transform:translateX(-50%);background:#111c2a;border:1px solid #22324b;color:#e6edf7;padding:10px 14px;border-radius:12px;opacity:0;pointer-events:none;transition:opacity .2s;z-index:9999}.toast.show{opacity:1}`;
document.head.appendChild(style);


(function(){
  function pageOffsetTop(el){ const r = el.getBoundingClientRect(); return r.top + window.scrollY; }
  function pageOffsetLeft(el){ const r = el.getBoundingClientRect(); return r.left + window.scrollX; }

  function setupPatchedPoop(){
    const poop = document.querySelector('.poop');
    if(!poop) return;
    const character = document.querySelector('.character');
    let startOffset = 0;
    if(character){
      const cRect = character.getBoundingClientRect();
      startOffset = cRect.top;
    }
    const hero = document.querySelector('.hero') || document.body;

    // Calculate baseline absolute top for the poop element
    const poopBaseTop = pageOffsetTop(poop);
    const poopBaseLeft = pageOffsetLeft(poop);

    // Collect obstacles: any windows + the toilet
    function getObstacles(){
      const nlist = document.querySelectorAll('.window, .building-window, #toiletTarget, .toilet');
      // Filter to visible, measurable elements
      return Array.from(nlist).filter(el => el.offsetWidth && el.offsetHeight);
    }

    function horizOverlap(ax, aw, bx, bw){
      const aMid = ax + aw/2;
      const bMid = bx + bw/2;
      // allow generous overlap tolerance
      return Math.abs(aMid - bMid) < (aw/2 + bw/2 + 20);
    }

    function newUpdatePoop(){
      const scrollY = window.scrollY;
      const heroStart = (hero ? pageOffsetTop(hero) : 0) + (hero.offsetHeight ? hero.offsetHeight * 0.12 : 0);
      // Proposed target translation from original baseline
      let targetY = Math.max(0, scrollY - heroStart);

      const poopRect = poop.getBoundingClientRect();
      const poopW = poopRect.width || 64;
      const poopH = poopRect.height || 64;
      // Live left based on current layout
      const currentLeft = pageOffsetLeft(poop);
      // Evaluate collisions
      const obstacles = getObstacles();
      let stopY = null;
      for(const ob of obstacles){
        const orct = ob.getBoundingClientRect();
        const oTop = orct.top + window.scrollY;
        const oLeft = orct.left + window.scrollX;
        const oW = orct.width;
        const oH = orct.height;

        // Horizontal overlap between poop and obstacle
        if(horizOverlap(currentLeft, poopW, oLeft, oW)){
          // If after applying targetY, the poop bottom would pass the obstacle top, clamp
          const prospectiveBottom = poopBaseTop + targetY + poopH;
          if(prospectiveBottom >= oTop){
            const candidate = oTop - poopBaseTop - poopH - 2; // stop just above
            if(stopY === null || candidate < stopY){
              stopY = candidate;
            }
          }
        }
      }
      if(stopY !== null){
        targetY = Math.max(0, stopY);
      }

      // Opacity behavior similar to original: fade in after small movement
      const visible = targetY > 8;
      poop.style.opacity = visible ? 1 : 0;

      poop.style.transform = `translate(-50%, ${targetY}px) rotate(0deg) scale(1.4)`;
    }

    // Remove any previous listeners bound to the old updatePoop
    try{ window.removeEventListener('scroll', updatePoop); }catch(e){}
    try{ window.removeEventListener('resize', updatePoop); }catch(e){}

    // Bind our patched one
    window.addEventListener('scroll', newUpdatePoop, {passive:true});
    window.addEventListener('resize', newUpdatePoop);
    // kick once
    newUpdatePoop();
  }

  if(document.readyState === 'loading'){
    window.addEventListener('DOMContentLoaded', setupPatchedPoop);
  } else {
    setupPatchedPoop();
  }
})();
/* === End Patch === */

/* === Patch: poop falls full viewport until toilet at bottom === */
(function(){
  function setupFullHeightPoop(){
    const poop = document.querySelector('.poop');
    const toilet = document.getElementById('toiletTarget');
    if(!poop || !toilet) return;

    // Place toilet at bottom of the page
    toilet.style.position = 'fixed';
    toilet.style.bottom = '0';
    toilet.style.left = '50%';
    toilet.style.transform = 'translateX(-50%)';

    const viewportHeight = window.innerHeight;
    const poopStartTop = poop.getBoundingClientRect().top + window.scrollY;

    function update(){
      const scrollY = window.scrollY;
      const travelDistance = document.body.scrollHeight - viewportHeight;
      const progress = Math.min(scrollY / travelDistance, 1);
      const fallDistance = progress * (viewportHeight - poop.offsetHeight - toilet.offsetHeight - 20); 
      poop.style.opacity = progress > 0.02 ? 1 : 0;
      poop.style.transform = `translate(-50%, ${fallDistance}px) scale(1.4)`;
    }

    window.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update);
    update();
  }
  if(document.readyState === 'loading'){
    window.addEventListener('DOMContentLoaded', setupFullHeightPoop);
  } else {
    setupFullHeightPoop();
  }
})();
/* === End Patch === */

/* === Patch: viewport travel poop with baseline clamp + static bottom toilet landing + disappear effect === */
(function(){
  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
  function setupViewportPoop(){
    const poop = document.querySelector('#poop.poop');
    if(!poop) return;
    const toilet = document.getElementById('goldToilet');
    const bowlImg = toilet ? toilet.querySelector('.gold-toilet-img') : null;
    const splashEl = document.getElementById('toiletSplash');
    const character = document.querySelector('.character');

    let baselineTop = 0;
    function calcBaseline(){
      if(character){
        const r = character.getBoundingClientRect();
        baselineTop = Math.max(0, r.top + window.scrollY + 4);
      } else {
        baselineTop = window.scrollY;
      }
    }
    calcBaseline();

    function onScrollResize(){
      const doc = document.documentElement;
      const scrollMax = (doc.scrollHeight - window.innerHeight) || 1;
      const progress = clamp(window.scrollY / scrollMax, 0, 1);

      const poopH = poop.getBoundingClientRect().height || 64;
      let targetY = baselineTop + progress * (doc.scrollHeight - poopH - baselineTop);

      if(targetY < baselineTop) targetY = baselineTop;

      if(toilet){
        const tRect = toilet.getBoundingClientRect();
        const landY = (function(){
        const root = getComputedStyle(document.documentElement);
        const offset = parseFloat(root.getPropertyValue('--poop-stop-offset')) || 0;
        const rect = (bowlImg ? bowlImg.getBoundingClientRect() : tRect);
        return window.scrollY + rect.top + rect.height - poopH + offset;
      })();
        targetY = Math.min(targetY, landY);
        if(targetY >= landY - 1){
          /* DEBUG_OFFSET_LOG */ try { const dbg = getComputedStyle(document.documentElement).getPropertyValue('--poop-stop-offset'); if(!window.__poopDbg){ console.log('Poop stop offset:', dbg.trim()); window.__poopDbg=true; } } catch(e){}
          // Poop hits toilet -> fade out into bowl
          poop.style.opacity = 0;
          poop.style.transform = `translate(-50%, ${targetY - window.scrollY + 10}px) scale(1.4)`;
        } else {
          poop.style.opacity = 1;
          poop.style.transform = `translate(-50%, ${targetY - window.scrollY}px) scale(1.4)`;
        }
      } else {
        poop.style.opacity = 1;
        poop.style.transform = `translate(-50%, ${targetY - window.scrollY}px) scale(1.4)`;
      }
    }

    window.addEventListener('scroll', onScrollResize, {passive:true});
    window.addEventListener('resize', () => { calcBaseline(); onScrollResize(); });
    onScrollResize();
  }

  if(document.readyState === 'loading'){
    window.addEventListener('DOMContentLoaded', setupViewportPoop);
  } else {
    setupViewportPoop();
  }
})();
/* === End Patch === */
