// Application State
const state = {
    markedWords: new Set(),
    translations: {},
    originalText: '',
    sourceLanguage: 'auto',
    targetLanguage: 'es', // Default to Spanish
    availableLanguages: {} // Will be populated from /api/languages
};

// DOM Elements
const textInput = document.getElementById('textInput');
const motItBtn = document.getElementById('motItBtn');
const clearBtn = document.getElementById('clearBtn');
const printBtn = document.getElementById('printBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const displayText = document.getElementById('displayText');
const markedCount = document.getElementById('markedCount');
const translatedCount = document.getElementById('translatedCount');
const languagePair = document.getElementById('languagePair');

const sourceLang = document.getElementById('sourceLang');
const targetLang = document.getElementById('targetLang');

// Initialize language dropdowns from server
async function initializeLanguageDropdowns() {
    try {
        const response = await fetch('/api/languages');
        const data = await response.json();
        const languages = data.languages;
        
        // Store for later use
        state.availableLanguages = languages;
        
        // Populate source language dropdown
        const sourceOptions = sourceLang.querySelectorAll('option');
        const sourceAutoOption = sourceOptions[0]; // Keep "Detect (auto)" option
        
        for (const [code, name] of Object.entries(languages)) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            sourceLang.appendChild(option);
        }
        
        // Populate target language dropdown
        for (const [code, name] of Object.entries(languages)) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            targetLang.appendChild(option);
        }
        
        // Set default target language (Spanish)
        if (languages['es']) {
            targetLang.value = 'es';
            state.targetLanguage = 'es';
        } else {
            // Fallback to first available language
            const firstLang = Object.keys(languages)[0];
            targetLang.value = firstLang;
            state.targetLanguage = firstLang;
        }
    } catch (error) {
        console.error('Failed to load available languages:', error);
        // Fallback to hardcoded languages if API fails
        const fallbackLanguages = { 'en': 'English', 'es': 'Spanish' };
        for (const [code, name] of Object.entries(fallbackLanguages)) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            sourceLang.appendChild(option);
            
            const targetOption = document.createElement('option');
            targetOption.value = code;
            targetOption.textContent = name;
            targetLang.appendChild(targetOption);
        }
        targetLang.value = 'es';
    }
}

// Event Listeners
motItBtn.addEventListener('click', handleMotIt);
clearBtn.addEventListener('click', handleClear);
printBtn.addEventListener('click', handlePrint);
copyBtn.addEventListener('click', handleCopy);
shareBtn.addEventListener('click', handleShare);
textInput.addEventListener('input', updateDisplay);

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeLanguageDropdowns);

// Language code to name mapping
// Will be populated from the API, but has fallback values
const LANGUAGE_NAMES = {
    'auto': 'Auto',
    'en': 'English',
    'es': 'Spanish',
    'nl': 'Dutch',
    'de': 'German',
    'fr': 'French',
    'pt': 'Portuguese'
};

// Text Selection Handling
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('touchend', handleTextSelection);

/**
 * Handle "Mot it!" button click - translate marked words
 */
async function handleMotIt() {
    if (state.markedWords.size === 0) {
        alert('Please mark some words first!');
        return;
    }

    const wordsArray = Array.from(state.markedWords);
    
    try {
        motItBtn.disabled = true;
        motItBtn.textContent = '⏳ Translating...';

        // include selected source/target languages
        const payload = { words: wordsArray, source: sourceLang.value, target: targetLang.value };
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Translation failed');

        const data = await response.json();
        
        // Store language info and translations
        state.sourceLanguage = data.sourceLanguage || sourceLang.value;
        state.targetLanguage = data.targetLanguage || targetLang.value;
        
        data.translations.forEach(item => {
            state.translations[item.original.toLowerCase()] = item.translated;
        });

        updateDisplay();
        updateStats();
    } catch (error) {
        console.error('Translation error:', error);
        alert('Failed to translate. Please try again.');
    } finally {
        motItBtn.disabled = false;
        motItBtn.textContent = '🔤 Mot it!';
    }
}

