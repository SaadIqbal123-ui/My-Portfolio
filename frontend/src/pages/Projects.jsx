import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

// Skeleton loader for loading state
const CardSkeleton = () => (
  <div className="bg-surface-container-low rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-video bg-surface-container-high" />
    <div className="p-8 space-y-3">
      <div className="h-3 bg-surface-container-high rounded w-1/4" />
      <div className="h-6 bg-surface-container-high rounded w-3/4" />
      <div className="h-4 bg-surface-container-high rounded w-full" />
      <div className="h-4 bg-surface-container-high rounded w-5/6" />
    </div>
  </div>
);

const ProjectCard = ({ project, index }) => {
  const tags = project.TAGS ? project.TAGS.split(',').map(t => t.trim()) : [];
  const isFirst = index === 0;
  const isHorizontal = index % 5 === 3; // every 4th card after first is horizontal

  if (isFirst) {
    return (
      <div className="col-span-12 lg:col-span-8 group">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest aspect-video cursor-pointer">
          {project.IMAGE_URL ? (
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              src={project.IMAGE_URL}
              alt={project.TITLE}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant">folder_open</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-12">
            <div className="flex flex-wrap gap-3 mb-6">
              {tags.map(tag => (
                <span key={tag} className="bg-surface-container-highest px-4 py-1 rounded-full text-xs font-label text-on-surface-variant uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-4xl font-headline font-bold mb-2">{project.TITLE}</h3>
                <p className="text-on-surface-variant text-lg max-w-md">{project.DESCRIPTION}</p>
              </div>
              <div className="flex">
                {project.LIVE_URL && (
                  <a
                    href={project.LIVE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="signature-gradient w-12 h-12 rounded-full flex items-center justify-center text-on-primary shrink-0 ml-4"
                  >
                    <span className="material-symbols-outlined">arrow_outward</span>
                  </a>
                )}
                {project.GITHUB_URL && (
                  <a
                    href={project.GITHUB_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-surface-container-highest w-12 h-12 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors ml-4"
                  >
                    <span className="material-symbols-outlined">code</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isHorizontal) {
    return (
      <div className="col-span-12 lg:col-span-8 group">
        <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col md:flex-row h-full transition-colors duration-300 group-hover:bg-surface-container-high">
          <div className="md:w-1/2 overflow-hidden min-h-[280px]">
            {project.IMAGE_URL ? (
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src={project.IMAGE_URL}
                alt={project.TITLE}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-container min-h-[280px]">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant">folder_open</span>
              </div>
            )}
          </div>
          <div className="md:w-1/2 p-12 flex flex-col justify-center">
            <span className="font-label text-secondary tracking-widest uppercase text-xs mb-2">{project.CATEGORY}</span>
            <h3 className="text-3xl font-headline font-bold mb-6 leading-tight">{project.TITLE}</h3>
            <p className="text-on-surface-variant mb-8 text-lg">{project.DESCRIPTION}</p>
            <div className="flex gap-4 flex-wrap">
              {project.LIVE_URL && (
                <a
                  href={project.LIVE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="signature-gradient px-8 py-3 rounded-full text-on-primary font-label text-xs tracking-widest uppercase font-bold transition-transform active:scale-95"
                >
                  View Live
                </a>
              )}
              {project.GITHUB_URL && (
                <a
                  href={project.GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-outline-variant/20 px-8 py-3 rounded-full text-on-surface font-label text-xs tracking-widest uppercase hover:bg-surface-container-highest transition-colors"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: tall/small card
  return (
    <div className="col-span-12 md:col-span-6 lg:col-span-4 group">
      <div className="bg-surface-container-low p-8 rounded-xl h-full flex flex-col transition-colors duration-300 group-hover:bg-surface-container-high">
        <div className="relative overflow-hidden rounded-lg aspect-[4/3] mb-8">
          {project.IMAGE_URL ? (
            <img
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              src={project.IMAGE_URL}
              alt={project.TITLE}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant">folder_open</span>
            </div>
          )}
        </div>
        <span className="font-label text-on-surface-variant tracking-widest uppercase text-xs mb-2">{project.CATEGORY}</span>
        <h3 className="text-2xl font-headline font-bold mb-4">{project.TITLE}</h3>
        <p className="text-on-surface-variant mb-6 flex-grow">{project.DESCRIPTION}</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-label text-on-surface-variant uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-4 mt-auto">
          {project.LIVE_URL && (
            <a
              href={project.LIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-primary inline-flex items-center gap-2 font-label text-sm tracking-widest uppercase hover:underline"
            >
              Live <span className="material-symbols-outlined text-sm">east</span>
            </a>
          )}
          {project.GITHUB_URL && (
            <a
              href={project.GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-on-surface-variant hover:text-primary inline-flex items-center gap-2 font-label text-sm tracking-widest uppercase hover:underline"
            >
              GitHub <span className="material-symbols-outlined text-sm">code</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load projects');
        return res.json();
      })
      .then(data => {
        // Map to UPPERCASE to support the existing ProjectCard logic
        const mappedData = (Array.isArray(data) ? data : []).map(p => ({
          ...p,
          ID: p.id,
          TITLE: p.title,
          DESCRIPTION: p.description,
          CATEGORY: p.category,
          IMAGE_URL: p.image_url,
          LIVE_URL: p.live_url,
          GITHUB_URL: p.github_url,
          TAGS: p.tags
        }));
        setProjects(mappedData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="pt-32 pb-24 px-8 md:px-24">
      {/* Header */}
      <header className="mb-20 max-w-4xl">
        <span className="font-label text-on-surface-variant tracking-[0.2rem] uppercase text-xs mb-4 block">
          Archive
        </span>
        <h1 className="text-6xl md:text-8xl font-headline font-bold tracking-tighter leading-tight mb-8">
          Selected <span className="text-primary italic">Works</span>
        </h1>
        <p className="text-xl md:text-2xl text-on-surface-variant font-light leading-relaxed max-w-2xl">
          A curated anthology of digital experiences, focusing on high-contrast aesthetics and editorial storytelling through code.
        </p>
      </header>

      {/* Project Grid */}
      <section className="grid grid-cols-12 gap-8">
        {loading && (
          <>
            <div className="col-span-12 lg:col-span-8"><CardSkeleton /></div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4"><CardSkeleton /></div>
            <div className="col-span-12 md:col-span-6 lg:col-span-4"><CardSkeleton /></div>
          </>
        )}

        {!loading && error && (
          <div className="col-span-12 text-center py-24">
            <span className="material-symbols-outlined text-5xl text-error mb-4 block">cloud_off</span>
            <p className="text-on-surface-variant text-lg">{error}</p>
            <p className="text-on-surface-variant/60 text-sm mt-2">Make sure the backend server is running on port 5000.</p>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="col-span-12 text-center py-24">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">folder_open</span>
            <h3 className="font-headline text-3xl mb-4">No projects yet</h3>
            <p className="text-on-surface-variant">Projects added via the admin panel will appear here.</p>
          </div>
        )}

        {!loading && !error && projects.map((project, index) => (
          <ProjectCard key={project.ID} project={project} index={index} />
        ))}
      </section>

      {/* CTA Section */}
      {!loading && (
        <section className="mt-32 py-24 bg-surface-container-low rounded-[2rem] text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full -ml-48 -mb-48"></div>
          <div className="relative z-10 max-w-2xl mx-auto px-6">
            <h2 className="text-5xl font-headline font-bold mb-8">Have a vision in mind?</h2>
            <p className="text-on-surface-variant text-xl mb-12">
              I&apos;m currently accepting new projects. Let&apos;s create something extraordinary together.
            </p>
            <Link
              to="/contact"
              className="signature-gradient px-12 py-5 rounded-full text-on-primary font-label text-sm tracking-[0.2rem] uppercase font-extrabold inline-block shadow-[0_20px_40px_-10px_rgba(73,75,214,0.3)] hover:scale-105 transition-transform"
            >
              Start a Conversation
            </Link>
          </div>
        </section>
      )}
    </main>
  );
};

export default Projects;
