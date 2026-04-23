import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import API_BASE_URL from '../apiConfig';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'contacts', 'profile'
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Profile State
  const [profile, setProfile] = useState({
    email: '',
    location: '',
    status: '',
    full_name: '',
    avatar_url: '',
    base_image_url: '',
    cv_url: '',
    bio: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // New Project State
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: '',
    live_url: '',
    description: '',
    image_url: ''
  });
  const [savingProject, setSavingProject] = useState(false);

  // Edit Project State (shares same fields as form + ID)
  const [editingProject, setEditingProject] = useState(null);
  const [updatingProject, setUpdatingProject] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Listen to Firebase auth state — redirect to login if signed out
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate('/login');
      } else {
        setUser(firebaseUser);
        fetchProjects();
        fetchProfile();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`);
      const data = await res.json();
      
      // PostgreSQL returns lowercase; we map to UPPERCASE aliases to support your current UI logic
      const mappedData = (Array.isArray(data) ? data : []).map(p => ({
        ...p, // keep lowercase for the list view
        id: p.id, 
        TITLE: p.title,
        DESCRIPTION: p.description,
        CATEGORY: p.category,
        IMAGE_URL: p.image_url,
        LIVE_URL: p.live_url,
        GITHUB_URL: p.github_url,
        CREATED_AT: p.created_at
      }));
      
      setProjects(mappedData);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`);
      const data = await res.json();
      if (res.ok) {
        setProfile({
          email: data.email || '',
          location: data.location || '',
          status: data.status || '',
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
          base_image_url: data.base_image_url || '',
          cv_url: data.cv_url || '',
          bio: data.bio || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not authenticated");
      const idToken = await currentUser.getIdToken();

      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({ ...projectForm, tags: '', github_url: '' })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save via API");
      }

      // Reset form and go back to projects tab
      setProjectForm({ title: '', category: '', live_url: '', description: '', image_url: '' });
      setActiveTab('projects');
      fetchProjects();
    } catch (err) {
      console.error('Save error:', err);
      alert(`Failed to save project: ${err.message}`);
    } finally {
      setSavingProject(false);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editingProject || !editingProject.id) return;

    setUpdatingProject(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Not authenticated");
      const idToken = await currentUser.getIdToken();

      const res = await fetch(`${API_BASE_URL}/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({
          title: editingProject.TITLE || editingProject.title,
          description: editingProject.DESCRIPTION || editingProject.description,
          category: editingProject.CATEGORY || editingProject.category,
          live_url: editingProject.LIVE_URL || editingProject.live_url,
          image_url: editingProject.IMAGE_URL || editingProject.image_url,
          tags: editingProject.tags || '',
          github_url: editingProject.GITHUB_URL || editingProject.github_url || ''
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update project");
      }

      alert('Project updated successfully!');
      setEditingProject(null);
      setActiveTab('projects');
      fetchProjects();
    } catch (err) {
      console.error('Update error:', err);
      alert(`Failed to update project: ${err.message}`);
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleEditClick = (project) => {
    setEditingProject({ ...project });
    setActiveTab('edit_project');
  };

  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();
      await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify(profile)
      });
      alert('Profile updated successfully!');
      fetchProfile(); // Re-fetch to verify persistence
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const idToken = await currentUser.getIdToken();
      await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/login');
  };

  const filteredProjects = projects.filter((p) =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedCount = projects.filter((p) => p.live_url).length;

  return (
    <div className="bg-[#131313] text-[#e5e2e1] font-body min-h-screen">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/60 backdrop-blur-md shadow-[0_40px_40px_-15px_rgba(73,75,214,0.06)] flex justify-between items-center px-8 h-20">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-[#e5e2e1] tracking-[-0.02em] font-headline">
            {profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase() : 'MSI'}
          </span>
        </div>
        <div className="flex items-center gap-6">
          {/* Search only mostly relevant to projects right now */}
          {activeTab === 'projects' && (
            <div className="hidden md:flex items-center bg-[#2a2a2a] rounded-full px-4 py-2">
              <span className="material-symbols-outlined text-[#c7c4d8] text-sm mr-2">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 text-sm text-[#e5e2e1] placeholder:text-[#918fa1]/50 w-64 outline-none"
                placeholder="Search projects..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <button className="text-[#e5e2e1]/60 hover:text-[#c0c1ff] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-[#e5e2e1]/60 hover:text-[#c0c1ff] transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-[#4b4dd8]/30 ring-2 ring-[#c0c1ff]/20 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[#c0c1ff]">person</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-[#1c1b1b] flex flex-col py-8 gap-y-2 pt-28 border-none">
        <div className="px-8 mb-8">
          <h2 className="text-[#e5e2e1] font-headline italic text-lg leading-tight">Portfolio CMS</h2>
          <p className="font-label text-[10px] uppercase tracking-[0.15rem] text-[#c7c4d8]/40 mt-1">Management Suite</p>
        </div>

        <nav className="flex-grow flex flex-col gap-y-1">
          <button
            onClick={() => setActiveTab('projects')}
            className={`mx-4 py-3 px-6 flex items-center gap-3 rounded-full transition-all duration-200 ${activeTab === 'projects' ? 'bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#131313]' : 'text-[#e5e2e1]/40 hover:bg-[#353534] hover:text-[#e5e2e1] hover:translate-x-1'
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'projects' ? "'FILL' 1" : "'FILL' 0" }}>grid_view</span>
            <span className={`font-label text-sm uppercase tracking-[0.1rem] ${activeTab === 'projects' ? 'font-bold' : ''}`}>Projects</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`mx-4 py-3 px-6 flex items-center gap-3 rounded-full transition-all duration-200 ${activeTab === 'contacts' ? 'bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#131313]' : 'text-[#e5e2e1]/40 hover:bg-[#353534] hover:text-[#e5e2e1] hover:translate-x-1'
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'contacts' ? "'FILL' 1" : "'FILL' 0" }}>contact_mail</span>
            <span className={`font-label text-sm uppercase tracking-[0.1rem] ${activeTab === 'contacts' ? 'font-bold' : ''}`}>Contacts</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`mx-4 py-3 px-6 flex items-center gap-3 rounded-full transition-all duration-200 ${activeTab === 'profile' ? 'bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] text-[#131313]' : 'text-[#e5e2e1]/40 hover:bg-[#353534] hover:text-[#e5e2e1] hover:translate-x-1'
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person_outline</span>
            <span className={`font-label text-sm uppercase tracking-[0.1rem] ${activeTab === 'profile' ? 'font-bold' : ''}`}>Profile</span>
          </button>
        </nav>

        <div className="px-4 mt-auto space-y-4">
          <button
            onClick={() => setActiveTab('new_project')}
            className="w-full bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#1000a9] py-4 rounded-full font-bold text-sm uppercase tracking-widest shadow-lg shadow-[#c0c1ff]/10 hover:opacity-90 transition-opacity">
            New Project
          </button>
          <button
            onClick={handleLogout}
            className="text-[#e5e2e1]/40 mx-4 py-3 px-6 flex items-center gap-3 hover:bg-[#353534] hover:text-[#e5e2e1] rounded-full transition-all hover:text-[#ffb4ab] w-full"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label text-sm uppercase tracking-[0.1rem]">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 pt-28 px-12 pb-12 min-h-screen">
        {activeTab === 'projects' && (
          <>
            {/* Header */}
            <section className="mb-12 flex justify-between items-end">
              <div className="max-w-2xl">
                <span className="font-label text-xs uppercase tracking-[0.2rem] text-[#c0c1ff] mb-4 block">Archive Management</span>
                <h1 className="font-headline text-5xl font-bold tracking-tighter text-[#e5e2e1]">Existing Projects</h1>
                <p className="font-body text-[#c7c4d8] mt-4 leading-relaxed">
                  Curate and manage your editorial spreads. Use tonal layering to prioritize high-impact visual narratives across your digital portfolio.
                </p>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-2 rounded-full border border-[#464555]/20 text-[#c7c4d8] hover:bg-[#2a2a2a] transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                  Filter
                </button>
                <button className="px-6 py-2 rounded-full border border-[#464555]/20 text-[#c7c4d8] hover:bg-[#2a2a2a] transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">sort</span>
                  Sort
                </button>
              </div>
            </section>

            {/* Project Grid */}
            <div className="grid grid-cols-12 gap-6">
              {/* Table Header */}
              <div className="col-span-12 grid grid-cols-12 px-8 py-4 bg-[#1c1b1b] rounded-t-xl text-[#c7c4d8] font-label text-[10px] uppercase tracking-widest hidden md:grid">
                <div className="col-span-5">Project Details</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="col-span-12 py-20 text-center text-[#c7c4d8]">
                  <span className="material-symbols-outlined animate-spin text-4xl text-[#c0c1ff]">progress_activity</span>
                  <p className="mt-4 font-label uppercase tracking-widest text-sm">Loading projects...</p>
                </div>
              )}

              {/* No projects */}
              {!loading && filteredProjects.length === 0 && (
                <div className="col-span-12 py-20 text-center bg-[#0e0e0e] rounded-b-xl">
                  <span className="material-symbols-outlined text-5xl text-[#464555]">folder_open</span>
                  <p className="mt-4 font-label uppercase tracking-widest text-sm text-[#c7c4d8]/40">
                    {searchQuery ? 'No projects match your search.' : 'No projects found in the database.'}
                  </p>
                </div>
              )}

              {/* Project Rows */}
              {!loading && filteredProjects.map((project, index) => {
                const isPublished = Boolean(project.live_url);
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={project.id}
                    className={`col-span-12 grid grid-cols-12 items-center px-8 py-6 ${isEven ? 'bg-[#0e0e0e]' : 'bg-[#1c1b1b]'} hover:bg-[#2a2a2a] transition-all group border-b border-[#464555]/10 md:border-none ${index === filteredProjects.length - 1 ? 'rounded-b-xl' : ''}`}
                  >
                    {/* Project Details */}
                    <div className="col-span-12 md:col-span-5 flex items-center gap-6 mb-4 md:mb-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#353534] flex-shrink-0">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl text-[#464555]">image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-headline text-lg font-bold text-[#e5e2e1]">{project.title}</h3>
                        <p className="font-body text-sm text-[#c7c4d8]/60">
                          {project.created_at ? `Added ${project.created_at}` : 'No date'}
                        </p>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-6 md:col-span-2">
                      <span className="bg-[#353534] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#c7c4d8]">
                        {project.category || 'Uncategorized'}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                      {isPublished ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-[#c0c1ff] shadow-[0_0_8px_rgba(192,193,255,0.6)]"></div>
                          <span className="font-body text-sm text-[#e5e2e1]">Published</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-[#464555]"></div>
                          <span className="font-body text-sm text-[#c7c4d8]">Draft</span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-12 md:col-span-3 flex justify-end gap-3 mt-4 md:mt-0">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full hover:bg-[#353534] text-[#c7c4d8] transition-colors"
                          title="View Live"
                        >
                          <span className="material-symbols-outlined">open_in_new</span>
                        </a>
                      )}
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full hover:bg-[#353534] text-[#c7c4d8] transition-colors"
                          title="View on GitHub"
                        >
                          <span className="material-symbols-outlined">code</span>
                        </a>
                      )}
                      <button
                        className="p-2 rounded-full hover:bg-[#353534] text-[#c7c4d8] transition-colors"
                        title="Edit"
                        onClick={() => handleEditClick(project)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-[#ffb4ab]/10 text-[#ffb4ab] transition-colors"
                        title="Delete"
                        onClick={() => setDeleteConfirm(project.id)}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats Bento */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1c1b1b] p-8 rounded-xl border-l-4 border-[#c0c1ff]">
                <span className="font-label text-[10px] uppercase tracking-widest text-[#c7c4d8]/50">Total Projects</span>
                <div className="flex items-end gap-3 mt-2">
                  <span className="font-headline text-4xl font-bold text-[#e5e2e1]">{projects.length}</span>
                  <span className="font-body text-xs text-[#c0c1ff] mb-1">In database</span>
                </div>
              </div>
              <div className="bg-[#1c1b1b] p-8 rounded-xl">
                <span className="font-label text-[10px] uppercase tracking-widest text-[#c7c4d8]/50">Published</span>
                <div className="flex items-end gap-3 mt-2">
                  <span className="font-headline text-4xl font-bold text-[#e5e2e1]">{publishedCount}</span>
                  <span className="font-body text-xs text-[#ffb783] mb-1">With live URL</span>
                </div>
              </div>
              <div className="bg-[#1c1b1b] p-8 rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#c0c1ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="font-label text-[10px] uppercase tracking-widest text-[#c7c4d8]/50">Drafts</span>
                <div className="flex items-end gap-3 mt-2">
                  <span className="font-headline text-4xl font-bold text-[#e5e2e1]">{projects.length - publishedCount}</span>
                  <span className="font-body text-xs text-[#c7c4d8]/40 mb-1">Without live URL</span>
                </div>
              </div>
            </div>
            {/* FAB */}
            <button
              onClick={() => setActiveTab('new_project')}
              className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-[#c0c1ff] to-[#4b4dd8] rounded-full shadow-[0_20px_40px_-5px_rgba(73,75,214,0.4)] flex items-center justify-center text-[#131313] hover:scale-110 active:scale-90 transition-all z-50"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>add</span>
            </button>
          </>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-5xl mx-auto mb-20">
            {/* Header Section */}
            <header className="mb-16">
              <p className="font-label text-xs uppercase tracking-[0.2em] text-[#ffb783] mb-4">Identity Control</p>
              <h1 className="text-6xl md:text-7xl font-headline tracking-tight text-[#e5e2e1] mb-6">Profile Settings</h1>
              <div className="h-1 w-24 bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] rounded-full"></div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Profile Picture Bento Card */}
              <section className="lg:col-span-5 bg-[#1c1b1b] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                <div className="relative group cursor-pointer border-4 border-[#353534] shadow-2xl rounded-full overflow-hidden w-48 h-48 transition-transform duration-500">
                  <div className="w-full h-full bg-[#1c1b1b] relative overflow-hidden">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Current Avatar"
                        className="w-full h-full object-cover transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#131313] flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-[#464555]">person</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-8 w-full">
                  <h3 className="font-headline text-xl mb-2 text-[#e5e2e1]">{profile.full_name || 'Admin User'}</h3>
                  <p className="font-body text-[#c7c4d8] text-sm mb-6">{profile.status || 'Editorial Director'}</p>

                  <div className="relative text-left w-full mt-4">
                    <label className="absolute -top-2.5 left-4 bg-[#1c1b1b] px-2 font-label text-[10px] uppercase tracking-[0.15em] text-[#c7c4d8] group-focus-within:text-[#c0c1ff] transition-colors">Image URL</label>
                    <input
                      className="w-full bg-[#2a2a2a] border-none rounded-xl py-3 px-4 text-xs text-[#e5e2e1] focus:ring-2 focus:ring-[#c0c1ff] transition-all outline-none"
                      type="url"
                      placeholder="Paste image link here"
                      value={profile.avatar_url}
                      onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    />
                  </div>
                </div>
              </section>

              {/* Personal Information & Security */}
              <div className="lg:col-span-7 space-y-8">
                {/* Basic Info */}
                <section className="bg-[#1c1b1b] rounded-xl p-8 border border-transparent hover:border-[#c0c1ff]/10 transition-colors">
                  <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-[#c0c1ff]">badge</span>
                    <h2 className="font-headline text-2xl text-[#e5e2e1]">Identity</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="absolute -top-2.5 left-4 bg-[#1c1b1b] px-2 font-label text-[10px] uppercase tracking-[0.15em] text-[#c7c4d8]">Full Name</label>
                      <input
                        className="w-full bg-[#2a2a2a] border-none rounded-xl py-4 px-6 text-[#e5e2e1] focus:ring-2 focus:ring-[#c0c1ff] transition-all outline-none"
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2.5 left-4 bg-[#1c1b1b] px-2 font-label text-[10px] uppercase tracking-[0.15em] text-[#c7c4d8]">Email Address</label>
                      <input
                        className="w-full bg-[#2a2a2a] border-none rounded-xl py-4 px-6 text-[#e5e2e1] focus:ring-2 focus:ring-[#c0c1ff] transition-all outline-none"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                    <div className="relative">
                      <label className="absolute -top-2.5 left-4 bg-[#1c1b1b] px-2 font-label text-[10px] uppercase tracking-[0.15em] text-[#c7c4d8]">Short Bio</label>
                      <textarea
                        className="w-full bg-[#2a2a2a] border-none rounded-xl py-4 px-6 text-[#e5e2e1] focus:ring-2 focus:ring-[#c0c1ff] transition-all resize-none outline-none"
                        rows="3"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-[#464555]/20">
              <div className="flex items-center gap-4 text-[#c7c4d8]">
                <span className="material-symbols-outlined text-sm">history</span>
                <span className="text-xs font-label uppercase tracking-widest">Unsaved Changes</span>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                  onClick={() => fetchProfile()} // Resets to DB state
                  className="flex-1 md:flex-none px-10 py-4 rounded-full border border-[#464555]/30 text-[#c7c4d8] text-xs font-bold uppercase tracking-widest hover:bg-[#2a2a2a] transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={savingProfile}
                  className="flex-1 md:flex-none px-12 py-4 rounded-full bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#1000a9] text-xs font-bold uppercase tracking-[0.2em] shadow-2xl shadow-[#c0c1ff]/20 hover:scale-[1.02] active:scale-95 transition-all outline-none disabled:opacity-50"
                >
                  {savingProfile ? 'Committing...' : 'Commit Changes'}
                </button>
              </div>
            </div>

            {/* Toast Feedback */}
            {savingProfile && (
              <div className="fixed bottom-10 right-10 z-[60] bg-[#353534]/80 backdrop-blur-xl px-6 py-4 rounded-full flex items-center gap-4 shadow-[0_40px_40px_-15px_rgba(73,75,214,0.1)] border border-[#c0c1ff]/20 pointer-events-none transition-opacity duration-300">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] animate-pulse"></div>
                <span className="text-xs font-label uppercase tracking-widest text-[#e5e2e1]">Saving to Database...</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <section className="col-span-12 mb-20 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="mb-16 max-w-4xl">
              <span className="font-label text-xs uppercase tracking-[0.2rem] text-[#ffb783] mb-4 block">Communications Hub</span>
              <h2 className="text-7xl font-headline text-[#e5e2e1] tracking-[-0.03em] leading-tight mb-6">Identity.</h2>
              <p className="text-xl text-[#c7c4d8] max-w-2xl font-body leading-relaxed">
                Manage the portal's public-facing metadata and orchestrate response workflows for incoming editorial inquiries.
              </p>
            </div>

            {/* Optimized Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Public Profile Section */}
              <div className="xl:col-span-7">
                <div className="bg-[#1c1b1b] rounded-xl p-10 border border-[#464555]/10 shadow-lg">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-headline text-3xl flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#c0c1ff] text-3xl">public</span>
                      Public Profile
                    </h3>
                    <span className="px-4 py-1 rounded-full bg-[#c0c1ff]/10 text-[#c0c1ff] text-xs font-label uppercase tracking-widest">Configuration</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative group md:col-span-2">
                      <label className="absolute -top-2 left-4 px-2 bg-[#1c1b1b] text-xs font-label uppercase tracking-widest text-[#c7c4d8] group-focus-within:text-[#c0c1ff] transition-colors">Public Email</label>
                      <input
                        className="w-full bg-[#2a2a2a] text-[#e5e2e1] p-4 rounded-xl border-0 ring-1 ring-[#464555]/20 focus:ring-2 focus:ring-[#c0c1ff] transition-all outline-none font-body"
                        type="text"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="editorial@example.com"
                      />
                    </div>
                    <div className="relative group md:col-span-2">
                      <label className="absolute -top-2 left-4 px-2 bg-[#1c1b1b] text-xs font-label uppercase tracking-widest text-[#c7c4d8] group-focus-within:text-[#c0c1ff] transition-colors">Studio Location</label>
                      <input
                        className="w-full bg-[#2a2a2a] text-[#e5e2e1] p-4 rounded-xl border-0 ring-1 ring-[#464555]/20 focus:ring-2 focus:ring-[#c0c1ff] transition-all outline-none font-body"
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="Location"
                      />
                    </div>
                    <div className="relative group md:col-span-2">
                      <label className="absolute -top-2 left-4 px-2 bg-[#1c1b1b] text-xs font-label uppercase tracking-widest text-[#c7c4d8] group-focus-within:text-[#c0c1ff] transition-colors">Availability Status</label>
                      <select
                        className="w-full bg-[#2a2a2a] text-[#e5e2e1] p-4 rounded-xl border-0 ring-1 ring-[#464555]/20 focus:ring-2 focus:ring-[#c0c1ff] transition-all outline-none font-body appearance-none"
                        value={profile.status}
                        onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                      >
                        <option value="Available for New Projects">Available for New Projects</option>
                        <option value="Currently Fully Booked">Currently Fully Booked</option>
                        <option value="Consultation Only">Consultation Only</option>
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#c7c4d8]">
                        <span className="material-symbols-outlined">expand_more</span>
                      </div>
                    </div>
                    <div className="relative group md:col-span-2">
                      <label className="absolute -top-2 left-4 px-2 bg-[#1c1b1b] text-xs font-label uppercase tracking-widest text-[#c7c4d8] group-focus-within:text-[#c0c1ff] transition-colors">CV / Resume Link</label>
                      <input
                        className="w-full bg-[#2a2a2a] text-[#e5e2e1] p-4 rounded-xl border-0 ring-1 ring-[#464555]/20 focus:ring-2 focus:ring-[#c0c1ff] transition-all outline-none font-body"
                        type="url"
                        value={profile.cv_url}
                        onChange={(e) => setProfile({ ...profile, cv_url: e.target.value })}
                        placeholder="Google Drive / Dropbox link to your CV"
                      />
                    </div>
                    <div className="relative group md:col-span-2">
                      <label className="absolute -top-2 left-4 px-2 bg-[#1c1b1b] text-xs font-label uppercase tracking-widest text-[#c7c4d8] group-focus-within:text-[#c0c1ff] transition-colors">Base Image URL</label>
                      <input
                        className="w-full bg-[#2a2a2a] text-[#e5e2e1] p-4 rounded-xl border-0 ring-1 ring-[#464555]/20 focus:ring-2 focus:ring-[#c0c1ff] transition-all outline-none font-body"
                        type="url"
                        value={profile.base_image_url}
                        onChange={(e) => setProfile({ ...profile, base_image_url: e.target.value })}
                        placeholder="Paste environmental studio/location image link"
                      />
                    </div>
                  </div>
                  <div className="mt-10 flex justify-end">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={savingProfile}
                      className="bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#131313] px-10 py-4 rounded-full font-label font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                    >
                      {savingProfile ? 'Updating...' : 'Update Identity'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Visual Anchor */}
              <div className="xl:col-span-5 h-full">
                <div className="rounded-xl overflow-hidden aspect-[4/3] xl:aspect-auto xl:h-full relative group cursor-pointer shadow-2xl border border-[#464555]/10 min-h-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent z-10 opacity-80"></div>
                  {profile.base_image_url ? (
                    <img
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                      src={profile.base_image_url}
                      alt="Base of Operations"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1c1b1b] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#464555] text-6xl">image</span>
                    </div>
                  )}
                  <div className="absolute bottom-8 left-8 z-20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-8 h-[1px] bg-[#ffb783]"></span>
                      <p className="text-[10px] font-label uppercase tracking-[0.3rem] text-[#ffb783]">Base of Operations</p>
                    </div>
                    <h4 className="font-headline text-3xl italic text-[#e5e2e1]">{profile.location.split(',')[0]}</h4>
                    <p className="text-[#c7c4d8] text-sm mt-1 font-body opacity-0 group-hover:opacity-100 transition-opacity duration-500">{profile.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'new_project' && (
          <div className="max-w-5xl mx-auto grid grid-cols-12 gap-12 mb-20">
            {/* Left Column: Form */}
            <div className="col-span-12 xl:col-span-8">
              <header className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40">Draft</span>
                  <div className="h-[1px] w-8 bg-[#1c1b1b]"></div>
                </div>
                <h1 className="font-headline text-5xl font-bold tracking-tight text-[#e5e2e1] leading-tight">Create New Project</h1>
                <p className="text-[#e5e2e1]/60 mt-4 max-w-xl text-lg font-light leading-relaxed">
                  Define the essence of your work. Every detail here contributes to the editorial narrative of your portfolio.
                </p>
              </header>
              <form className="space-y-10" onSubmit={handleSaveProject}>
                {/* Project Name */}
                <div className="space-y-3">
                  <label className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 block ml-1">Project Name</label>
                  <input
                    className="w-full bg-[#1c1b1b] border-none rounded-xl p-5 text-xl text-[#e5e2e1] placeholder:text-[#e5e2e1]/10 font-headline font-medium focus:ring-2 focus:ring-[#c0c1ff] outline-none"
                    placeholder="Enter a distinctive title"
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Category */}
                  <div className="space-y-3">
                    <label className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 block ml-1">Category</label>
                    <input
                      className="w-full bg-[#1c1b1b] border-none rounded-xl p-4 text-[#e5e2e1] placeholder:text-[#e5e2e1]/10 focus:ring-2 focus:ring-[#c0c1ff] outline-none"
                      placeholder="e.g. Creative Direction"
                      type="text"
                      value={projectForm.category}
                      onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                    />
                  </div>
                  {/* URL */}
                  <div className="space-y-3">
                    <label className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 block ml-1">Live Website URL</label>
                    <input
                      className="w-full bg-[#1c1b1b] border-none rounded-xl p-4 text-[#e5e2e1] placeholder:text-[#e5e2e1]/10 focus:ring-2 focus:ring-[#c0c1ff] outline-none"
                      placeholder="https://example.com"
                      type="url"
                      value={projectForm.live_url}
                      onChange={e => setProjectForm({ ...projectForm, live_url: e.target.value })}
                    />
                  </div>
                </div>
                {/* Description */}
                <div className="space-y-3">
                  <label className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 block ml-1">Project Description</label>
                  <div className="bg-[#1c1b1b] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#c0c1ff]">
                    <div className="flex gap-2 p-3 border-b border-[#131313] bg-[#222121]">
                      <button className="p-2 hover:bg-[#353534] rounded-lg transition-colors text-[#e5e2e1]/40" type="button"><span className="material-symbols-outlined text-sm">format_bold</span></button>
                      <button className="p-2 hover:bg-[#353534] rounded-lg transition-colors text-[#e5e2e1]/40" type="button"><span className="material-symbols-outlined text-sm">format_italic</span></button>
                      <button className="p-2 hover:bg-[#353534] rounded-lg transition-colors text-[#e5e2e1]/40" type="button"><span className="material-symbols-outlined text-sm">link</span></button>
                      <div className="w-[1px] h-4 bg-[#131313] self-center mx-1"></div>
                      <button className="p-2 hover:bg-[#353534] rounded-lg transition-colors text-[#e5e2e1]/40" type="button"><span className="material-symbols-outlined text-sm">format_list_bulleted</span></button>
                    </div>
                    <textarea
                      className="w-full bg-transparent border-none p-5 text-[#e5e2e1]/80 placeholder:text-[#e5e2e1]/10 resize-none leading-relaxed outline-none"
                      placeholder="Narrate the story of this project..."
                      rows="6"
                      value={projectForm.description}
                      onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                {/* Media Upload */}
                <div className="space-y-3">
                  <label className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 block ml-1">Hero Image URL</label>
                  <input
                    className="w-full bg-[#1c1b1b] border-none rounded-xl p-4 text-[#e5e2e1] placeholder:text-[#e5e2e1]/10 font-body focus:ring-2 focus:ring-[#c0c1ff] outline-none"
                    placeholder="https://example.com/image.jpg"
                    type="url"
                    value={projectForm.image_url}
                    onChange={e => setProjectForm({ ...projectForm, image_url: e.target.value })}
                  />
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-6 pt-6">
                  <button
                    disabled={savingProject}
                    className="bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#131313] px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all shadow-[0_10px_30px_-5px_rgba(79,70,229,0.3)] disabled:opacity-50"
                    type="submit"
                  >
                    {savingProject ? 'Saving...' : 'Save Project'}
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-[#e5e2e1]/60 hover:text-[#e5e2e1] font-bold text-sm uppercase tracking-widest transition-colors underline underline-offset-8 decoration-[#1c1b1b] hover:decoration-[#c0c1ff]"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Meta & Preview */}
            <div className="col-span-12 xl:col-span-4 space-y-8">
              {/* Metadata Card */}
              <div className="bg-[#1c1b1b] rounded-2xl p-8 space-y-8 sticky top-32 border border-[#464555]/10 shadow-lg">
                <div>
                  <h4 className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-4">Project Insights</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-[#131313]">
                      <span className="text-sm text-[#e5e2e1]/60">Created On</span>
                      <span className="text-sm text-[#e5e2e1] font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#131313]">
                      <span className="text-sm text-[#e5e2e1]/60">Status</span>
                      <span className="text-sm text-[#c0c1ff] font-medium italic">Unsaved Draft</span>
                    </div>
                  </div>
                </div>

                {/* Mini Preview */}
                <div>
                  <h4 className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-4">Preview</h4>
                  <div className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-[#0e0e0e] border border-[#2a2a2a] flex items-center justify-center">
                    {projectForm.image_url ? (
                      <>
                        <img
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                          src={projectForm.image_url}
                          alt="Preview cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent opacity-90"></div>
                      </>
                    ) : (
                      <span className="material-symbols-outlined text-5xl text-[#353534] absolute">image</span>
                    )}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none z-10">
                      <p className="text-[10px] text-[#c0c1ff] font-bold uppercase tracking-widest mb-1">{projectForm.category || 'Category'}</p>
                      <h5 className="font-headline text-lg text-[#e5e2e1] leading-tight drop-shadow-md">{projectForm.title || 'Untitled Project'}</h5>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#e5e2e1]/40 mt-3 text-center italic font-label">Preview generated based on current metadata</p>
                </div>

                {/* Helper Tip */}
                <div className="bg-[#4b4dd8]/5 p-5 rounded-xl border border-[#c0c1ff]/10">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-[#c0c1ff] text-lg">lightbulb</span>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#e5e2e1]">Tip</p>
                      <p className="text-xs leading-relaxed text-[#c7c4d8]/80">Ensure images are optimized and links perfectly target your live demos.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'edit_project' && editingProject && (
          <div className="max-w-5xl mx-auto grid grid-cols-12 gap-12 mb-20">
            {/* Left Column: Form */}
            <div className="col-span-12 xl:col-span-8">
              <header className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-label uppercase tracking-[0.2em] text-[#c0c1ff]">Editing Mode</span>
                  <div className="h-[1px] w-8 bg-[#c0c1ff]/30"></div>
                </div>
                <h1 className="font-headline text-5xl font-bold tracking-tight text-[#e5e2e1] leading-tight">Modify Project</h1>
                <p className="text-[#e5e2e1]/60 mt-4 max-w-xl text-lg font-light leading-relaxed">
                  Refine the details of your project. Modernizing the narrative ensures your portfolio remains at the forefront of editorial excellence.
                </p>
              </header>
              <form className="space-y-10" onSubmit={handleUpdateProject}>
                {/* Project Name */}
                <div className="space-y-3">
                  <label className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 block ml-1">Project Name</label>
                  <input
                    className="w-full bg-[#1c1b1b] border-none rounded-xl p-5 text-xl text-[#e5e2e1] placeholder:text-[#e5e2e1]/10 font-headline font-medium focus:ring-2 focus:ring-[#c0c1ff] outline-none"
                    placeholder="Enter title"
                    type="text"
                    required
                    value={editingProject.TITLE || ''}
                    onChange={e => setEditingProject({ ...editingProject, TITLE: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Category */}
                  <div className="space-y-3">
                    <label className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 block ml-1">Category</label>
                    <input
                      className="w-full bg-[#1c1b1b] border-none rounded-xl p-4 text-[#e5e2e1] placeholder:text-[#e5e2e1]/10 focus:ring-2 focus:ring-[#c0c1ff] outline-none"
                      placeholder="Category"
                      type="text"
                      value={editingProject.CATEGORY || ''}
                      onChange={e => setEditingProject({ ...editingProject, CATEGORY: e.target.value })}
                    />
                  </div>
                  {/* URL */}
                  <div className="space-y-3">
                    <label className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 block ml-1">Live Website URL</label>
                    <input
                      className="w-full bg-[#1c1b1b] border-none rounded-xl p-4 text-[#e5e2e1] placeholder:text-[#e5e2e1]/10 focus:ring-2 focus:ring-[#c0c1ff] outline-none"
                      placeholder="URL"
                      type="url"
                      value={editingProject.LIVE_URL || ''}
                      onChange={e => setEditingProject({ ...editingProject, LIVE_URL: e.target.value })}
                    />
                  </div>
                </div>
                {/* Description */}
                <div className="space-y-3">
                  <label className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 block ml-1">Project Description</label>
                  <textarea
                    className="w-full bg-[#1c1b1b] border-none rounded-xl p-5 text-[#e5e2e1]/80 placeholder:text-[#e5e2e1]/10 resize-none leading-relaxed outline-none"
                    placeholder="Description"
                    rows="6"
                    value={editingProject.DESCRIPTION || ''}
                    onChange={e => setEditingProject({ ...editingProject, DESCRIPTION: e.target.value })}
                  ></textarea>
                </div>
                {/* Media Upload */}
                <div className="space-y-3">
                  <label className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 block ml-1">Hero Image URL</label>
                  <input
                    className="w-full bg-[#1c1b1b] border-none rounded-xl p-4 text-[#e5e2e1] placeholder:text-[#e5e2e1]/10 font-body focus:ring-2 focus:ring-[#c0c1ff] outline-none"
                    placeholder="Image URL"
                    type="url"
                    value={editingProject.IMAGE_URL || ''}
                    onChange={e => setEditingProject({ ...editingProject, IMAGE_URL: e.target.value })}
                  />
                </div>
                {/* Action Buttons */}
                <div className="flex items-center gap-6 pt-6">
                  <button
                    disabled={updatingProject}
                    className="bg-gradient-to-r from-[#c0c1ff] to-[#4b4dd8] text-[#131313] px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                    type="submit"
                  >
                    {updatingProject ? 'Updating...' : 'Update Project'}
                  </button>
                  <button
                    onClick={() => { setEditingProject(null); setActiveTab('projects'); }}
                    className="text-[#e5e2e1]/60 hover:text-[#e5e2e1] font-bold text-sm uppercase tracking-widest transition-colors underline underline-offset-8"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Meta & Preview */}
            <div className="col-span-12 xl:col-span-4 space-y-8">
              <div className="bg-[#1c1b1b] rounded-2xl p-8 sticky top-32 border border-[#464555]/10 shadow-lg">
                <h4 className="text-xs font-label uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-6">Live Preview</h4>
                <div className="aspect-video rounded-xl bg-[#0e0e0e] overflow-hidden mb-6 border border-[#2a2a2a]">
                  {editingProject.IMAGE_URL ? (
                    <img src={editingProject.IMAGE_URL} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#464555]">
                      <span className="material-symbols-outlined text-4xl">image</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="font-headline text-2xl font-bold text-[#e5e2e1]">{editingProject.TITLE || 'Untitled Project'}</h3>
                  <p className="text-sm text-[#c7c4d8]/60 line-clamp-3">{editingProject.DESCRIPTION || 'No description provided.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirm Modal */}
      {deleteConfirm && activeTab === 'projects' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="bg-[#201f1f] border border-[#464555]/20 rounded-xl p-10 w-full max-w-md shadow-2xl">
            <span className="material-symbols-outlined text-4xl text-[#ffb4ab] mb-4 block">warning</span>
            <h2 className="font-headline text-2xl font-bold text-[#e5e2e1] mb-2">Delete Project?</h2>
            <p className="font-body text-[#c7c4d8] mb-8">This action cannot be undone. The project will be permanently removed from the database.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-full border border-[#464555]/30 text-[#c7c4d8] hover:bg-[#2a2a2a] transition-colors font-label text-sm uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-full bg-[#93000a] text-[#ffdad6] hover:bg-[#93000a]/80 transition-colors font-label text-sm uppercase tracking-widest font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
