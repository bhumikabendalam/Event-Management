import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Users, Sparkles, Milestone } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

const TEAM: TeamMember[] = [
  {
    name: 'Amelia Patel',
    role: 'Co-Founder & Director',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    bio: 'Dedicated to building immersive local communities that spark genuine professional relationships.',
  },
  {
    name: 'Rajeev Sen',
    role: 'Lead Technical Architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Crafts secure database engines and premium frontend architectures that scale seamlessly.',
  },
  {
    name: 'Vikram Mehta',
    role: 'Head of Operations',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    bio: 'Orchestrates partnerships with venues, coordinators, and corporate hosts globally.',
  },
  {
    name: 'Sophia Chen',
    role: 'Community Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: 'Supports local hosts in executing summits, workshops, and acoustic community gatherings.',
  },
];

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-20">
      
      {/* Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-primary bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/25">
          <Milestone className="w-3.5 h-3.5" />
          Our Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
          Connecting Minds, Creating <br />
          <span className="text-gradient">Experiences</span>
        </h1>
        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
          EventFlow is a premium digital venue hosting summits, technology conferences, art shows, and networking spaces. We empower creators to design memorable gatherings.
        </p>
      </section>

      {/* Vision & values grids */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 border border-white/5 rounded-2xl space-y-4 bg-slate-900/30">
          <div className="w-10 h-10 bg-indigo-500/10 text-primary border border-indigo-500/25 rounded-xl flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">Curated Discovery</h3>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
            We vet hosts and venues to ensure attendees join workshops, panels, and music stages that inspire growth.
          </p>
        </div>

        <div className="glass-panel p-8 border border-white/5 rounded-2xl space-y-4 bg-slate-900/30">
          <div className="w-10 h-10 bg-pink-500/10 text-secondary border border-pink-500/25 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">Active Networking</h3>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
            By connecting tickets with public profiles, we bridge the gap between sitting in an audience and building networks.
          </p>
        </div>

        <div className="glass-panel p-8 border border-white/5 rounded-2xl space-y-4 bg-slate-900/30">
          <div className="w-10 h-10 bg-cyan-500/10 text-accent border border-cyan-500/25 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">Complete Control</h3>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
            From QR validation to roster downloads, hosts receive SaaS tools to oversee events from proposal to booking logs.
          </p>
        </div>
      </section>

      {/* Core Team Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
            Meet the <span className="text-gradient">Innovators</span>
          </h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            The creative minds coordinating partnerships and building tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM.map((member, idx) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 border border-white/5 rounded-2xl text-center space-y-4 bg-slate-900/10 hover:border-indigo-500/25 transition-all duration-300"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-20 h-20 rounded-full object-cover border border-white/10 mx-auto shadow-md"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm sm:text-base leading-snug">{member.name}</h4>
                <p className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider">{member.role}</p>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};
