import React from 'react';

const CTA = () => {
  return (
    <section className="py-32 bg-surface">
      <div className="container mx-auto px-8">
        <div className="bg-surface-container-highest rounded-3xl p-12 md:p-24 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 group-hover:opacity-20 transition-opacity">
            <img
              className="w-full h-full object-cover"
              data-alt="subtle dark texture of crumpled high-quality paper with dramatic lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAazSuUgvIYrOuSGsujj3K8rsY4EdQ6VKVodBIuX8LRXfM-MGc-RIsk3dlq-xivf0bfSDor2EPqBjYU9p3CbLQExVTpmBDskMZ1_-KPpGMfkoIZQVp9_lYwwc09kF535H3Vc3n-b3DlQGwXSda-t1GTTa3ZCGKgL7d94iRkgrG1CaOG6ixQzRZOWF2FsOYufs3mCkt1B0x7AMUOliUMyXPs10FLpaMW-dhZMx3TQ5-NibTlnsAzvkrLYz-VahYxr75cdUT2SUc1t_Ue"
              alt="Texture"
            />
          </div>
          <div className="max-w-3xl relative z-10">
            <h2 className="text-5xl md:text-7xl font-headline font-bold text-on-surface mb-8 leading-[1.1]">
              Let&apos;s build <span className="text-secondary italic">something extraordinary</span> together.
            </h2>
            <p className="text-xl md:text-2xl text-on-surface-variant mb-12 leading-relaxed">
              Currently accepting select freelance inquiries. If you have a vision that needs an editorial touch, I&apos;d love to hear from you.
            </p>
            <a className="inline-block text-2xl md:text-4xl font-headline font-bold text-primary border-b-2 border-primary/40 hover:border-primary transition-all pb-2" href="mailto:saadiqbalbse067@gmail.com">
              saadiqbalbse067@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
