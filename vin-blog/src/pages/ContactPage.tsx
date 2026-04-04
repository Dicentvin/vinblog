import { useState, type FormEvent } from 'react';
import { useSubscribeMutation } from '../store/apiSlice';

// ── Your real contact details ─────────────────────────────────────────────────
const CONTACT = {
  email:    'dr.vincent@skylimits.dev',
  phone:    '+234 801 234 5678',
  whatsapp: 'https://wa.me/2348012345678',
  twitter:  'https://twitter.com/drvincent',
  linkedin: 'https://linkedin.com/in/drvincent',
  instagram:'https://instagram.com/drvincent',
  location: 'Nigeria 🇳🇬',
};

const SUBJECTS = [
  'General Enquiry',
  'Medical Question / Second Opinion',
  'Collaboration / Partnership',
  'Speaking / Media Invitation',
  'Tech / Development Project',
  'Advertising / Sponsorship',
  'Other',
];

interface FormState {
  name:    string;
  email:   string;
  subject: string;
  message: string;
}

export default function ContactPage(): JSX.Element {
  const [subscribe] = useSubscribeMutation();

  const [form, setForm]   = useState<FormState>({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [nlEmail, setNlEmail] = useState('');
  const [nlDone,  setNlDone]  = useState(false);
  const [copied,  setCopied]  = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus('sending');

    // Simulate sending — replace with real email API (e.g. EmailJS, Resend, Formspree)
    await new Promise(r => setTimeout(r, 1500));
    setStatus('sent');
  };

  const handleSubscribe = async (): Promise<void> => {
    if (!nlEmail.trim()) return;
    try { await subscribe(nlEmail).unwrap(); } catch { /* ok */ }
    setNlDone(true);
  };

  const copyToClipboard = (text: string, key: string): void => {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* ── Header ── */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot flex-shrink-0" />
          <span className="text-[0.63rem] font-bold tracking-[0.18em] uppercase text-accent">Get In Touch</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.1] mb-4">
          Let's Start a<br />
          <em className="text-accent not-italic">Conversation</em>
        </h1>
        <p className="text-muted text-base leading-relaxed max-w-lg mx-auto">
          Whether you have a medical question, a collaboration idea, or just want to say hello —
          I am always happy to hear from readers and fellow professionals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10">

        {/* ── Contact Form ── */}
        <div className="admin-card p-6 sm:p-8">
          <h2 className="font-display font-bold text-xl text-white mb-1">Send a Message</h2>
          <p className="text-muted text-sm mb-6">I typically respond within 24-48 hours.</p>

          {status === 'sent' ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="font-display font-bold text-xl text-white mb-2">Message Sent!</h3>
              <p className="text-muted text-sm mb-6">Thank you for reaching out. I will get back to you shortly.</p>
              <button
                onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }); }}
                className="btn-primary px-6 py-2.5"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="name"
                    className="input-field text-sm"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="input-field text-sm"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">
                  Subject
                </label>
                <select
                  name="subject"
                  className="input-field text-sm"
                  value={form.subject}
                  onChange={handleChange}
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[0.62rem] font-bold tracking-widest uppercase text-muted mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="message"
                  className="input-field text-sm resize-y"
                  rows={6}
                  placeholder="Write your message here…"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Disclaimer */}
              <p className="text-[0.62rem] text-muted leading-relaxed bg-surface2 border border-border rounded-lg px-3 py-2.5">
                ⚠️ <strong className="text-white">Medical disclaimer:</strong> This contact form is not for medical emergencies.
                If you are experiencing a medical emergency, please call your local emergency number immediately.
                Responses to medical questions are for general educational purposes only and do not constitute medical advice.
              </p>

              {status === 'error' && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2.5">
                  <span className="text-red-400">⚠</span>
                  <p className="text-red-400 text-xs">Something went wrong. Please try emailing directly instead.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-primary w-full py-3 text-sm disabled:opacity-60"
              >
                {status === 'sending' ? '⏳ Sending…' : 'Send Message →'}
              </button>
            </form>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Direct contact */}
          <div className="admin-card p-5">
            <h3 className="text-xs font-bold tracking-widest uppercase text-accent mb-4">Direct Contact</h3>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center justify-between gap-3 p-3 bg-surface2 rounded-xl border border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center text-base flex-shrink-0">📧</div>
                  <div className="min-w-0">
                    <p className="text-[0.6rem] text-muted uppercase tracking-widest">Email</p>
                    <a href={`mailto:${CONTACT.email}`} className="text-sm text-white hover:text-accent transition-colors truncate block">
                      {CONTACT.email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(CONTACT.email, 'email')}
                  className="text-[0.6rem] text-muted hover:text-accent transition-colors bg-transparent border-0 cursor-pointer font-body flex-shrink-0 px-2 py-1 rounded border border-border hover:border-accent"
                >
                  {copied === 'email' ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between gap-3 p-3 bg-surface2 rounded-xl border border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center text-base flex-shrink-0">📞</div>
                  <div className="min-w-0">
                    <p className="text-[0.6rem] text-muted uppercase tracking-widest">Phone / WhatsApp</p>
                    <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="text-sm text-white hover:text-accent transition-colors block">
                      {CONTACT.phone}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(CONTACT.phone, 'phone')}
                  className="text-[0.6rem] text-muted hover:text-accent transition-colors bg-transparent border-0 cursor-pointer font-body flex-shrink-0 px-2 py-1 rounded border border-border hover:border-accent"
                >
                  {copied === 'phone' ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* WhatsApp */}
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/30 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-base flex-shrink-0">💬</div>
                <div>
                  <p className="text-[0.6rem] text-emerald-400/70 uppercase tracking-widest">WhatsApp</p>
                  <p className="text-sm text-emerald-400 font-semibold group-hover:text-emerald-300">Chat on WhatsApp →</p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-center gap-3 p-3 bg-surface2 rounded-xl border border-border">
                <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-base flex-shrink-0">📍</div>
                <div>
                  <p className="text-[0.6rem] text-muted uppercase tracking-widest">Location</p>
                  <p className="text-sm text-white">{CONTACT.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social media */}
          <div className="admin-card p-5">
            <h3 className="text-xs font-bold tracking-widests uppercase text-accent mb-4">Follow Me</h3>
            <div className="space-y-2">
              {[
                { platform: 'Twitter / X',  href: CONTACT.twitter,   icon: '𝕏',  color: 'text-sky-400',     bg: 'bg-sky-900/20 border-sky-500/30' },
                { platform: 'LinkedIn',     href: CONTACT.linkedin,  icon: 'in', color: 'text-blue-400',    bg: 'bg-blue-900/20 border-blue-500/30' },
                { platform: 'Instagram',    href: CONTACT.instagram, icon: '📷', color: 'text-pink-400',    bg: 'bg-pink-900/20 border-pink-500/30' },
              ].map(s => (
                <a
                  key={s.platform}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:opacity-80 ${s.bg}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {s.icon}
                  </div>
                  <span className={`text-sm font-medium ${s.color}`}>{s.platform}</span>
                  <span className="ml-auto text-xs text-muted">→</span>
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-gradient-to-br from-accent/10 to-accent2/8 border border-accent/20 rounded-xl p-5">
            <div className="text-2xl mb-2">📬</div>
            <h3 className="font-display font-bold text-base text-white mb-1">Newsletter</h3>
            <p className="text-muted text-xs leading-relaxed mb-3">
              Get weekly articles on medicine, tech, and self-development directly in your inbox. No spam — ever.
            </p>
            {nlDone ? (
              <div className="text-center py-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-accent font-semibold">✅ Subscribed! Welcome aboard.</p>
              </div>
            ) : (
              <>
                <input
                  className="input-field text-sm mb-2"
                  placeholder="your@email.com"
                  value={nlEmail}
                  onChange={e => setNlEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && void handleSubscribe()}
                />
                <button onClick={() => void handleSubscribe()} className="btn-primary w-full text-sm py-2.5">
                  Subscribe for Free →
                </button>
              </>
            )}
          </div>

          {/* Response time */}
          <div className="admin-card p-4">
            <h3 className="text-xs font-bold tracking-widest uppercase text-muted mb-3">Response Times</h3>
            <div className="space-y-2">
              {[
                { type: 'General enquiries',  time: '24-48 hours',  dot: 'bg-emerald-400' },
                { type: 'Collaboration',       time: '48-72 hours',  dot: 'bg-accent' },
                { type: 'Medical questions',   time: '2-5 days',     dot: 'bg-blue-400' },
                { type: 'Speaking requests',   time: '3-5 days',     dot: 'bg-accent2' },
              ].map(r => (
                <div key={r.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.dot}`} />
                    <span className="text-xs text-muted">{r.type}</span>
                  </div>
                  <span className="text-xs text-white font-medium">{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
