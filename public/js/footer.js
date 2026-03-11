/* BMG Footer Component Loader
   Fetches /components/footer.html and injects it into #bmg-footer */
(function () {
  var el = document.getElementById('bmg-footer');
  if (!el) return;
  fetch('/components/footer.html')
    .then(function (r) { return r.text(); })
    .then(function (html) { el.innerHTML = html; })
    .catch(function () {
      console.warn('Footer component failed to load.');
    });
})();
