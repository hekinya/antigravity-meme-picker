// Antigravity Meme Drawer (Core Engine)
// Pure, decoupled, theme-agnostic implementation for Google Antigravity

(() => {
    if (window.__antigravityMemeSystemLoaded) return;
    window.__antigravityMemeSystemLoaded = true;

    const DEFAULT_MEMES = window.__DEFAULT_PRESET_MEMES || [];

    function getCustomMemes() {
        try {
            const raw = localStorage.getItem('ag_custom_memes');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveCustomMemes(list) {
        try {
            localStorage.setItem('ag_custom_memes', JSON.stringify(list));
        } catch (e) {
            console.error('[MemePicker] Save error:', e);
        }
    }

    let currentPack = 'default';
    let searchQuery = '';
    let pickerEl = null;
    let autoSendPref = localStorage.getItem('ag_meme_auto_send') !== 'false';

    const SMILE_ICON_SVG = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="1.8"/>
            <circle cx="8.5" cy="9.5" r="1.3" fill="currentColor"/>
            <circle cx="15.5" cy="9.5" r="1.3" fill="currentColor"/>
            <path d="M7.8 14.5C8.8 16.8 11.2 18 12 18C12.8 18 15.2 16.8 16.2 14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
    `;

    function ensureStyles() {
        if (document.getElementById('ag-meme-isolated-styles')) return;
        const style = document.createElement('style');
        style.id = 'ag-meme-isolated-styles';
        style.textContent = `
            .group\\/media:has(> div > img) {
                width: fit-content !important;
                max-width: 140px !important;
                display: block !important;
                margin: 6px 0 !important;
            }
            .group\\/media:has(> div > img) > div:first-child {
                max-width: 140px !important;
                width: fit-content !important;
                border: none !important;
                background: transparent !important;
                box-shadow: none !important;
            }
            .group\\/media:has(> div > img) img {
                max-width: 140px !important;
                max-height: 140px !important;
                width: 140px !important;
                height: auto !important;
                border-radius: 12px !important;
                object-fit: contain !important;
                filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35)) !important;
            }
            .group\\/media:has(img[alt]) > div:last-child:not(:has(img)) {
                display: none !important;
            }

            #ag-meme-picker {
                position: fixed;
                z-index: 999999;
                width: 440px;
                max-width: calc(100vw - 20px);
                background: var(--popover, #181324);
                color: var(--popover-foreground, #f3e8ff);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 16px;
                box-shadow: 0 20px 48px -6px rgba(0, 0, 0, 0.6), 0 0 24px rgba(168, 85, 247, 0.18);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                font-family: inherit;
                animation: agMemeFadeIn 0.14s cubic-bezier(0.16, 1, 0.3, 1);
                user-select: none;
                box-sizing: border-box;
            }
            #ag-meme-picker * {
                box-sizing: border-box;
            }
            @keyframes agMemeFadeIn {
                from { opacity: 0; transform: translateY(6px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            .ag-meme-topbar {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                background: rgba(0, 0, 0, 0.15);
            }
            .ag-meme-search-box {
                flex: 1;
                display: flex;
                align-items: center;
                position: relative;
            }
            .ag-meme-search-input {
                width: 100%;
                height: 30px;
                padding: 0 10px 0 28px;
                font-size: 12px;
                background: rgba(255, 255, 255, 0.07);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #ffffff;
                outline: none;
                transition: all 0.15s ease;
            }
            .ag-meme-search-input:focus {
                border-color: rgba(168, 85, 247, 0.6);
                background: rgba(255, 255, 255, 0.1);
            }
            .ag-meme-search-icon {
                position: absolute;
                left: 8px;
                opacity: 0.45;
                pointer-events: none;
            }
            .ag-meme-counter {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.45);
                white-space: nowrap;
                padding: 0 4px;
            }
            .ag-meme-btn-import {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 11px;
                padding: 4px 8px;
                border-radius: 6px;
                background: rgba(168, 85, 247, 0.18);
                color: #d8b4fe;
                border: 1px solid rgba(168, 85, 247, 0.35);
                cursor: pointer;
                transition: all 0.15s ease;
                white-space: nowrap;
            }
            .ag-meme-btn-import:hover {
                background: rgba(168, 85, 247, 0.3);
                border-color: rgba(168, 85, 247, 0.6);
            }
            .ag-meme-btn-close {
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                cursor: pointer;
                padding: 4px 6px;
                font-size: 15px;
                border-radius: 6px;
                line-height: 1;
                transition: all 0.15s ease;
            }
            .ag-meme-btn-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
            }

            .ag-meme-grid-viewport {
                max-height: 280px;
                min-height: 160px;
                overflow-y: auto;
                padding: 10px;
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
            }
            .ag-meme-grid-viewport::-webkit-scrollbar {
                width: 5px;
            }
            .ag-meme-grid-viewport::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
            .ag-meme-grid {
                display: grid !important;
                grid-template-columns: repeat(5, 1fr) !important;
                gap: 8px !important;
                width: 100% !important;
            }
            .ag-meme-card {
                position: relative;
                aspect-ratio: 1 / 1;
                width: 100% !important;
                max-width: none !important;
                min-width: 0 !important;
                display: flex !important;
                align-items: center;
                justify-content: center;
                padding: 6px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.16s ease;
            }
            .ag-meme-card:hover {
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(168, 85, 247, 0.45);
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
            }
            .ag-meme-card:active {
                transform: scale(0.96);
            }
            .ag-meme-card img {
                width: 100% !important;
                height: 100% !important;
                max-width: 100% !important;
                max-height: 100% !important;
                object-fit: contain !important;
                pointer-events: none;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
            }
            .ag-meme-card-delete {
                position: absolute;
                top: 2px;
                right: 2px;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: rgba(239, 68, 68, 0.85);
                color: #ffffff;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                line-height: 1;
                cursor: pointer;
            }
            .ag-meme-card:hover .ag-meme-card-delete {
                display: flex;
            }
            .ag-meme-empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 36px 12px;
                color: rgba(255, 255, 255, 0.4);
                font-size: 12px;
                gap: 8px;
            }

            .ag-meme-bottombar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.25);
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                font-size: 11px;
            }
            .ag-meme-tabs {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .ag-meme-tab {
                padding: 3px 8px;
                border-radius: 6px;
                background: transparent;
                border: 1px solid transparent;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .ag-meme-tab.active {
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(255, 255, 255, 0.18);
                color: #ffffff;
                font-weight: 500;
            }
            .ag-meme-tab:hover:not(.active) {
                background: rgba(255, 255, 255, 0.06);
                color: rgba(255, 255, 255, 0.85);
            }
            .ag-meme-autosend-toggle {
                display: flex;
                align-items: center;
                gap: 5px;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
            }
            .ag-meme-autosend-toggle input {
                accent-color: #a855f7;
                cursor: pointer;
            }
            #ag-meme-trigger-btn {
                margin-left: 2px;
            }
            #ag-meme-trigger-btn:hover {
                color: #c084fc !important;
            }
        `;
        document.head.appendChild(style);
    }

    function closePicker() {
        if (pickerEl && pickerEl.parentElement) {
            pickerEl.parentElement.removeChild(pickerEl);
            pickerEl = null;
        }
    }

    function positionPicker(triggerBtn) {
        if (!pickerEl || !triggerBtn) return;
        const rect = triggerBtn.getBoundingClientRect();
        const pickerWidth = 440;
        const pickerHeight = 360;

        let left = rect.left - 6;
        if (left + pickerWidth > window.innerWidth - 12) {
            left = window.innerWidth - pickerWidth - 12;
        }
        if (left < 12) left = 12;

        let bottom = window.innerHeight - rect.top + 12;
        if (bottom + pickerHeight > window.innerHeight) {
            pickerEl.style.bottom = 'auto';
            pickerEl.style.top = `${rect.bottom + 10}px`;
        } else {
            pickerEl.style.top = 'auto';
            pickerEl.style.bottom = `${bottom}px`;
        }
        pickerEl.style.left = `${left}px`;
    }

    function handleMemeSelect(meme, isShiftClick) {
        const editor = document.querySelector('div[data-lexical-editor="true"]');
        if (!editor) {
            closePicker();
            return;
        }

        const tagText = meme.tag || `[表情: ${meme.name}]`;
        const shouldSend = autoSendPref && !isShiftClick;

        editor.focus();

        const dt = new DataTransfer();
        dt.setData('text/plain', tagText);
        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: dt,
            bubbles: true,
            cancelable: true
        });
        editor.dispatchEvent(pasteEvent);

        closePicker();

        if (shouldSend) {
            const isGenerating = !!document.querySelector('[data-testid="input-cancel-button"]');
            if (isGenerating) return;

            setTimeout(() => {
                editor.focus();
                const submitBtn = document.querySelector('[data-testid="input-submit-button"]') ||
                                  document.querySelector('button[aria-label="Send"]') ||
                                  document.querySelector('button[aria-label="Submit"]');
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.click();
                } else {
                    const enterEvt = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                    });
                    editor.dispatchEvent(enterEvt);
                }
            }, 60);
        }
    }

    function handleImportFiles(files) {
        if (!files || !files.length) return;
        const customList = getCustomMemes();
        let loaded = 0;

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            const name = file.name.replace(/\.[^/.]+$/, "");
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUri = e.target.result;
                customList.push({
                    id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                    name: name,
                    tag: `[表情: ${name}]`,
                    preview: dataUri
                });
                loaded++;
                if (loaded === files.length) {
                    saveCustomMemes(customList);
                    currentPack = 'custom';
                    renderPickerContent();
                }
            };
            reader.readAsDataURL(file);
        });
    }

    function renderPickerContent() {
        if (!pickerEl) return;

        const allMemes = currentPack === 'default' ? DEFAULT_MEMES : getCustomMemes();
        const filtered = allMemes.filter(m => {
            if (!searchQuery) return true;
            return m.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

        const counterEl = pickerEl.querySelector('.ag-meme-counter');
        if (counterEl) {
            counterEl.innerText = `共 ${filtered.length} 张`;
        }

        const gridContainer = pickerEl.querySelector('.ag-meme-grid-viewport');
        if (!gridContainer) return;

        if (filtered.length === 0) {
            gridContainer.innerHTML = `
                <div class="ag-meme-empty">
                    <span>${searchQuery ? '未找到相关表情' : '该图库暂无表情，可点击右上角导入'}</span>
                </div>
            `;
            return;
        }

        gridContainer.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'ag-meme-grid';

        filtered.forEach(meme => {
            const card = document.createElement('div');
            card.className = 'ag-meme-card';
            card.title = `${meme.name} (点击发送，Shift+点击插入)`;
            card.innerHTML = `
                <img src="${meme.preview}" alt="${meme.name}" loading="lazy" />
                ${currentPack === 'custom' ? '<button class="ag-meme-card-delete" title="删除此表情">✕</button>' : ''}
            `;

            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('ag-meme-card-delete')) return;
                handleMemeSelect(meme, e.shiftKey);
            });

            if (currentPack === 'custom') {
                const delBtn = card.querySelector('.ag-meme-card-delete');
                if (delBtn) {
                    delBtn.onclick = (e) => {
                        e.stopPropagation();
                        const list = getCustomMemes().filter(x => x.id !== meme.id);
                        saveCustomMemes(list);
                        renderPickerContent();
                    };
                }
            }

            grid.appendChild(card);
        });

        gridContainer.appendChild(grid);
    }

    function openPicker(triggerBtn) {
        if (pickerEl) {
            closePicker();
            return;
        }

        ensureStyles();
        searchQuery = '';

        pickerEl = document.createElement('div');
        pickerEl.id = 'ag-meme-picker';

        const topbar = document.createElement('div');
        topbar.className = 'ag-meme-topbar';
        topbar.innerHTML = `
            <div class="ag-meme-search-box">
                <svg class="ag-meme-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" class="ag-meme-search-input" placeholder="搜索描述 / 关键词..." />
            </div>
            <span class="ag-meme-counter">共 0 张</span>
            <button class="ag-meme-btn-import" title="导入本地自定义图片">➕ 导入</button>
            <button class="ag-meme-btn-close" title="关闭 (Esc)">✕</button>
        `;

        const searchInput = topbar.querySelector('.ag-meme-search-input');
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            renderPickerContent();
        });

        const importBtn = topbar.querySelector('.ag-meme-btn-import');
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (e) => {
            handleImportFiles(e.target.files);
        });

        importBtn.onclick = () => fileInput.click();
        topbar.querySelector('.ag-meme-btn-close').onclick = closePicker;

        const viewport = document.createElement('div');
        viewport.className = 'ag-meme-grid-viewport';

        const bottombar = document.createElement('div');
        bottombar.className = 'ag-meme-bottombar';
        bottombar.innerHTML = `
            <div class="ag-meme-tabs">
                <button class="ag-meme-tab ${currentPack === 'default' ? 'active' : ''}" data-pack="default">默认</button>
                <button class="ag-meme-tab ${currentPack === 'custom' ? 'active' : ''}" data-pack="custom">我的收藏</button>
            </div>
            <label class="ag-meme-autosend-toggle" title="开启后点击表情直接发送">
                <input type="checkbox" id="ag-meme-autosend-cb" ${autoSendPref ? 'checked' : ''} />
                <span>点击直接发送</span>
            </label>
        `;

        bottombar.querySelectorAll('.ag-meme-tab').forEach(tab => {
            tab.onclick = () => {
                bottombar.querySelectorAll('.ag-meme-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentPack = tab.dataset.pack;
                renderPickerContent();
            };
        });

        const autoSendCb = bottombar.querySelector('#ag-meme-autosend-cb');
        autoSendCb.onchange = (e) => {
            autoSendPref = e.target.checked;
            localStorage.setItem('ag_meme_auto_send', autoSendPref ? 'true' : 'false');
        };

        pickerEl.appendChild(topbar);
        pickerEl.appendChild(viewport);
        pickerEl.appendChild(bottombar);

        document.body.appendChild(pickerEl);
        positionPicker(triggerBtn);
        renderPickerContent();

        setTimeout(() => searchInput.focus(), 50);
    }

    function mountMemeButton() {
        if (document.getElementById('ag-meme-trigger-btn')) return;

        const addBtn = document.querySelector('button[aria-label="Add context"]');
        if (!addBtn || !addBtn.parentElement) return;

        const btn = document.createElement('button');
        btn.id = 'ag-meme-trigger-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label', '表情包');
        btn.setAttribute('data-no-drag', '');
        btn.title = '表情包';
        btn.className = 'ag-meme-btn p-1.5 rounded-full text-secondary-foreground hover:bg-secondary cursor-pointer transition-colors flex items-center justify-center';
        btn.innerHTML = SMILE_ICON_SVG;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            openPicker(btn);
        });

        addBtn.parentElement.insertBefore(btn, addBtn.nextSibling);
    }

    function renderChatMemes() {
        const defaultMemes = window.__DEFAULT_PRESET_MEMES || [];
        const customMemes = getCustomMemes();
        const allMemes = [...defaultMemes, ...customMemes];
        if (!allMemes.length) return;

        const memeMap = {};
        allMemes.forEach(m => memeMap[m.name] = m.preview);

        const nodes = document.querySelectorAll('[data-testid="user-message-content"] .whitespace-pre-wrap, .whitespace-pre-wrap');
        nodes.forEach(el => {
            if (el.dataset.agMemeRendered) return;
            const text = el.innerText || '';
            if (!text.includes('[表情:')) return;

            const standaloneMatch = text.trim().match(/^\[表情:\s*([^\]]+)\]$/);
            if (standaloneMatch) {
                const name = standaloneMatch[1].trim();
                const src = memeMap[name];
                if (src) {
                    el.dataset.agMemeRendered = 'true';
                    el.innerHTML = `
                        <div class="ag-standalone-bubble-meme" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2px;">
                            <img src="${src}" style="width:108px; height:108px; object-fit:contain; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3));" alt="${name}" title="[表情: ${name}]" />
                        </div>
                    `;
                    return;
                }
            }

            if (/\[表情:\s*[^\]]+\]/.test(text)) {
                let replaced = false;
                const newHtml = el.innerHTML.replace(/\[表情:\s*([^\]]+)\]/g, (match, p1) => {
                    const name = p1.trim();
                    const src = memeMap[name];
                    if (src) {
                        replaced = true;
                        return `<img src="${src}" style="display:inline-block; width:26px; height:26px; vertical-align:-6px; margin:0 3px; object-fit:contain;" alt="${name}" title="${match}" />`;
                    }
                    return match;
                });
                if (replaced) {
                    el.dataset.agMemeRendered = 'true';
                    el.innerHTML = newHtml;
                }
            }
        });
    }

    document.addEventListener('pointerdown', (e) => {
        if (!pickerEl) return;
        const triggerBtn = document.getElementById('ag-meme-trigger-btn');
        if (pickerEl.contains(e.target) || (triggerBtn && triggerBtn.contains(e.target))) {
            return;
        }
        closePicker();
    }, true);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && pickerEl) {
            closePicker();
        }
    });

    window.addEventListener('resize', () => {
        if (pickerEl) {
            const triggerBtn = document.getElementById('ag-meme-trigger-btn');
            positionPicker(triggerBtn);
        }
    });

    ensureStyles();
    mountMemeButton();
    renderChatMemes();

    setInterval(() => {
        mountMemeButton();
        renderChatMemes();
    }, 1000);

    const obs = new MutationObserver(() => {
        mountMemeButton();
        renderChatMemes();
    });
    obs.observe(document.body, { childList: true, subtree: true });
})();
