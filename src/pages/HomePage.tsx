import React from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { WhyKernelLab } from '../components/WhyKernelLab';
import { FilterGallery } from '../components/FilterGallery';
import { KernelRoadmap } from '../components/KernelRoadmap';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';
import { FilterType } from '../engine/types';

interface HomePageProps {
  onNavigateToStudio: (filterId?: FilterType) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToStudio }) => {
  return (
    <div className="min-h-screen bg-[#08070D] text-[#e6e0ea] flex flex-col selection:bg-purple-600/30 selection:text-white">
      {/* Navigation */}
      <Navbar currentView="home" onNavigate={() => onNavigateToStudio()} />

      {/* Hero Section */}
      <Hero onLaunchStudio={() => onNavigateToStudio()} />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Why KernelLab Section */}
      <WhyKernelLab />

      {/* Filter Gallery Section */}
      <FilterGallery onOpenStudio={(filterId) => onNavigateToStudio(filterId)} />

      {/* Kernel Roadmap Section */}
      <KernelRoadmap />

      {/* Final Call to Action */}
      <FinalCTA onOpenStudio={() => onNavigateToStudio()} />

      {/* Footer */}
      <Footer onNavigate={(view, filterId) => {
        if (view === 'studio') {
          onNavigateToStudio(filterId as FilterType);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }} />
    </div>
  );
};
