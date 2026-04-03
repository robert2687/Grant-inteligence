import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserProfile as UserProfileType } from '../types';
import { User, Briefcase, Target, Upload, Save, CheckCircle2 } from 'lucide-react';

export default function UserProfile() {
  const { userProfile, updateUserProfile } = useAppContext();
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UserProfileType>(userProfile || {
    firstName: '', lastName: '', dob: '', gender: '', country: '', city: '', photoUrl: '', bio: '',
    profession: '', industry: '', yearsOfExperience: '', skills: '', certifications: '', website: '',
    preferredGrantTypes: '', preferredRegions: '', fundingSizeRange: '', projectThemes: '', preferredDeadlines: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateUserProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">User Profile</h2>
          <p className="text-gray-500 mt-2">Manage your identity and grant preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          <span>{isSaved ? 'Saved!' : 'Save Profile'}</span>
        </button>
      </header>

      {/* Personal Info */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
          <User className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Personal Information</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">Recommended: Square image, max 2MB.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (Optional)</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender (Optional)</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border">
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country / Region</label>
            <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City (Optional)</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" placeholder="1-3 sentences about yourself..."></textarea>
          </div>
        </div>
      </section>

      {/* Professional Identity */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Professional Identity</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession / Job Title</label>
            <input type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry / Sector</label>
            <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn or Website (Optional)</label>
            <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" placeholder="https://" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills and Competencies</label>
            <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" placeholder="e.g. AI, Machine Learning, Project Management (comma separated)" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Certifications or Qualifications</label>
            <input type="text" name="certifications" value={formData.certifications} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" />
          </div>
        </div>
      </section>

      {/* Grant Preferences */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Grant Preferences</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Grant Types</label>
            <input type="text" name="preferredGrantTypes" value={formData.preferredGrantTypes} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" placeholder="e.g. research, innovation, SME, education, arts, social impact" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Regions</label>
            <input type="text" name="preferredRegions" value={formData.preferredRegions} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" placeholder="e.g. EU, global, national" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Funding Size Range</label>
            <input type="text" name="fundingSizeRange" value={formData.fundingSizeRange} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" placeholder="e.g. €50k - €500k" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Themes of Interest</label>
            <input type="text" name="projectThemes" value={formData.projectThemes} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" placeholder="e.g. Climate Tech, Autonomous Agents, Healthcare" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Deadlines</label>
            <input type="text" name="preferredDeadlines" value={formData.preferredDeadlines} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border" placeholder="e.g. short-term, long-term, recurring" />
          </div>
        </div>
      </section>
    </div>
  );
}
