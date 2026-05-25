import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/api';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { ArrowLeft, Building, Mail, Phone, ExternalLink, ShieldCheck, User } from 'lucide-react';

export const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = Number(id);

  // Query public profile data
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => userService.getUserProfile(userId),
    enabled: !isNaN(userId),
  });

  if (isNaN(userId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h2 className="text-2xl font-bold text-white">Invalid Profile ID</h2>
        <Link to="/events" className="text-primary mt-4 inline-block hover:underline">Return to Discovery</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28">
        <SkeletonLoader type="profile" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white font-heading">Profile Not Found</h2>
        <p className="text-text-secondary max-w-sm mx-auto">
          The user profile you are looking for may have been deactivated or does not exist.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-gradient-primary text-white text-sm font-semibold rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const defaultAvatar = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23818cf8'><rect width='100%' height='100%' fill='%23111827'/><circle cx='12' cy='8' r='4'/><path d='M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z'/></svg>`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-white transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>

      {/* Main card */}
      <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative bg-slate-900/30">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-primary"></div>

        <div className="p-8 sm:p-12 space-y-8">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left border-b border-white/5 pb-8">
            <img
              src={profile.avatar || defaultAvatar}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/30 shadow-lg shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            />
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading leading-none">
                  {profile.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full mt-1 sm:mt-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">{profile.role} Profile</p>
              
              {profile.company && (
                <p className="text-sm text-text-secondary flex items-center justify-center sm:justify-start gap-1.5 font-semibold">
                  <Building className="w-4 h-4 text-indigo-400" />
                  {profile.company}
                </p>
              )}
            </div>
          </div>

          {/* Bio block */}
          {profile.bio && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" />
                About {profile.name.split(' ')[0]}
              </h3>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed whitespace-pre-line bg-slate-950/20 border border-white/5 p-6 rounded-2xl">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Directory Contact handles */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-text-muted tracking-wider">Networking Directory</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Email */}
              <div className="glass-panel p-5 border border-white/5 rounded-xl flex items-center gap-4 bg-slate-900/40">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-text-muted">Primary Email</p>
                  <a href={`mailto:${profile.email}`} className="text-xs sm:text-sm font-semibold text-white hover:text-primary transition-colors truncate block">
                    {profile.email}
                  </a>
                </div>
              </div>

              {/* Secondary Handle */}
              {profile.secondary_contact && (
                <div className="glass-panel p-5 border border-white/5 rounded-xl flex items-center gap-4 bg-slate-900/40">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-primary">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-text-muted">Social Handle / Web</p>
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      {profile.secondary_contact}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {profile.contact_number && (
                <div className="glass-panel p-5 border border-white/5 rounded-xl flex items-center gap-4 bg-slate-900/40 col-span-1 sm:col-span-2">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-primary">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-text-muted">Phone Number</p>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {profile.contact_number}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