/**
 * Print current translated display area
 */
function handlePrint() {
    window.print();
}

/**
 * Copy a summary of marked words and translations to clipboard
 */
function handleCopy() {
    if (state.markedWords.size === 0) {
        alert('No marked words to copy');
        return;
    }

    const lines = [];
    Array.from(state.markedWords).forEach(word => {
        const t = state.translations[word.toLowerCase()] || '';
        lines.push(`${word} → ${t}`);
    });

    const text = lines.join('\n');

    navigator.clipboard.writeText(text).then(() => {
        alert('Copied translations to clipboard');
    }).catch(err => {
        console.error('Copy failed', err);
        alert('Copy failed');
    });
}

/**
 * Share translations using Web Share API if available, otherwise copy
 */
function handleShare() {
    if (state.markedWords.size === 0) {
        alert('No marked words to share');
        return;
    }

    const lines = [];
    Array.from(state.markedWords).forEach(word => {
        const t = state.translations[word.toLowerCase()] || '';
        lines.push(`${word} → ${t}`);
    });

    const text = lines.join('\n');

    if (navigator.share) {
        navigator.share({
            title: 'Un petit mot — translations',
            text
        }).catch(err => console.error('Share failed', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Shared content copied to clipboard (no native share available)');
        }).catch(err => {
            console.error('Share fallback failed', err);
            alert('Share failed');
        });
    }
}

/**
 * Handle text selection for marking words/phrases
 */
function handleTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length === 0) return;

    // Toggle marking on selection
    if (state.markedWords.has(selectedText)) {
        state.markedWords.delete(selectedText);
        delete state.translations[selectedText.toLowerCase()];
    } else {
        state.markedWords.add(selectedText);
    }

    updateDisplay();
    updateStats();
    selection.removeAllRanges();
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
    const words = state.originalText.split(/(\s+)/); // Keep whitespace

    words.forEach(word => {
        if (/^\s+$/.test(word)) {
            // Preserve whitespace
            html += word;
        } else if (state.markedWords.has(word)) {
            // Marked word
            html += `<span class="word marked">${escapeHtml(word)}`;
            
            // Add translation if available
            if (state.translations[word.toLowerCase()]) {
                html += `<span class="translation">${escapeHtml(state.translations[word.toLowerCase()])}</span>`;
            }
            
            html += '</span>';
        } else {
            // Regular word - clickable
            html += `<span class="word">${escapeHtml(word)}</span>`;
        }
    });

    html += '</p>';
    displayText.innerHTML = html;

    // Add click handlers to non-marked words
    addWordClickHandlers();
}

/**
 * Add click handlers to individual words
 */
function addWordClickHandlers() {
    const words = document.querySelectorAll('.word:not(.marked)');
    
    words.forEach(wordSpan => {
        wordSpan.addEventListener('click', function(e) {
            e.stopPropagation();
            const word = this.textContent.trim();
            
            if (word.length > 0) {
                if (state.markedWords.has(word)) {
                    state.markedWords.delete(word);
                    delete state.translations[word.toLowerCase()];
                } else {
                    state.markedWords.add(word);
                }
                
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
    if (confirm('Clear all content? This cannot be undone.')) {
        textInput.value = '';
        state.markedWords.clear();
        state.translations = {};
        state.originalText = '';
        updateDisplay();
        updateStats();
    }
}

/**
 * Update statistics display
 */
function updateStats() {
    markedCount.textContent = state.markedWords.size;
    translatedCount.textContent = Object.keys(state.translations).length;
    
    // Display language pair
    const sourceName = LANGUAGE_NAMES[state.sourceLanguage] || state.sourceLanguage;
    const targetName = LANGUAGE_NAMES[state.targetLanguage] || state.targetLanguage;
    languagePair.textContent = `${sourceName} → ${targetName}`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize
updateDisplay();
updateStats();
