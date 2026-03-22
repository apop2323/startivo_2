-- 15 realistic events for 2026
INSERT INTO events (name, slug, sport_type, date_start, date_end, city, voivodeship, description, distance, difficulty, price, registration_url, organizer_name, status, featured)
VALUES
  ('Runmageddon Warszawa 2026', 'runmageddon-warszawa-2026', 'ocr', '2026-05-16', '2026-05-17', 'Warszawa', 'mazowieckie',
   'Największa przeszkodowa impreza w Polsce! Runmageddon Warszawa to trzy dystanse: Rekrut (5km), Classic (12km) i Hardcore (20km). Pokonaj ponad 50 przeszkód i sprawdź swoje możliwości.',
   '5km / 12km / 20km', 'hard', 199, 'https://runmageddon.pl', 'Runmageddon', 'published', true),

  ('Runmageddon Kraków 2026', 'runmageddon-krakow-2026', 'ocr', '2026-06-13', '2026-06-14', 'Kraków', 'małopolskie',
   'Runmageddon powraca do Krakowa! Trasy w malowniczym terenie z prawdziwymi przeszkodami militarnymi. Sprawdź się na dystansie Rekrut, Classic lub Hardcore.',
   '5km / 12km / 20km', 'hard', 199, 'https://runmageddon.pl', 'Runmageddon', 'published', false),

  ('Runmageddon Wrocław 2026', 'runmageddon-wroclaw-2026', 'ocr', '2026-07-11', '2026-07-12', 'Wrocław', 'dolnośląskie',
   'Letnia edycja Runmageddon we Wrocławiu. Adrenalina, błoto i przeszkody — trzy dystanse dla każdego poziomu zaawansowania.',
   '5km / 12km / 20km', 'hard', 209, 'https://runmageddon.pl', 'Runmageddon', 'published', false),

  ('HYROX Gdańsk 2026', 'hyrox-gdansk-2026', 'hyrox', '2026-03-28', '2026-03-28', 'Gdańsk', 'pomorskie',
   'HYROX to globalna seria zawodów fitness. 8km biegu przeplatane 8 stacjami ćwiczeń funkcjonalnych. Rywalizuj z najlepszymi w Polsce!',
   '8km + 8 stacji', 'hard', 399, 'https://hyrox.com', 'HYROX', 'published', true),

  ('HYROX Poznań 2026', 'hyrox-poznan-2026', 'hyrox', '2026-10-17', '2026-10-17', 'Poznań', 'wielkopolskie',
   'Jesienne zawody HYROX w Poznaniu. Zmierz się z 8 kilometrami biegu i 8 stacjami funkcjonalnymi: SkiErg, Burpee Broad Jumps, Row, Farmers Carry i więcej.',
   '8km + 8 stacji', 'hard', 399, 'https://hyrox.com', 'HYROX', 'published', false),

  ('Triathlon Gdynia 2026', 'triathlon-gdynia-2026', 'triathlon', '2026-07-19', '2026-07-19', 'Gdynia', 'pomorskie',
   'Legendarny triathlon nad Bałtykiem! Pływanie w Zatoce Gdańskiej, rower wzdłuż wybrzeża i bieg po bulwarze. Dystans olimpijski i sprint.',
   '1.5km / 40km / 10km', 'extreme', 280, 'https://triathlon-gdynia.pl', 'Stowarzyszenie Triathlonu Gdynia', 'published', true),

  ('Triathlon Olsztyn 2026', 'triathlon-olsztyn-2026', 'triathlon', '2026-08-09', '2026-08-09', 'Olsztyn', 'warmińsko-mazurskie',
   'Triathlon na Warmii i Mazurach — pływanie w krystalicznie czystym jeziorze, rower przez mazurskie wzgórza i bieg wokół Olsztyna.',
   '1.5km / 40km / 10km', 'extreme', 299, 'https://triathlon-olsztyn.pl', 'Klub Triathlonu Olsztyn', 'published', false),

  ('Bieg Łódź Maraton 2026', 'bieg-lodz-maraton-2026', 'running', '2026-04-19', '2026-04-19', 'Łódź', 'łódzkie',
   'Tradycyjny maraton uliczny przez serce Łodzi. Trasa biegnie przez zabytkową ul. Piotrkowską i parki miejskie. Dystanse: maraton, półmaraton i 10km.',
   '10km / 21km / 42km', 'easy', 60, 'https://lodz-maraton.pl', 'ŁKS Łódź', 'published', false),

  ('Bieg Katowice Urban Race 2026', 'bieg-katowice-urban-race-2026', 'running', '2026-05-24', '2026-05-24', 'Katowice', 'śląskie',
   'Miejski bieg uliczny w centrum Katowic. Trasa prowadzi przez najważniejsze miejsca miasta — Rynek, Spodek i Strefa Kultury. Dystans 5km i 10km.',
   '5km / 10km', 'medium', 80, 'https://katowice-run.pl', 'RunKatowice', 'published', false),

  ('Bieg Lublin Półmaraton 2026', 'bieg-lublin-polmaraton-2026', 'running', '2026-09-13', '2026-09-13', 'Lublin', 'lubelskie',
   'Jesień w Lublinie! Półmaraton przez historyczne centrum miasta i zielone parki. Idealna impreza dla biegaczy z całej wschodniej Polski.',
   '21km', 'medium', 120, 'https://polmaraton-lublin.pl', 'Lubelski Klub Biegacza', 'published', false),

  ('Ultra Trail Zakopane 2026', 'ultra-trail-zakopane-2026', 'trail', '2026-08-22', '2026-08-23', 'Zakopane', 'małopolskie',
   'Ekstremalne górskie zawody trail runningowe w Tatrach. Trasy prowadzą przez najpiękniejsze szlaki — Giewont, Kasprowy Wierch i Morskie Oko.',
   '25km / 50km / 100km', 'hard', 180, 'https://ultra-trail-zakopane.pl', 'Tatrzańskie Stowarzyszenie Biegowe', 'published', true),

  ('Bieszczady Ultra Run 2026', 'bieszczady-ultra-run-2026', 'trail', '2026-09-05', '2026-09-06', 'Lesko', 'podkarpackie',
   'Bieg przez dziewicze Bieszczady — jeden z najtrudniejszych i najpiękniejszych tereny w Polsce. Natura, cisza i wyjątkowa atmosfera.',
   '30km / 60km', 'hard', 150, 'https://bieszczady-ultra.pl', 'Bieszczadzki Klub Sportowy', 'published', false),

  ('Spartan Race Wrocław 2026', 'spartan-race-wroclaw-2026', 'ocr', '2026-04-25', '2026-04-26', 'Wrocław', 'dolnośląskie',
   'Spartan Race powraca do Wrocławia! Sprint (5km), Super (10km) i Beast (21km). Ponad 20 przeszkód, błoto, ścianki, liny — sprawdź swoje limity!',
   '5km / 10km / 21km', 'extreme', 249, 'https://spartanrace.pl', 'Spartan Race Poland', 'published', true),

  ('Wyścig Kolarski Mazury 2026', 'wyscig-kolarski-mazury-2026', 'cycling', '2026-06-07', '2026-06-07', 'Giżycko', 'warmińsko-mazurskie',
   'Kolarskie zawody szosowe wśród malowniczych jezior mazurskich. Trasy 60km i 120km przez najpiękniejsze zakątki Mazur.',
   '60km / 120km', 'medium', 80, 'https://mazury-bike.pl', 'Mazurski Klub Kolarski', 'published', false),

  ('Gran Fondo Wielkopolska 2026', 'gran-fondo-wielkopolska-2026', 'cycling', '2026-08-30', '2026-08-30', 'Poznań', 'wielkopolskie',
   'Wielkoformatowe zawody kolarskie przez Wielkopolskę. Trasy 80km i 160km dla amatorów i zaawansowanych kolarzy.',
   '80km / 160km', 'medium', 100, 'https://granfondo-wielkopolska.pl', 'Wielkopolski Związek Kolarski', 'published', true)

