// Microsoft Clarity, loaded only after the first user interaction or ~4s of idle time,
// so it never competes with first paint. Mounted from app/layout.tsx via next/script.
(function () {
  var started = false;
  var EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"];

  function start() {
    if (started) return;
    started = true;
    EVENTS.forEach(function (e) {
      window.removeEventListener(e, start);
    });
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", "oo7sqjfgyt");
  }

  EVENTS.forEach(function (e) {
    window.addEventListener(e, start, { once: true, passive: true });
  });
  setTimeout(function () {
    if ("requestIdleCallback" in window) window.requestIdleCallback(start, { timeout: 2000 });
    else start();
  }, 4000);
})();
