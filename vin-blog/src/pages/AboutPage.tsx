import { useNav } from '../hooks';

const SKILLS = [
  { category: 'Medicine',       items: ['Gynaecologic Oncology', 'Reproductive Medicine', 'Internal Medicine', 'Clinical Research', 'Evidence-Based Practice'] },
  { category: 'Technology',     items: ['Full-Stack Development', 'React & TypeScript', 'Node.js & PostgreSQL', 'Data Analysis', 'AI & Machine Learning'] },
  { category: 'Communication',  items: ['Medical Writing', 'Patient Education', 'Health Advocacy', 'Digital Content', 'Public Speaking'] },
];

const TIMELINE = [
  { year: '2025', title: 'Founded SkyLimits', desc: 'Launched this platform to bridge the gap between medicine and technology through quality long-form content.' },
  { year: '2024', title: 'Fellowship in Gynaecologic Oncology', desc: 'Advanced clinical training in gynaecologic cancers, surgical oncology, and cancer research.' },
  { year: '2022', title: 'Medical Degree (MBBS)', desc: 'Graduated with honours, developing a deep passion for women\'s health and evidence-based medicine.' },
  { year: '2021', title: 'First Code Commit', desc: 'Discovered programming during the pandemic and never looked back. Built first full-stack application.' },
  { year: '2019', title: 'Medical Research', desc: 'Published first peer-reviewed research article on reproductive health outcomes in West African women.' },
];

const STATS = [
  { value: '40+',  label: 'Articles Published',  icon: '📝' },
  { value: '7+',   label: 'Years in Medicine',    icon: '🩺' },
  { value: '3+',   label: 'Years in Tech',        icon: '💻' },
  { value: '50K+', label: 'Monthly Readers',      icon: '👁'  },
];

