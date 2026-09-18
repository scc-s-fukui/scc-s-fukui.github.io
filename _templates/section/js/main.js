(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.querySelector(".site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // 同一オリジンの内部リンクはフェードアウトしてから遷移し、画面遷移演出をつける
  document.querySelectorAll('a[href$=".html"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var href = link.getAttribute("href");
      if (!href || link.target === "_blank") {
        return;
      }
      event.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(function () {
        window.location.href = href;
      }, 200);
    });
  });
})();
