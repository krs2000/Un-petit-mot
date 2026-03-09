// Application State
const state = {
    markedWords: new Set(),
    translations: {},
    originalText: '',
    sourceLanguage: 'auto',
    targetLanguage: 'es',
    availableLanguages: {}
};

// DOM Elements - Helper function
const el = id => document.getElementById(id);
const textInput = el('textInput');
const motItBtn = el('motItBtn');
const clearBtn = el('clearBtn');
const printBtn = el('printBtn');
const copyBtn = el('copyBtn');
const shareBtn = el('shareBtn');
const displayText = el('displayText');
const markedCount = el('markedCount');
const translatedCount = el('translatedCount');
const languagePair = el('languagePair');
const sourceLang = el('sourceLang');
const targetLang = el('targetLang');

// Initialize language dropdowns from server
async function initializeLanguageDropdowns() {
    try {
        const response = await fetch('/api/languages');
        const data = await response.json();
        const languages = data.languages;
        
        state.availableLanguages = languages;
        
        // Populate both dropdowns
        const populateSelect = (select, includeAuto = false) => {
            if (includeAuto) {
                const opt = document.createElement('option');
                opt.value = 'auto';
                opt.textContent = 'Detect (auto)';
                select.appendChild(opt);
            }
            Object.entries(languages).forEach(([code, name]) => {
                const opt = document.createElement('option');
                opt.value = code;
                opt.textContent = name;
                select.appendChild(opt);
            });
        };
        
        populateSelect(sourceLang, true);
        populateSelect(targetLang);
        
        // Set defaults
        sourceLang.value = languages['en'] ? 'en' : Object.keys(languages)[0];
        targetLang.value = languages['es'] ? 'es' : Object.keys(languages)[0];
        state.sourceLanguage = sourceLang.value;
        state.targetLanguage = targetLang.value;
    } catch (error) {
        console.error('Failed to load languages:', error);
        const fallback = { 'en': 'English', 'es': 'Spanish' };
        Object.entries(fallback).forEach(([code, name]) => {
            ['sourceLang', 'targetLang'].forEach(id => {
                const opt = document.createElement('option');
                opt.value = code;
                opt.textContent = name;
                el(id).appendChild(opt);
            });
        });
        targetLang.value = 'es';
    }
}

// Event Listeners
[
    [motItBtn, 'click', handleMotIt],
    [clearBtn, 'click', handleClear],
    [printBtn, 'click', () => window.print()],
    [copyBtn, 'click', handleCopy],
    [shareBtn, 'click', handleShare],
    [textInput, 'input', updateDisplay],
    [sourceLang, 'change', e => { state.sourceLanguage = e.target.value; updateStats(); }],
    [targetLang, 'change', e => { state.targetLanguage = e.target.value; updateStats(); }],
    [document, 'mouseup', handleTextSelection],
    [document, 'touchend', handleTextSelection],
].forEach(([elem, evt, handler]) => elem.addEventListener(evt, handler));

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeLanguageDropdowns);

// Language code to name mapping
const LANGUAGE_NAMES = {
    'auto': 'Auto', 'en': 'English', 'es': 'Spanish', 'nl': 'Dutch',
    'de': 'German', 'fr': 'French', 'pt': 'Portuguese'
};

/**
 * Handle "Translate" button click - translate marked words
 */
async function handleMotIt() {
    if (state.markedWords.size === 0) {
        showNotification('Please mark some words first!', 'info');
        return;
    }

    try {
        motItBtn.disabled = true;
        motItBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Translating...';

        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                words: Array.from(state.markedWords), 
                source: sourceLang.value, 
                target: targetLang.value 
            })
        });

        if (!response.ok) throw new Error('Translation failed');

        const data = await response.json();
        state.sourceLanguage = data.sourceLanguage || sourceLang.value;
        state.targetLanguage = data.targetLanguage || targetLang.value;
        
        data.translations.forEach(item => {
            state.translations[item.original.toLowerCase()] = item.translated;
        });

        updateDisplay();
        updateStats();
        showNotification(`✓ Translated ${data.translations.filter(t => !t.error).length} words`, 'success');
    } catch (error) {
        console.error('Translation error:', error);
        showNotification('Translation failed. Please try again.', 'error');
    } finally {
        motItBtn.disabled = false;
        motItBtn.innerHTML = '<i class="bi bi-play-circle"></i> Translate';
    }
}

// Build translation display text
const buildTranslationText = () => {
    const lines = [];
    Array.from(state.markedWords).forEach(word => {
        const t = state.translations[word.toLowerCase()] || '';
        lines.push(`${word} → ${t}`);
    });
    return lines.join('\n');
};

