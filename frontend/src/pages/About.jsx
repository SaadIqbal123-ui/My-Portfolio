import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../apiConfig';

const About = () => {
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

  const displayAvatar = profile?.AVATAR_URL || profile?.avatar_url || 'https://res.cloudinary.com/durgaqq7v/image/upload/v1775323710/portfolio/frerfyyg5xuvxed3rb0s.png';

  return (
    <main className="pt-32 pb-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 mb-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-end">
        <div className="lg:col-span-8">
          <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant block mb-6">Introduction</span>
          <h1 className="text-6xl md:text-8xl font-headline font-bold tracking-tight text-on-surface leading-[0.95]">
            Crafting <span className="text-primary italic">digital narratives</span> with intent and precision.
          </h1>
        </div>
        <div className="lg:col-span-4 pb-4">
          <p className="text-lg text-on-surface-variant leading-relaxed">
            A multidisciplinary developer and designer turning complex ideas into fast, reliable, and intuitive applications
          </p>
        </div>
      </section>

      {/* Profile & Story Section */}
      <section className="bg-surface-container-low py-32 mb-32">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Profile Image */}
          <div className="lg:col-span-5">
            <div className={`relative group ${loading ? 'animate-pulse' : ''}`}>
              <div className="absolute -inset-4 signature-gradient opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-700"></div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-highest">
                <img
                  alt="Profile"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
                  src={displayAvatar}
                />
              </div>
              <div className="mt-8 flex gap-4">
                <div className="flex-1 p-6 bg-surface-container-highest rounded-xl">
                  <span className="block text-primary font-headline text-2xl mb-1">2+</span>
                  <span className="text-xs uppercase tracking-widest text-on-surface-variant">Years of Craft</span>
                </div>
                <div className="flex-1 p-6 bg-surface-container-highest rounded-xl">
                  <span className="block text-primary font-headline text-2xl mb-1">10+</span>
                  <span className="text-xs uppercase tracking-widest text-on-surface-variant">Global Projects</span>
                </div>
              </div>
            </div>
          </div>

          {/* Story Text */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className="text-4xl font-headline mb-12 text-on-surface">The Narrative</h2>
            <div className="space-y-8 text-xl text-on-surface-variant font-light leading-relaxed max-w-2xl">
              <p>
                I&apos;m a full-stack developer passionate about building applications that are not just functional, but smooth, reliable, and intuitive. Currently, I work with{' '}
                <strong>Flutter, Java, HTML, CSS, JavaScript, React, and Node.js</strong>, crafting everything from responsive UIs to efficient backend logic.
              </p>
              <p>
                Some of my projects include an <strong>AI Receptionist</strong> that automates bookings and scheduling, a{' '}
                <strong>Hotel Ordering System</strong> that streamlines operations, and my flagship project,{' '}
                <strong>CreatorMerch</strong>, an ecommerce platform designed with both speed and usability in mind. I obsess over{' '}
                <strong>performance, seamless user experience, and robust error handling</strong>—because bad exceptions, crashes, or lag are dealbreakers for me.
              </p>
              <p>
                Beyond screens, I&apos;m disciplined and goal-oriented, whether it&apos;s hitting the gym to build strength and consistency, or going on outings to explore, recharge, and spark creativity. These routines fuel my coding mindset, keeping me focused and inspired to create apps that don&apos;t just work, but feel effortless to use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Skills Section */}
      <section className="max-w-7xl mx-auto px-8 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-4">
            <h2 className="text-4xl font-headline sticky top-32">
              Technical <br /><span className="text-primary">Ecosystem</span>
            </h2>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Design Discipline */}
            <div className="space-y-6">
              <h3 className="text-sm uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline-variant/20 pb-4">Design Discipline</h3>
              <div className="flex flex-wrap gap-2">
                {['Creative Art', 'Editorial Layout', 'UI / UX', 'Figma Master', 'Designer'].map((skill) => (
                  <span key={skill} className="px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-full text-sm font-label">{skill}</span>
                ))}
              </div>
            </div>
            {/* Engineering Stack */}
            <div className="space-y-6">
              <h3 className="text-sm uppercase tracking-[0.2em] text-on-surface-variant border-b border-outline-variant/20 pb-4">Engineering Stack</h3>
              <div className="flex flex-wrap gap-2">
                {['Java', 'React', 'Tailwind CSS', 'Flutter', 'Node.js'].map((skill) => (
                  <span key={skill} className="px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-full text-sm font-label">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Interests / Bento Grid */}
      <section className="max-w-7xl mx-auto px-8">
        <h2 className="text-4xl font-headline mb-16 text-center">Beyond the Screen</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[600px]">
          {/* Large card */}
          <div className="md:col-span-2 md:row-span-2 bg-surface-container rounded-xl overflow-hidden relative group">
            <img
              alt="Architecture"
              className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVSYNi-rT0beOzMyEwBVse_nFdYYkDrSQ4MUEN02uDtKXWYfxtLsT61Oltx9NF3nwqIRtH5wtlIaJZCryFcifs_BsiUIN7XY-IJK6Y4sc2ShF7QSkvPlV12QdE8mC0N_w701VExNMGZdS4hbMJTaWXuR0cLWbrLzx-N9eUeUoaL1fk_3vbuUj41HXLHSymhJpUtop6_Gh185Ftuf8bROPTJdY1FVkcwP5LDPa9LRVeRIQU5qPvNXPKTtXWflXeCc5PlmmLY5BlNCoo"
            />
            <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-background to-transparent">
              <span className="text-primary font-headline text-xl">Competitive FPS</span>
              <p className="text-sm text-on-surface-variant mt-2">focus on reaction time &amp; decision-making under pressure</p>
            </div>
          </div>

          {/* Photography card */}
          <div className="md:col-span-2 bg-surface-container rounded-xl overflow-hidden relative group">
            <img
              alt="Gym"
              className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
              src="https://img.freepik.com/premium-photo/room-transformed-by-dark-wood-gym-aesthetic-ai-generation_724548-27377.jpg"
            />
            <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-background to-transparent">
              <span className="text-primary font-headline text-xl">Building consistency, same mindset I apply to coding</span>
            </div>
          </div>

          {/* Exploring card */}
          <div className="md:col-span-1 bg-surface-container rounded-xl overflow-hidden relative group">
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <span className="text-primary font-headline text-lg">Exploring beyond routine</span>
            </div>
          </div>

          {/* Craftsman card */}
          <div className="md:col-span-1 bg-surface-container rounded-xl overflow-hidden relative group">
            <div className="absolute inset-0 signature-gradient opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <span className="text-on-surface font-headline text-lg"><strong>Craftsman</strong></span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
