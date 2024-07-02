const surahSelect = document.getElementById('surah-select');
const ayahInput = document.getElementById('ayah-input');
const loadButton = document.getElementById('load-button');
const ayahContainer = document.getElementById('ayah-container');

const homeBtn = document.getElementById('home-btn');
const bookmarkBtn = document.getElementById('bookmark-btn');
const settingsBtn = document.getElementById('settings-btn');
const scrollTopBtn = document.getElementById('scroll-top-btn');

const bookmarkModal = document.getElementById('bookmark-modal');
const closeBookmarkModal = document.getElementById('close-bookmark-modal');
const bookmarkList = document.getElementById('bookmark-list');

const settingsModal = document.getElementById('settings-modal');
const closeSettingsModal = document.getElementById('close-settings-modal');
const fontSizeSlider = document.getElementById('font-size');
const darkModeToggle = document.getElementById('dark-mode-toggle');

const arabicFontSize = document.getElementById('arabic-font-size');
const arabicFont = document.getElementById('arabic-font');
const showArabic = document.getElementById('show-arabic');
const showTranslation = document.getElementById('show-translation');
const showTransliteration = document.getElementById('show-transliteration');

const bottomBar = document.getElementById('bottom-bar');
const closeBottomBar = document.getElementById('close-bottom-bar');
const resetSettings = document.getElementById('reset-settings');
const fontExample = document.getElementById('font-example');

let bookmarks = JSON.parse(localStorage.getItem('quran-bookmarks')) || [];

async function fetchSurahs() {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();
    return data.data;
}

fetchSurahs().then(surahs => {
    surahs.forEach(surah => {
        const option = document.createElement('option');
        option.value = surah.number;
        option.textContent = `${surah.number}. ${surah.englishName} (${surah.name})`;
        surahSelect.appendChild(option);
    });
});

loadButton.addEventListener('click', loadAyahs);

