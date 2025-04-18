(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
document.addEventListener("DOMContentLoaded", () => {
  const ring = document.getElementById("menuRing");
  let isDragging = false;
  let startAngle = 0;
  let currentRotation = 0;
  function getAngle(e) {
    const rect = ring.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - rect.width / 2;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top - rect.height / 2;
    return Math.atan2(y, x) * (180 / Math.PI);
  }
  ring.addEventListener("mousedown", startRotate);
  ring.addEventListener("touchstart", startRotate);
  function startRotate(e) {
    isDragging = true;
    startAngle = getAngle(e);
    e.preventDefault();
  }
  document.addEventListener("mousemove", rotate);
  document.addEventListener("touchmove", rotate);
  function rotate(e) {
    if (!isDragging) return;
    const angle = getAngle(e);
    const delta = angle - startAngle;
    ring.style.transform = `rotate(${currentRotation + delta}deg)`;
  }
  document.addEventListener("mouseup", endRotate);
  document.addEventListener("touchend", endRotate);
  function endRotate(e) {
    if (!isDragging) return;
    const angle = getAngle(e);
    const delta = angle - startAngle;
    currentRotation += delta;
    isDragging = false;
  }
});
