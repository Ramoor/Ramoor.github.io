(function () {
  const runtimeEl = document.getElementById('runtimeshow');
  if (!runtimeEl) return;

  const publishDate = runtimeEl.getAttribute('data-publishDate');
  if (!publishDate) return;

  const startDate = new Date(publishDate);
  if (Number.isNaN(startDate.getTime())) return;

  const renderRuntime = () => {
    const now = new Date();
    const elapsed = now - startDate;

    const days = Math.floor(elapsed / 86400000);
    const hours = Math.floor((elapsed % 86400000) / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);

    runtimeEl.textContent = `${days} 天 ${String(hours).padStart(2, '0')} 小时 ${String(minutes).padStart(2, '0')} 分 ${String(seconds).padStart(2, '0')} 秒`;
  };

  renderRuntime();
  setInterval(renderRuntime, 1000);
})();
