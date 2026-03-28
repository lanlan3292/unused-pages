function showToast(msg, success = true) {
    const existing = document.getElementById('lz-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'lz-toast';
    toast.textContent = msg;
    toast.style.cssText = `
        position: fixed;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${success ? 'rgba(74,222,128,0.12)' : 'rgba(255,80,80,0.12)'};
        border: 1px solid ${success ? 'rgba(74,222,128,0.5)' : 'rgba(255,80,80,0.5)'};
        color: ${success ? '#4ade80' : '#ff8080'};
        padding: 11px 28px;
        border-radius: 50px;
        font-size: 13.5px;
        font-family: 'Noto Sans SC', monospace, sans-serif;
        letter-spacing: 0.05em;
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        box-shadow: 0 4px 24px ${success ? 'rgba(74,222,128,0.15)' : 'rgba(255,80,80,0.15)'};
        opacity: 0;
        transition: opacity 0.28s ease, transform 0.28s ease;
        z-index: 99999;
        pointer-events: none;
        white-space: nowrap;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }));

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2200);
}

function getMsg(success) {
    // 优先读页面的 i18n，fallback 到中文
    if (typeof window.getToastText === 'function') return window.getToastText(success);
    return success ? '✓ 已复制到剪贴板' : '✗ 复制失败，请手动复制';
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => showToast(getMsg(true)))
            .catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
        document.execCommand('copy');
        showToast(getMsg(true));
    } catch {
        showToast(getMsg(false), false);
    }
    document.body.removeChild(ta);
}