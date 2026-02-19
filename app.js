import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAHA1AtPsjf4X4gf5YliMnscDj4CmgWSgk",
    authDomain: "triton-magazine.firebaseapp.com",
    projectId: "triton-magazine",
    storageBucket: "triton-magazine.firebasestorage.app",
    messagingSenderId: "859169446483",
    appId: "1:859169446483:web:39b308366df7e3eb9c04a6"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const COLLECTION = 'issues';
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'triton2024';
  let isLoggedIn = false;
  let currentLang = 'ru';
  let allIssuesCache = [];
  let lastIssuesQuery = '';
  const pageState = {
    hasHomePage: Boolean(document.getElementById('page-home')),
    hasIssuesPage: Boolean(document.getElementById('page-issues')),
    hasAdminPage: Boolean(document.getElementById('page-admin'))
  };

  // â”€â”€â”€ TRANSLATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const T = {
    ru: {
      nav_home: 'Главная', nav_issues: 'Все выпуски', nav_about: 'О нас',
      search_placeholder: 'Поиск по выпускам...',
      hero_tag: '📰 Гимназический журнал',
      hero_title: 'Добро пожаловать в<br/>журнал <em>Тритон</em>',
      hero_sub: 'Голос нашей Гимназии — истории, идеи и моменты, которые важны. Написано студентами для студентов.',
      hero_btn_issues: 'Все выпуски', hero_btn_about: 'О нас',
      stat_issues: 'Опубликовано выпусков', stat_founded: 'Год основания',
      stat_students: 'Написано студентами Гимназии', stat_stories: 'Историй впереди',
      latest_issues: 'Последние выпуски', see_all: 'Все выпуски →',
      empty_title: 'Выпусков пока нет',
      empty_home_sub: 'Выпуски, загруженные администратором, появятся здесь.',
      empty_issues_sub: 'Заходите позже — новые выпуски появятся здесь.',
      how_title: 'Как работает журнал',
      how_sub: 'Всё, что нужно знать о «Тритоне» с первого взгляда',
      how1_title: 'Кто пишет',
      how1_text: 'Каждую статью, репортаж и колонку создают студенты Гимназии Сколково — настоящая редакция из тех, кто учится рядом с вами.',
      how2_title: 'Когда выходит',
      how2_text: 'Журнал выходит дважды в год — в <strong>январе</strong> и <strong>июне</strong>. Каждый выпуск — итог целого семестра.',
      how3_title: 'Зачем читать',
      how3_text: 'Здесь вы найдёте честные взгляды студентов на жизнь школы, культуру, науку и всё, что волнует молодых людей.',
      about_title: 'О журнале <span>Тритон</span>',
      about_p1: '«Тритон» — официальный журнал Гимназии Сколково, основанный в 2021 году. Это платформа, где каждый голос имеет значение: от новостей и культуры до мнений и творчества.',
      about_p2: 'Каждый выпуск создаётся с любовью нашей редакцией и отражает жизнь школьного сообщества.',
      about_editor: 'Главный редактор: <strong class="about-editor-name">Гаджикулиев Умар</strong>',
      feat1_title: 'Голоса студентов Гимназии', feat1_text: 'Каждая статья, история и колонка написана студентами Гимназии Сколково.',
      feat2_title: 'Авторский дизайн', feat2_text: 'Каждый выпуск оформляется нашей творческой командой.',
      feat3_title: 'Бесплатное чтение', feat3_text: 'Все выпуски доступны бесплатно прямо здесь, онлайн.',
      issues_page_title: 'Все выпуски', issues_page_sub: 'Читайте все номера журнала «Тритон»',
      about_page_title: 'О журнале', about_page_sub: '«Тритон» — голос Гимназии Сколково',
      footer_school: 'Гимназия Сколково', footer_year: 'Основан в 2021 г.', footer_editor: 'Гл. редактор: Гаджикулиев Умар',
      read_btn: 'Читать выпуск →', read_btn_small: 'Читать →',
      badge_latest: '✦ Последний выпуск',
      search_no_results: 'Ничего не найдено', search_no_results_sub: 'Попробуйте другой запрос',
      search_found: 'найдено выпусков',
      pdf_loading: 'Открываем PDF...',
      fs_enter: '⛶ На весь экран', fs_exit: '✕ Выйти из полноэкрана',
    },
    en: {
      nav_home: 'Home', nav_issues: 'All Issues', nav_about: 'About',
      search_placeholder: 'Search issues...',
      hero_tag: '📰 Gymnasium Magazine',
      hero_title: 'Welcome to<br/>the <em>Triton</em> magazine',
      hero_sub: 'The voice of our Gymnasium — stories, ideas and moments that matter. Written by students, for students.',
      hero_btn_issues: 'All Issues', hero_btn_about: 'About Us',
      stat_issues: 'Issues Published', stat_founded: 'Year Founded',
      stat_students: 'Written by Gymnasium Students', stat_stories: 'Stories Ahead',
      latest_issues: 'Latest Issues', see_all: 'All Issues →',
      empty_title: 'No issues yet',
      empty_home_sub: 'Issues uploaded by the admin will appear here.',
      empty_issues_sub: 'Check back later — new issues will appear here.',
      how_title: 'How the Magazine Works',
      how_sub: 'Everything you need to know about Triton at a glance',
      how1_title: 'Who Writes',
      how1_text: 'Every article, report and column is created by Skolkovo Gymnasium students — a real editorial team of your classmates.',
      how2_title: 'When It Comes Out',
      how2_text: 'Published twice a year — in <strong>January</strong> and <strong>June</strong>. Each issue is the highlight of a whole semester.',
      how3_title: 'Why Read It',
      how3_text: 'Find honest student perspectives on school life, culture, science and everything that matters to young people.',
      about_title: 'About <span>Triton</span>',
      about_p1: 'Triton is the official magazine of Skolkovo Gymnasium, founded in 2021. A platform where every voice matters — from news and culture to opinion and creativity.',
      about_p2: 'Each issue is crafted with care by our editorial team and reflects the life of the school community.',
      about_editor: 'Editor-in-Chief: <strong class="about-editor-name">Gadzhikuliev Umar</strong>',
      feat1_title: 'Gymnasium Student Voices', feat1_text: 'Every article, story and column is written by Skolkovo Gymnasium students.',
      feat2_title: 'Original Design', feat2_text: 'Every issue is designed by our creative team.',
      feat3_title: 'Free to Read', feat3_text: 'All issues are available for free right here, online.',
      issues_page_title: 'All Issues', issues_page_sub: 'Read all issues of the Triton magazine',
      about_page_title: 'About the Magazine', about_page_sub: 'Triton — the voice of Skolkovo Gymnasium',
      footer_school: 'Skolkovo Gymnasium', footer_year: 'Founded in 2021', footer_editor: 'Editor-in-Chief: Gadzhikuliev Umar',
      read_btn: 'Read Issue →', read_btn_small: 'Read →',
      badge_latest: '✦ Latest Issue',
      search_no_results: 'Nothing found', search_no_results_sub: 'Try a different search',
      search_found: 'issues found',
      pdf_loading: 'Opening PDF...',
      fs_enter: '⛶ Fullscreen', fs_exit: '✕ Exit Fullscreen',
    }
  };

  const ADMIN_I18N = {
    ru: {
      nav_admin: 'Admin',
      login_title: 'Вход для администратора',
      login_subtitle: 'Войдите, чтобы управлять и загружать выпуски журнала.',
      label_username: 'Имя пользователя',
      label_password: 'Пароль',
      ph_username: 'Введите имя пользователя',
      ph_password: 'Введите пароль',
      btn_login: 'Войти',
      dashboard_title: '📋 Панель администратора',
      dashboard_subtitle: 'Управление журналом «Тритон»',
      btn_logout: 'Выйти',
      upload_title: '📤 Добавить новый выпуск',
      label_issue_title: 'Название выпуска',
      ph_issue_title: 'Например: Весна 2025',
      label_issue_date: 'Дата выпуска',
      label_issue_desc: 'Краткое описание (необязательно)',
      ph_issue_desc: 'Что в этом выпуске?',
      label_pdf: 'Ссылка на PDF <span class="label-note">(Google Drive / Yandex Диск)</span>',
      ph_pdf: 'https://drive.google.com/file/d/...',
      drive_hint: '📌 В Google Drive: правая кнопка → «Открыть доступ» → «Все у кого есть ссылка» → скопировать',
      label_cover: 'Ссылка на обложку <span class="label-note">(необязательно)</span>',
      ph_cover: 'https://drive.google.com/file/d/...',
      btn_preview_cover: '👁 Предпросмотр обложки',
      btn_publish: 'Опубликовать выпуск',
      btn_saving: 'Сохранение...',
      published_title: 'Опубликованные выпуски',
      empty_title: 'Выпусков пока нет',
      empty_sub: 'Добавьте первый выпуск с помощью панели слева.',
      issue_prefix: 'Выпуск: ',
      cover_ok: '🖼️ Обложка есть',
      cover_missing: '⚠️ Нет обложки',
      btn_edit: '✏️ Изменить',
      btn_view: 'Просмотр',
      btn_delete: 'Удалить',
      edit_title: '✏️ Редактировать выпуск',
      edit_subtitle_default: 'Изменить данные выпуска',
      label_edit_desc: 'Описание',
      label_edit_pdf: 'Ссылка на PDF <span class="label-note">(оставьте пустым чтобы не менять)</span>',
      btn_remove_cover: '✕ Убрать обложку',
      btn_save: 'Сохранить',
      btn_cancel: 'Отмена',
      toast_login_success: 'Добро пожаловать! 👋',
      toast_login_error: 'Неверное имя пользователя или пароль',
      toast_cover_missing: 'Вставьте ссылку на обложку',
      toast_title_required: 'Введите название выпуска',
      toast_date_required: 'Выберите дату',
      toast_pdf_required: 'Вставьте ссылку на PDF',
      toast_issue_published: 'Выпуск опубликован! 🎉',
      toast_try_again: 'Ошибка. Попробуйте ещё раз.',
      toast_issue_deleted: 'Выпуск удалён',
      toast_issue_updated: 'Выпуск обновлён! ✅',
      toast_save_error: 'Ошибка сохранения',
      toast_pdf_missing: 'PDF не найден',
      confirm_delete: 'Удалить этот выпуск? Это действие нельзя отменить.'
    },
    en: {
      nav_admin: 'Admin',
      login_title: 'Admin Login',
      login_subtitle: 'Sign in to manage and publish magazine issues.',
      label_username: 'Username',
      label_password: 'Password',
      ph_username: 'Enter username',
      ph_password: 'Enter password',
      btn_login: 'Sign In',
      dashboard_title: '📋 Admin Dashboard',
      dashboard_subtitle: 'Manage the “Triton” magazine',
      btn_logout: 'Log Out',
      upload_title: '📤 Add New Issue',
      label_issue_title: 'Issue Title',
      ph_issue_title: 'For example: Spring 2025',
      label_issue_date: 'Issue Date',
      label_issue_desc: 'Short Description (optional)',
      ph_issue_desc: 'What is in this issue?',
      label_pdf: 'PDF URL <span class="label-note">(Google Drive / Yandex Disk)</span>',
      ph_pdf: 'https://drive.google.com/file/d/...',
      drive_hint: '📌 In Google Drive: right click → “Share” → “Anyone with the link” → copy',
      label_cover: 'Cover URL <span class="label-note">(optional)</span>',
      ph_cover: 'https://drive.google.com/file/d/...',
      btn_preview_cover: '👁 Preview Cover',
      btn_publish: 'Publish Issue',
      btn_saving: 'Saving...',
      published_title: 'Published Issues',
      empty_title: 'No issues yet',
      empty_sub: 'Add your first issue using the panel on the left.',
      issue_prefix: 'Issue: ',
      cover_ok: '🖼️ Cover available',
      cover_missing: '⚠️ No cover',
      btn_edit: '✏️ Edit',
      btn_view: 'View',
      btn_delete: 'Delete',
      edit_title: '✏️ Edit Issue',
      edit_subtitle_default: 'Update issue details',
      label_edit_desc: 'Description',
      label_edit_pdf: 'PDF URL <span class="label-note">(leave blank to keep current)</span>',
      btn_remove_cover: '✕ Remove cover',
      btn_save: 'Save',
      btn_cancel: 'Cancel',
      toast_login_success: 'Welcome! 👋',
      toast_login_error: 'Incorrect username or password',
      toast_cover_missing: 'Paste the cover URL',
      toast_title_required: 'Enter issue title',
      toast_date_required: 'Select issue date',
      toast_pdf_required: 'Paste the PDF URL',
      toast_issue_published: 'Issue published! 🎉',
      toast_try_again: 'Error. Please try again.',
      toast_issue_deleted: 'Issue deleted',
      toast_issue_updated: 'Issue updated! ✅',
      toast_save_error: 'Save error',
      toast_pdf_missing: 'PDF not found',
      confirm_delete: 'Delete this issue? This action cannot be undone.'
    }
  };

  const storedLang = localStorage.getItem('triton_lang');
  if (storedLang && T[storedLang]) currentLang = storedLang;

  function tr(key) { return (T[currentLang] || T.ru)[key] || key; }
  function ta(key) { return (ADMIN_I18N[currentLang] || ADMIN_I18N.ru)[key] || key; }

  function setFieldLabel(inputId, key) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const label = input.closest('.form-group')?.querySelector('label');
    if (label) label.innerHTML = ta(key);
  }

  function setFieldPlaceholder(inputId, key) {
    const input = document.getElementById(inputId);
    if (input) input.placeholder = ta(key);
  }

  function localizeAdminStaticTexts() {
    const loginTitle = document.querySelector('#admin-login h2');
    if (loginTitle) loginTitle.textContent = ta('login_title');
    const loginSubtitle = document.querySelector('#admin-login p');
    if (loginSubtitle) loginSubtitle.textContent = ta('login_subtitle');
    setFieldLabel('login-user', 'label_username');
    setFieldPlaceholder('login-user', 'ph_username');
    setFieldLabel('login-pass', 'label_password');
    setFieldPlaceholder('login-pass', 'ph_password');
    const loginBtn = document.querySelector('#admin-login .form-submit');
    if (loginBtn) loginBtn.textContent = ta('btn_login');

    const dashboardTitle = document.querySelector('.admin-topbar h2');
    if (dashboardTitle) dashboardTitle.textContent = ta('dashboard_title');
    const dashboardSubtitle = document.querySelector('.admin-topbar span');
    if (dashboardSubtitle) dashboardSubtitle.textContent = ta('dashboard_subtitle');
    const logoutBtn = document.querySelector('.admin-topbar .logout-btn');
    if (logoutBtn) logoutBtn.textContent = ta('btn_logout');

    const uploadTitle = document.querySelector('.upload-panel h3');
    if (uploadTitle) uploadTitle.textContent = ta('upload_title');
    setFieldLabel('up-title', 'label_issue_title');
    setFieldPlaceholder('up-title', 'ph_issue_title');
    setFieldLabel('up-date', 'label_issue_date');
    setFieldLabel('up-desc', 'label_issue_desc');
    setFieldPlaceholder('up-desc', 'ph_issue_desc');
    setFieldLabel('up-pdf-url', 'label_pdf');
    setFieldPlaceholder('up-pdf-url', 'ph_pdf');
    const driveHint = document.querySelector('.upload-panel .url-hint');
    if (driveHint) driveHint.textContent = ta('drive_hint');
    setFieldLabel('up-cover-url', 'label_cover');
    setFieldPlaceholder('up-cover-url', 'ph_cover');
    const uploadPreviewBtn = document.querySelector('.upload-panel .preview-btn');
    if (uploadPreviewBtn) uploadPreviewBtn.textContent = ta('btn_preview_cover');
    const uploadSubmitBtn = document.querySelector('.upload-panel .form-submit');
    if (uploadSubmitBtn && !uploadSubmitBtn.disabled) uploadSubmitBtn.textContent = ta('btn_publish');

    const listTitle = document.querySelector('.issues-list-panel h3');
    const countValue = document.getElementById('admin-count')?.textContent || '0';
    if (listTitle) {
      listTitle.innerHTML = `${ta('published_title')} <span class="issues-count" id="admin-count">${countValue}</span>`;
    }

    const editTitle = document.querySelector('#edit-modal h3');
    if (editTitle) editTitle.textContent = ta('edit_title');
    const editSubtitle = document.getElementById('edit-subtitle');
    if (editSubtitle) editSubtitle.textContent = ta('edit_subtitle_default');
    setFieldLabel('edit-title', 'label_issue_title');
    setFieldPlaceholder('edit-title', 'ph_issue_title');
    setFieldLabel('edit-date', 'label_issue_date');
    setFieldLabel('edit-desc', 'label_edit_desc');
    setFieldPlaceholder('edit-desc', 'ph_issue_desc');
    setFieldLabel('edit-pdf-url', 'label_edit_pdf');
    setFieldPlaceholder('edit-pdf-url', 'ph_pdf');
    setFieldLabel('edit-cover-url', 'label_cover');
    setFieldPlaceholder('edit-cover-url', 'ph_cover');
    const editPreviewBtn = document.querySelector('#edit-modal .preview-btn');
    if (editPreviewBtn) editPreviewBtn.textContent = ta('btn_preview_cover');
    const removeCoverBtn = document.querySelector('#edit-cover-preview-wrap [data-action=\"remove-edit-cover\"]');
    if (removeCoverBtn) removeCoverBtn.textContent = ta('btn_remove_cover');
    const saveBtn = document.querySelector('#edit-modal .form-submit');
    if (saveBtn && !saveBtn.disabled) saveBtn.textContent = ta('btn_save');
    const cancelBtn = document.querySelector('#edit-modal [data-action=\"close-edit-modal\"]');
    if (cancelBtn) cancelBtn.textContent = ta('btn_cancel');

    const adminNavBtn = document.querySelector('nav .nav-admin-btn');
    if (adminNavBtn) adminNavBtn.textContent = ta('nav_admin');
  }

  // â”€â”€â”€ LANGUAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  window.setLang = function(lang) {
    if (!T[lang]) lang = 'ru';
    currentLang = lang;
    localStorage.setItem('triton_lang', lang);
    const ruBtn = document.getElementById('lang-ru');
    const enBtn = document.getElementById('lang-en');
    if (ruBtn) ruBtn.classList.toggle('active', lang === 'ru');
    if (enBtn) enBtn.classList.toggle('active', lang === 'en');
    document.documentElement.lang = lang;
    applyTranslations();
    // Re-render current visible page content
    if (pageState.hasHomePage && document.getElementById('page-home').classList.contains('active')) renderHomeIssues();
    if (pageState.hasIssuesPage && document.getElementById('page-issues').classList.contains('active')) renderIssuesPage(lastIssuesQuery);
    if (pageState.hasAdminPage && isLoggedIn) renderAdminList();
  };

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.innerHTML = tr(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = tr(el.getAttribute('data-i18n-ph'));
    });
    // Update PDF loading text
    const pdfTxt = document.getElementById('pdf-loading-text');
    if (pdfTxt) pdfTxt.textContent = tr('pdf_loading');
    // Update fullscreen button
    const fsBtn = document.getElementById('fs-btn');
    if (fsBtn && !document.fullscreenElement) fsBtn.textContent = tr('fs_enter');
    localizeAdminStaticTexts();
  }

  // â”€â”€â”€ FIREBASE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function getIssues() {
    try {
      const q = query(collection(db, COLLECTION), orderBy('uploadedAt', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { console.error(e); return []; }
  }
  async function addIssue(issue) { return await addDoc(collection(db, COLLECTION), issue); }
  async function updateIssue(id, data) { return await updateDoc(doc(db, COLLECTION, id), data); }
  async function removeIssue(id) { return await deleteDoc(doc(db, COLLECTION, id)); }

  // â”€â”€â”€ DRIVE CONVERTERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function driveToEmbed(url) {
    if (!url) return '';
    const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return 'https://drive.google.com/file/d/' + m[1] + '/preview';
    const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2) return 'https://drive.google.com/file/d/' + m2[1] + '/preview';
    return url;
  }
  function driveToDirectImage(url) {
    if (!url) return '';
    const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w400';
    const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2) return 'https://drive.google.com/thumbnail?id=' + m2[1] + '&sz=w400';
    return url;
  }

  // â”€â”€â”€ NAVIGATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function activatePage(page, options = {}) {
    const issueQuery = options.issueQuery || '';

    if (page === 'admin') {
      window.location.href = 'admin.html';
      return;
    }

    const targetPage = document.getElementById('page-' + page);
    if (!targetPage) return;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    targetPage.classList.add('active');

    const navEl = document.getElementById('nav-' + page);
    if (navEl) navEl.classList.add('active');

    window.scrollTo(0, 0);

    if (page === 'home') await renderHomeIssues();
    if (page === 'issues') await renderIssuesPage(issueQuery);
  }

  window.showPage = function(page) {
    return activatePage(page);
  };

  document.addEventListener('click', async event => {
    const langBtn = event.target.closest('[data-lang]');
    if (langBtn) {
      event.preventDefault();
      window.setLang(langBtn.dataset.lang);
      return;
    }

    const hrefEl = event.target.closest('[data-href]');
    if (hrefEl) {
      event.preventDefault();
      window.location.href = hrefEl.dataset.href;
      return;
    }

    const actionEl = event.target.closest('[data-action]');
    if (actionEl) {
      event.preventDefault();
      const { action, issueId } = actionEl.dataset;

      if (action === 'open-issue' && issueId) return window.readIssue(issueId);
      if (action === 'open-edit-issue' && issueId) return window.openEditModal(issueId);
      if (action === 'delete-issue' && issueId) return window.deleteIssue(issueId);
      if (action === 'toggle-fullscreen') return window.toggleNativeFullscreen();
      if (action === 'close-modal') return window.closeModal();
      if (action === 'login') return window.doLogin();
      if (action === 'logout') return window.doLogout();
      if (action === 'preview-upload-cover') return window.previewCoverUrl();
      if (action === 'publish-issue') return window.uploadIssue();
      if (action === 'preview-edit-cover') return window.previewEditCoverUrl();
      if (action === 'remove-edit-cover') return window.removeEditCover();
      if (action === 'save-edit') return window.saveEdit();
      if (action === 'close-edit-modal') return window.closeEditModal();
      return;
    }

    const pageEl = event.target.closest('[data-page]');
    if (pageEl) {
      event.preventDefault();
      await activatePage(pageEl.dataset.page);
      return;
    }
  });

  // â”€â”€â”€ SEARCH (NAV) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const navSearchInput = document.getElementById('nav-search-input');
  if (navSearchInput) {
    navSearchInput.addEventListener('keydown', async e => {
      if (e.key !== 'Enter') return;
      const q = e.target.value.trim();
      if (!q) return;
      await activatePage('issues', { issueQuery: q });
      e.target.value = '';
    });
  }

  // â”€â”€â”€ HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const COVER_THEME_COUNT = 5;

  function formatDate(d) {
    if (!d) return '';
    const [y, m] = d.split('-');
    const RU = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
    const EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${(currentLang === 'en' ? EN : RU)[parseInt(m)-1]} ${y}`;
  }

  function setHidden(el, hidden) {
    if (!el) return;
    el.classList.toggle('is-hidden', hidden);
  }

  function coverThemeClass(idx) {
    return `cover-theme-${Math.abs(idx) % COVER_THEME_COUNT}`;
  }

  function fallbackCover(issue, idx, opts = {}) {
    const small = Boolean(opts.small);
    const themeClass = coverThemeClass(idx);
    const issueLine = small ? '' : `<div class="mag-issue">${issue.date || ''}</div>`;
    const wave = small ? '' : '<div class="wave"></div>';
    const smallClass = small ? ' issue-cover-small' : '';
    const magNameClass = small ? 'mag-name mag-name-small' : 'mag-name';

    return `<div class="issue-cover ${themeClass}${smallClass}">
      <div class="issue-cover-inner">
        <div class="${magNameClass}">Triton</div>
        ${issueLine}
      </div>
      ${wave}
    </div>`;
  }

  function coverDiv(issue, idx, opts = {}) {
    const small = Boolean(opts.small);
    if (issue.coverUrl) {
      const themeClass = coverThemeClass(idx);
      const smallClass = small ? ' issue-cover-small' : '';
      return `<div class="issue-cover issue-cover-img-wrap ${themeClass}${smallClass}">
        <img
          src="${driveToDirectImage(issue.coverUrl)}"
          alt="${issue.title}"
          class="issue-cover-img js-cover-image"
          data-cover-theme="${themeClass}"
          data-cover-small="${small ? '1' : '0'}"
          data-cover-date="${issue.date || ''}"
        />
      </div>`;
    }
    return fallbackCover(issue, idx, { small });
  }

  function replaceBrokenIssueCover(img) {
    const wrap = img.closest('.issue-cover-img-wrap');
    if (!wrap) return;
    const themeClass = img.dataset.coverTheme || 'cover-theme-0';
    const small = img.dataset.coverSmall === '1';
    const date = img.dataset.coverDate || '';
    const indexMatch = themeClass.match(/cover-theme-(\d+)/);
    const themeIndex = indexMatch ? Number(indexMatch[1]) : 0;
    wrap.outerHTML = fallbackCover({ date }, themeIndex, { small });
  }

  function issueCard(issue, idx) {
    return `<div class="issue-card" data-action="open-issue" data-issue-id="${issue.id}">
      ${coverDiv(issue, idx)}
      <div class="issue-info">
        <h3>${issue.title}</h3>
        <div class="issue-date">${formatDate(issue.date)}</div>
        ${issue.desc ? `<div class="issue-desc">${issue.desc}</div>` : ''}
        <button class="read-btn">${tr('read_btn')}</button>
      </div>
    </div>`;
  }

  // ─── RENDER HOME ─────────────────────────────────────────
  async function renderHomeIssues() {
    const grid = document.getElementById('home-issues-grid');
    const empty = document.getElementById('home-empty');
    if (!grid || !empty) return;

    grid.className = 'issues-grid';
    grid.innerHTML = '<div class="loading-state">⏳</div>';

    const issues = await getIssues();
    allIssuesCache = issues;

    const statIssues = document.getElementById('stat-issues');
    if (statIssues) statIssues.textContent = issues.length;

    if (!issues.length) {
      grid.innerHTML = '';
      setHidden(empty, false);
      return;
    }

    setHidden(empty, true);
    const recent = issues.slice().reverse().slice(0, 4);

    if (recent.length === 1) {
      grid.className = 'issues-grid';
      grid.innerHTML = issueCard(recent[0], 0);
      return;
    }

    grid.className = 'issues-featured-grid';
    const [feat, ...rest] = recent;
    const featCard = `<div class="issue-card issue-card-featured" data-action="open-issue" data-issue-id="${feat.id}" data-badge="${tr('badge_latest')}">
      ${coverDiv(feat, 0)}
      <div class="issue-info">
        <h3>${feat.title}</h3>
        <div class="issue-date">${formatDate(feat.date)}</div>
        ${feat.desc ? `<div class="issue-desc issue-desc-featured">${feat.desc}</div>` : ''}
        <button class="read-btn">${tr('read_btn')}</button>
      </div>
    </div>`;

    const smallCards = rest.map((iss, i) => {
      const themeClass = coverThemeClass(i + 1);
      return `<div class="issue-card issue-card-small" data-action="open-issue" data-issue-id="${iss.id}">
        <div class="small-cover-wrap ${themeClass}">
          ${coverDiv(iss, i + 1, { small: true })}
        </div>
        <div class="issue-info">
          <h3>${iss.title}</h3>
          <div class="issue-date">${formatDate(iss.date)}</div>
          <button class="read-btn">${tr('read_btn_small')}</button>
        </div>
      </div>`;
    }).join('');

    grid.innerHTML = featCard + `<div class="issues-small-col">${smallCards}</div>`;
  }

  // ─── RENDER ISSUES PAGE ──────────────────────────────────
  async function renderIssuesPage(initialQuery = '') {
    const grid = document.getElementById('issues-page-grid');
    const empty = document.getElementById('issues-empty');
    const searchInput = document.getElementById('issues-search-input');
    const searchCount = document.getElementById('issues-search-count');
    const searchEmpty = document.getElementById('issues-search-empty');
    if (!grid || !empty || !searchInput || !searchCount || !searchEmpty) return;

    grid.innerHTML = '<div class="loading-state">⏳</div>';

    const issues = await getIssues();
    allIssuesCache = issues.slice().reverse();

    if (!issues.length) {
      grid.innerHTML = '';
      setHidden(empty, false);
      searchInput.value = '';
      searchCount.textContent = '';
      setHidden(searchEmpty, true);
      setHidden(grid, false);
      lastIssuesQuery = '';
      return;
    }

    setHidden(empty, true);
    const requestedQuery = (initialQuery || searchInput.value || '').trim();
    searchInput.value = requestedQuery;
    lastIssuesQuery = requestedQuery;

    if (requestedQuery) {
      filterIssues(requestedQuery);
      return;
    }

    searchCount.textContent = '';
    setHidden(searchEmpty, true);
    setHidden(grid, false);
    grid.innerHTML = allIssuesCache.map((iss, i) => issueCard(iss, i)).join('');
  }

  function filterIssues(rawQ) {
    const sourceQuery = (rawQ || '').trim();
    const q = sourceQuery.toLowerCase();
    lastIssuesQuery = sourceQuery;

    const grid = document.getElementById('issues-page-grid');
    const searchEmpty = document.getElementById('issues-search-empty');
    const count = document.getElementById('issues-search-count');
    if (!grid || !searchEmpty || !count) return;

    if (!q) {
      grid.innerHTML = allIssuesCache.map((iss, i) => issueCard(iss, i)).join('');
      setHidden(grid, false);
      setHidden(searchEmpty, true);
      count.textContent = '';
      return;
    }

    const filtered = allIssuesCache.filter(iss =>
      (iss.title || '').toLowerCase().includes(q) ||
      (iss.desc || '').toLowerCase().includes(q) ||
      (iss.date || '').includes(q)
    );

    if (!filtered.length) {
      setHidden(grid, true);
      setHidden(searchEmpty, false);
      count.textContent = '';
    } else {
      setHidden(grid, false);
      setHidden(searchEmpty, true);
      grid.innerHTML = filtered.map((iss, i) => issueCard(iss, i)).join('');
      count.textContent = `${filtered.length} ${tr('search_found')}`;
    }
  }

  const issuesSearchInput = document.getElementById('issues-search-input');
  if (issuesSearchInput) {
    issuesSearchInput.addEventListener('input', e => filterIssues(e.target.value));
  }

  // â”€â”€â”€ ADMIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function renderAdminPage() {
    const loginPanel = document.getElementById('admin-login');
    const dashboard = document.getElementById('admin-dashboard');
    if (!loginPanel || !dashboard) return;

    if (isLoggedIn) {
      setHidden(loginPanel, true);
      setHidden(dashboard, false);
      renderAdminList();
    } else {
      setHidden(loginPanel, false);
      setHidden(dashboard, true);
    }
  }

  async function renderAdminList() {
    const issues = await getIssues();
    const list = document.getElementById('admin-issues-list');
    if (!list) return;

    const listTitle = document.querySelector('.issues-list-panel h3');
    if (listTitle) {
      listTitle.innerHTML = `${ta('published_title')} <span class="issues-count" id="admin-count">${issues.length}</span>`;
    }

    if (!issues.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>${ta('empty_title')}</h3><p>${ta('empty_sub')}</p></div>`;
      return;
    }

    const rows = issues.slice().reverse().map((issue, idx) => {
      const themeClass = coverThemeClass(idx);
      const thumb = issue.coverUrl
        ? `<div class="admin-issue-thumb ${themeClass}">
            <img src="${driveToDirectImage(issue.coverUrl)}" alt="${issue.title}" class="admin-issue-thumb-img js-admin-thumb-image" />
          </div>`
        : `<div class="admin-issue-thumb ${themeClass}">Triton</div>`;

      return `<div class="admin-issue-row">
        ${thumb}
        <div class="admin-issue-info"><h4>${issue.title}</h4><span>${formatDate(issue.date)} · ${issue.coverUrl ? ta('cover_ok') : ta('cover_missing')}</span></div>
        <div class="admin-issue-actions">
          <button class="btn-edit" data-action="open-edit-issue" data-issue-id="${issue.id}">${ta('btn_edit')}</button>
          <button class="btn-view-small" data-action="open-issue" data-issue-id="${issue.id}">${ta('btn_view')}</button>
          <button class="btn-delete" data-action="delete-issue" data-issue-id="${issue.id}">${ta('btn_delete')}</button>
        </div>
      </div>`;
    }).join('');

    list.innerHTML = rows;
  }

  window.doLogin = function() {
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value;
    if (u === ADMIN_USER && p === ADMIN_PASS) {
      isLoggedIn = true;
      renderAdminPage();
      showToast(ta('toast_login_success'), 'success');
    } else {
      showToast(ta('toast_login_error'), 'error');
    }
  };

  window.doLogout = function() {
    isLoggedIn = false;
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    renderAdminPage();
  };

  window.previewCoverUrl = function() {
    const url = document.getElementById('up-cover-url').value.trim();
    if (!url) { showToast(ta('toast_cover_missing'), 'error'); return; }
    document.getElementById('cover-url-preview').src = driveToDirectImage(url);
    setHidden(document.getElementById('cover-url-preview-wrap'), false);
  };

  window.uploadIssue = async function() {
    const title  = document.getElementById('up-title').value.trim();
    const date   = document.getElementById('up-date').value;
    const desc   = document.getElementById('up-desc').value.trim();
    const pdfUrl = document.getElementById('up-pdf-url').value.trim();
    const cover  = document.getElementById('up-cover-url').value.trim();

    if (!title) { showToast(ta('toast_title_required'), 'error'); return; }
    if (!date)  { showToast(ta('toast_date_required'), 'error'); return; }
    if (!pdfUrl){ showToast(ta('toast_pdf_required'), 'error'); return; }

    const btn = document.querySelector('.upload-panel .form-submit');
    if (btn) {
      btn.textContent = ta('btn_saving');
      btn.disabled = true;
    }

    try {
      await addIssue({ title, date, desc, pdfUrl, coverUrl: cover||null, uploadedAt: new Date().toISOString() });
      ['up-title','up-date','up-desc','up-pdf-url','up-cover-url'].forEach(id => document.getElementById(id).value = '');
      setHidden(document.getElementById('cover-url-preview-wrap'), true);
      renderAdminList();
      renderHomeIssues();
      showToast(ta('toast_issue_published'), 'success');
    } catch (e) {
      showToast(ta('toast_try_again'), 'error');
    } finally {
      if (btn) {
        btn.textContent = ta('btn_publish');
        btn.disabled = false;
      }
    }
  };

  window.deleteIssue = async function(id) {
    if (!confirm(ta('confirm_delete'))) return;
    await removeIssue(id);
    renderAdminList();
    renderHomeIssues();
    showToast(ta('toast_issue_deleted'), 'success');
  };

  let editingId = null;
  window.openEditModal = async function(id) {
    const issues = await getIssues();
    const issue = issues.find(i => i.id === id);
    if (!issue) return;
    editingId = id;
    document.getElementById('edit-title').value = issue.title||'';
    document.getElementById('edit-date').value = issue.date||'';
    document.getElementById('edit-desc').value = issue.desc||'';
    document.getElementById('edit-pdf-url').value = issue.pdfUrl||'';
    document.getElementById('edit-cover-url').value = issue.coverUrl||'';
    document.getElementById('edit-subtitle').textContent = ta('issue_prefix') + issue.title;
    const wrap = document.getElementById('edit-cover-preview-wrap');
    const img  = document.getElementById('edit-cover-preview');
    if (issue.coverUrl) {
      img.src = driveToDirectImage(issue.coverUrl);
      setHidden(wrap, false);
    } else {
      img.src = '';
      setHidden(wrap, true);
    }
    document.getElementById('edit-modal').classList.add('open');
  };

  window.previewEditCoverUrl = function() {
    const url = document.getElementById('edit-cover-url').value.trim();
    if (!url) { showToast(ta('toast_cover_missing'), 'error'); return; }
    document.getElementById('edit-cover-preview').src = driveToDirectImage(url);
    setHidden(document.getElementById('edit-cover-preview-wrap'), false);
  };

  window.removeEditCover = function() {
    document.getElementById('edit-cover-url').value = '';
    setHidden(document.getElementById('edit-cover-preview-wrap'), true);
    document.getElementById('edit-cover-preview').src = '';
  };

  window.saveEdit = async function() {
    const title  = document.getElementById('edit-title').value.trim();
    const date   = document.getElementById('edit-date').value;
    const desc   = document.getElementById('edit-desc').value.trim();
    const pdfUrl = document.getElementById('edit-pdf-url').value.trim();
    const cover  = document.getElementById('edit-cover-url').value.trim();

    if (!title) { showToast(ta('toast_title_required'), 'error'); return; }
    if (!date)  { showToast(ta('toast_date_required'), 'error'); return; }

    const btn = document.querySelector('#edit-modal .form-submit');
    if (btn) {
      btn.textContent = ta('btn_saving');
      btn.disabled = true;
    }

    try {
      await updateIssue(editingId, { title, date, desc, pdfUrl: pdfUrl||null, coverUrl: cover||null });
      renderAdminList();
      renderHomeIssues();
      window.closeEditModal();
      showToast(ta('toast_issue_updated'), 'success');
    } catch (e) {
      showToast(ta('toast_save_error'), 'error');
    } finally {
      if (btn) {
        btn.textContent = ta('btn_save');
        btn.disabled = false;
      }
    }
  };

  window.closeEditModal = function() {
    const editModal = document.getElementById('edit-modal');
    if (!editModal) return;
    editModal.classList.remove('open');
    editingId = null;
  };
  const editModalEl = document.getElementById('edit-modal');
  if (editModalEl) {
    editModalEl.addEventListener('click', e => {
      if (e.target === editModalEl) window.closeEditModal();
    });
  }

  // â”€â”€â”€ PDF VIEWER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  window.readIssue = async function(id) {
    const issues = await getIssues();
    const issue = issues.find(i => i.id === id);
    if (!issue || !issue.pdfUrl) { showToast(ta('toast_pdf_missing'), 'error'); return; }
    document.getElementById('modal-title').textContent = issue.title;
    document.getElementById('modal-iframe').src = driveToEmbed(issue.pdfUrl);
    const ml = document.getElementById('modal-loading');
    setHidden(ml, false);
    document.getElementById('pdf-loading-text').textContent = tr('pdf_loading');
    document.getElementById('pdf-modal').classList.add('open');
    document.getElementById('modal-iframe').onload = () => setHidden(ml, true);
  };

  window.closeModal = function() {
    document.getElementById('pdf-modal').classList.remove('open');
    document.getElementById('modal-iframe').src = '';
    setHidden(document.getElementById('modal-loading'), true);
  };

  window.toggleNativeFullscreen = function() {
    const el = document.getElementById('pdf-modal');
    if (!document.fullscreenElement) {
      el.requestFullscreen && el.requestFullscreen();
      document.getElementById('fs-btn').textContent = tr('fs_exit');
    } else {
      document.exitFullscreen && document.exitFullscreen();
      document.getElementById('fs-btn').textContent = tr('fs_enter');
    }
  };

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      const fsBtn = document.getElementById('fs-btn');
      if (fsBtn) fsBtn.textContent = tr('fs_enter');
    }
  });

  const pdfModalEl = document.getElementById('pdf-modal');
  if (pdfModalEl) {
    pdfModalEl.addEventListener('click', e => {
      if (e.target === pdfModalEl) window.closeModal();
    });
  }

  document.addEventListener('error', event => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;

    if (target.classList.contains('js-cover-image')) {
      replaceBrokenIssueCover(target);
      return;
    }

    if (target.classList.contains('js-admin-thumb-image')) {
      const thumb = target.closest('.admin-issue-thumb');
      if (!thumb) return;
      target.remove();
      thumb.textContent = 'Triton';
      return;
    }

    if (target.id === 'cover-url-preview' || target.id === 'edit-cover-preview') {
      const previewWrap = target.closest('.cover-preview-wrap');
      setHidden(previewWrap, true);
    }
  }, true);

  // â”€â”€â”€ TOAST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.className = 'toast show ' + type;
    setTimeout(() => t.className = 'toast', 3500);
  }

  const loginPassInput = document.getElementById('login-pass');
  if (loginPassInput) {
    loginPassInput.addEventListener('keydown', e => { if (e.key === 'Enter') window.doLogin(); });
  }

  // â”€â”€â”€ INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  window.setLang(currentLang);
  if (pageState.hasAdminPage && !pageState.hasHomePage) {
    renderAdminPage();
  }




