/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { StudioPage } from './pages/StudioPage';
import { FilterType } from './engine/types';

const VALID_FILTERS: FilterType[] = ['sketch', 'oil', 'neon', 'film', 'halftone', 'kernel'];

function parseCurrentRoute(): { view: 'home' | 'studio'; filterId: FilterType } {
  if (typeof window === 'undefined') {
    return { view: 'home', filterId: 'sketch' };
  }

  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');

  let view: 'home' | 'studio' = 'home';
  let filterId: FilterType = 'sketch';

  // 1. Check Pathname: /studio or /studio/:filterId
  if (pathname === '/studio' || pathname.startsWith('/studio/')) {
    view = 'studio';
    const sub = pathname.replace(/^\/studio\/?/, '').split('/')[0];
    if (VALID_FILTERS.includes(sub as FilterType)) {
      filterId = sub as FilterType;
    }
    return { view, filterId };
  }

  // 2. Check Hash: #studio or #studio/:filterId
  if (hash === 'studio' || hash.startsWith('studio/')) {
    view = 'studio';
    const sub = hash.replace(/^studio\/?/, '').split('/')[0];
    if (VALID_FILTERS.includes(sub as FilterType)) {
      filterId = sub as FilterType;
    }
    return { view, filterId };
  }

  return { view: 'home', filterId: 'sketch' };
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'studio'>(() => parseCurrentRoute().view);
  const [activeStudioFilter, setActiveStudioFilter] = useState<FilterType>(() => parseCurrentRoute().filterId);

  // Sync route on popstate (back/forward) and hashchange
  useEffect(() => {
    const syncRoute = () => {
      const { view, filterId } = parseCurrentRoute();
      setCurrentView(view);
      setActiveStudioFilter(filterId);
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  const navigateToStudio = (filterId: FilterType = 'sketch') => {
    const targetFilter = VALID_FILTERS.includes(filterId) ? filterId : 'sketch';
    setActiveStudioFilter(targetFilter);
    setCurrentView('studio');
    const newPath = `/studio/${targetFilter}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({ view: 'studio', filterId: targetFilter }, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateToHome = () => {
    setCurrentView('home');
    if (window.location.pathname !== '/') {
      window.history.pushState({ view: 'home' }, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#08070D]">
      {currentView === 'home' ? (
        <HomePage onNavigateToStudio={navigateToStudio} />
      ) : (
        <StudioPage
          initialFilter={activeStudioFilter}
          onBackToHome={navigateToHome}
        />
      )}
    </main>
  );
}
