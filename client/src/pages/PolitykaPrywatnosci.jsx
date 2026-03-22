import React from 'react';
import { Helmet } from 'react-helmet-async';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{ fontSize: 20, marginBottom: 12 }}>{title}</h3>
      <div style={{ color: '#444', lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

function PolitykaPrywatnosci() {
  return (
    <>
      <Helmet>
        <title>Polityka prywatności | Startivo</title>
      </Helmet>

      <div className="page-header" style={{ paddingBottom: 60 }}>
        <div className="container">
          <span className="section-label">Dokumenty</span>
          <h1 style={{ color: 'white', fontSize: 'clamp(32px, 6vw, 72px)' }}>Polityka<br/>prywatności</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 14 }}>
            Ostatnia aktualizacja: 1 stycznia 2026
          </p>
        </div>
      </div>

      <div style={{ background: 'var(--cream)', padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ background: 'white', borderRadius: 'var(--r-xl)', padding: 48, border: '1px solid var(--cream-border)' }}>

            <Section title="1. Administrator danych">
              <p>Administratorem Twoich danych osobowych jest Startivo (startivo.pl). W sprawach dotyczących ochrony danych osobowych możesz kontaktować się pod adresem: <a href="mailto:kontakt@startivo.pl" style={{ color: 'var(--orange)' }}>kontakt@startivo.pl</a></p>
            </Section>

            <Section title="2. Jakie dane zbieramy">
              <p>Zbieramy następujące dane:</p>
              <ul style={{ marginLeft: 20, marginTop: 8 }}>
                <li>Adres email (przy zapisie do newslettera i ustawianiu przypomnień)</li>
                <li>Dane kontaktowe (przy wysyłaniu formularza kontaktowego)</li>
                <li>Dane wydarzeń (przy dodawaniu eventów przez organizatorów)</li>
                <li>Dane techniczne (adres IP, przeglądarka — w logach serwera)</li>
              </ul>
            </Section>

            <Section title="3. W jakim celu przetwarzamy dane">
              <ul style={{ marginLeft: 20 }}>
                <li>Wysyłka newslettera z informacjami o nowych startach (zgoda)</li>
                <li>Obsługa przypomnień o wydarzeniach (zgoda)</li>
                <li>Odpowiadanie na zapytania (prawnie uzasadniony interes)</li>
                <li>Weryfikacja zgłoszonych wydarzeń (wykonanie umowy)</li>
              </ul>
            </Section>

            <Section title="4. Podstawy prawne przetwarzania">
              <p>Dane przetwarzamy na podstawie art. 6 RODO:</p>
              <ul style={{ marginLeft: 20, marginTop: 8 }}>
                <li><strong>Zgoda</strong> (art. 6 ust. 1 lit. a) — newsletter, przypomnienia</li>
                <li><strong>Umowa</strong> (art. 6 ust. 1 lit. b) — obsługa zgłoszeń organizatorów</li>
                <li><strong>Prawnie uzasadniony interes</strong> (art. 6 ust. 1 lit. f) — bezpieczeństwo, analityka</li>
              </ul>
            </Section>

            <Section title="5. Przechowywanie danych">
              <p>Dane przechowujemy przez okres niezbędny do realizacji celów lub do czasu wycofania zgody. Dane z formularzy kontaktowych przechowujemy przez 2 lata.</p>
            </Section>

            <Section title="6. Twoje prawa">
              <p>Masz prawo do:</p>
              <ul style={{ marginLeft: 20, marginTop: 8 }}>
                <li>Dostępu do swoich danych</li>
                <li>Sprostowania danych</li>
                <li>Usunięcia danych ("prawo do bycia zapomnianym")</li>
                <li>Ograniczenia przetwarzania</li>
                <li>Przenoszenia danych</li>
                <li>Wniesienia sprzeciwu</li>
                <li>Wycofania zgody w każdym momencie</li>
              </ul>
              <p style={{ marginTop: 8 }}>Aby skorzystać z tych praw, napisz na: <a href="mailto:kontakt@startivo.pl" style={{ color: 'var(--orange)' }}>kontakt@startivo.pl</a></p>
            </Section>

            <Section title="7. Cookies">
              <p>Strona używa jedynie technicznych plików cookie niezbędnych do jej działania (np. sesja administratora). Nie używamy cookies reklamowych ani śledzących.</p>
            </Section>

            <Section title="8. Przekazywanie danych">
              <p>Nie sprzedajemy ani nie udostępniamy Twoich danych podmiotom trzecim do celów marketingowych. Dane mogą być przekazane wyłącznie dostawcom usług technicznych (hosting, email) na podstawie umów powierzenia przetwarzania danych.</p>
            </Section>

            <Section title="9. Kontakt">
              <p>W sprawach dotyczących polityki prywatności i ochrony danych skontaktuj się z nami:</p>
              <p style={{ marginTop: 8 }}><strong>Email:</strong> <a href="mailto:kontakt@startivo.pl" style={{ color: 'var(--orange)' }}>kontakt@startivo.pl</a></p>
              <p><strong>Strona:</strong> startivo.pl</p>
            </Section>

          </div>
        </div>
      </div>
    </>
  );
}

export default PolitykaPrywatnosci;
