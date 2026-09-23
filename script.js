// Find the important elements on the page.
const navItems = document.querySelectorAll('.nav-item');
const pageViews = document.querySelectorAll('.page-view');
const breadcrumbTitle = document.querySelector('#breadcrumb-title');
const modal = document.querySelector('#project-modal');
const projectNameInput = document.querySelector('#project-name');
const toast = document.querySelector('#toast');
const authModal = document.querySelector('#auth-modal');
const authForm = document.querySelector('#auth-form');
const authEmailInput = document.querySelector('#auth-email');
const authPasswordInput = document.querySelector('#auth-password');
const authNameInput = document.querySelector('#auth-name');
const authNameField = document.querySelector('#auth-name-field');
const authSubmitButton = document.querySelector('#auth-submit-button');
const authModeToggle = document.querySelector('#auth-mode-toggle');
const authModalTitle = document.querySelector('#auth-modal-title');
const authToggleButton = document.querySelector('#auth-toggle-button');
const logoutButton = document.querySelector('#logout-button');
const userName = document.querySelector('#user-name');
const userEmail = document.querySelector('#user-email');
const userAvatar = document.querySelector('#user-avatar');
const welcomeHeading = document.querySelector('#welcome-heading');
const projectsGrid = document.querySelector('.projects-grid');
const projectsNavCount = document.querySelector('#projects-nav-count');
const projectsTotal = document.querySelector('#projects-total');
const reviewsTotal = document.querySelector('#reviews-total');
const bugsTotal = document.querySelector('#bugs-total');
const testsTotal = document.querySelector('#tests-total');
const healthScore = document.querySelector('#health-score');
const reviewFilter = document.querySelector('#review-filter');
const API_BASE_URL = window.CODELENS_API_URL || 'http://localhost:8000';

let authMode = 'login';

const STORAGE_KEYS = {
  guestProjects: 'codelens-guest-projects',
  guestReviews: 'codelens-guest-reviews',
  guestTests: 'codelens-guest-tests',
  guestBugs: 'codelens-guest-bugs',
  userProjects: 'codelens-projects',
  userReviews: 'codelens-reviews',
  userTests: 'codelens-tests',
  userBugs: 'codelens-bugs'
};

const DEFAULT_PROJECTS = [
  { name: 'DSA Practice', description: 'Algorithms and data structures in Python.', files: '7 files', updated: 'Updated today', accent: 'coral-bg', icon: '⌘' },
  { name: 'E-commerce API', description: 'REST API for a small online store.', files: '12 files', updated: 'Updated Sep 17', accent: 'blue-bg', icon: '⌁' },
  { name: 'Portfolio site', description: 'Personal website and experiments.', files: '4 files', updated: 'Updated Sep 12', accent: 'yellow-bg', icon: '✦' }
];

function getStoredList(storageKey) {
  const storedValue = localStorage.getItem(storageKey);
  if (!storedValue) return [];

  try {
    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    localStorage.removeItem(storageKey);
    return [];
  }
}

function saveStoredList(storageKey, items) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function resetGuestState() {
  localStorage.removeItem(STORAGE_KEYS.guestProjects);
  localStorage.removeItem(STORAGE_KEYS.guestReviews);
  localStorage.removeItem(STORAGE_KEYS.guestTests);
  localStorage.removeItem(STORAGE_KEYS.guestBugs);
}

function getUserStorageKey(storageKey) {
  const user = getStoredUser();
  return user?.id ? `${storageKey}:${user.id}` : storageKey;
}