async function loadAyahs() {
    const surahId = surahSelect.value;
    const ayahNumber = ayahInput.value;
    
    if (surahId) {
        let url = `https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,id.indonesian,en.transliteration`;
        if (ayahNumber) {
            url = `https://api.alquran.cloud/v1/ayah/${surahId}:${ayahNumber}/editions/quran-uthmani,id.indonesian,en.transliteration`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (ayahNumber) {
            displaySingleAyah(data.data);
        } else {
            displayAyahs(data.data[0].ayahs, data.data[1].ayahs, data.data[2].ayahs);
        }
    }
}

function displayAyahs(arabicAyahs, indonesianAyahs, transliterationAyahs) {
    ayahContainer.innerHTML = '';

    // Tambahkan checkbox autoplay sebelum semua ayat
    const autoplayElement = document.createElement('div');
    autoplayElement.className = 'mb-4';
    autoplayElement.innerHTML = `
        <input type="checkbox" id="autoplay-checkbox">
        <label for="autoplay-checkbox">Autoplay audio?</label>
    `;
    ayahContainer.appendChild(autoplayElement);

    // Tambahkan ayat-ayat ke dalam kontainer
    arabicAyahs.forEach((ayah, index) => {
        const ayahElement = document.createElement('div');
        ayahElement.className = 'border-b pb-4 mb-4 last:border-b-0';

        const surahNumber = surahSelect.value;

        ayahElement.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">${surahNumber}:${ayah.numberInSurah}</span>
                <div>
                    <button class="play-btn text-green-500 mr-2" data-audio="https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="bookmark-btn text-green-500" data-surah="${surahNumber}" data-ayah="${ayah.numberInSurah}">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
            <p class="text-2xl text-right font-arabic mb-4 arabic-text">${ayah.text}</p>
            <p class="text-lg mb-2 italic transliteration-text">${transliterationAyahs[index].text}</p>
            <p class="mb-4 translation-text">${indonesianAyahs[index].text}</p>
        `;
        ayahContainer.appendChild(ayahElement);
    });

    addBookmarkListeners();
    addPlayListeners();
    addAutoplayListener();
    updateTextVisibility();
}

function addAutoplayListener() {
    const autoplayCheckbox = document.getElementById('autoplay-checkbox');

    if (autoplayCheckbox) {
        autoplayCheckbox.addEventListener('change', function() {
            if (autoplayCheckbox.checked) {
                startAutoplay();
            } else {
                stopAutoplay();
            }
        });
    }
}


function addAutoplayListener() {
    const autoplayCheckbox = document.getElementById('autoplay-checkbox');

    if (autoplayCheckbox) {
        autoplayCheckbox.addEventListener('change', function() {
            if (autoplayCheckbox.checked) {
                startAutoplay();
            } else {
                stopAutoplay();
            }
        });
    }
}

let currentAyahIndex = 0;
let audio = null;

function startAutoplay() {
    const playButtons = document.querySelectorAll('.play-btn');
    if (playButtons.length > 0) {
        playNextAyah(playButtons);
    }
}

function playNextAyah(playButtons) {
    if (currentAyahIndex < playButtons.length) {
        const playButton = playButtons[currentAyahIndex];
        const audioUrl = playButton.getAttribute('data-audio');
        
        // Hapus highlight dari ayat sebelumnya
        removeHighlight();

        // Tandai ayat yang sedang diputar
        const ayahElement = playButton.closest('.border-b');
        ayahElement.classList.add('playing');

        if (audio) {
            audio.pause();
        }
        
        audio = new Audio(audioUrl);
        audio.play();
        audio.onended = function() {
            currentAyahIndex++;
            playNextAyah(playButtons);
        };
    } else {
        currentAyahIndex = 0;
    }
}

function stopAutoplay() {
    if (audio) {
        audio.pause();
    }
    currentAyahIndex = 0;
    removeHighlight();
}

function addPlayListeners() {
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const audioUrl = button.getAttribute('data-audio');
            if (audio) {
                audio.pause();
            }
            audio = new Audio(audioUrl);
            audio.play();

            // Hapus highlight dari ayat sebelumnya
            removeHighlight();

            // Tandai ayat yang sedang diputar
            const ayahElement = button.closest('.border-b');
            ayahElement.classList.add('playing');
        });
    });
}

function removeHighlight() {
    const playingAyah = document.querySelector('.playing');
    if (playingAyah) {
        playingAyah.classList.remove('playing');
    }
}

function displaySingleAyah(ayahData) {
    ayahContainer.innerHTML = '';
    const arabicAyah = ayahData.find(a => a.edition.identifier === 'quran-uthmani');
    const indonesianAyah = ayahData.find(a => a.edition.identifier === 'id.indonesian');
    const transliterationAyah = ayahData.find(a => a.edition.identifier === 'en.transliteration');
    
    const ayahElement = document.createElement('div');
    ayahElement.className = 'border-b pb-4 mb-4';
    
    const surahNumber = surahSelect.value;
    
    ayahElement.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">${surahNumber}:${arabicAyah.numberInSurah}</span>
            <div>
                <button class="play-btn text-green-500 mr-2" data-audio="https://cdn.islamic.network/quran/audio/128/ar.alafasy/${arabicAyah.number}.mp3">
                    <i class="fas fa-play"></i>
                </button>
                <button class="bookmark-btn text-green-500" data-surah="${surahNumber}" data-ayah="${arabicAyah.numberInSurah}">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </div>
        <p class="text-2xl text-right font-arabic mb-4 arabic-text">${arabicAyah.text}</p>
        <p class="text-lg mb-2 italic transliteration-text">${transliterationAyah.text}</p>
        <p class="mb-4 translation-text">${indonesianAyah.text}</p>
    `;
    ayahContainer.appendChild(ayahElement);
    addBookmarkListeners();
    addPlayListeners();
    updateTextVisibility();
}

function addBookmarkListeners() {
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    bookmarkButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const surah = this.dataset.surah;
            const ayah = this.dataset.ayah;
            addBookmark(surah, ayah);
        });
    });
}