/**
 * Copy a summary of marked words and translations to clipboard
 */
function handleCopy() {
    if (state.markedWords.size === 0) {
        showNotification('No marked words to copy', 'info');
        return;
    }
    navigator.clipboard.writeText(buildTranslationText()).then(() => {
        showNotification('✓ Translations copied to clipboard', 'success');
    }).catch(err => {
        console.error('Copy failed', err);
        showNotification('Failed to copy', 'error');
    });
}

/**
 * Share translations using Web Share API if available, otherwise copy
 */
function handleShare() {
    if (state.markedWords.size === 0) {
        showNotification('No marked words to share', 'info');
        return;
    }

    const text = buildTranslationText();
    if (navigator.share) {
        navigator.share({ title: 'Un petit mot — translations', text }).catch(err => {
            if (err.name !== 'AbortError') console.error('Share failed', err);
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('✓ Copied to clipboard', 'success');
        }).catch(err => {
            console.error('Share fallback failed', err);
            showNotification('Failed to share', 'error');
        });
    }
}

/**
 * Handle text selection for marking words/phrases
 */
function handleTextSelection() {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length === 0) return;

    if (state.markedWords.has(selectedText)) {
        state.markedWords.delete(selectedText);
        delete state.translations[selectedText.toLowerCase()];
    } else {
        state.markedWords.add(selectedText);
    }

    updateDisplay();
    updateStats();
    window.getSelection().removeAllRanges();
}

/**
 * Update the display with marked and translated words
 */
function updateDisplay() {
    state.originalText = textInput.value;

    if (!state.originalText.trim()) {
        displayText.innerHTML = '<p class="placeholder">Your text with translations will appear here...</p>';
        return;
    }

    let html = '<p>';
    state.originalText.split(/(\s+)/).forEach(word => {
        if (/^\s+$/.test(word)) {
            html += word;
        } else if (state.markedWords.has(word)) {
            const trans = state.translations[word.toLowerCase()];
            html += `<span class="word marked">${escapeHtml(word)}${trans ? `<span class="translation">${escapeHtml(trans)}</span>` : ''}</span>`;
        } else {
            html += `<span class="word">${escapeHtml(word)}</span>`;
        }
    });

    html += '</p>';
    displayText.innerHTML = html;
    addWordClickHandlers();
}

/**
 * Add click handlers to individual words
 */
function addWordClickHandlers() {
    document.querySelectorAll('.word:not(.marked)').forEach(wordSpan => {
        wordSpan.addEventListener('click', function(e) {
            e.stopPropagation();
            const word = this.textContent.trim();
            if (word.length > 0) {
                state.markedWords.has(word) ? state.markedWords.delete(word) : state.markedWords.add(word);
                delete state.translations[word.toLowerCase()];
                updateDisplay();
                updateStats();
            }
        });
    });
}

/**
 * Clear all content and state
 */
function handleClear() {
    textInput.value = '';
    state.markedWords.clear();
    state.translations = {};
    state.originalText = '';
    updateDisplay();
    updateStats();
    showNotification('✓ Cleared all content', 'info');
}

/**
 * Update statistics display
 */
function updateStats() {
    markedCount.textContent = state.markedWords.size;
    translatedCount.textContent = Object.keys(state.translations).length;
    const sourceName = LANGUAGE_NAMES[state.sourceLanguage] || state.sourceLanguage;
    const targetName = LANGUAGE_NAMES[state.targetLanguage] || state.targetLanguage;
    languagePair.textContent = `${sourceName} → ${targetName}`;
}

/**
 * Show toast notification
 */
function showNotification(message, type = 'success') {
    const toastEl = el('notificationToast');
    const toastMsg = el('toastMessage');
    const toastHeader = toastEl.querySelector('.toast-header');
    
    toastMsg.textContent = message;
    
    const icons = { success: 'check-circle text-success', error: 'exclamation-circle text-danger', info: 'info-circle text-info' };
    const titles = { success: 'Success', error: 'Error', info: 'Info' };
    const icon = icons[type] || icons.info;
    const title = titles[type] || 'Info';
    
    toastHeader.innerHTML = `<i class="bi bi-${icon} me-2"></i><strong class="me-auto">${title}</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button>`;
    
    toastEl.classList.remove('hide');
    new bootstrap.Toast(toastEl, { autohide: true, delay: 3000 }).show();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize
updateDisplay();
updateStats();
