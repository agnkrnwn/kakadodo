let currentVerse = 1;
let totalVerses = 83;
let yasinData;
let currentSurah = 'Yasin';

const verseContainer = document.getElementById('verseContainer');
const darkModeToggle = document.getElementById('darkModeToggle');
const prevVerseBtn = document.getElementById('prevVerse');
const nextVerseBtn = document.getElementById('nextVerse');
const verseNumberSpan = document.getElementById('verseNumber');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
const audioPlayer = document.getElementById('audioPlayer');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const arabicFontSelect = document.getElementById('arabicFontSelect');
const showArabicCheckbox = document.getElementById('showArabic');
const showTranslationCheckbox = document.getElementById('showTranslation');
const showTransliterationCheckbox = document.getElementById('showTransliteration');
const resetSettingsBtn = document.getElementById('resetSettings');

async function loadSurahData(surahName) {
    try {
        const formattedName = surahName.toLowerCase().replace('-', '_');
        const response = await fetch(`/asset/data/${formattedName}_data.json`);
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${surahName} data:`, error);
        verseContainer.innerHTML = '<p class="text-red-500">Gagal memuat data. Silakan muat ulang halaman.</p>';
        return null;
    }
}

async function fetchVerse(ayahNumber) {
    let surahData;
    if (currentSurah === 'Yasin') {
        if (!yasinData) {
            yasinData = await loadSurahData('yasin');
        }
        surahData = yasinData;
    } else {
        surahData = await loadSurahData(currentSurah);
    }
    
    if (surahData && surahData[ayahNumber - 1]) {
        displayVerse(surahData[ayahNumber - 1]);
        updateAudioSource(ayahNumber);
    } else {
        verseContainer.innerHTML = '<p class="text-red-500">Gagal memuat ayat. Data tidak ditemukan.</p>';
    }
}

function searchSurah() {
    const searchTerm = document.getElementById('surahSearch').value.toLowerCase();
    const surahLinks = document.querySelectorAll('.short-surah');
    
    surahLinks.forEach(link => {
        const surahName = link.textContent.toLowerCase();
        if (surahName.includes(searchTerm)) {
            link.style.display = 'block';
        } else {
            link.style.display = 'none';
        }
    });
}

function displayVerse(verseData) {
    const arabicText = verseData.find(v => v.edition.type === 'quran')?.text || '';
    const transliteration = verseData.find(v => v.edition.identifier === 'en.transliteration')?.text || '';
    const translation = verseData.find(v => v.edition.language === 'id')?.text || 'Terjemahan tidak tersedia';

    let verseHTML = '';
    if (showArabicCheckbox.checked) {
        verseHTML += `<p class="text-4xl text-right font-arabic leading-loose mb-6 arabic-text">${arabicText}</p>`;
    }
    if (showTransliterationCheckbox.checked) {
        verseHTML += `<p class="text-xl mb-4 transliteration-text">${transliteration}</p>`;
    }
    if (showTranslationCheckbox.checked) {
        verseHTML += `<p class="text-lg translation-text">${translation}</p>`;
    }

    verseContainer.innerHTML = verseHTML;
    verseNumberSpan.textContent = `${currentSurah} - Ayat ${currentVerse}`;
    updateNavigationButtons();
    
    updateTextColors(document.body.classList.contains('dark'));
}

function updateNavigationButtons() {
    prevVerseBtn.disabled = currentVerse === 1;
    nextVerseBtn.disabled = currentVerse === totalVerses;
    prevVerseBtn.classList.toggle('opacity-50', prevVerseBtn.disabled);
    nextVerseBtn.classList.toggle('opacity-50', nextVerseBtn.disabled);
}

function changeVerse(direction) {
    const newVerse = currentVerse + direction;
    if (newVerse >= 1 && newVerse <= totalVerses) {
        verseContainer.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            currentVerse = newVerse;
            fetchVerse(currentVerse);
            verseContainer.classList.remove('scale-95', 'opacity-0');
        }, 300);
    }
}

function updateAudioSource(ayahNumber) {
    const audioSrc = `https://verse.mp3quran.net/arabic/mishary_alafasy/64/036${ayahNumber.toString().padStart(3, '0')}.mp3`;
    audioPlayer.src = audioSrc;
}

function resetSettings() {
    fontSizeSlider.value = 16;
    arabicFontSelect.value = 'Noto Naskh Arabic';
    showArabicCheckbox.checked = true;
    showTranslationCheckbox.checked = true;
    showTransliterationCheckbox.checked = true;
    updateFontSize(fontSizeSlider.value);
    updateArabicFont(arabicFontSelect.value);
    fetchVerse(currentVerse);
}

function showPage(pageId) {
    const pageToShow = document.getElementById(pageId);
    if (pageToShow && !pageToShow.classList.contains('hidden')) {
        pageToShow.classList.add('hidden');
        showPage('home');
    } else {
        document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
        if (pageToShow) {
            pageToShow.classList.remove('hidden');
        }
    }
    sidebar.classList.add('-translate-x-full');
}

function updateFontSize(size) {
    document.documentElement.style.setProperty('--base-font-size', size + 'px');
}

function updateArabicFont(fontFamily) {
    document.documentElement.style.setProperty('--arabic-font', fontFamily);
}

function updateTextColors(isDarkMode) {
    const arabicTextClass = isDarkMode ? 'text-yellow-300' : 'text-yellow-300';
    const transliterationClass = isDarkMode ? 'text-blue-200' : 'text-blue-300';
    const translationClass = isDarkMode ? 'text-gray-100' : 'text-gray-100';
    
    document.querySelectorAll('.arabic-text').forEach(el => {
        el.classList.remove('text-yellow-300', 'text-yellow-300');
        el.classList.add(arabicTextClass);
    });
    document.querySelectorAll('.transliteration-text').forEach(el => {
        el.classList.remove('text-blue-200', 'text-blue-300');
        el.classList.add(transliterationClass);
    });
    document.querySelectorAll('.translation-text').forEach(el => {
        el.classList.remove('text-gray-100', 'text-gray-100');
        el.classList.add(translationClass);
    });
}

// Event Listeners
showArabicCheckbox.addEventListener('change', () => fetchVerse(currentVerse));
showTranslationCheckbox.addEventListener('change', () => fetchVerse(currentVerse));
showTransliterationCheckbox.addEventListener('change', () => fetchVerse(currentVerse));
resetSettingsBtn.addEventListener('click', resetSettings);
prevVerseBtn.addEventListener('click', () => changeVerse(-1));
nextVerseBtn.addEventListener('click', () => changeVerse(1));

darkModeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark');
    if (isDarkMode) {
        document.body.classList.remove('from-indigo-900', 'to-purple-800');
        document.body.classList.add('from-gray-900', 'to-gray-800');
        verseContainer.classList.remove('bg-opacity-20', 'bg-white');
        verseContainer.classList.add('bg-opacity-90', 'bg-gray-800');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('from-gray-900', 'to-gray-800');
        document.body.classList.add('from-indigo-900', 'to-purple-800');
        verseContainer.classList.remove('bg-opacity-90', 'bg-gray-800');
        verseContainer.classList.add('bg-opacity-20', 'bg-white');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    updateTextColors(isDarkMode);
});

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(e.target.closest('.nav-link').dataset.page);
        });
    });

    fontSizeSlider.addEventListener('input', (e) => {
        updateFontSize(e.target.value);
    });

    arabicFontSelect.addEventListener('change', (e) => {
        updateArabicFont(e.target.value);
    });

    document.querySelectorAll('.short-surah').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const surahName = e.target.dataset.surah;
            currentSurah = surahName;
            const surahData = await loadSurahData(surahName);
            if (surahData) {
                yasinData = surahData;
                totalVerses = surahData.length;
                currentVerse = 1;
                fetchVerse(currentVerse);
                showPage('home');
            } else {
                alert(`Gagal memuat surat ${surahName}. Silakan coba lagi.`);
            }
        });
    });
    const surahSearch = document.getElementById('surahSearch');
    surahSearch.addEventListener('input', searchSurah);

    resetSettings();
});

// Simple swipe detection
let touchStartX = 0;
let touchEndX = 0;

function checkDirection() {
    if (touchEndX < touchStartX) changeVerse(1); // Swipe left
    if (touchEndX > touchStartX) changeVerse(-1); // Swipe right
}

verseContainer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

verseContainer.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    checkDirection();
});

// Initialize
loadSurahData('yasin').then((data) => {
    yasinData = data;
    fetchVerse(currentVerse);
});