function getMetricCount(storageKey) {
  const value = Number(localStorage.getItem(storageKey) || 0);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function setMetricCount(storageKey, value) {
  const safeValue = Math.max(0, Number(value) || 0);
  localStorage.setItem(storageKey, String(safeValue));
}

function getVisibleTests() {
  const storageKey = hasActiveSession() ? getUserStorageKey(STORAGE_KEYS.userTests) : STORAGE_KEYS.guestTests;
  return getMetricCount(storageKey);
}

function getVisibleBugs() {
  const storageKey = hasActiveSession() ? getUserStorageKey(STORAGE_KEYS.userBugs) : STORAGE_KEYS.guestBugs;
  return getMetricCount(storageKey);
}

function getProjects() {
  const storageKey = hasActiveSession() ? getUserStorageKey(STORAGE_KEYS.userProjects) : STORAGE_KEYS.guestProjects;
  const projects = getStoredList(storageKey);
  return localStorage.getItem(storageKey) === null ? DEFAULT_PROJECTS.map((project) => ({ ...project })) : projects;
}

function saveProjects(projects) {
  const storageKey = hasActiveSession() ? getUserStorageKey(STORAGE_KEYS.userProjects) : STORAGE_KEYS.guestProjects;
  saveStoredList(storageKey, projects);
}

function getReviews() {
  const storageKey = hasActiveSession() ? getUserStorageKey(STORAGE_KEYS.userReviews) : STORAGE_KEYS.guestReviews;
  return getStoredList(storageKey);
}

function saveReviews(reviews) {
  const storageKey = hasActiveSession() ? getUserStorageKey(STORAGE_KEYS.userReviews) : STORAGE_KEYS.guestReviews;
  saveStoredList(storageKey, reviews);
}

function hasActiveSession() {
  return Boolean(localStorage.getItem('codelens-token') && getStoredUser()?.id);
}

function getVisibleProjects() {
  return getProjects();
}

function getVisibleReviews() {
  return getReviews();
}

function getFilteredReviews() {
  const searchText = document.querySelector('#review-search')?.value.trim().toLowerCase() || '';
  const selectedFilter = reviewFilter?.value || 'all';

  return getVisibleReviews().filter((review) => {
    const searchableText = `${review.fileName} ${review.projectName}`.toLowerCase();
    if (searchText && !searchableText.includes(searchText)) return false;
    if (selectedFilter === 'bugs' && !review.bugs) return false;
    if (selectedFilter === 'suggestions' && review.bugs) return false;
    if (selectedFilter === 'good' && review.bugs) return false;
    return true;
  });
}

function renderReviews() {
  const historyList = document.querySelector('#history-list');
  if (!historyList) return;

  const reviews = getFilteredReviews();
  historyList.innerHTML = '';

  if (!reviews.length) {
    historyList.innerHTML = '<p class="empty-history">No reviews yet.</p>';
    renderRecentReviews();
    return;
  }

  reviews.forEach((review) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <span class="file-icon python">Py</span>
      <div><strong></strong><small></small></div>
      <span class="status-pill success">Completed</span>
      <button class="row-arrow" type="button" aria-label="Open review">→</button>
    `;
    item.querySelector('strong').textContent = review.fileName;
    item.querySelector('small').textContent = `${review.projectName} · ${review.createdAt}`;
    item.querySelector('.row-arrow').addEventListener('click', () => showView('review'));
    historyList.appendChild(item);
  });

  renderRecentReviews();
}

function renderRecentReviews() {
  const reviewTable = document.querySelector('#recent-review-table');
  if (!reviewTable) return;

  const reviews = getFilteredReviews();
  reviewTable.innerHTML = '<div class="table-row table-header"><span>File</span><span>Project</span><span>Result</span><span>Updated</span><span></span></div>';

  if (!reviews.length) {
    reviewTable.innerHTML += '<p class="empty-history">No reviews yet.</p>';
    return;
  }

  reviews.slice(0, 5).forEach((review) => {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.innerHTML = `
      <span class="file-name"><span class="file-icon python">Py</span> <strong></strong></span>
      <span></span>
      <span><span class="status-pill success">Completed</span></span>
      <span></span>
      <button class="row-arrow" type="button" aria-label="Open review">→</button>
    `;
    row.querySelector('.file-name strong').textContent = review.fileName;
    row.children[1].textContent = review.projectName;
    row.children[3].textContent = review.createdAt;
    row.querySelector('.row-arrow').addEventListener('click', () => showView('review'));
    reviewTable.appendChild(row);
  });
}

function syncProjectCount() {
  const navItem = document.querySelector('.nav-item[data-view="projects"]');
  const countBadge = navItem?.querySelector('.nav-count');
  const totalProjects = getVisibleProjects().length;

  if (countBadge) {
    countBadge.textContent = totalProjects;
  }
}

function syncDashboardMetrics() {
  const projects = getVisibleProjects();
  const reviews = getVisibleReviews();
  const tests = getVisibleTests();
  const bugs = getVisibleBugs();

  if (projectsNavCount) projectsNavCount.textContent = projects.length;
  if (projectsTotal) projectsTotal.textContent = projects.length;
  if (reviewsTotal) reviewsTotal.textContent = reviews.length;
  if (bugsTotal) bugsTotal.textContent = bugs;
  if (testsTotal) testsTotal.textContent = tests;
  if (healthScore) {
    const score = Math.min(100, Math.max(0, Math.round(((reviews.length || 0) * 12 + (projects.length || 0) * 8 + (tests || 0) * 5) / 2)));
    healthScore.innerHTML = `${score}<span>/100</span>`;
  }
}

function openProject(projectName) {
  if (!projectName) return;
  showToast(`${projectName} opened`);
  showView('review');
}

function deleteProject(projectName) {
  if (!projectName || !window.confirm(`Delete "${projectName}"? This cannot be undone.`)) return;

  const projects = getProjects().filter((project) => project.name !== projectName);
  saveProjects(projects);
  renderProjects();
  showToast(`${projectName} deleted`);
}

function renderProjects() {
  if (!projectsGrid) return;

  const projects = getVisibleProjects();
  projectsGrid.innerHTML = '';

  projects.forEach((project) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.project = project.name;
    card.innerHTML = `
      <div class="project-color ${project.accent || 'coral-bg'}">${project.icon || project.name.charAt(0).toUpperCase()}</div>
      <div class="project-card-body">
        <div class="project-card-title">
          <h3>${project.name}</h3>
          <button class="delete-project-button" type="button" title="Delete project" aria-label="Delete ${project.name}">•••</button>
        </div>
        <p>${project.description}</p>
        <div class="project-meta">
          <span>${project.files}</span>
          <span>${project.updated}</span>
        </div>
        <button class="open-project-button" type="button">Open project <span>→</span></button>
      </div>
    `;
    card.querySelector('.project-color').textContent = project.icon || project.name.charAt(0).toUpperCase();
    card.querySelector('h3').textContent = project.name;
    card.querySelector('.project-card-body > p').textContent = project.description;
    card.querySelector('.project-meta span:first-child').textContent = project.files;
    card.querySelector('.project-meta span:last-child').textContent = project.updated;

    const openButton = card.querySelector('.open-project-button');
    openButton?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openProject(project.name);
    });

    const deleteButton = card.querySelector('.delete-project-button');
    deleteButton?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteProject(project.name);
    });

    projectsGrid.appendChild(card);
  });

  const emptyProjectCard = document.createElement('button');
  emptyProjectCard.type = 'button';
  emptyProjectCard.className = 'empty-project-card';
  emptyProjectCard.id = 'empty-project-button';
  emptyProjectCard.innerHTML = '<span>＋</span><strong>Create a project</strong><small>Start with a clean workspace</small>';
  emptyProjectCard.addEventListener('click', openProjectModal);
  projectsGrid.appendChild(emptyProjectCard);

  syncProjectCount();
  syncDashboardMetrics();
}

function createProjectCard(projectName) {
  const project = {
    name: projectName,
    description: `Workspace for ${projectName.toLowerCase()}.`,
    files: '1 file',
    updated: 'Updated just now',
    accent: ['coral-bg', 'blue-bg', 'yellow-bg'][Math.floor(Math.random() * 3)],
    icon: projectName.split(' ').slice(0, 2).map((part) => part[0].toUpperCase()).join('').slice(0, 2) || 'PR'
  };

  const projects = getProjects();
  projects.push(project);
  saveProjects(projects);
  renderProjects();
  return project;
}

function updateWelcomeHeading(user) {
  if (!welcomeHeading) return;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const displayName = user && user.name ? user.name : 'Guest user';
  welcomeHeading.textContent = `${greeting}, ${displayName} `;
  const wave = document.createElement('span');
  wave.className = 'wave';
  wave.textContent = '✦';
  welcomeHeading.appendChild(wave);
}

function applyGuestMetrics() {
  document.querySelector('#overview-view')?.classList.add('guest-state');
  renderProjects();
  renderReviews();
  syncDashboardMetrics();
  if (healthScore) {
    const guestScore = Math.min(100, Math.max(0, Math.round(((getVisibleReviews().length || 0) * 12 + (getVisibleProjects().length || 0) * 8 + getVisibleTests() * 5) / 2)));
    healthScore.innerHTML = `${guestScore}<span>/100</span>`;
  }
}

function showView(viewName) {
  pageViews.forEach((view) => {
    view.classList.toggle('active-view', view.id === `${viewName}-view`);
  });

  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  if (viewName === 'projects') {
    renderProjects();
  }
  if (viewName === 'reviews') {
    renderReviews();
  }
  if (viewName === 'overview') {
    syncDashboardMetrics();
    renderRecentReviews();
  }

  breadcrumbTitle.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);
}

navItems.forEach((item) => {
  item.addEventListener('click', () => showView(item.dataset.view));
});

document.querySelectorAll('[data-view-link]').forEach((link) => {
  link.addEventListener('click', () => showView(link.dataset.viewLink));
});

document.querySelector('.icon-button[title="Search"]')?.addEventListener('click', () => {
  showView('reviews');
  document.querySelector('#review-search')?.focus();
});

document.querySelector('.icon-button[title="Notifications"]')?.addEventListener('click', () => {
  showToast('No new notifications');
});

function openProjectModal() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  projectNameInput.focus();
}

function closeProjectModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  projectNameInput.value = '';
}

document.querySelector('#new-project-button').addEventListener('click', openProjectModal);
document.querySelector('#projects-new-button').addEventListener('click', openProjectModal);
document.querySelector('#empty-project-button').addEventListener('click', openProjectModal);
document.querySelector('#quick-review-button').addEventListener('click', () => showView('review'));
document.querySelector('#history-review-button').addEventListener('click', () => showView('review'));
document.querySelector('#close-modal').addEventListener('click', closeProjectModal);
document.querySelector('#cancel-modal').addEventListener('click', closeProjectModal);
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeProjectModal();
});

document.querySelector('#create-project').addEventListener('click', () => {
  const projectName = projectNameInput.value.trim();
  if (!projectName) {
    projectNameInput.focus();
    projectNameInput.placeholder = 'Please enter a project name';
    return;
  }

  const existingProjects = getProjects().map((project) => project.name.toLowerCase());
  if (existingProjects.includes(projectName.toLowerCase())) {
    projectNameInput.focus();
    projectNameInput.value = '';
    projectNameInput.placeholder = 'Project already exists';
    return;
  }

  createProjectCard(projectName);
  closeProjectModal();
  showView('projects');
  showToast(`${projectName} created`);
});

function formatReviewOutput(reviewText) {
  if (!reviewText || typeof reviewText !== 'string') {
    return 'Review is not available yet. Try again in a moment.';
  }

  let formatted = reviewText
    .replace(/\r\n/g, '\n')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/\n\s*Note:.*$/gim, '')
    .replace(/\n\s*Extra guidance:.*$/gim, '')
    .replace(/\n\s*This review is a local fallback.*$/gim, '')
    .trim();

  formatted = formatted
    .replace(/^(\d+)\.\s*(Summary|Overview)\b/gi, '✨ Summary')
    .replace(/^(\d+)\.\s*(Bugs and risks|Bugs|Risks)\b/gi, '⚠️ Bugs and risks')
    .replace(/^(\d+)\.\s*(Code quality|Quality)\b/gi, '✅ Code quality')
    .replace(/^(\d+)\.\s*(Time and space complexity|Complexity)\b/gi, '⏱️ Time and space complexity')
    .replace(/^(\d+)\.\s*(Simple improvements|Improvements)\b/gi, '💡 Simple improvements')
    .replace(/^Note:/gim, '');

  const lines = formatted.split('\n').map((line) => line.trim()).filter(Boolean);
  const cleaned = lines.map((line) => {
    if (/^(✨|⚠️|✅|⏱️|💡)/.test(line)) {
      return `\n${line}`;
    }
    return line;
  });

  return cleaned.join('\n\n');
}

function showToast(message) {
  toast.querySelector('p').textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2800);
}

function openAuthModal() {
  authMode = 'login';
  authNameField.classList.add('hidden');
  authModalTitle.textContent = 'Login';
  authSubmitButton.textContent = 'Login';
  authModeToggle.textContent = 'Create account';
  authModal.classList.add('open');
  authModal.setAttribute('aria-hidden', 'false');
  authEmailInput.focus();
}

function closeAuthModal() {
  authModal.classList.remove('open');
  authModal.setAttribute('aria-hidden', 'true');
  authForm.reset();
}

function getStoredUser() {
  const user = localStorage.getItem('codelens-user');
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (error) {
    localStorage.removeItem('codelens-user');
    return null;
  }
}

function setAuthState(user) {
  const token = localStorage.getItem('codelens-token');

  if (user && token) {
    document.querySelector('#overview-view')?.classList.remove('guest-state');
    userName.textContent = user.name || 'Developer';
    userEmail.textContent = user.email || 'user@example.com';
    userAvatar.textContent = (user.name || 'D').split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
    authToggleButton.textContent = 'Profile';
    authToggleButton.classList.add('hidden');
    logoutButton.classList.remove('hidden');
    updateWelcomeHeading(user);
    renderProjects();
    renderReviews();
    syncDashboardMetrics();
  } else {
    if (localStorage.getItem('codelens-user') && !token) {
      localStorage.removeItem('codelens-user');
    }
    userName.textContent = 'Guest user';
    userEmail.textContent = 'Not signed in';
    userAvatar.textContent = 'GU';
    authToggleButton.textContent = 'Login';
    authToggleButton.classList.remove('hidden');
    logoutButton.classList.add('hidden');
    updateWelcomeHeading(null);
    applyGuestMetrics();
  }
}

function logoutUser() {
  localStorage.removeItem('codelens-token');
  localStorage.removeItem('codelens-user');
  resetGuestState();
  setAuthState(null);
  showToast('Logged out');
}

async function loadCurrentUser() {
  const token = localStorage.getItem('codelens-token');
  if (!token) {
    localStorage.removeItem('codelens-user');
    setAuthState(null);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Token invalid');
    }

    const user = await response.json();
    localStorage.setItem('codelens-user', JSON.stringify(user));
    setAuthState(user);
  } catch (error) {
    localStorage.removeItem('codelens-token');
    localStorage.removeItem('codelens-user');
    setAuthState(null);
  }
}

async function submitAuth(event) {
  event.preventDefault();

  const payload = {
    email: authEmailInput.value.trim(),
    password: authPasswordInput.value
  };

  if (authMode === 'register') {
    payload.name = authNameInput.value.trim();
  }

  const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
  authSubmitButton.disabled = true;
  authSubmitButton.textContent = authMode === 'register' ? 'Creating...' : 'Logging in...';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg || item.detail || JSON.stringify(item)).join('; ')
        : typeof data.detail === 'object'
          ? data.detail.message || JSON.stringify(data.detail)
          : data.detail;
      throw new Error(detail || 'Authentication failed.');
    }

    resetGuestState();
    localStorage.setItem('codelens-token', data.token);
    localStorage.setItem('codelens-user', JSON.stringify(data.user));
    setAuthState(data.user);
    closeAuthModal();
    showToast(authMode === 'register' ? 'Account created' : 'Logged in');
  } catch (error) {
    showToast(error.message);
  } finally {
    authSubmitButton.disabled = false;
    authSubmitButton.textContent = authMode === 'register' ? 'Create account' : 'Login';
  }
}

function toggleAuthMode() {
  authMode = authMode === 'login' ? 'register' : 'login';
  const isRegister = authMode === 'register';

  authNameField.classList.toggle('hidden', !isRegister);
  authModalTitle.textContent = isRegister ? 'Create account' : 'Login';
  authSubmitButton.textContent = isRegister ? 'Create account' : 'Login';
  authModeToggle.textContent = isRegister ? 'Already have an account?' : 'Create account';
}

authToggleButton.addEventListener('click', openAuthModal);
logoutButton.addEventListener('click', logoutUser);
document.querySelector('#close-auth-modal').addEventListener('click', closeAuthModal);
authModal.addEventListener('click', (event) => {
  if (event.target === authModal) closeAuthModal();
});
authModeToggle.addEventListener('click', toggleAuthMode);
authForm.addEventListener('submit', submitAuth);

// Let the review history search filter the visible rows.
document.querySelector('#review-search').addEventListener('input', renderReviews);
reviewFilter?.addEventListener('change', renderReviews);

document.querySelectorAll('.review-table .row-arrow').forEach((button) => {
  button.addEventListener('click', () => showView('review'));
});

// Make project cards feel like real entry points for the next phase.
projectsGrid?.addEventListener('click', (event) => {
  const openButton = event.target.closest('.open-project-button');
  if (!openButton) return;

  event.preventDefault();
  event.stopPropagation();

  const project = openButton.closest('.project-card')?.dataset.project;
  if (!project) return;

  openProject(project);
});

renderProjects();
syncDashboardMetrics();
renderReviews();

// Change the sample chart slightly when the time period changes.
document.querySelector('#activity-period').addEventListener('change', (event) => {
  const bars = document.querySelectorAll('.bar');
  const multiplier = event.target.value === 'Last 7 days' ? 0.7 : event.target.value === 'This year' ? 0.9 : 1;
  bars.forEach((bar) => {
    if (!bar.dataset.baseHeight) bar.dataset.baseHeight = String(Number.parseFloat(bar.style.height) || 0);
    bar.style.height = `${Number.parseFloat(bar.dataset.baseHeight) * multiplier}%`;
  });
});

// Send code to our backend. The AI key stays on the backend.
document.querySelector('#run-review-button').addEventListener('click', async () => {
  const codeInput = document.querySelector('#code-input');
  const result = document.querySelector('#review-result');
  const status = document.querySelector('#review-status');
  const reviewButton = document.querySelector('#run-review-button');

  reviewButton.disabled = true;
  reviewButton.innerHTML = '<span>...</span> Reviewing code';
  status.textContent = 'The AI service is reading your code...';
  result.textContent = '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeInput.value, language: 'python' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'The review could not be completed.');
    result.textContent = formatReviewOutput(data.review);
    status.textContent = `Reviewed with ${data.model}`;
    const reviews = getReviews();
    const inferredBugs = Math.max(1, (data.review.match(/- /g) || []).length);
    reviews.unshift({
      fileName: 'review.py',
      projectName: 'Current workspace',
      createdAt: new Date().toLocaleString(),
      model: data.model,
      bugs: inferredBugs
    });
    saveReviews(reviews);
    const storageKey = hasActiveSession() ? getUserStorageKey(STORAGE_KEYS.userBugs) : STORAGE_KEYS.guestBugs;
    setMetricCount(storageKey, getMetricCount(storageKey) + inferredBugs);
    renderReviews();
    syncDashboardMetrics();
    showToast('Review added to history');
  } catch (error) {
    result.textContent = `Review unavailable: ${error.message}\n\nMake sure the FastAPI server is running on port 8000.`;
    status.textContent = 'The review service returned an error.';
  } finally {
    reviewButton.disabled = false;
    reviewButton.innerHTML = '<span>✦</span> Review with AI';
  }
});

document.querySelector('#generate-tests-button').addEventListener('click', async () => {
  const codeInput = document.querySelector('#code-input');
  const result = document.querySelector('#review-result');
  const status = document.querySelector('#review-status');
  const testsButton = document.querySelector('#generate-tests-button');

  testsButton.disabled = true;
  testsButton.innerHTML = '<span>...</span> Generating';
  status.textContent = 'Generating test cases from your code...';
  result.textContent = '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeInput.value, language: 'python' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'The test cases could not be generated.');
    result.textContent = `Generated test cases for Python\n\n${data.tests}`;
    status.textContent = `Test cases generated with ${data.model}`;
    const storageKey = hasActiveSession() ? getUserStorageKey(STORAGE_KEYS.userTests) : STORAGE_KEYS.guestTests;
    setMetricCount(storageKey, getMetricCount(storageKey) + 1);
    syncDashboardMetrics();
    showToast('Test cases generated');
  } catch (error) {
    result.textContent = `Test generation unavailable: ${error.message}\n\nMake sure the FastAPI server is running on port 8000.`;
    status.textContent = 'The test generator returned an error.';
  } finally {
    testsButton.disabled = false;
    testsButton.innerHTML = '<span>✦</span> Generate tests';
  }
});

document.querySelector('#explain-code-button').addEventListener('click', async () => {
  const codeInput = document.querySelector('#code-input');
  const result = document.querySelector('#review-result');
  const status = document.querySelector('#review-status');
  const explainButton = document.querySelector('#explain-code-button');

  explainButton.disabled = true;
  explainButton.innerHTML = '<span>...</span> Explaining';
  status.textContent = 'Explaining the code in plain language...';
  result.textContent = '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/explain-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeInput.value, level: 'beginner', language: 'python' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'The code could not be explained.');
    result.textContent = data.explanation;
    status.textContent = `Explanation generated with ${data.model}`;
    showToast('Code explained');
  } catch (error) {
    result.textContent = `Explanation unavailable: ${error.message}\n\nMake sure the FastAPI server is running on port 8000.`;
    status.textContent = 'The explanation service returned an error.';
  } finally {
    explainButton.disabled = false;
    explainButton.innerHTML = '<span>?</span> Explain code';
  }
});

async function runAnalysisAction(buttonSelector, endpoint, payload, loadingText, successText, successToast, formatResult, buttonLabel) {
  const button = document.querySelector(buttonSelector);
  const result = document.querySelector('#review-result');
  const status = document.querySelector('#review-status');

  button.disabled = true;
  button.innerHTML = '<span>...</span> Working';
  status.textContent = loadingText;
  result.textContent = '';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'The analysis request failed.');
    result.textContent = formatResult(data);
    status.textContent = successText;
    showToast(successToast);
  } catch (error) {
    result.textContent = `${successText}: ${error.message}\n\nMake sure the FastAPI server is running on port 8000.`;
    status.textContent = 'The analysis service returned an error.';
  } finally {
    button.disabled = false;
    button.innerHTML = buttonLabel;
  }
}

document.querySelector('#bug-check-button')?.addEventListener('click', () => {
  runAnalysisAction(
    '#bug-check-button',
    '/api/bug-verification',
    { code: document.querySelector('#code-input').value, language: 'python' },
    'Checking the code for likely bugs...',
    'Bug verification complete',
    'Bug verification complete',
    (data) => `${data.summary}\n\n${data.verification}`,
    '<span>!</span> Bug check'
  );
});

document.querySelector('#complexity-button')?.addEventListener('click', () => {
  runAnalysisAction(
    '#complexity-button',
    '/api/complexity-analysis',
    { code: document.querySelector('#code-input').value, language: 'python' },
    'Estimating performance and complexity...',
    'Complexity analysis complete',
    'Complexity checked',
    (data) => data.complexity,
    '<span>↺</span> Complexity'
  );
});

document.querySelector('#optimize-button')?.addEventListener('click', () => {
  runAnalysisAction(
    '#optimize-button',
    '/api/optimize-code',
    { code: document.querySelector('#code-input').value, language: 'python' },
    'Finding the best optimization opportunities...',
    'Optimization review complete',
    'Optimization suggestions ready',
    (data) => data.suggestion,
    '<span>⚙</span> Optimize'
  );
});

document.querySelector('#quality-score-button')?.addEventListener('click', () => {
  runAnalysisAction(
    '#quality-score-button',
    '/api/quality-score',
    { code: document.querySelector('#code-input').value, language: 'python' },
    'Scoring the code quality...',
    'Quality score complete',
    'Quality score ready',
    (data) => `${data.summary}\n\nScore: ${data.score}/100`,
    '<span>✓</span> Quality score'
  );
});

// Run Python through the backend and show stdout or errors.
document.querySelector('#run-code-button').addEventListener('click', async () => {
  const code = document.querySelector('#code-input').value;
  const result = document.querySelector('#review-result');
  const status = document.querySelector('#review-status');
  const runButton = document.querySelector('#run-code-button');

  runButton.disabled = true;
  runButton.innerHTML = '<span>...</span> Running';
  status.textContent = 'Running code...';
  result.textContent = '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'The code could not run.');
    result.textContent = data.error ? `${data.output}\n${data.error}` : data.output || 'Program finished without output.';
    status.textContent = data.timed_out ? 'Execution timed out.' : `Finished in ${data.execution_time} seconds.`;
  } catch (error) {
    result.textContent = `Run unavailable: ${error.message}`;
    status.textContent = 'The execution service returned an error.';
  } finally {
    runButton.disabled = false;
    runButton.innerHTML = '<span>▶</span> Run';
  }
});

const storedUser = getStoredUser();
if (!localStorage.getItem('codelens-token') && storedUser) {
  localStorage.removeItem('codelens-user');
}
setAuthState(localStorage.getItem('codelens-token') ? storedUser : null);
loadCurrentUser();