export default function AboutPage(): JSX.Element {
  const { navigate } = useNav();

  return (
    <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* ── Hero section ── */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center mb-16 pb-16 border-b border-border">
        {/* Photo */}
        <div className="flex-shrink-0 relative">
          <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-accent/30 shadow-2xl shadow-black/40">
            <img
              src="/src/images/authorimg.png"
              alt="Dr. Vincent"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Floating badge */}
          <div className="absolute -bottom-4 -right-4 bg-surface border border-accent/30 rounded-xl px-3 py-2 shadow-xl">
            <div className="text-xs font-bold text-accent">Dr. Vincent</div>
            <div className="text-[0.6rem] text-muted">MD · Developer · Writer</div>
          </div>
          {/* Decorative ring */}
          <div className="absolute -top-3 -left-3 w-16 h-16 rounded-full border border-accent/20 pointer-events-none" />
        </div>

        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/25 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot flex-shrink-0" />
            <span className="text-[0.63rem] font-bold tracking-[0.18em] uppercase text-accent">About Me</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-[1.1] mb-4">
            Where Medicine<br />
            <em className="text-accent not-italic">Meets Technology</em>
          </h1>
          <p className="text-muted text-base leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
            I am a medical doctor with a specialisation in Gynaecologic Oncology and a self-taught full-stack developer.
            SkyLimits is my attempt to make evidence-based medical knowledge more accessible, to explore the intersection
            of healthcare and technology, and to share insights from standing at the crossroads of two extraordinary fields.
          </p>
          <div className="flex gap-3 justify-center lg:justify-start flex-wrap">
            <button onClick={() => navigate('contact')} className="btn-primary px-6 py-2.5">
              Get In Touch →
            </button>
            <button onClick={() => navigate('blogs')} className="btn-ghost px-6 py-2.5">
              Read Articles
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {STATS.map(s => (
          <div key={s.label} className="admin-card p-5 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="font-display font-bold text-2xl sm:text-3xl text-accent mb-1">{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Story ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 pb-16 border-b border-border">
        <div>
          <p className="text-[0.62rem] font-bold tracking-[0.15em] uppercase text-accent mb-2">My Story</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mb-4">
            A doctor who codes
          </h2>
          <div className="space-y-4 text-muted text-sm leading-relaxed">
            <p>
              My journey into medicine began with a simple desire: to understand the human body and use that understanding to help people.
              What I did not anticipate was that medicine would lead me to some of the most complex problems in existence — problems that
              technology was uniquely positioned to help solve.
            </p>
            <p>
              During the COVID-19 pandemic, with hospitals overwhelmed and research moving at unprecedented speed, I found myself spending
              evenings learning to code. What started as curiosity became an obsession. The same analytical mindset that made me a good
              clinician turned out to be exactly what programming required.
            </p>
            <p>
              Today I work at the intersection of these two worlds — seeing patients, conducting research, building software, and writing
              about all of it. SkyLimits is my way of sharing the knowledge I have accumulated and the questions I am still wrestling with.
            </p>
          </div>
        </div>

        <div>
          <p className="text-[0.62rem] font-bold tracking-[0.15em] uppercase text-accent mb-2">My Mission</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mb-4">
            Why I write
          </h2>
          <div className="space-y-4 text-muted text-sm leading-relaxed">
            <p>
              Medical misinformation is one of the defining public health challenges of our era. Every week I see patients who have made
              decisions based on things they read online — some of it excellent, much of it dangerously wrong. I write to add more
              signal to a noisy information environment.
            </p>
            <p>
              I also write because the intersection of medicine and technology is one of the most exciting places to be right now.
              AI is transforming diagnostics. Wearable devices are generating unprecedented health data. Digital therapeutics are
              treating conditions that drugs cannot reach. These developments need voices who understand both the clinical and the technical dimensions.
            </p>
            <p>
              And I write because writing forces clarity of thought. Every article I publish has made me understand my own field better.
              The act of explaining something to a general audience reveals the gaps in your own understanding and forces you to fill them.
            </p>
          </div>
        </div>
      </div>

      {/* ── Skills ── */}
      <div className="mb-16 pb-16 border-b border-border">
        <div className="text-center mb-8">
          <p className="text-[0.62rem] font-bold tracking-[0.15em] uppercase text-accent mb-2">Expertise</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            What I bring to the table
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {SKILLS.map(group => (
            <div key={group.category} className="admin-card p-5">
              <h3 className="text-xs font-bold tracking-widest uppercase text-accent mb-4">{group.category}</h3>
              <div className="space-y-2">
                {group.items.map(skill => (
                  <div key={skill} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-sm text-[#e8e6f0]">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="mb-16 pb-16 border-b border-border">
        <div className="text-center mb-8">
          <p className="text-[0.62rem] font-bold tracking-[0.15em] uppercase text-accent mb-2">Journey</p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Key milestones
          </h2>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-8">
            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                className={`relative flex gap-6 sm:gap-0 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
              >
                {/* Content */}
                <div className={`flex-1 pl-10 sm:pl-0 ${i % 2 === 0 ? 'sm:pr-10 sm:text-right' : 'sm:pl-10'}`}>
                  <div className="admin-card p-4">
                    <span className="text-[0.6rem] font-bold tracking-widest uppercase text-accent">{item.year}</span>
                    <h3 className="font-display font-bold text-base text-white mt-1 mb-1">{item.title}</h3>
                    <p className="text-muted text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {/* Dot */}
                <div className="absolute left-4 sm:left-1/2 top-5 w-3 h-3 rounded-full bg-accent border-2 border-ink -translate-x-1/2" />
                {/* Empty space for opposite side */}
                <div className="hidden sm:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="text-center bg-gradient-to-br from-accent/10 to-accent2/8 border border-accent/20 rounded-2xl p-8 sm:p-12">
        <div className="text-4xl mb-4">👋</div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mb-3">
          Let's connect
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-6 max-w-md mx-auto">
          Whether you are a fellow clinician, a developer, a patient advocate, or just someone curious about the world —
          I would love to hear from you.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate('contact')} className="btn-primary px-6 py-2.5">
            Send a Message →
          </button>
          <a
            href="mailto:dr.vincent@skylimits.dev"
            className="btn-ghost px-6 py-2.5"
          >
            dr.vincent@skylimits.dev
          </a>
        </div>
      </div>
    </main>
  );
}
