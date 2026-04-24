// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  FiCloud, FiTerminal, FiArrowRight, FiGithub, FiTwitter, 
  FiLinkedin, FiMail, FiCheckCircle, FiCpu, FiZap, 
  FiChevronUp, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import Domains from './pages/Domains';
import Hosting from './pages/Hosting';
import ApiMarketplacePage from './pages/ApiMarketplace';
import Library from './pages/Library';
import Dashboard from './pages/Dashboard';

// ---------- BACKGROUND PARTICLES ----------
const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    let particles: Array<{ x: number; y: number; radius: number; alpha: number; speedX: number; speedY: number }> = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(150, Math.floor(window.innerWidth * 0.1));
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.5 + 0.1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.2,
        });
      }
    };
    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      animationId = requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resize);
    resize();
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ background: '#0a0a0f' }} />;
};

// ---------- ANIMATED CODE ----------
const AnimatedCode = ({ lines, className = '' }: { lines: string[]; className?: string }) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  useEffect(() => {
    lines.forEach((_, idx) => setTimeout(() => setVisibleLines(prev => [...prev, idx]), idx * 150));
  }, [lines]);
  return (
    <div className={`font-mono text-sm ${className}`}>
      {lines.map((line, idx) => (
        <div key={idx} className={`transition-all duration-300 ease-out transform ${visibleLines.includes(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <span className="text-gray-500 select-none mr-4">{String(idx + 1).padStart(2, '0')}</span>
          <span className="text-blue-400">{line}</span>
        </div>
      ))}
    </div>
  );
};

// ---------- VS CODE EDITOR SCREENSHOT ----------
const CodeEditorScreenshot = ({ title = "deploy-app.tsx", language = "typescript" }) => {
  const code: string[] = [
    "import { PCloudClient } from '@pclouds/sdk';",
    "",
    "const client = new PCloudClient({",
    "  apiKey: process.env.PCLOUD_API_KEY,",
    "  region: 'africa-west-1'",
    "});",
    "",
    "async function deploy() {",
    "  try {",
    "    const deployment = await client.deploy({",
    "      project: 'my-startup',",
    "      env: 'production',",
    "      domain: 'startup.pclouds.africa'",
    "    });",
    "    console.log(`✅ Deployed at ${deployment.url}`);",
    "  } catch (error) {",
    "    console.error('Deployment failed:', error);",
    "  }",
    "}",
    "",
    "deploy();"
  ];
  return (
    <div className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-800">
        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
        <div className="text-xs text-gray-400 font-mono">{title}</div>
        <div className="text-xs text-gray-500">{language}</div>
      </div>
      <div className="bg-gray-900/90 p-4 overflow-x-auto">
        <pre className="font-mono text-sm">
          {code.map((line, i) => {
            let colorClass = "text-gray-300";
            if (line.includes("import") || line.includes("from")) colorClass = "text-purple-400";
            else if (line.includes("console")) colorClass = "text-yellow-400";
            else if (line.includes("✅")) colorClass = "text-green-400";
            else if (line.includes("error")) colorClass = "text-red-400";
            else if (line.includes("await") || line.includes("async")) colorClass = "text-blue-400";
            else if (line.includes("'") || line.includes('"')) colorClass = "text-green-300";
            else if (line.match(/{\s*$/)) colorClass = "text-orange-300";
            return <div key={i} className={colorClass}>{line || " "}</div>;
          })}
        </pre>
      </div>
    </div>
  );
};

// ---------- PARTNERS ----------
const Partners = () => {
  const partners = ["Google", "Amazon Web Services", "Microsoft", "Stripe", "Vercel", "Flutterwave"];
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-20 px-6 bg-gradient-to-b from-gray-950 to-black border-y border-gray-800"
    >
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-cyan-400 mb-6">Trusted by teams building across Africa</p>
        <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-8 opacity-70">
          {partners.map((partner, i) => (
            <motion.div
              key={partner}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 0.7, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl font-semibold text-gray-400 hover:text-white transition"
            >
              {partner}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

// ---------- TESTIMONIALS (CAROUSEL) ----------
const Testimonials = () => {
  const testimonials = [
    {
      name: "Amara Okonkwo",
      role: "CTO, Swiftly Logistics",
      content: "PCLOUDs reduced our deployment time by over 70%. The API marketplace enabled us to integrate SMS and payment services in minutes rather than weeks.",
    },
    {
      name: "Kwame Asante",
      role: "Full-stack Developer, Freelance",
      content: "As an independent developer, the startup bundle offers exceptional value. Combining domain, hosting, and API credits in a single plan simplifies my workflow significantly.",
    },
    {
      name: "Fatima El-Sayed",
      role: "Founder, EduTech Kenya",
      content: "We migrated our student projects to PCLOUDs with ease. The hosting and database tooling are reliable, and the support team is consistently responsive.",
    },
    {
      name: "Tunde Adebayo",
      role: "DevOps Engineer, Paystack",
      content: "PCLOUDs delivers a developer experience tailored for African teams. The documentation is clear, and the pricing structure aligns well with local realities.",
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = window.setInterval(nextSlide, 5000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAutoPlaying, currentIndex]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-20 px-6 bg-gray-900/40"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-3">Trusted by engineering teams across Africa</h2>
        <p className="text-gray-400 mb-12">Join a growing network of developers building scalable products on PCLOUDs</p>
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-gray-800/30 border border-gray-700 rounded-xl p-8"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-medium mb-4">
                  {getInitials(testimonials[currentIndex].name)}
                </div>
                <p className="text-gray-300 text-lg leading-relaxed mb-6 italic">"{testimonials[currentIndex].content}"</p>
                <div className="font-semibold text-white">{testimonials[currentIndex].name}</div>
                <div className="text-sm text-gray-400">{testimonials[currentIndex].role}</div>
              </div>
            </motion.div>
          </AnimatePresence>
          <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-gray-800/50 hover:bg-gray-700 p-2 rounded-full"><FiChevronLeft className="w-5 h-5" /></button>
          <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-gray-800/50 hover:bg-gray-700 p-2 rounded-full"><FiChevronRight className="w-5 h-5" /></button>
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? "bg-blue-500 w-4" : "bg-gray-600"}`} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// ---------- STATS ----------
const Stats = () => {
  const [counts, setCounts] = useState({ developers: 0, apis: 0, deployments: 0, uptime: 99.99 });
  useEffect(() => {
    const targets = { developers: 12847, apis: 48, deployments: 253132 };
    const duration = 2000, stepTime = 20, steps = duration / stepTime;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setCounts({
        developers: Math.min(targets.developers, Math.floor((currentStep / steps) * targets.developers)),
        apis: Math.min(targets.apis, Math.floor((currentStep / steps) * targets.apis)),
        deployments: Math.min(targets.deployments, Math.floor((currentStep / steps) * targets.deployments)),
        uptime: 99.99
      });
      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);
  }, []);
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-16 px-6 bg-transparent"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-center gap-10 md:gap-0">
        <div className="flex flex-col items-center"><div className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{counts.developers.toLocaleString()}+</div><div className="text-gray-400 text-sm mt-2">Developers</div></div>
        <div className="flex flex-col items-center"><div className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{counts.apis}+</div><div className="text-gray-400 text-sm mt-2">APIs available</div></div>
        <div className="flex flex-col items-center"><div className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{counts.deployments.toLocaleString()}+</div><div className="text-gray-400 text-sm mt-2">Monthly deployments</div></div>
        <div className="flex flex-col items-center"><div className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{counts.uptime}%</div><div className="text-gray-400 text-sm mt-2">Uptime SLA</div></div>
      </div>
    </motion.section>
  );
};

// ---------- GLOBAL REACH (simplified: removed globe, added country list) ----------
const GlobalReach = () => {
  // List of 3 countries where PCLOUDs operates
  const operatingCountries = ["Nigeria", "Kenya", "Ghana"];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-24 px-6 bg-gradient-to-b from-gray-950 to-black"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
        {/* Left side: text content (unchanged) */}
        <div>
          <div className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm mb-4">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" /> Infrastructure Layer
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Built for Africa.<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Optimized for speed.</span>
          </h2>
          <p className="text-gray-400 mb-6 max-w-md">
            Deploy closer to your users with a distributed edge network across Africa. 
            Reduce latency, improve reliability, and scale without complexity.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8">
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full" /> sub-20ms latency</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full" /> multi-region routing</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 bg-purple-400 rounded-full" /> auto scaling</span>
          </div>
        </div>

        {/* Right side: simple list of 3 countries */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-gray-900/40 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">Live now in</h3>
            <div className="space-y-4">
              {operatingCountries.map((country, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0"
                >
                  <span className="text-lg font-medium text-gray-200">{country}</span>
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    active
                  </span>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs text-center mt-6">
              Expanding to more African countries soon
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

// ---------- NAVBAR (with conditional API link) ----------
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToApiSection = () => {
    const section = document.getElementById('api-marketplace');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };
  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-950/90 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><FiCloud className="text-white" /></div>
          <span className="font-bold text-xl tracking-tight">PCLOUDs</span>
          <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full ml-2">beta</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-gray-300">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/domains" className="hover:text-white transition">Domains</Link>
          <Link to="/hosting" className="hover:text-white transition">Hosting</Link>
          {isHome ? (
            <button onClick={scrollToApiSection} className="hover:text-white transition cursor-pointer">APIs</button>
          ) : (
            <Link to="/api-marketplace" className="hover:text-white transition">APIs</Link>
          )}
          <Link to="/library" className="hover:text-white transition">Library</Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-gray-300 hover:text-white px-3 py-1.5 rounded-md transition">Sign in</button>
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-md font-medium transition shadow-lg shadow-blue-600/20">Get Started</button>
        </div>
      </div>
    </nav>
  );
};

// ---------- HERO ----------
const Hero = () => {
  const codeLines: string[] = ['npx pclouds init my-app', 'cd my-app', 'pclouds deploy --prod', '✅ Deployment ready in 12.3s', '→ https://my-app.pclouds.africa'];
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg viewBox="0 0 1000 500" className="absolute right-[-200px] top-[-50px] w-[1200px]">
          <g stroke="#3b82f6" strokeWidth="1.2" fill="none" strokeDasharray="4 8">
            <path d="M120 200 Q300 100 480 180 T840 160" />
            <path d="M200 260 Q400 320 600 250 T900 300" />
            <path d="M150 120 Q350 200 520 140 T880 200" />
          </g>
          <g fill="#3b82f6">
            <circle cx="300" cy="180" r="4" />
            <circle cx="520" cy="140" r="4" />
            <circle cx="680" cy="260" r="4" />
            <circle cx="820" cy="160" r="4" />
          </g>
        </svg>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-full px-3 py-1 text-sm mb-6">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
              <span>Africa's first developer cloud</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Build, deploy,<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> scale faster</span></h1>
            <p className="text-gray-400 text-lg mb-8 max-w-lg">Domains, hosting, APIs, and a developer marketplace — unified for African developers. No more fragmented tools or dollar-only payments.</p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition">Start building <FiArrowRight /></button>
              <button className="border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"><FiTerminal /> pcloud deploy</button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1"><FiZap className="text-yellow-500" /> 99.9% uptime SLA</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="gradient-border"><div className="gradient-border-inner"><div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div><span className="text-xs text-gray-500">bash</span></div><AnimatedCode lines={codeLines} /></div></div>
            <div className="absolute -top-8 -right-8 text-7xl text-blue-500/10 font-mono select-none animate-pulse-slow">{'</>'}</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ---------- ARCHITECTURE PREVIEW ----------
const ArchitecturePreview = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes whiteElectricPulse {
        0% { text-shadow: 0 0 0px rgba(255,255,255,0); }
        20% { text-shadow: 0 0 8px rgba(255,255,255,0.9), 0 0 4px rgba(6,182,212,0.8); }
        40% { text-shadow: 0 0 4px rgba(255,255,255,0.5); }
        60% { text-shadow: 0 0 12px rgba(255,255,255,1), 0 0 6px rgba(6,182,212,1); }
        80% { text-shadow: 0 0 6px rgba(255,255,255,0.7); }
        100% { text-shadow: 0 0 0px rgba(255,255,255,0); }
      }
      .white-electric-line {
        animation: whiteElectricPulse 1.2s ease-in-out infinite;
        color: #ffffff;
      }
      .white-electric-line:nth-child(1) { animation-delay: 0s; }
      .white-electric-line:nth-child(2) { animation-delay: 0.2s; }
      .white-electric-line:nth-child(3) { animation-delay: 0.4s; }
      .white-electric-line:nth-child(4) { animation-delay: 0.6s; }
      .white-electric-line:nth-child(5) { animation-delay: 0.8s; }
      .white-electric-line:nth-child(6) { animation-delay: 1.0s; }
      .white-electric-line:nth-child(7) { animation-delay: 1.2s; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  const treeLines = [
    "PCLOUDs Platform",
    "│",
    "├── Domains",
    "├── Hosting",
    "├── API Marketplace",
    "├── Deployment Engine",
    "└── Developer Libraries"
  ];
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-20 px-6"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">One platform. Complete developer stack.</h2>
          <p className="text-gray-400 mb-6">Domains, hosting, APIs, deployments, and reusable libraries — orchestrated from a single infrastructure layer.</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>✓ Unified deployment console</li>
            <li>✓ Built-in API key management</li>
            <li>✓ African edge hosting</li>
            <li>✓ Startup-ready bundles</li>
          </ul>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 font-mono text-sm overflow-x-auto">
          <pre className="text-white">
            {treeLines.map((line, idx) => (
              <div key={idx} className={idx > 0 ? "white-electric-line" : "text-white font-bold"}>
                {line}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </motion.section>
  );
};

// ---------- FEATURE CARD ----------
const FeaturePreview = ({ title }: { title: string }) => {
  // ✅ Changed JSX.Element to React.ReactNode
  const previews: Record<string, React.ReactNode> = {
    "Domain Services": (<div className="bg-black/60 border border-gray-800 rounded-lg p-3 font-mono text-xs text-green-400">example.ng   A   76.76.21.21<br />www          CNAME edge.pclouds.africa</div>),
    "Cloud Hosting": (<div className="bg-black/60 border border-gray-800 rounded-lg p-3 font-mono text-xs text-green-400">$ pcloud deploy<br />✓ Build successful<br />🌍 Live in 11.2s</div>),
    "API Marketplace": (<div className="bg-black/60 border border-gray-800 rounded-lg p-3 font-mono text-xs text-blue-400">curl /sms/send<br />status: 200 OK</div>),
    "Developer Library": (<div className="bg-black/60 border border-gray-800 rounded-lg p-3 font-mono text-xs text-purple-400">import AuthKit<br />initDashboard()</div>),
    "CLI Tool": (<div className="bg-black/60 border border-gray-800 rounded-lg p-3 font-mono text-xs text-yellow-400">pcloud logs my-app<br />listening on :443</div>),
    "Deployment Console": (<div className="bg-black/60 border border-gray-800 rounded-lg p-3 text-xs text-gray-300">uptime: 99.99%<br />builds: 142</div>)
  };
  return previews[title] || null;
};

interface FeatureCardProps {
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard = ({ title, description, gradient }: FeatureCardProps) => {
  const serviceTags: Record<string, string[]> = {
    "Domain Services": ["DNS", "WHOIS", ".ng", ".africa"],
    "Cloud Hosting": ["Node.js", "Laravel", "SSL", "Databases"],
    "API Marketplace": ["SMS", "Payments", "WhatsApp", "AI"],
    "Developer Library": ["Boilerplates", "Dashboards", "SDKs"],
    "CLI Tool": ["Deploy", "Logs", "Env"],
    "Deployment Console": ["Projects", "Monitoring", "Keys"]
  };
  const tags = serviceTags[title] || [];
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl p-6 hover:border-blue-500/40 transition">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} mb-5 shadow-lg`} />
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2 mb-4">{tags.map(tag => <span key={tag} className="text-xs px-3 py-1 rounded-full border border-gray-700 text-gray-300 bg-gray-900/50">{tag}</span>)}</div>
      <div className="mb-4"><FeaturePreview title={title} /></div>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      <div className="mt-6 flex items-center justify-between opacity-70 group-hover:opacity-100 transition">
        <span className="text-xs text-blue-400 font-mono">Open module →</span>
        <FiArrowRight className="text-gray-500 group-hover:text-blue-400 transition" />
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition" />
    </motion.div>
  );
};

// ---------- MODULES SECTION ----------
const ModulesSection = () => {
  const modules: FeatureCardProps[] = [
    { title: 'Domain Services', description: 'Register .com, .ng, .africa domains with DNS management and WHOIS privacy.', gradient: 'from-blue-500 to-cyan-500' },
    { title: 'Cloud Hosting', description: 'Node.js, Laravel, static sites — with SSL, database tools, and file manager.', gradient: 'from-purple-500 to-pink-500' },
    { title: 'API Marketplace', description: 'SMS, Email, Payment, WhatsApp, AI APIs — pay per usage, get API keys instantly.', gradient: 'from-green-500 to-emerald-500' },
    { title: 'Developer Library', description: 'Buy & sell reusable code: dashboards, boilerplates, integrations.', gradient: 'from-orange-500 to-red-500' },
    { title: 'CLI Tool', description: 'pcloud deploy — push from your terminal, manage env vars, view logs.', gradient: 'from-indigo-500 to-blue-500' },
    { title: 'Deployment Console', description: 'Central dashboard for projects, domains, databases, and API keys.', gradient: 'from-rose-500 to-pink-500' }
  ];
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6" id="features">
      <div className="max-w-7xl mx-auto"><div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ship</h2><p className="text-gray-400 max-w-2xl mx-auto">From domain registration to deployment, we've got African developers covered.</p></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {modules.map((mod, idx) => mod.title === 'API Marketplace' ? <div key={idx} className="lg:col-span-2"><FeatureCard {...mod} /></div> : <FeatureCard key={idx} {...mod} />)}
      </div></div>
    </motion.section>
  );
};

// ---------- API MARKETPLACE (standalone section) ----------
const ApiMarketplace = () => {
  const apis = [
    { name: 'SMS API', endpoint: 'https://api.pclouds.africa/v1/sms', price: '$0.005 per msg' },
    { name: 'WhatsApp API', endpoint: 'https://api.pclouds.africa/v1/whatsapp', price: '$0.01 per msg' },
    { name: 'Forex Rate API', endpoint: 'https://api.pclouds.africa/v1/forex', price: 'Free tier 1000/day' }
  ];
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6 bg-gray-900/30 border-y border-gray-800" id="api-marketplace">
      <div className="max-w-7xl mx-auto"><div className="grid lg:grid-cols-2 gap-12 items-center">
        <div><div className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm mb-4"><FiCpu /> Core Differentiator</div><h2 className="text-3xl md:text-4xl font-bold mb-4">API Marketplace</h2><p className="text-gray-400 mb-6">Subscribe to production‑ready APIs with one click. Generate API keys, monitor usage, and pay only for what you consume.</p><div className="space-y-3">{apis.map((api, idx) => (<div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition"><div className="flex justify-between items-center flex-wrap gap-2"><span className="font-mono text-blue-400">{api.endpoint}</span><span className="text-xs bg-gray-900 px-2 py-1 rounded">{api.price}</span></div><div className="text-sm text-gray-400 mt-1">{api.name}</div></div>))}</div>
          <Link to="/api-marketplace" className="mt-6 inline-flex text-blue-400 hover:text-blue-300 font-medium items-center gap-1">Browse all 20+ APIs <FiArrowRight /></Link>
        </div>
        <div className="relative"><div className="code-block"><div className="text-gray-400 mb-2">// Test API in your browser</div><pre className="text-green-400">{`curl -X POST https://api.pclouds.africa/v1/sms \\\n  -H "X-API-Key: your_key" \\\n  -d '{"to":"+234...","message":"Hello"}'`}</pre></div></div>
      </div></div>
    </motion.section>
  );
};

// ---------- STARTUP BUNDLE ----------
const StartupBundle = () => {
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6">
      <div className="max-w-7xl mx-auto"><div className="gradient-border"><div className="gradient-border-inner bg-gradient-to-br from-gray-900 to-gray-950"><div className="grid md:grid-cols-2 gap-8 items-center">
      <div><div className="inline-flex items-center gap-2 bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-sm mb-4"><FiZap /> Launch Special</div><h3 className="text-2xl md:text-3xl font-bold mb-3">Startup Launch Bundle</h3><p className="text-gray-400 mb-4">Everything you need to launch your MVP: domain, hosting, email API, SMS credits, and deployment tools.</p><ul className="space-y-2 mb-6"><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 1 free .com.ng domain</li><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 6 months shared hosting</li><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 10,000 email API credits</li><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 500 SMS API credits</li></ul><div className="flex items-center gap-4 flex-wrap"><span className="text-3xl font-bold">$19<span className="text-sm text-gray-400">/month</span></span><button className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-medium">Claim bundle →</button></div></div>
      <div className="relative"><div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"><div className="flex items-center gap-2 mb-3"><FiTerminal className="text-gray-400" /><span className="text-sm font-mono">pclouds bundle create startup-2025</span></div><div className="h-px bg-gray-700 my-2"></div><div className="text-green-400 text-sm">✓ Bundle activated. Your infrastructure is ready.</div></div></div>
    </div></div></div></div>
    </motion.section>
  );
};

// ---------- CLI PREVIEW ----------
const CliPreview = () => {
  const commands: string[] = ['$ pcloud deploy','→ Building your application...','→ Deploying to edge network...','✓ Deployment complete (12.3s)','→ https://my-app.pclouds.africa','$ pcloud logs --tail'];
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6 bg-gray-900/30" id="cli">
      <div className="max-w-7xl mx-auto text-center"><h2 className="text-3xl font-bold mb-3">Deploy from your terminal</h2><p className="text-gray-400 max-w-2xl mx-auto mb-10">The PCLOUDs CLI gives you full control. Push updates, manage env vars, and stream logs.</p><div className="max-w-2xl mx-auto code-block text-left"><AnimatedCode lines={commands} /><div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center"><span className="text-xs text-gray-500">pclouds-cli v1.0.0-beta</span><span className="text-green-400 text-sm flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> connected</span></div></div></div>
    </motion.section>
  );
};

// ---------- CODE SCREENSHOTS ----------
const CodeScreenshots = () => {
  return (
    <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="py-20 px-6 bg-gray-900/20">
      <div className="max-w-7xl mx-auto"><div className="text-center mb-12"><h2 className="text-3xl font-bold mb-3">Build with your favorite tools</h2><p className="text-gray-400">Seamless integration into your existing workflow</p></div><div className="grid md:grid-cols-2 gap-8"><CodeEditorScreenshot title="deploy-app.tsx" language="TypeScript" /><CodeEditorScreenshot title="api-usage.js" language="JavaScript" /></div><div className="mt-8 max-w-2xl mx-auto"><CodeEditorScreenshot title="Dockerfile" language="dockerfile" /></div></div>
    </motion.section>
  );
};

// ---------- FOOTER ----------
const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 pt-16 pb-8 px-6"><div className="max-w-7xl mx-auto"><div className="grid md:grid-cols-5 gap-8 mb-12"><div className="col-span-2"><div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><FiCloud className="text-white" /></div><span className="font-bold text-xl">PCLOUDs</span></div><p className="text-gray-500 text-sm max-w-xs">Building Africa's default infrastructure platform for developers and startups.</p><div className="flex gap-4 mt-4"><FiGithub className="text-gray-500 hover:text-white cursor-pointer transition" /><FiTwitter className="text-gray-500 hover:text-white cursor-pointer transition" /><FiLinkedin className="text-gray-500 hover:text-white cursor-pointer transition" /><FiMail className="text-gray-500 hover:text-white cursor-pointer transition" /></div></div><div><h4 className="font-semibold mb-3">Product</h4><ul className="space-y-2 text-sm text-gray-500"><li><Link to="/domains" className="hover:text-gray-300">Domains</Link></li><li><Link to="/hosting" className="hover:text-gray-300">Hosting</Link></li><li><Link to="/api-marketplace" className="hover:text-gray-300">API Marketplace</Link></li><li><Link to="/library" className="hover:text-gray-300">Library</Link></li><li><a href="#" className="hover:text-gray-300">CLI</a></li></ul></div><div><h4 className="font-semibold mb-3">Developers</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#" className="hover:text-gray-300">Documentation</a></li><li><a href="#" className="hover:text-gray-300">API Reference</a></li><li><a href="#" className="hover:text-gray-300">Status</a></li><li><a href="#" className="hover:text-gray-300">GitHub</a></li></ul></div><div><h4 className="font-semibold mb-3">Company</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#" className="hover:text-gray-300">About</a></li><li><a href="#" className="hover:text-gray-300">Blog</a></li><li><a href="#" className="hover:text-gray-300">Careers</a></li><li><a href="#" className="hover:text-gray-300">Contact</a></li></ul></div></div><div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-600">&copy; 2025 PCLOUDs — Empowering African developers. All rights reserved.</div></div></footer>
  );
};

// ---------- SCROLL TO TOP BUTTON ----------
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 500);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg shadow-blue-600/20 transition-all"
        >
          <FiChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ---------- MAIN APP (with conditional navbar/footer) ----------
function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-gray-950 relative">
      <Particles />
      <div className="relative z-10">
        {!isDashboard && <Navbar />}
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <ArchitecturePreview />
              <GlobalReach />
              <ModulesSection />
              <CodeScreenshots />
              <ApiMarketplace />
              <StartupBundle />
              <CliPreview />
              <Partners />
              <Testimonials />
              <Stats />
            </>
          } />
          <Route path="/domains" element={<Domains />} />
          <Route path="/hosting" element={<Hosting />} />
          <Route path="/api-marketplace" element={<ApiMarketplacePage />} />
          <Route path="/library" element={<Library />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        {!isDashboard && <Footer />}
        <ScrollToTop />
      </div>
    </div>
  );
}

// Wrap the whole app with Router
export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}