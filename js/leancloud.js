(function (window, document) {
  const appId = 'lPTos9qTFk57xeK53vE7I61e-MdYXbMMI';
  const appKey = 'DpXRDnV0ErOnqjSiWrfRvGWm';
  const serverUrl = `https://${appId.slice(0, 8).toLowerCase()}.api.lncldglobal.com`;

  const siteUvEl = document.getElementById('busuanzi_value_site_uv');
  const sitePvEl = document.getElementById('busuanzi_value_site_pv');
  const pageViewEl = document.querySelector('.leancloud-visitors-count');

  if (!siteUvEl && !sitePvEl && !pageViewEl) return;

  const shouldCount = !['localhost', '127.0.0.1'].includes(window.location.hostname);

  const request = (method, path, data) => fetch(`${serverUrl}/1.1${path}`, {
    method,
    headers: {
      'X-LC-Id': appId,
      'X-LC-Key': appKey,
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : undefined
  }).then(async response => {
    const json = await response.json().catch(() => ({}));
    if (!response.ok || json.code) {
      throw new Error(json.error || `LeanCloud request failed: ${response.status}`);
    }
    return json;
  });

  const getOrCreateRecord = async target => {
    const data = await request('GET', `/classes/Counter?where=${encodeURIComponent(JSON.stringify({ target }))}`);
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }
    return request('POST', '/classes/Counter', { target, time: 0 });
  };

  const incrementRecord = objectId => request('PUT', `/classes/Counter/${objectId}`, {
    time: {
      __op: 'Increment',
      amount: 1
    }
  });

  const updateText = (element, value) => {
    if (element) {
      element.textContent = value;
    }
  };

  const shouldIncrementUv = () => {
    const key = 'LeanCloud_UV_Flag';
    const now = Date.now();
    const last = Number(localStorage.getItem(key) || 0);
    if (now - last <= 86400000) return false;
    localStorage.setItem(key, String(now));
    return true;
  };

  const normalizePath = () => decodeURI(window.location.pathname.replace(/\/*(index\.html)?$/, '/') || '/');

  const loadSitePv = async () => {
    if (!sitePvEl) return;
    const record = await getOrCreateRecord('site-pv');
    const nextValue = (record.time || 0) + (shouldCount ? 1 : 0);
    updateText(sitePvEl, nextValue);
    if (shouldCount) {
      await incrementRecord(record.objectId);
    }
  };

  const loadSiteUv = async () => {
    if (!siteUvEl) return;
    const record = await getOrCreateRecord('site-uv');
    const incr = shouldCount && shouldIncrementUv();
    updateText(siteUvEl, (record.time || 0) + (incr ? 1 : 0));
    if (incr) {
      await incrementRecord(record.objectId);
    }
  };

  const loadPageView = async () => {
    if (!pageViewEl) return;
    const record = await getOrCreateRecord(normalizePath());
    const nextValue = (record.time || 0) + (shouldCount ? 1 : 0);
    updateText(pageViewEl, nextValue);
    if (shouldCount) {
      await incrementRecord(record.objectId);
    }
  };

  Promise.all([loadSitePv(), loadSiteUv(), loadPageView()]).catch(error => {
    console.error('LeanCloud Counter Error:', error);
  });
})(window, document);
