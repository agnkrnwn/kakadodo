let currentVerse = 1;
const totalVerses = 83;
let yasinData;

const verseContainer = document.getElementById('verseContainer');
const darkModeToggle = document.getElementById('darkModeToggle');
const prevVerseBtn = document.getElementById('prevVerse');
const nextVerseBtn = document.getElementById('nextVerse');
const verseNumberSpan = document.getElementById('verseNumber');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
const audioPlayer = document.getElementById('audioPlayer');
const bookmarksContainer = document.getElementById('bookmarksContainer');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const arabicFontSelect = document.getElementById('arabicFontSelect');
const showArabicCheckbox = document.getElementById('showArabic');
const showTranslationCheckbox = document.getElementById('showTranslation');
const showTransliterationCheckbox = document.getElementById('showTransliteration');
const resetSettingsBtn = document.getElementById('resetSettings');

async function loadYasinData() {
    try {
        const response = await fetch('/asset/data/yasin_data.json');
        yasinData = await response.json();
    } catch (error) {
        console.error('Error loading Yasin data:', error);
        verseContainer.innerHTML = '<p class="text-red-500">Gagal memuat data. Silakan muat ulang halaman.</p>';
    }
}

async function fetchVerse(ayahNumber) {
    if (!yasinData) {
        await loadYasinData();
    }
    
    if (yasinData && yasinData[ayahNumber - 1]) {
        displayVerse(yasinData[ayahNumber - 1]);
        updateAudioSource(ayahNumber);
    } else {
        verseContainer.innerHTML = '<p class="text-red-500">Gagal memuat ayat. Data tidak ditemukan.</p>';
    }
}

function displayVerse(verseData) {
    const arabicText = verseData.find(v => v.edition.type === 'quran')?.text || '';
    const transliteration = verseData.find(v => v.edition.identifier === 'en.transliteration')?.text || '';
    const translation = verseData.find(v => v.edition.language === 'id')?.text || 'Terjemahan tidak tersedia';

    let verseHTML = '';
    if (showArabicCheckbox.checked) {
        verseHTML += `<p class="text-4xl text-right font-arabic leading-loose mb-6 text-yellow-300">${arabicText}</p>`;
    }
    if (showTransliterationCheckbox.checked) {
        verseHTML += `<p class="text-xl mb-4 text-blue-300 font-semibold">${transliteration}</p>`;
    }
    if (showTranslationCheckbox.checked) {
        verseHTML += `<p class="text-lg text-gray-100">${translation}</p>`;
    }
    verseHTML += `
        <button class="bookmark-btn mt-4 px-4 py-2 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-600 transition-colors">
            <i class="fas fa-bookmark mr-2"></i>
        </button>
    `;

    verseContainer.innerHTML = verseHTML;
    verseNumberSpan.textContent = `Ayat ${currentVerse} / ${totalVerses}`;
    updateNavigationButtons();

    const bookmarkBtn = verseContainer.querySelector('.bookmark-btn');
    bookmarkBtn.addEventListener('click', () => bookmarkVerse(currentVerse));
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

function bookmarkVerse(verseNumber) {
    let bookmarks = JSON.parse(localStorage.getItem('yasinBookmarks')) || [];
    if (!bookmarks.includes(verseNumber)) {
        bookmarks.push(verseNumber);
        localStorage.setItem('yasinBookmarks', JSON.stringify(bookmarks));
        alert(`Ayat ${verseNumber} telah ditambahkan ke bookmark.`);
        updateBookmarksList();
    } else {
        alert(`Ayat ${verseNumber} sudah ada dalam bookmark.`);
    }
}

function updateBookmarksList() {
    const bookmarks = JSON.parse(localStorage.getItem('yasinBookmarks')) || [];
    bookmarksContainer.innerHTML = '';
    bookmarks.forEach(verseNumber => {
        const bookmarkItem = document.createElement('div');
        bookmarkItem.className = 'p-2 bg-indigo-700 rounded mb-2 flex justify-between items-center';
        bookmarkItem.innerHTML = `
            <span>Ayat ${verseNumber}</span>
            <button class="go-to-verse px-2 py-1 bg-yellow-500 text-gray-900 rounded" data-verse="${verseNumber}">Buka</button>
        `;
        bookmarksContainer.appendChild(bookmarkItem);
    });

    document.querySelectorAll('.go-to-verse').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const verseNumber = parseInt(e.target.dataset.verse);
            currentVerse = verseNumber;
            fetchVerse(currentVerse);
            showPage('home');
        });
    });
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
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
        pageToShow.classList.remove('hidden');
    }
    sidebar.classList.add('-translate-x-full');
}

function updateFontSize(size) {
    document.documentElement.style.setProperty('--base-font-size', size + 'px');
}

function updateArabicFont(fontFamily) {
    document.documentElement.style.setProperty('--arabic-font', fontFamily);
}

// Event Listeners for settings
showArabicCheckbox.addEventListener('change', () => fetchVerse(currentVerse));
showTranslationCheckbox.addEventListener('change', () => fetchVerse(currentVerse));
showTransliterationCheckbox.addEventListener('change', () => fetchVerse(currentVerse));
resetSettingsBtn.addEventListener('click', resetSettings);

// Other existing event listeners
prevVerseBtn.addEventListener('click', () => changeVerse(-1));
nextVerseBtn.addEventListener('click', () => changeVerse(1));

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
        document.body.classList.remove('from-indigo-900', 'to-purple-800');
        document.body.classList.add('from-gray-100', 'to-gray-300');
        verseContainer.classList.remove('bg-opacity-20', 'bg-white');
        verseContainer.classList.add('bg-opacity-90', 'bg-gray-800');
        document.querySelectorAll('.text-yellow-300').forEach(el => el.classList.replace('text-yellow-300', 'text-indigo-300'));
        document.querySelectorAll('.text-blue-300').forEach(el => el.classList.replace('text-blue-300', 'text-yellow-300'));
        document.querySelectorAll('.text-gray-100').forEach(el => el.classList.replace('text-gray-100', 'text-gray-300'));
    } else {
        document.body.classList.remove('from-gray-100', 'to-gray-300');
        document.body.classList.add('from-indigo-900', 'to-purple-800');
        verseContainer.classList.remove('bg-opacity-90', 'bg-gray-800');
        verseContainer.classList.add('bg-opacity-20', 'bg-white');
        document.querySelectorAll('.text-indigo-300').forEach(el => el.classList.replace('text-indigo-300', 'text-yellow-300'));
        document.querySelectorAll('.text-yellow-300').forEach(el => el.classList.replace('text-yellow-300', 'text-blue-300'));
        document.querySelectorAll('.text-gray-300').forEach(el => el.classList.replace('text-gray-300', 'text-gray-100'));
    }
    darkModeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
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
loadYasinData().then(() => {
    fetchVerse(currentVerse);
    updateBookmarksList();
});

