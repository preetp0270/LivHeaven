// LivHeaven Frontend Behaviors

document.addEventListener('DOMContentLoaded', () => {
  initFormValidation();
  initCardNavigation();
  initNavBtnAnimation();
  initFilters();
  initPriceToggle();
  initCountrySearch();
  initImageSourceToggle();
});

function initFormValidation() {
  const forms = document.querySelectorAll('.needs-validation');
  forms.forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });
}

function initCardNavigation() {
  document.querySelectorAll('.listing-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (id) window.location.href = `/listing/${id}`;
    });
  });
}

function initNavBtnAnimation() {
  const navBtn = document.getElementById('nav-btn');
  if (!navBtn) return;
  const hasFlash = document.querySelectorAll('.alert').length > 0;
  if (!hasFlash) {
    setTimeout(() => {
      navBtn.innerHTML = `Search <i class="fa-solid fa-magnifying-glass ms-1"></i>`;
    }, 5000);
  }
}

function initFilters() {
  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.listing-card');

  const normalize = text =>
    (text || '').toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^\w-]/g, '');
  const normalizeBare = text => normalize(text).replace(/[-_]+/g, '');

  const applyFilter = category => {
    const normalized = normalize(category);
    const normalizedBare = normalizeBare(category);

    cards.forEach(card => {
      const col = card.closest('[class*="col-"]');
      const cardCategory = normalize(card.dataset.category);
      const cardCategoryBare = normalizeBare(card.dataset.category);

      const match =
        normalized === '' ||
        normalized === 'all' ||
        cardCategory === normalized ||
        cardCategoryBare === normalizedBare;

      (col || card).classList.toggle('hide', !match);
    });
  };

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      const category = filter.dataset.category || filter.textContent.trim();
      applyFilter(category);
    });
  });

  const active = document.querySelector('.filter.active');
  applyFilter(active ? active.dataset.category || '' : '');
}

function initPriceToggle() {
  const priceSwitch = document.getElementById('switchCheckDefault');
  if (!priceSwitch) return;

  const sync = () => {
    document.querySelectorAll('.listing-price').forEach(el => {
      el.style.display = priceSwitch.checked ? 'block' : 'none';
    });
  };
  document.querySelectorAll('.listing-price').forEach(el => {
    el.style.display = 'none';
  });
  priceSwitch.addEventListener('change', sync);
}

// Working search: navigate to /listing?q=...
function initCountrySearch() {
  const navBtn = document.getElementById('nav-btn');
  const countryInput = document.getElementById('country-input');
  if (!navBtn || !countryInput) return;

  // Prefill from ?q= if present
  const params = new URLSearchParams(window.location.search);
  const existing = params.get('q') || params.get('country');
  if (existing) countryInput.value = existing;

  const doSearch = () => {
    const q = countryInput.value.trim();
    if (!q) {
      countryInput.classList.add('is-invalid');
      setTimeout(() => countryInput.classList.remove('is-invalid'), 1500);
      countryInput.focus();
      return;
    }
    const params = new URLSearchParams({ q });
    window.location.href = `/listing?${params.toString()}`;
  };

  navBtn.addEventListener('click', doSearch);
  countryInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch();
    }
  });
}

// Toggle between file upload and image URL on create/edit forms
function initImageSourceToggle() {
  const fileInput = document.getElementById('image');
  const urlInput = document.getElementById('imageUrl');
  if (!fileInput && !urlInput) return;

  const syncRequired = () => {
    if (!fileInput || !urlInput) return;
    const hasFile = fileInput.files && fileInput.files.length > 0;
    const hasUrl = urlInput.value.trim().length > 0;
    // On create page, at least one is needed — browser required is relaxed
    fileInput.required = false;
    urlInput.required = false;
  };

  if (fileInput) fileInput.addEventListener('change', syncRequired);
  if (urlInput) urlInput.addEventListener('input', syncRequired);
  syncRequired();
}
