import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Kalendarz = lazy(() => import('./pages/Kalendarz'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Mapa = lazy(() => import('./pages/Mapa'));
const Artykuly = lazy(() => import('./pages/Artykuly'));
const ArtykulDetail = lazy(() => import('./pages/ArtykulDetail'));
const DodajEvent = lazy(() => import('./pages/DodajEvent'));
const MojeStarty = lazy(() => import('./pages/MojeStarty'));
const Wspolpraca = lazy(() => import('./pages/Wspolpraca'));
const PolitykaPrywatnosci = lazy(() => import('./pages/PolitykaPrywatnosci'));
const Admin = lazy(() => import('./pages/Admin'));

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '160px 20px' }}>
      <h1 style={{ fontSize: 'clamp(80px, 15vw, 160px)', color: '#FF5C00', lineHeight: 1 }}>404</h1>
      <p style={{ color: '#8C8B86', fontSize: 18, marginTop: 16 }}>
        Strona nie istnieje lub została usunięta.
      </p>
      <a href="/" className="btn-primary" style={{ display: 'inline-flex', marginTop: 32 }}>
        Wróć na stronę główną
      </a>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="loading-spinner" />
    </div>
  );
}

function Layout({ children, noFooter = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
      {!noFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/kalendarz" element={<Layout><Kalendarz /></Layout>} />
        <Route path="/event/:slug" element={<Layout><EventDetail /></Layout>} />
        <Route path="/mapa" element={<Layout noFooter><Mapa /></Layout>} />
        <Route path="/artykuly" element={<Layout><Artykuly /></Layout>} />
        <Route path="/artykuly/:slug" element={<Layout><ArtykulDetail /></Layout>} />
        <Route path="/dodaj" element={<Layout><DodajEvent /></Layout>} />
        <Route path="/moje-starty" element={<Layout><MojeStarty /></Layout>} />
        <Route path="/wspolpraca" element={<Layout><Wspolpraca /></Layout>} />
        <Route path="/polityka-prywatnosci" element={<Layout><PolitykaPrywatnosci /></Layout>} />
        <Route path="/admin" element={
          <Suspense fallback={<PageLoader />}>
            <Admin />
          </Suspense>
        } />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
