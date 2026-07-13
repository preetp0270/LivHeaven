// LivHaven Frontend Behaviors - Responsive Ready

document.addEventListener('DOMContentLoaded', () => {
  initFormValidation();
  initCardNavigation();
  initNavBtnAnimation();
  initFilters();
  initPriceToggle();
  initCountrySearch();
});

// ===============================
// Form Validation
// ===============================
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

// ===============================
// Card click navigation
// ===============================
function initCardNavigation() {
  document.querySelectorAll('.listing-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (id) window.location.href = `/listing/${id}`;
    });
  });
}

// ===============================
// Navbar Button Message Animation
// ===============================
function initNavBtnAnimation() {
  const navBtn = document.getElementById('nav-btn');
  if (!navBtn) return;
  const hasFlash = document.querySelectorAll('.alert').length > 0;
  if (!hasFlash) {
    setTimeout(() => {
      navBtn.classList.add('fw-semibold');
      navBtn.innerHTML = `Welcome to LivHaven! <i class="fa-solid fa-magnifying-glass-location"></i>`;
    }, 4000);
  }
}

// ===============================
// Category Filter
// ===============================
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

// ===============================
// Price Toggle
// ===============================
function initPriceToggle() {
  const priceSwitch = document.getElementById('switchCheckDefault');
  if (!priceSwitch) return;

  priceSwitch.addEventListener('change', () => {
    document.querySelectorAll('.list-title').forEach(title => {
      const base = title.getAttribute('data-base-title') || title.textContent.split(' - ₹')[0];
      const price = title.getAttribute('data-price') || '';
      if (priceSwitch.checked && price) {
        title.textContent = `${base} - ₹ ${price}`;
      } else {
        title.textContent = base;
      }
      title.setAttribute('data-base-title', base);
    });
  });
}

// ===============================
// Country Search (in navbar collapse)
// ===============================
function initCountrySearch() {
  const navBtn = document.getElementById('nav-btn');
  const countryInput = document.getElementById('country-input');
  if (!navBtn || !countryInput) return;

  navBtn.addEventListener('click', () => {
    const country = countryInput.value.trim();
    if (!country) {
      countryInput.classList.add('is-invalid');
      setTimeout(() => countryInput.classList.remove('is-invalid'), 1500);
      countryInput.focus();
      return;
    }
    alert(`Searching listings in ${country}...`);
  });

  countryInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') navBtn.click();
  });
}
