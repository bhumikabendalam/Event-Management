import React, { useState } from 'react';
import { toast } from '../components/Toast';
import { Mail, Phone, MapPin, Send, HelpCircle, FileText } from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error('Please enter all details.');
      return;
    }

    setSending(true);
    // Simulate support ticket email submission
    setTimeout(() => {
      setSending(false);
      toast.success('Your message has been sent! Our support team will get in touch shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-28 space-y-12">
      {/* Banner */}
      <section className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
          Contact <span className="text-gradient">Support</span>
        </h1>
        <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
          Need help registering, verifying host credentials, or canceling booking tickets? Get in touch!
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Side: Support channels */}
        <div className="space-y-6">
          <div className="glass-panel p-8 border border-white/5 rounded-2xl space-y-6 bg-slate-900/40 shadow-lg">
            <h3 className="text-base font-bold uppercase tracking-wider text-text-muted font-heading">
              Support Directory
            </h3>

            {/* Email */}
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 text-primary border border-indigo-500/25 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Email Inquiry</h4>
                <a href="mailto:hello@eventflow.com" className="text-xs sm:text-sm text-text-secondary hover:text-primary transition-colors block mt-1">
                  hello@eventflow.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 text-primary border border-indigo-500/25 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Phone Support</h4>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  +91 80 4930 2000 <span className="text-[10px] text-text-muted">(Mon-Fri)</span>
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-indigo-500/10 text-primary border border-indigo-500/25 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Symphony Office</h4>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mt-1">
                  Symphony Tower, 24th Floor, <br />
                  Bangalore, Karnataka, IN
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Message form */}
        <div className="lg:col-span-2 glass-panel p-8 border border-white/5 rounded-2xl shadow-xl bg-slate-900/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-bold font-heading text-white border-b border-white/5 pb-4">
              Submit a Support Ticket
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajeev Sen"
                  className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rajeev@domain.com"
                  className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                Inquiry Category / Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Trouble booking tickets / Request host verification..."
                className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300"
                required
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Message / Details
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Explain the problem or request in detail..."
                className="w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-xl text-text-primary text-sm focus:border-primary outline-none transition-all duration-300 resize-none"
                required
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-8 py-3.5 bg-gradient-primary hover:scale-[1.02] text-white text-sm font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Sending Ticket...' : 'Submit Inquiry'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
