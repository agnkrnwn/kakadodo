let darkMode = false;
let showArabic = true;
let showTranslation = true;
let arabicFontSize = 24;
let arabicFont = "'Amiri', serif";

async function loadSurahList() {
    try {
        const url = 'https://api.quran.com/api/v4/chapters?language=id';
        console.log('Fetching Surah list from:', url);
        const response = await fetch(url);
        const data = await response.json();
        const select = document.getElementById('surahSelect');
        data.chapters.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.id;
            option.textContent = `${surah.id}. ${surah.name_simple} (${surah.name_arabic})`;
            select.appendChild(option);
        });
        console.log('Surah list loaded successfully:', data.chapters);
    } catch (error) {
        console.error('Error loading Surah list:', error);
    }
}

async function loadSurah() {
    const surahId = document.getElementById('surahSelect').value;
    if (!surahId) return;

    // Tampilkan overlay loading
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');

    try {
        let pageNumber = 1;
        let allVerses = [];

        // Load all verses
        while (true) {
            const versesUrl = `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=id&words=true&translations=33&fields=text_uthmani,verse_key&page=${pageNumber}`;

            console.log('Fetching verses from:', versesUrl);

            const response = await fetch(versesUrl);
            const versesData = await response.json();

            if (!versesData.verses.length) {
                break; // No more verses to load
            }

            allVerses = [...allVerses, ...versesData.verses];
            pageNumber++;
        }

        console.log('All verses loaded:', allVerses);

        const contentDiv = document.getElementById('quranContent');
        contentDiv.innerHTML = '';

        // Render all verses
        allVerses.forEach(verse => {
            const verseDiv = document.createElement('div');
            verseDiv.className = 'mb-6 p-4 bg-white dark:bg-gray-700 rounded shadow';
            
            const arabicText = verse.text_uthmani || 'Teks Arab tidak tersedia';
            const translationText = verse.translations && verse.translations[0] ? 
                verse.translations[0].text : 'Terjemahan tidak tersedia';

            verseDiv.innerHTML = `
                ${showArabic ? `<div class="arabic-text text-right mb-2 dark:text-white" style="font-size: ${arabicFontSize}px; font-family: ${arabicFont};">${arabicText}</div>` : ''}
                ${showTranslation ? `<div class="text-gray-700 dark:text-gray-300 mb-2">${translationText}</div>` : ''}
            `;

            contentDiv.appendChild(verseDiv);
        });

        // Load audio for the whole Surah
        const audioResponse = await fetch(`https://api.quran.com/api/v4/chapter_recitations/7/${surahId}`);
        const audioData = await audioResponse.json();

        // Add audio player for the whole surah
        if (audioData.audio_file && audioData.audio_file.audio_url) {
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.innerHTML = `
                <audio id="surahAudio" controls class="w-full">
                    <source src="${audioData.audio_file.audio_url}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            `;
        }

    } catch (error) {
        console.error('Error loading Surah:', error);
    } finally {
        // Sembunyikan overlay loading setelah selesai
        loadingOverlay.classList.add('hidden');
    }
}



function setupEventListeners() {
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    document.getElementById('showArabic').addEventListener('change', toggleArabicText);
    document.getElementById('showTranslation').addEventListener('change', toggleTranslation);
    document.getElementById('arabicFontSize').addEventListener('input', changeArabicFontSize);
    document.getElementById('arabicFont').addEventListener('change', changeArabicFont);
    document.getElementById('resetDefault').addEventListener('click', resetToDefault);
    document.getElementById('settingsToggle').addEventListener('click', toggleSettings);
    document.getElementById('closeSettings').addEventListener('click', toggleSettings);
}

function toggleDarkMode() {
    darkMode = !darkMode;
    document.documentElement.classList.toggle('dark');
    document.body.classList.toggle('dark:bg-gray-800');
    console.log('Dark mode toggled:', darkMode);
}

function toggleArabicText() {
    showArabic = !showArabic;
    loadSurah();
    console.log('Show Arabic toggled:', showArabic);
}

function toggleTranslation() {
    showTranslation = !showTranslation;
    loadSurah();
    console.log('Show Translation toggled:', showTranslation);
}

function changeArabicFontSize(e) {
    arabicFontSize = e.target.value;
    loadSurah();
    console.log('Arabic font size changed to:', arabicFontSize);
}

function changeArabicFont(e) {
    arabicFont = e.target.value;
    loadSurah();
    console.log('Arabic font changed to:', arabicFont);
}

function resetToDefault() {
    showArabic = true;
    showTranslation = true;
    arabicFontSize = 24;
    arabicFont = "'Amiri', serif";
    document.getElementById('showArabic').checked = true;
    document.getElementById('showTranslation').checked = true;
    document.getElementById('arabicFontSize').value = 24;
    document.getElementById('arabicFont').value = "'Amiri', serif";
    loadSurah();
    console.log('Settings reset to default.');
}

function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.toggle('hidden');
    modal.classList.toggle('flex');
    console.log('Settings modal toggled:', !modal.classList.contains('hidden'));
}

document.addEventListener('DOMContentLoaded', () => {
    loadSurahList();
    setupEventListeners();
});