ON CONFLICT (slug) DO NOTHING;

-- 3 articles
INSERT INTO articles (title, slug, content, excerpt, author_name, sport_type, status)
VALUES
  ('Jak przygotować się do Hyrox? Kompleksowy przewodnik',
   'jak-przygotowac-sie-do-hyrox',
   E'# Jak przygotować się do Hyrox?\n\nHyrox to jedno z najszybciej rosnących wydarzeń fitness na świecie. Łączy bieganie z ćwiczeniami funkcjonalnymi w jednym formacie rywalizacji.\n\n## Czym jest Hyrox?\n\nHyrox to zawody składające się z 8 rund. Każda runda to 1 km biegu + jedna stacja funkcjonalna:\n\n1. SkiErg — 1000m\n2. Sanki — 50m\n3. Burpee Broad Jumps — 80m\n4. Wiosłowanie — 1000m\n5. Farmers Carry — 200m\n6. Lunges z sankami — 100m\n7. Wall Balls — 100 powtórzeń\n8. Assault Bike — 100 kalorii\n\n## Plan treningowy na 12 tygodni\n\n### Faza 1 (tygodnie 1-4): Baza\n- 3x bieganie w tygodniu (łącznie 20-25km)\n- 2x trening funkcjonalny\n- Nacisk na technikę\n\n### Faza 2 (tygodnie 5-8): Budowanie\n- 4x bieganie (25-35km tygodniowo)\n- 3x trening funkcjonalny\n- Wprowadzenie elementów specyficznych dla Hyrox\n\n### Faza 3 (tygodnie 9-12): Szczytowa forma\n- Symulacje wyścigu\n- Redukcja objętości, wzrost intensywności\n- Odpoczynek przed startem\n\n## Żywienie i regeneracja\n\nPrzed startem zadbaj o:\n- Odpowiednie nawodnienie (min. 2L wody dziennie)\n- Węglowodany w dniach poprzedzających start\n- Sen (8 godzin minimum)\n\n## Sprzęt\n\n- Buty do biegania (nie crossfit — komfort biegu priorytetowy)\n- Rękawiczki (opcjonalnie)\n- Pas neoprenowy (dla saneczkarzy)\n\n## Podsumowanie\n\nHyrox jest dostępny dla każdego, kto regularnie trenuje. Kluczem jest systematyczny trening i dobra strategia wyścigu. Powodzenia!',
   'Kompletny przewodnik przygotowania do zawodów Hyrox — plan treningowy, żywienie i strategia wyścigu dla każdego poziomu.',
   'Redakcja Startivo', 'hyrox', 'published'),

  ('OCR dla początkujących — jak zacząć przygodę z Runmageddon',
   'ocr-dla-poczatkujacych-runmageddon',
   E'# OCR dla początkujących — Runmageddon\n\nOCR (Obstacle Course Racing) to jeden z najdynamiczniej rozwijających się sportów w Polsce. Runmageddon jest największą polską serią tych zawodów.\n\n## Dlaczego OCR?\n\nZawody przeszkodowe to coś więcej niż bieg. To:\n- Test siły i wytrzymałości\n- Wyjątkowa atmosfera (błoto, przeszkody, muzyka)\n- Świetna społeczność\n- Przygoda dla każdego poziomu\n\n## Dystanse w Runmageddon\n\n### Rekrut (5km)\nIdealny dystans dla początkujących. Około 20 przeszkód, teren umiarkowanie wymagający. Ukończy go każdy, kto regularnie ćwiczy.\n\n### Classic (12km)\nŚredniozaawansowany dystans. 30+ przeszkód, bardziej wymagający teren. Zalecane minimum 3-4 miesiące treningu.\n\n### Hardcore (20km)\nDla weteranów i doświadczonych sportowców. 50+ przeszkód, ekstremalne warunki. Nie dla początkujących!\n\n## Jak się przygotować?\n\n### Minimum 3 miesiące przed startem\n1. Zacznij biegać (3x tygodniowo)\n2. Trening siłowy (podciąganie, pompki, brzuszki)\n3. Ćwiczenia z własną masą ciała\n\n### Tydzień przed startem\n- Odpoczynek i regeneracja\n- Sprawdź sprzęt\n- Przygotuj strój który możesz zabrudzić\n\n## Co zabrać?\n\n- Stare buty z kolcami lub trail\n- Ciasno przylegająca koszulka\n- Strój kompresyjny\n- Rękawice robocze (opcjonalnie)\n- Zmianę ubrań na po starcie\n\n## Mentalne przygotowanie\n\nNajważniejsze: nie poddawaj się! Każdą przeszkodę można pokonać lub ominąć (z karą biegową). Liczy się ukończenie, nie czas.\n\nDo zobaczenia na trasie!',
   'Wszystko co musisz wiedzieć przed pierwszym startem w Runmageddon — dystanse, przygotowanie fizyczne i praktyczne porady dla nowicjuszy.',
   'Redakcja Startivo', 'ocr', 'published'),

  ('Triathlon od zera — jak zaplanować pierwszy sezon',
   'triathlon-od-zera-pierwszy-sezon',
   E'# Triathlon od zera — pierwszy sezon\n\nTriathlon to jedno z najbardziej kompleksowych wyzwań sportowych. Pływanie, kolarstwo i bieganie w jednym wyścigu — brzmi przerażająco? Nie musi!\n\n## Wybierz dystans\n\n### Sprint\n- Pływanie: 750m\n- Rower: 20km\n- Bieg: 5km\n- Czas ukończenia: 1-2 godziny\n- **Idealny na początek**\n\n### Olimpijski\n- Pływanie: 1500m\n- Rower: 40km\n- Bieg: 10km\n- Czas ukończenia: 2-4 godziny\n- Dla osób z podstawą sportową\n\n## Sprzęt\n\n### Niezbędny minimum\n- Rower (szosowy lub MTB na start)\n- Kask (obowiązkowo!)\n- Strój triathlonowy lub szortki+koszulka\n- Okulary pływackie + czepek\n- Buty biegowe\n\n### Warto mieć\n- Komputer rowerowy\n- Pas tętna\n- Pianka triathlonowa (przy zimnej wodzie)\n\n## Plan treningowy dla początkujących (16 tygodni)\n\n### Tygodniowy rozkład\n- Poniedziałek: Pływanie techniczne\n- Wtorek: Bieganie spokojne\n- Środa: Rower + bieganie (brick)\n- Czwartek: Siłownia/odpoczynek\n- Piątek: Pływanie\n- Sobota: Długi rower\n- Niedziela: Odpoczynek\n\n## Strefa zmiany (T1 i T2)\n\nPrzejście między dyscyplinami to osobna umiejętność. Ćwicz:\n- Szybkie zakładanie butów\n- Spinanie kasku\n- Organizację strefy\n\n## Żywienie na wyścigu\n\n- Żele energetyczne co 30-40 min na rowerze\n- Picie na każdym punkcie\n- Nie eksperymentuj w dniu wyścigu!\n\n## Podsumowanie\n\nTriathlon to przygoda na całe życie. Zacznij od sprintu, ciesz się procesem i stopniowo zwiększaj dystanse. Do zobaczenia na starcie!',
   'Praktyczny przewodnik dla każdego kto chce wystartować w pierwszym triathlonie — dystanse, sprzęt, trening i wskazówki na dzień wyścigu.',
   'Redakcja Startivo', 'triathlon', 'published')

ON CONFLICT (slug) DO NOTHING;

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('hero_headline_1', 'ZNAJDŹ SWÓJ'),
  ('hero_headline_2', 'NASTĘPNY START.'),
  ('hero_subtitle', 'Biegi, triathlony, OCR, Hyrox — wszystkie polskie zawody sportowe w jednym miejscu.')
ON CONFLICT (key) DO NOTHING;
