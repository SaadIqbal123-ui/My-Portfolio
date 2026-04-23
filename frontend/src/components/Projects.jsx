import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data.slice(0, 2)); // Only show first 2 on home page
        } else {
          setProjects([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="bg-surface-container-low py-32">
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-xl">
            <span className="text-secondary font-label uppercase tracking-widest mb-4 block">Selected Works</span>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface leading-tight">
              Recent Projects that define the standard.
            </h2>
          </div>
          <Link to="/projects" className="group flex items-center gap-2 text-primary font-bold text-lg border-b border-primary/20 pb-1">
            Explore Archive
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" data-icon="arrow_forward">arrow_forward</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          {loading ? (
            <div className="col-span-2 text-center py-20 text-on-surface-variant">Loading projects...</div>
          ) : projects.length > 0 ? (
            projects.map((project, index) => (
              <div key={project.id} className={`group cursor-pointer ${index === 1 ? 'md:mt-24' : ''}`}>
                <div className="aspect-[16/10] bg-surface-container-lowest rounded-xl overflow-hidden mb-8">
                  {project.image_url ? (
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={project.image_url}
                      alt={project.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container">
                      <span className="material-symbols-outlined text-6xl text-on-surface-variant">folder_open</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  {project.tags && project.tags.split(',').map(tag => (
                    <span key={tag} className="px-4 py-1 rounded-full bg-surface-container-highest text-xs font-label uppercase tracking-widest text-on-surface-variant">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                <h3 className="text-3xl font-headline font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  {project.description}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-20 text-on-surface-variant">No projects found.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
