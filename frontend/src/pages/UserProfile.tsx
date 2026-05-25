import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/api';
import type { User } from '../services/api';
import { toast } from '../components/Toast';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ArrowLeft, User as UserIcon, Building, Phone, Link2, Info, Upload, CheckCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  
  // Local state form coordinates initialized directly from Zustand store
  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    avatar: user?.avatar || '',
    contact_number: user?.contact_number || '',
    secondary_contact: user?.secondary_contact || '',
    bio: user?.bio || '',
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarTab, setAvatarTab] = useState<'upload' | 'url'>(
    user?.avatar && !user.avatar.startsWith('data:image/') ? 'url' : 'upload'
  );
  const [dragActive, setDragActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        company: user.company || '',
        avatar: user.avatar || '',
        contact_number: user.contact_number || '',
        secondary_contact: user.secondary_contact || '',
        bio: user.bio || '',
      });
      setAvatarPreview(user.avatar || '');
      if (user.avatar && !user.avatar.startsWith('data:image/')) {
        setAvatarTab('url');
      }
    }
    setIsEditing(false);
  };

  // Sync form details with authenticated store user in case of late loading
  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        name: prev.name || user.name || '',
        company: prev.company || user.company || '',
        avatar: prev.avatar || user.avatar || '',
        contact_number: prev.contact_number || user.contact_number || '',
        secondary_contact: prev.secondary_contact || user.secondary_contact || '',
        bio: prev.bio || user.bio || '',
      }));
      setAvatarPreview((prev) => prev || user.avatar || '');
      if (user.avatar && !user.avatar.startsWith('data:image/')) {
        setAvatarTab('url');
      }
    }
  }, [user]);

  // Fetch fresh profile data on component mount in background
  const { isLoading } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const data = await userService.getUserProfile(user.id);
      if (data) {
        // Load extra fields from local storage
        const extraStr = localStorage.getItem(`eventflow_extra_${user.id}`);
        const extraFields = extraStr ? JSON.parse(extraStr) : {};
        const mergedData = { ...data, ...extraFields };

        setFormData({
          name: mergedData.name || '',
          company: mergedData.company || '',
          avatar: mergedData.avatar || '',
          contact_number: mergedData.contact_number || '',
          secondary_contact: mergedData.secondary_contact || '',
          bio: mergedData.bio || '',
        });
        setAvatarPreview(mergedData.avatar || '');
        if (mergedData.avatar) {
          setAvatarTab(mergedData.avatar.startsWith('data:image/') ? 'upload' : 'url');
        }

        // Keep Zustand auth store synchronized
        updateUser(mergedData);
        return mergedData;
      }
      return data;
    },
    enabled: !!user,
  });

  // Profile update mutation
  const updateMutation = useMutation({
    mutationFn: (payload: Partial<User>) => userService.updateProfile(payload),
    onSuccess: (res) => {
      if (res.success && res.data) {
        // Sync local storage extra fields immediately
        const extraFields = {
          avatar: formData.avatar,
          company: formData.company,
          contact_number: formData.contact_number,
          secondary_contact: formData.secondary_contact,
          bio: formData.bio,
        };
        localStorage.setItem(`eventflow_extra_${user?.id}`, JSON.stringify(extraFields));
        localStorage.setItem(`eventflow_avatar_${user?.id}`, formData.avatar || '');

        // Sync Zustand store with the backend response merged with local details!
        const mergedUser = {
          ...res.data,
          ...extraFields,
        };
        updateUser(mergedUser);
        setIsEditing(false);
        toast.success('Profile settings updated successfully!');
      } else {
        toast.error(res.error || 'Failed to save changes.');
      }
    },
    onError: () => {
      toast.error('An error occurred. Check connection settings.');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'avatar') {
      setAvatarPreview(value);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setFormData((prev) => ({ ...prev, avatar: base64Url }));
      setAvatarPreview(base64Url);
    };
    reader.readAsDataURL(file);
  };

  // Convert uploaded image file to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }));
    setAvatarPreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    updateMutation.mutate(formData);
  };

  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23818cf8'><rect width='100%' height='100%' fill='%23111827'/><circle cx='12' cy='8' r='4'/><path d='M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z'/></svg>`;

  if (isLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28">
        <SkeletonLoader type="profile" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home Page
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Preview Drawer */}
        <div className="glass-panel p-8 border border-border-glass rounded-2xl flex flex-col items-center text-center space-y-6 shadow-xl">
          <h3 className="text-base font-bold uppercase tracking-wider text-text-muted font-heading">
            Profile Preview
          </h3>

          <div className="relative">
            <img
              src={avatarPreview || defaultAvatar}
              alt="Avatar Preview"
              className="w-28 h-28 rounded-full object-cover border-2 border-indigo-500/30 shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-text-primary font-heading">{formData.name || 'Anonymous User'}</h4>
            <p className="text-xs text-text-muted">{user?.role} Role</p>
            <p className="text-xs text-text-secondary">{user?.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-border-glass text-xs text-text-muted space-y-2 text-left">
            <p className="flex justify-between">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Active Verified
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Form Inputs */}
        <div className="md:col-span-2 glass-panel p-8 border border-border-glass rounded-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-bold text-text-primary font-heading border-b border-border-glass pb-4">
              Edit Account Information
            </h3>

            {/* Grid fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-bg-primary border border-border-glass rounded-xl text-text-primary placeholder:text-text-muted text-sm outline-none transition-all duration-300 ${
                    isEditing ? 'focus:border-primary cursor-text' : 'opacity-80 cursor-not-allowed select-none'
                  }`}
                  required
                  readOnly={!isEditing}
                />
              </div>

              {/* Company / Hub affiliation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  Company / Organization
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder={isEditing ? "e.g. Symphony Creative Labs" : "Not Provided"}
                  className={`w-full px-4 py-3 bg-bg-primary border border-border-glass rounded-xl text-text-primary placeholder:text-text-muted text-sm outline-none transition-all duration-300 ${
                    isEditing ? 'focus:border-primary cursor-text' : 'opacity-80 cursor-not-allowed select-none'
                  }`}
                  readOnly={!isEditing}
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  Primary Phone Contact
                </label>
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                  placeholder={isEditing ? "e.g. +91 98765 43210" : "Not Provided"}
                  className={`w-full px-4 py-3 bg-bg-primary border border-border-glass rounded-xl text-text-primary placeholder:text-text-muted text-sm outline-none transition-all duration-300 ${
                    isEditing ? 'focus:border-primary cursor-text' : 'opacity-80 cursor-not-allowed select-none'
                  }`}
                  readOnly={!isEditing}
                />
              </div>

              {/* Networking Social handles */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                  Social Handle / Webpage
                </label>
                <input
                  type="text"
                  name="secondary_contact"
                  value={formData.secondary_contact}
                  onChange={handleInputChange}
                  placeholder={isEditing ? "e.g. @rajeev_sen" : "Not Provided"}
                  className={`w-full px-4 py-3 bg-bg-primary border border-border-glass rounded-xl text-text-primary placeholder:text-text-muted text-sm outline-none transition-all duration-300 ${
                    isEditing ? 'focus:border-primary cursor-text' : 'opacity-80 cursor-not-allowed select-none'
                  }`}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            {/* Avatar URL or image upload selector */}
            {isEditing && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                  Profile Picture (Avatar)
                </label>

                <div className="border border-border-glass rounded-2xl bg-bg-primary/50 p-4 space-y-4">
                {/* Tab headers */}
                <div className="flex gap-2 border-b border-border-glass pb-2">
                  <button
                    type="button"
                    onClick={() => setAvatarTab('upload')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                      avatarTab === 'upload'
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarTab('url')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                      avatarTab === 'url'
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Web Image URL
                  </button>
                </div>

                {/* Tab 1: Upload */}
                {avatarTab === 'upload' && (
                  <div className="space-y-4">
                    {!formData.avatar ? (
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
                          dragActive
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                        <p className="text-xs text-text-primary font-medium">
                          Drag & drop avatar here, or <span className="text-indigo-400 font-bold underline">browse</span>
                        </p>
                        <p className="text-[10px] text-text-muted mt-1">Supports JPG, PNG, GIF up to 2MB</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 bg-bg-primary p-3 rounded-xl border border-border-glass">
                        <img
                          src={formData.avatar}
                          alt="Avatar Preview"
                          className="w-16 h-16 rounded-full object-cover border border-border-glass"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">Uploaded Local File</p>
                          <p className="text-[10px] text-text-muted">Base64 Encoded Image</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="p-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 rounded-xl transition-all duration-300 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: URL */}
                {avatarTab === 'url' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="avatar"
                        value={formData.avatar}
                        onChange={handleInputChange}
                        placeholder="Paste image URL (e.g. https://...)"
                        className="w-full px-4 py-3 bg-bg-primary border border-border-glass rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                      />
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="px-4 py-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 rounded-xl transition-all duration-300 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {formData.avatar && (
                      <div className="flex items-center gap-4 bg-bg-primary p-3 rounded-xl border border-border-glass">
                        <img
                          src={formData.avatar}
                          alt="URL Preview"
                          className="w-16 h-16 rounded-full object-cover border border-border-glass"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultAvatar;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">Web Image URL</p>
                          <p className="text-[10px] text-text-muted truncate">{formData.avatar}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            )}

            {/* Bio textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                Professional Bio Summary
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                placeholder={isEditing ? "Share something about yourself, your skills, or event hosting interests..." : "No Bio Provided"}
                className={`w-full px-4 py-3 bg-bg-primary border border-border-glass rounded-xl text-text-primary placeholder:text-text-muted text-sm outline-none transition-all duration-300 resize-none ${
                  isEditing ? 'focus:border-primary cursor-text' : 'opacity-80 cursor-not-allowed select-none'
                }`}
                readOnly={!isEditing}
              />
            </div>

            {/* Submit & Edit Action Controls */}
            <div className="pt-4 flex justify-end gap-3 border-t border-border-glass">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3.5 bg-gradient-primary hover:scale-[1.02] text-white text-sm font-bold rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
                >
                  Edit Profile Settings
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-text-secondary hover:text-text-primary text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer"
                  >
                    Cancel Editing
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-8 py-3.5 bg-gradient-primary hover:scale-[1.02] text-white text-sm font-bold rounded-xl shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving Settings...' : 'Save Profile Updates'}
                  </button>
                </>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
