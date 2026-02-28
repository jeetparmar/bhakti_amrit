(function injectSharedFooter() {
  const mountPoint = document.getElementById('siteFooterMount');
  if (!mountPoint) return;

  const mode = mountPoint.dataset.footerPath || 'root';
  const isSubPage = mode === 'sub';

  const aboutHref = isSubPage ? 'about.html' : 'html/about.html';
  const contactHref = isSubPage ? 'contact.html' : 'html/contact.html';
  const homeHref = isSubPage ? '../index.html' : 'index.html';

  mountPoint.innerHTML = `
    <footer>
      <div
        class="header-divider"
        style="justify-content: center; margin-bottom: 10px"
      >
        <div class="divider-line" style="width: 60px"></div>
        <div class="divider-dot"></div>
        <div class="divider-line" style="width: 60px"></div>
      </div>
      ॥ जय जय श्री हरि ॥ — सभी देवी-देवताओं को समर्पित <br />
      <div class="footer-links">
        <a href="${aboutHref}">हमारे बारे में</a>
        <span aria-hidden="true">•</span>
        <a href="${contactHref}">संपर्क</a>
        <span aria-hidden="true">•</span>
        <a href="${homeHref}">भक्ति अमृत © 2026</a>
      </div>
    </footer>
  `;
})();