function addPlayListeners() {
    const playButtons = document.querySelectorAll('.play-btn');
    let currentAudio = null;

    playButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const audio = new Audio(this.dataset.audio);

            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                document.querySelectorAll('.play-btn i').forEach(i => i.className = 'fas fa-play');
            }

            if (icon.classList.contains('fa-play')) {
                audio.play();
                icon.className = 'fas fa-pause';
                currentAudio = audio;
            } else {
                audio.pause();
                audio.currentTime = 0;
                icon.className = 'fas fa-play';
                currentAudio = null;
            }

            audio.onended = function() {
                icon.className = 'fas fa-play';
                currentAudio = null;
            };
        });
    });
}
async function addBookmark(surah, ayah) {
    const surahName = surahSelect.options[surahSelect.selectedIndex].text.split('.')[1].trim();
    const bookmark = { surah, ayah, surahName };
    if (!bookmarks.some(b => b.surah === surah && b.ayah === ayah)) {
        bookmarks.push(bookmark);
        localStorage.setItem('quran-bookmarks', JSON.stringify(bookmarks));
        alert('Bookmark ditambahkan');
    } else {
        alert('Bookmark sudah ada');
    }
}
function clearBookmarks() {
    bookmarks = [];
    localStorage.removeItem('quran-bookmarks');
    displayBookmarks();
}

const clearBookmarksBtn = document.getElementById('clear-bookmarks');
clearBookmarksBtn.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua bookmark?')) {
        clearBookmarks();
    }
});

homeBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

bookmarkBtn.addEventListener('click', () => {
    displayBookmarks();
    bookmarkModal.style.display = 'flex';
});

closeBookmarkModal.addEventListener('click', () => {
    bookmarkModal.style.display = 'none';
});

settingsBtn.addEventListener('click', () => {
    bottomBar.classList.toggle('translate-y-full');
});

closeBottomBar.addEventListener('click', () => {
    bottomBar.classList.add('translate-y-full');
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

fontSizeSlider.addEventListener('input', (e) => {
    const size = e.target.value;
    updateLatinFontSize(size);
    localStorage.setItem('latinFontSize', size);
});
arabicFontSize.addEventListener('input', (e) => {
    document.querySelectorAll('.arabic-text').forEach(el => {
        el.style.fontSize = `${e.target.value}px`;
    });
    fontExample.style.fontSize = `${e.target.value}px`;
});

arabicFont.addEventListener('change', (e) => {
    document.querySelectorAll('.arabic-text').forEach(el => {
        el.style.fontFamily = e.target.value;
    });
    fontExample.style.fontFamily = e.target.value;
});

showArabic.addEventListener('change', updateTextVisibility);
showTranslation.addEventListener('change', updateTextVisibility);
showTransliteration.addEventListener('change', updateTextVisibility);

function updateTextVisibility() {
    document.querySelectorAll('.arabic-text').forEach(el => {
        el.style.display = showArabic.checked ? 'block' : 'none';
    });
    document.querySelectorAll('.translation-text').forEach(el => {
        el.style.display = showTranslation.checked ? 'block' : 'none';
    });
    document.querySelectorAll('.transliteration-text').forEach(el => {
        el.style.display = showTransliteration.checked ? 'block' : 'none';
    });
}

darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', null);
    }
});

