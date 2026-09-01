
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };

  function cleanText(s) {
    return (s || '').replace(/\s+/g, ' ').trim().slice(0, 100);
  }

  function track(name, params) {
    try {
      gtag('event', name, Object.assign({
        app_section: location.pathname.includes('games.html') ? 'games' : 'main'
      }, params || {}));
    } catch (e) {}
  }

  const sectionNames = {
    meeting: 'موعد الاجتماع',
    announcements: 'الإعلانات',
    program: 'برنامج الاجتماع',
    trips: 'الرحلات والمؤتمرات',
    hymns: 'الترانيم',
    media: 'الصور والفيديو',
    contact: 'تواصل معنا'
  };

  document.addEventListener('click', function (e) {
    const el = e.target.closest('button,a');
    if (!el) return;

    // Main app sections
    if (el.dataset && el.dataset.page) {
      track('section_open', {
        section_key: el.dataset.page,
        section_name: sectionNames[el.dataset.page] || cleanText(el.textContent)
      });
    }

    // Games section link
    const href = el.getAttribute('href') || '';
    if (/games\.html/i.test(href)) {
      track('section_open', {
        section_key: 'games',
        section_name: 'المسابقات'
      });
    }

    // Conference registration
    if (el.classList.contains('register-btn')) {
      track('conference_registration_click', {
        button_text: cleanText(el.textContent)
      });
    }

    // Contact call — no phone number is sent to Analytics
    if (href.startsWith('tel:')) {
      track('contact_call_click', {});
    }

    // Game menu choice
    if (el.classList.contains('game-card')) {
      const title = el.querySelector('h3');
      track('game_selected', {
        game_name: cleanText(title ? title.textContent : el.textContent)
      });
    }

    // Difficulty
    if (el.classList.contains('level-btn')) {
      const level = cleanText(el.childNodes[1]?.textContent || el.textContent)
        .replace(/أسئلة.*$/,'').trim();
      const gameTitle = document.getElementById('levelTitle');
      track('quiz_started', {
        game_name: cleanText(gameTitle ? gameTitle.textContent : ''),
        difficulty: level
      });
    }

    if (el.id === 'spinBtn') track('wheel_spin', {});
    if (el.id === 'rollBtn') track('dice_roll', {});
  });

  // Hymn/audio play
  document.addEventListener('play', function (e) {
    const audio = e.target;
    if (!audio || audio.tagName !== 'AUDIO') return;
    const box = audio.closest('.empty-card, .info-card, div');
    const title = box ? box.querySelector('h3') : null;
    track('hymn_play', {
      hymn_name: cleanText(title ? title.textContent : 'ترنيمة')
    });
  }, true);

  // Detect quiz completion and record score
  const observer = new MutationObserver(function () {
    const result = document.querySelector('#answers .result h3');
    if (!result || result.dataset.analyticsSent) return;

    const m = cleanText(result.textContent).match(/(\d+)\s*\/\s*(\d+)/);
    if (!m) return;

    result.dataset.analyticsSent = '1';
    const title = document.getElementById('quizTitle');
    const level = document.getElementById('difficultyChip');

    track('quiz_completed', {
      game_name: cleanText(title ? title.textContent : 'مسابقة'),
      difficulty: cleanText(level ? level.textContent : ''),
      score: Number(m[1]),
      total_questions: Number(m[2]),
      score_percent: Math.round(Number(m[1]) * 100 / Number(m[2]))
    });
  });

  observer.observe(document.documentElement, {childList:true, subtree:true});

  // Track first view of each app area
  track('app_view', {
    page_name: location.pathname.includes('games.html') ? 'المسابقات' : 'الرئيسية'
  });
})();
