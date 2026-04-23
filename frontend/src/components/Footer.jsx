import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-surface-container-low w-full py-12 px-8">
      <div className="flex flex-col md:flex-row justify-between items-center w-full gap-8">
        <div className="text-lg font-bold text-on-surface font-headline uppercase tracking-widest">M SAAD Iqbal</div>

        <div className="flex gap-8">
          <a className="text-on-surface/60 hover:text-primary transition-colors font-label text-sm uppercase tracking-widest" href="https://www.linkedin.com/in/muhammad-saad-iqbal-620923368/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="text-on-surface/60 hover:text-primary transition-colors font-label text-sm uppercase tracking-widest" href="https://github.com/SaadIqbal123-ui" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a className="text-on-surface/60 hover:text-primary transition-colors font-label text-sm uppercase tracking-widest" href="https://www.fiverr.com/s/qDK2k1d" target="_blank" rel="noopener noreferrer">Fiverr</a>
          <a className="text-on-surface/60 hover:text-primary transition-colors font-label text-sm uppercase tracking-widest" href="https://www.instagram.com/m.saad.exe/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>

        <div className="text-on-surface/40 font-label text-xs uppercase tracking-[0.2em]">
          &nbsp;All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
