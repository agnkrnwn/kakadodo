import requests
import json

def fetch_yasin_verses():
    base_url = "https://api.alquran.cloud/v1/ayah/36:{}/editions/quran-uthmani,en.transliteration,id.indonesian"
    verses = []

    for ayah_number in range(1, 84):  # Surat Yasin memiliki 83 ayat
        print(f"Mengunduh ayat {ayah_number}...")
        response = requests.get(base_url.format(ayah_number))
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and isinstance(data['data'], list):
                verses.append(data['data'])
            else:
                print(f"Format data tidak sesuai untuk ayat {ayah_number}")
        else:
            print(f"Gagal mengunduh ayat {ayah_number}: HTTP {response.status_code}")

    return verses

def save_to_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Data berhasil disimpan ke {filename}")

if __name__ == "__main__":
    yasin_data = fetch_yasin_verses()
    save_to_json(yasin_data, 'yasin_data.json')