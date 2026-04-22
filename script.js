const config = window.SITE_CONFIG;
const latestGrid = document.getElementById('latest-grid');
const weeklyGrid = document.getElementById('weekly-grid');

document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('substack-name').textContent = new URL(config.substackBaseUrl).hostname.replace('www.', '');
document.querySelector('#about p').textContent = config.aboutText;

[
  'substack-link-nav',
  'substack-link-hero',
  'substack-link-about',
  'archive-link-latest',
  'archive-link-footer'
].forEach(id => {
  const el = document.getElementById(id);
  el.href = config.substackBaseUrl;
});

document.getElementById('linkedin-link').href = config.linkedinUrl;

function stripHtml(input = '') {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function truncate(text, max = 145) {
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
}

function isWeekly(post) {
  const haystack = `${post.title} ${post.summary}`.toLowerCase();
  return config.weeklyKeywords.some(keyword => haystack.includes(keyword.toLowerCase()));
}

function createCard(post, label) {
  const article = document.createElement('article');
  article.className = 'post-card';
  article.innerHTML = `
    <div class="post-meta">${formatDate(post.pubDate)}</div>
    <h3>${post.title}</h3>
    <p>${truncate(post.summary)}</p>
    <div class="card-footer">
      <span class="tag">${label}</span>
      <a class="text-link" href="${post.link}" target="_blank" rel="noopener">Read post</a>
    </div>
  `;
  return article;
}

function renderEmpty(target, message) {
  target.innerHTML = `<div class="empty-state">${message}</div>`;
}

fetch('./data/posts.json', { cache: 'no-store' })
  .then(response => response.json())
  .then(data => {
    const posts = (data.items || []).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      summary: stripHtml(item.description || item.content || '')
    }));

    if (!posts.length) {
      renderEmpty(latestGrid, 'Once you connect your Substack feed, your latest posts will show here.');
      renderEmpty(weeklyGrid, 'Your weekly outlooks will appear here once they are published.');
      return;
    }

    const latestPosts = posts.slice(0, config.maxLatestPosts);
    latestPosts.forEach(post => latestGrid.appendChild(createCard(post, isWeekly(post) ? 'Weekly Outlook' : 'Market Note')));

    const weeklyPosts = posts.filter(isWeekly).slice(0, config.maxWeeklyPosts);
    if (weeklyPosts.length) {
      weeklyPosts.forEach(post => weeklyGrid.appendChild(createCard(post, 'Weekly Outlook')));
    } else {
      renderEmpty(weeklyGrid, 'No weekly outlooks detected yet. Add titles like “Week Ahead” or “Weekly Outlook” and they will appear here automatically.');
    }
  })
  .catch(() => {
    renderEmpty(latestGrid, 'Unable to load posts right now. Make sure data/posts.json exists and your GitHub Action has run.');
    renderEmpty(weeklyGrid, 'Unable to load weekly outlooks right now.');
  });
