import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../apiConfig';

const Hero = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/profile`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center pt-24 animate-pulse">
        <div className="container mx-auto px-8">
          <div className="h-10 bg-surface-container-high w-2/3 mb-6 rounded"></div>
          <div className="h-6 bg-surface-container-high w-1/2 rounded"></div>
        </div>
      </section>
    );
  }

  // Fallback to defaults if no profile is found or fields are missing
  const displayName = profile?.full_name || 'M Saad Iqbal';
  const displayStatus = profile?.status || 'Available for New Projects';
  const displayBio = profile?.bio || 'Transforming complex ideas into high-fidelity monoliths of design and code.';
  const displayAvatar = profile?.avatar_url || 'https://res.cloudinary.com/durgaqq7v/image/upload/v1775323710/portfolio/frerfyyg5xuvxed3rb0s.png';

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]"></div>

      <div className="container mx-auto px-8 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-surface-container-highest/60 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">{displayStatus}</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-headline font-bold tracking-tighter leading-[0.9] text-on-surface">
            Crafting <span className="text-primary italic">Visual</span> Narratives.
          </h1>

          <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl leading-relaxed">
            {displayBio}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4">
            <button 
              onClick={() => {
                const link = profile?.cv_url;
                if (link) {
                  window.open(link, '_blank');
                } else {
                  alert('CV link not configured yet. Please set it in the Admin Dashboard under Identity.');
                }
              }}
              className="flex items-center gap-3 px-8 py-5 rounded-full border border-outline-variant/20 text-on-surface font-bold tracking-tight text-lg hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">download</span>
              Download CV
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 hidden lg:block">
          <div className="relative group">
            <div className="absolute -inset-1 signature-gradient rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-container-high">
              <img
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                src={displayAvatar}
                alt={displayName}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
