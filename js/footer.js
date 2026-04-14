/* BMG Footer Component Loader
   Fetches /components/footer.html and injects it into #bmg-footer */
(function () {
  var el = document.getElementById('bmg-footer');
  if (!el) return;
  fetch('/components/footer.html?v=' + new Date().getTime())
    .then(function (r) { return r.text(); })
    .then(function (html) { 
      el.innerHTML = html; 
      window.dispatchEvent(new CustomEvent('footerLoaded'));
    })
    .catch(function () {
      console.warn('Footer component failed to load.');
    });
})();
