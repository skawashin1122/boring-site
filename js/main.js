'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initHamburgerMenu();
  initSmoothScroll();
  initFadeInObserver();
  initNavHighlight();
  initToTopButton();
  initContactForm();
});

/* ヘッダーのスクロール時の影 */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 4);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ハンバーガーメニューの開閉 */
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  const overlay = document.getElementById('nav-overlay');
  if (!hamburger || !nav || !overlay) return;

  const closeMenu = () => {
    hamburger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    overlay.hidden = true;
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    hamburger.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      hamburger.focus();
    }
  });
}

/* スムーススクロール（ヘッダー高さ分オフセット） */
function initSmoothScroll() {
  const header = document.getElementById('site-header');
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  });
}

/* IntersectionObserver によるフェードイン */
function initFadeInObserver() {
  const targets = document.querySelectorAll('.card, .strength-item, .motto, .company-table, .access-grid, .contact-grid, .hero-inner');
  targets.forEach((el) => el.classList.add('fade-in'));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* 現在セクションのナビハイライト */
function initNavHighlight() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-list a');
  if (!sections.length || !navLinks.length) return;

  const linkMap = new Map();
  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      linkMap.set(href.slice(1), link);
    }
  });

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = linkMap.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ページトップボタンの表示制御 */
function initToTopButton() {
  const button = document.getElementById('to-top');
  if (!button) return;

  const onScroll = () => {
    button.hidden = window.scrollY < window.innerHeight;
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  });
}

/* フォームのクライアントサイドバリデーション */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const thanks = document.getElementById('form-thanks');

  const fields = [
    { id: 'name', errorId: 'name-error', message: 'お名前を入力してください。' },
    {
      id: 'tel',
      errorId: 'tel-error',
      message: '電話番号を入力してください。',
      validate: (value) => value.trim() !== '' && /^[0-9+\-()\s]+$/.test(value),
      invalidMessage: '正しい電話番号を入力してください。',
    },
    {
      id: 'email',
      errorId: 'email-error',
      required: false,
      validate: (value) => value.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      invalidMessage: '正しいメールアドレスを入力してください。',
    },
    { id: 'inquiry-type', errorId: 'inquiry-type-error', message: 'お問い合わせ種別を選択してください。' },
    { id: 'message', errorId: 'message-error', message: 'お問い合わせ内容を入力してください。' },
  ];

  const validateField = (field) => {
    const input = document.getElementById(field.id);
    const errorEl = document.getElementById(field.errorId);
    if (!input || !errorEl) return true;

    const value = input.value;
    const required = field.required !== false;
    let isValid = true;
    let message = '';

    if (required && value.trim() === '') {
      isValid = false;
      message = field.message;
    } else if (field.validate && !field.validate(value)) {
      isValid = false;
      message = field.invalidMessage || field.message;
    }

    if (isValid) {
      input.removeAttribute('aria-invalid');
      errorEl.textContent = '';
    } else {
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
    }

    return isValid;
  };

  const validatePrivacy = () => {
    const checkbox = document.getElementById('privacy');
    const errorEl = document.getElementById('privacy-error');
    if (!checkbox || !errorEl) return true;

    if (!checkbox.checked) {
      checkbox.setAttribute('aria-invalid', 'true');
      errorEl.textContent = '個人情報の取扱いへの同意が必要です。';
      return false;
    }

    checkbox.removeAttribute('aria-invalid');
    errorEl.textContent = '';
    return true;
  };

  fields.forEach((field) => {
    const input = document.getElementById(field.id);
    if (!input) return;
    input.addEventListener('blur', () => validateField(field));
  });

  const privacyCheckbox = document.getElementById('privacy');
  if (privacyCheckbox) {
    privacyCheckbox.addEventListener('change', validatePrivacy);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const results = fields.map((field) => validateField(field));
    const privacyValid = validatePrivacy();
    const allValid = results.every(Boolean) && privacyValid;

    if (!allValid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* 送信先：Formspree等を設定後、実際の送信処理に置き換える */
    form.reset();
    if (thanks) {
      thanks.hidden = false;
    }
  });
}
