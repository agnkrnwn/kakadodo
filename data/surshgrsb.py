import requests
import json
import re
import os
from time import sleep

def sanitize_filename(filename):
    # Mengganti spasi dan tanda hubung dengan underscore, menghapus karakter lain yang tidak diinginkan
    return re.sub(r'[^\w\-_\. ]', '', filename).replace(' ', '_').replace('-', '_').lower()

def fetch_surah_verses(surah_number, total_verses):
    base_url = f"https://api.alquran.cloud/v1/surah/{surah_number}/editions/quran-uthmani,en.transliteration,id.indonesian"
    verses = []

    print(f"Mengunduh surat nomor {surah_number}...")
    response = requests.get(base_url)
    if response.status_code == 200:
        data = response.json()
        if 'data' in data and isinstance(data['data'], list) and len(data['data']) == 3:
            for edition in data['data']:
                if 'ayahs' in edition and len(edition['ayahs']) == total_verses:
                    verses.append(edition)
                else:
                    print(f"Jumlah ayat tidak sesuai untuk surat nomor {surah_number}")
                    return None
        else:
            print(f"Format data tidak sesuai untuk surat nomor {surah_number}")
            return None
    else:
        print(f"Gagal mengunduh surat nomor {surah_number}: HTTP {response.status_code}")
        return None

    return verses

def save_to_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Data berhasil disimpan ke {filename}")

if __name__ == "__main__":
    surahs = {
        "Al-Fatihah": (1, 7),
        "An-Nas": (114, 6),
        "Al-Falaq": (113, 5),
        "Al-Ikhlas": (112, 4),
        "Al-Lahab": (111, 5),
        "An-Nasr": (110, 3),
        "Al-Kafirun": (109, 6),
        "Al-Kautsar": (108, 3),
        "Al-Maun": (107, 7),
        "Al-Quraisy": (106, 4),
        "Al-Fiil": (105, 5),
        "Al-Humazah": (104, 9),
        "Al-Asr": (103, 3),
        "At-Takatsur": (102, 8),
        "Al-Qariah": (101, 11),
        "Al-Adiyat": (100, 11),
        "Al-Zalzalah": (99, 8),
        "Al-Bayyinah": (98, 8),
        "Al-Qadr": (97, 5),
        "Al-Alaq": (96, 19),
        "At-Tin": (95, 8),
        "Al-Insyirah": (94, 8),
        "Ad-Dhuha": (93, 11),
        "Al-Lail": (92, 21),
        "Asy-Syams": (91, 15),
        "Al-Balad": (90, 20),
        "Al-Fajr": (89, 30),
        "Al-Ghasyiyah": (88, 26),
        "Al-Ala": (87, 19),
        "At-Tariq": (86, 17),
        "Yasin": (36, 83)
    }

    output_dir = "datax"
    os.makedirs(output_dir, exist_ok=True)

    for surah_name, (surah_number, total_verses) in surahs.items():
        surah_data = fetch_surah_verses(surah_number, total_verses)
        if surah_data:
            sanitized_name = sanitize_filename(surah_name)
            filename = os.path.join(output_dir, f"{sanitized_name}_data.json")
            save_to_json(surah_data, filename)
            print(f"Selesai mengunduh surat {surah_name}\n")
        else:
            print(f"Gagal mengunduh surat {surah_name}\n")
        
        # Menambahkan jeda untuk menghindari pembatasan rate
        sleep(1)

    print("Proses pengunduhan selesai.")