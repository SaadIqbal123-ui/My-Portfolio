import React, { useState } from 'react';
import API_BASE_URL from '../apiConfig';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', attachment_link: '' });
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState({ email: 'saadiqbalbse067@gmail.com', location: 'Remote', status: 'Currently accepting new commissions' });

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/profile`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setProfile({
            email: data.EMAIL || 'saadiqbalbse067@gmail.com',
            location: data.LOCATION || 'Islamabad, Pakistan',
            status: data.STATUS || 'Available for New Projects',
            base_image_url: data.BASE_IMAGE_URL || 'https://res.cloudinary.com/durgaqq7v/image/upload/v1775323710/portfolio/studio_fallback.jpg'
          });
        }
      })
      .catch(err => console.error('Error fetching profile:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (attachmentFiles.length + files.length > 4) {
      alert("Maximum 4 images allowed.");
      return;
    }
    setAttachmentFiles([...attachmentFiles, ...files]);
  };

  const removeFile = (index) => {
    setAttachmentFiles(attachmentFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      attachmentFiles.forEach(file => data.append('images', file));

      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '', attachment_link: '' });
        setAttachmentFiles([]);
      } else {
        const errData = await response.json();
        console.error('Submission failed:', errData);
        alert(errData.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      alert('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <header className="mb-24 md:ml-24">
        <span className="font-label text-sm uppercase tracking-[0.2em] text-on-surface-variant mb-4 block">
          Get in touch
        </span>
        <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter leading-tight text-on-surface max-w-4xl">
          Let&apos;s compose your{' '}
          <span className="italic text-primary">next masterpiece</span> together.
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column — Contact Details */}
        <aside className="lg:col-span-4 order-2 lg:order-1 space-y-16">
          <section>
            <h3 className="font-headline text-2xl mb-6">Contact Details</h3>
            <div className="space-y-8">
              <div className="group">
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">
                  General Inquiries
                </p>
                <a
                  className="text-xl hover:text-primary transition-colors duration-300"
                  href={`mailto:${profile.email}`}
                >
                  {profile.email}
                </a>
              </div>
              <div className="group">
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">
                  Location
                </p>
                <p className="text-xl">{profile.location}</p>
              </div>
            </div>
          </section>



          <div className="relative rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 aspect-[3/4] max-w-sm group cursor-pointer shadow-2xl">
            <img
              alt="Studio view"
              className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
              src={profile.base_image_url}
            />
            
            {/* Overlay matching the high-fidelity admin dashboard */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-8 z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-[1px] w-8 bg-primary"></div>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary font-label font-bold">
                  Base of Operations
                </span>
              </div>
              <h3 className="font-headline italic text-4xl sm:text-5xl text-on-surface">
                {profile.location ? profile.location.split(',')[0] : 'Islamabad'}
              </h3>
              <p className="text-on-surface-variant text-sm mt-2 font-body opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {profile.location || 'Islamabad, Pakistan'}
              </p>
            </div>
          </div>
        </aside>

        {/* Right Column — Contact Form */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-surface-container-low rounded-xl p-8 md:p-12">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
                <span className="material-symbols-outlined text-6xl text-primary">check_circle</span>
                <h2 className="font-headline text-4xl text-on-surface">Message Sent!</h2>
                <p className="text-on-surface-variant text-lg">
                  Thank you for reaching out. I&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => { 
                    setSubmitted(false); 
                    setFormData({ name: '', email: '', subject: '', message: '', attachment_link: '' }); 
                    setAttachmentFiles([]);
                  }}
                  className="signature-gradient text-on-primary font-bold py-3 px-8 rounded-full mt-4 hover:scale-105 transition-transform"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="relative group">
                    <label
                      className="font-label text-xs uppercase tracking-widest text-on-surface-variant absolute -top-3 left-4 bg-surface-container-low px-2 z-10"
                      htmlFor="name"
                    >
                      Full Name
                    </label>
                    <input
                      className="w-full bg-surface-container-high border-none rounded-xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all duration-300"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      required
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="relative group">
                    <label
                      className="font-label text-xs uppercase tracking-widest text-on-surface-variant absolute -top-3 left-4 bg-surface-container-low px-2 z-10"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <input
                      className="w-full bg-surface-container-high border-none rounded-xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all duration-300"
                      id="email"
                      name="email"
                      placeholder="hello@gmail.com"
                      required
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="relative group">
                  <label
                    className="font-label text-xs uppercase tracking-widest text-on-surface-variant absolute -top-3 left-4 bg-surface-container-low px-2 z-10"
                    htmlFor="subject"
                  >
                    Subject
                  </label>
                  <input
                    className="w-full bg-surface-container-high border-none rounded-xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all duration-300"
                    id="subject"
                    name="subject"
                    placeholder="Project inquiry: Branding Strategy"
                    required
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                {/* Message */}
                <div className="relative group">
                  <label
                    className="font-label text-xs uppercase tracking-widest text-on-surface-variant absolute -top-3 left-4 bg-surface-container-low px-2 z-10"
                    htmlFor="message"
                  >
                    Message
                  </label>
                  <textarea
                    className="w-full bg-surface-container-high border-none rounded-xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all duration-300 resize-none"
                    id="message"
                    name="message"
                    placeholder="Tell me about your vision..."
                    required
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                {/* Attachments Section */}
                <div className="space-y-8 pt-4 border-t border-outline-variant/10">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-label">Attachment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Reference Link */}
                    <div className="relative group">
                      <label 
                        className="font-label text-xs uppercase tracking-widest text-on-surface-variant absolute -top-3 left-4 bg-surface-container-low px-2 z-10"
                        htmlFor="attachment_link"
                      >
                        Project / Reference Link (Optional)
                      </label>
                      <input
                        className="w-full bg-surface-container-high border-none rounded-xl py-4 px-6 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all duration-300"
                        id="attachment_link"
                        name="attachment_link"
                        placeholder="https://..."
                        type="url"
                        value={formData.attachment_link}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="relative">
                      <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4 ml-1">
                        Attach Images (Optional - Max 4, 5MB each)
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {attachmentFiles.map((file, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-container-highest group">
                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                            <button 
                              type="button"
                              onClick={() => removeFile(idx)}
                              className="absolute inset-0 bg-error/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="material-symbols-outlined text-white text-sm">close</span>
                            </button>
                          </div>
                        ))}
                        {attachmentFiles.length < 4 && (
                          <label className="w-16 h-16 rounded-lg border-2 border-dashed border-outline-variant/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleFileChange} 
                            />
                            <span className="material-symbols-outlined text-on-surface-variant/40">add</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end">
                  <button
                    disabled={isSubmitting}
                    className={`signature-gradient text-on-primary font-body font-bold py-4 px-12 rounded-full shadow-[0_40px_40px_-15px_rgba(73,75,214,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 group ${isSubmitting ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    type="submit"
                  >
                    {isSubmitting ? 'Sending Request...' : 'Send Message'}
                    <span className={`material-symbols-outlined transition-transform ${isSubmitting ? 'animate-spin' : 'group-hover:translate-x-1'}`}>
                      {isSubmitting ? 'sync' : 'send'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Status badge */}
          <div className="mt-8 flex items-center gap-4 text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-label text-xs uppercase tracking-widest">
              {profile.status}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
