(function initBhaktiTheme() {
  const STORAGE_KEY = 'bhakti-theme';
  const DEFAULT_THEME = 'classic';
  const root = document.documentElement;
  const themes = Object.freeze({
    classic: {
      label: 'मूल',
      labelEn: 'Classic',
      accent: '#ff6b00',
    },
    saffron: {
      label: 'केसर',
      labelEn: 'Saffron',
      accent: '#ff7a00',
    },
    sunrise: {
      label: 'अरुण',
      labelEn: 'Sunrise',
      accent: '#eb7d34',
    },
    lotus: {
      label: 'कमल',
      labelEn: 'Lotus',
      accent: '#d25d8a',
    },
  });

  function isValidTheme(themeName) {
    return Object.prototype.hasOwnProperty.call(themes, themeName);
  }

  function readStoredTheme() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function writeStoredTheme(themeName) {
    try {
      window.localStorage.setItem(STORAGE_KEY, themeName);
    } catch (error) {
      return null;
    }

    return themeName;
  }

  function dispatchThemeChange(themeName) {
    window.dispatchEvent(
      new CustomEvent('bhakti-theme-change', {
        detail: {
          theme: themeName,
          meta: themes[themeName],
        },
      }),
    );
  }

  function applyTheme(themeName, options = {}) {
    const nextTheme = isValidTheme(themeName) ? themeName : DEFAULT_THEME;
    root.dataset.theme = nextTheme;

    if (!options.skipStorage) {
      writeStoredTheme(nextTheme);
    }

    if (!options.silent) {
      dispatchThemeChange(nextTheme);
    }

    return nextTheme;
  }

  const storedTheme = readStoredTheme();
  const initialTheme = isValidTheme(storedTheme) ? storedTheme : DEFAULT_THEME;
  root.dataset.theme = initialTheme;

  window.BhaktiTheme = {
    themes,
    storageKey: STORAGE_KEY,
    defaultTheme: DEFAULT_THEME,
    getCurrentTheme() {
      return isValidTheme(root.dataset.theme) ? root.dataset.theme : DEFAULT_THEME;
    },
    setTheme(themeName) {
      return applyTheme(themeName);
    },
    cycleTheme() {
      const ids = Object.keys(themes);
      const currentIndex = ids.indexOf(this.getCurrentTheme());
      const nextTheme = ids[(currentIndex + 1) % ids.length];
      return applyTheme(nextTheme);
    },
  };

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    applyTheme(event.newValue, { skipStorage: true });
  });
})();