function updateLatinFontSize(size) {
    document.documentElement.style.setProperty('--latin-font-size', `${size}px`);
    document.querySelectorAll('.transliteration-text').forEach(el => {
        el.style.fontSize = `${size}px`;
    });
    document.querySelectorAll('.translation-text').forEach(el => {
        el.style.fontSize = `${parseInt(size) - 2}px`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedFontSize = localStorage.getItem('latinFontSize');
    if (savedFontSize) {
        fontSizeSlider.value = savedFontSize;
        updateLatinFontSize(savedFontSize);
    }
});

resetSettings.addEventListener('click', () => {
    // Reset slider values
    fontSizeSlider.value = 16;
    arabicFontSize.value = 24;
    arabicFont.value = 'UthmanicHafs';

    // Reset checkboxes
    showArabic.checked = true;
    showTranslation.checked = true;
    showTransliteration.checked = true;
    darkModeToggle.checked = false;

    // Reset latin text font size
    updateLatinFontSize(16);
    document.documentElement.style.setProperty('--latin-font-size', '16px');

    // Reset Arabic text font size and family
    document.querySelectorAll('.arabic-text').forEach(el => {
        el.style.fontSize = '24px';
        el.style.fontFamily = 'UthmanicHafs';
    });

    // Reset font example
    fontExample.style.fontSize = '24px';
    fontExample.style.fontFamily = 'UthmanicHafs';

    // Update visibility
    updateTextVisibility();

    // Reset dark mode
    document.documentElement.classList.remove('dark');

    // Clear localStorage
    localStorage.removeItem('latinFontSize');
    localStorage.removeItem('arabicFontSize');
    localStorage.removeItem('arabicFont');
    localStorage.removeItem('darkMode');

    // Update UI to reflect changes
    updateUIFromSettings();
});

function updateUIFromSettings() {
    // Update latin text size
    document.querySelectorAll('.transliteration-text').forEach(el => {
        el.style.fontSize = `${fontSizeSlider.value}px`;
    });
    document.querySelectorAll('.translation-text').forEach(el => {
        el.style.fontSize = `${parseInt(fontSizeSlider.value) - 2}px`;
    });

    // Update Arabic text size and font
    document.querySelectorAll('.arabic-text').forEach(el => {
        el.style.fontSize = `${arabicFontSize.value}px`;
        el.style.fontFamily = arabicFont.value;
    });

    // Update text visibility
    updateTextVisibility();
}

function displayBookmarks() {
    bookmarkList.innerHTML = '';
    if (bookmarks.length === 0) {
        bookmarkList.innerHTML = '<li class="text-center text-gray-500">Tidak ada bookmark</li>';
    } else {
        bookmarks.forEach(bookmark => {
            const li = document.createElement('li');
            li.className = 'bookmark-item mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-center';
            li.innerHTML = `
                <span>${bookmark.surahName} - Ayat ${bookmark.ayah}</span>
                <button class="delete-bookmark ml-2 text-red-500 p-1 hover:bg-red-100 rounded" data-surah="${bookmark.surah}" data-ayah="${bookmark.ayah}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            li.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-bookmark')) {
                    surahSelect.value = bookmark.surah;
                    ayahInput.value = bookmark.ayah;
                    loadAyahs();
                    bookmarkModal.style.display = 'none';
                }
            });
            bookmarkList.appendChild(li);
        });
        addDeleteBookmarkListeners();
    }
}
function migrateBookmarks() {
    const updatedBookmarks = bookmarks.map(bookmark => {
        if (!bookmark.surahName) {
            const surahOption = Array.from(surahSelect.options).find(option => option.value === bookmark.surah);
            const surahName = surahOption ? surahOption.text.split('.')[1].trim() : `Surah ${bookmark.surah}`;
            return { ...bookmark, surahName };
        }
        return bookmark;
    });
    bookmarks = updatedBookmarks;
    localStorage.setItem('quran-bookmarks', JSON.stringify(bookmarks));
}

// Panggil fungsi ini saat aplikasi dimuat
migrateBookmarks();
function addDeleteBookmarkListeners() {
    const deleteButtons = document.querySelectorAll('.delete-bookmark');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const surah = this.dataset.surah;
            const ayah = this.dataset.ayah;
            deleteBookmark(surah, ayah);
        });
    });
}

function deleteBookmark(surah, ayah) {
    bookmarks = bookmarks.filter(b => !(b.surah === surah && b.ayah === ayah));
    localStorage.setItem('quran-bookmarks', JSON.stringify(bookmarks));
    displayBookmarks();
}

// Initialize settings
if (localStorage.getItem('darkMode') === 'enabled') {
    document.documentElement.classList.add('dark');
    darkModeToggle.checked = true;
}

document.getElementById('toggle-ayah-input').addEventListener('click', function() {
    const ayahInputContainer = document.getElementById('ayah-input-container');
    if (ayahInputContainer.classList.contains('hidden')) {
        ayahInputContainer.classList.remove('hidden');
    } else {
        ayahInputContainer.classList.add('hidden');
    }
});

document.getElementById('surah-select').addEventListener('change', function() {
    const surahTitle = this.options[this.selectedIndex].text;
    document.getElementById('current-surah-title').textContent = surahTitle;
});

window.addEventListener('scroll', function() {
    const ayahContainer = document.getElementById('ayah-container');
    const stickyHeader = document.getElementById('sticky-header');
    const rect = ayahContainer.getBoundingClientRect();
    if (rect.top <= 0) {
        stickyHeader.style.display = 'block';
    } else {
        stickyHeader.style.display = 'none';
    }
});