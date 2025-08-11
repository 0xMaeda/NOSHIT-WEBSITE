const CONTRACT = "0x1B7BF3cf3080ea8b844E3834Fb8705bBF975600c";
const SYMBOL = "NOSHIT";
const DECIMALS = 18;

const buyUrl = `https://traderjoexyz.com/avalanche/trade?outputCurrency=${CONTRACT}`;
const snowtraceUrl = `https://snowtrace.io/token/${CONTRACT}`;

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
    const end = info.offsetTop + 40;
    const clamped = Math.min(Math.max(scrollY - start, 0), end - start);
    const progress = (clamped) / (end - start);
    poop.style.opacity = progress > 0.02 ? 1 : 0;
    poop.style.transform = `translate(-50%, ${progress * 600}px) rotate(${progress * 20 - 10}deg) scale(1.4)`;

    const toiletRect = toilet.getBoundingClientRect();
    const poopRect = poop.getBoundingClientRect();
    const closeHoriz = Math.abs((poopRect.left + poopRect.width/2) - (toiletRect.left + toiletRect.width/2)) < 90;
    const closeVert = (poopRect.bottom) > (toiletRect.top + 40);
    const container = toilet.parentElement;
    if (closeHoriz && closeVert) { container.classList.add("hit"); } else { container.classList.remove("hit"); }
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
