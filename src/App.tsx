import { useState, useEffect } from 'react';
import { 
  FiSearch, FiGlobe, FiCloud, FiGrid, FiTerminal, 
  FiBookOpen, FiDollarSign, FiUsers, FiLock, FiZap,
  FiArrowRight, FiGithub, FiTwitter, FiLinkedin, FiMail,
  FiCheckCircle, FiCode, FiDatabase, FiServer, FiCpu,
  FiStar, FiAward, FiTrendingUp, FiPlay, FiRefreshCw
} from 'react-icons/fi';

// ===== 3D GLOBE with React Three Fiber =====
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

// Country coordinates (latitude, longitude) for 12 African nations
const countryMarkers = [
  { name: "Nigeria", lat: 9.0820, lon: 8.6753, color: "#3b82f6" },
  { name: "Kenya", lat: -1.2864, lon: 36.8172, color: "#10b981" },
  { name: "Ghana", lat: 7.9465, lon: -1.0232, color: "#f59e0b" },
  { name: "South Africa", lat: -30.5595, lon: 22.9375, color: "#ef4444" },
  { name: "Egypt", lat: 26.8206, lon: 30.8025, color: "#8b5cf6" },
  { name: "Morocco", lat: 31.7917, lon: -7.0926, color: "#ec4899" },
  { name: "Senegal", lat: 14.4974, lon: -14.4524, color: "#06b6d4" },
  { name: "Uganda", lat: 1.3733, lon: 32.2903, color: "#84cc16" },
  { name: "Tanzania", lat: -6.3690, lon: 34.8888, color: "#f97316" },
  { name: "Cameroon", lat: 3.8480, lon: 11.5021, color: "#14b8a6" },
  { name: "Ivory Coast", lat: 7.5400, lon: -5.5471, color: "#a855f7" },
  { name: "Ethiopia", lat: 9.1450, lon: 40.4897, color: "#eab308" }
];

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = lon * Math.PI / 180;
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

function Globe3D() {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-800 bg-black/50 relative">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Earth texture (high-res from Three.js examples) */}
        <Sphere args={[1.2, 64, 64]}>
          <meshStandardMaterial 
            map={new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg')}
            roughness={0.5}
            metalness={0.1}
          />
        </Sphere>
        
        {/* Atmospheric glow */}
        <Sphere args={[1.22, 64, 64]}>
          <meshStandardMaterial 
            color="#3b82f6"
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </Sphere>
        
        {/* Country markers with pulsing rings */}
        {countryMarkers.map((country) => {
          const pos = latLonToVector3(country.lat, country.lon, 1.25);
          return (
            <group key={country.name}>
              {/* Pulsing ring */}
              <mesh position={pos}>
                <ringGeometry args={[0.05, 0.08, 16]} />
                <meshStandardMaterial 
                  color={country.color} 
                  emissive={country.color}
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.8}
                />
              </mesh>
              {/* Center dot */}
              <mesh position={pos}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color={country.color} emissive={country.color} emissiveIntensity={1} />
              </mesh>
              {/* Tooltip label */}
              <Html position={pos} distanceFactor={1.5}>
                <div className="bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded px-2 py-1 whitespace-nowrap border border-gray-700 shadow-lg">
                  {country.name}
                </div>
              </Html>
            </group>
          );
        })}
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
      <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
        {countryMarkers.length} countries • Drag to rotate
      </div>
    </div>
  );
}

// ===== AUTO-LAUNCH DARK ROCKET (no click, periodic launch) =====
const AutoLaunchRocket = () => {
  const [launchState, setLaunchState] = useState<'idle' | 'launching' | 'flying'>('idle');
  const [resetKey, setResetKey] = useState(0);
  
  useEffect(() => {
    // First launch after 1.5 seconds
    const initialTimer = setTimeout(() => {
      setLaunchState('launching');
    }, 1500);
    
    // Cycle every 8 seconds: launch → fly → reset
    const interval = setInterval(() => {
      setLaunchState('launching');
      setTimeout(() => {
        setResetKey(prev => prev + 1);
        setLaunchState('idle');
      }, 3000);
    }, 8000);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);
  
  useEffect(() => {
    if (launchState === 'launching') {
      setTimeout(() => setLaunchState('flying'), 100);
      setTimeout(() => {
        setTimeout(() => {
          setLaunchState('idle');
        }, 2500);
      }, 100);
    }
  }, [launchState]);
  
  return (
    <div key={resetKey} className="relative flex justify-center items-center h-64">
      <div className={`relative transition-all duration-1000 ease-out ${launchState === 'flying' ? '-translate-y-56 scale-150 rotate-12 opacity-0' : ''}`}>
        {/* Dark rocket body */}
        <div className="relative w-20 h-40">
          {/* Main body - dark metallic */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 rounded-t-full rounded-b-lg shadow-lg border border-gray-600"></div>
          {/* Nose cone - dark red */}
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[18px] border-r-[18px] border-b-[28px] border-l-transparent border-r-transparent border-b-red-800"></div>
          {/* Window - cyan glow */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-7 h-7 bg-cyan-800 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-500/20"></div>
          {/* Dark fins */}
          <div className="absolute bottom-0 left-[-10px] w-10 h-14 bg-gray-800 rounded-bl-2xl transform -skew-x-12 border-r border-gray-600"></div>
          <div className="absolute bottom-0 right-[-10px] w-10 h-14 bg-gray-800 rounded-br-2xl transform skew-x-12 border-l border-gray-600"></div>
          
          {/* Thruster flame */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-12">
            <div className={`absolute inset-0 bg-orange-600 rounded-full blur-md ${launchState === 'launching' || launchState === 'flying' ? 'animate-pulse scale-150' : 'animate-pulse'}`}></div>
            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-yellow-400 rounded-full blur-sm ${launchState === 'launching' || launchState === 'flying' ? 'animate-ping' : ''}`}></div>
          </div>
          
          {/* Side thrusters */}
          <div className="absolute bottom-4 -left-3 w-3 h-6 bg-gray-700 rounded-sm"></div>
          <div className="absolute bottom-4 -right-3 w-3 h-6 bg-gray-700 rounded-sm"></div>
        </div>
      </div>
      
      {/* Particle effects during launch */}
      {launchState === 'launching' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-orange-400 rounded-full"
              style={{
                left: `calc(50% + ${(Math.random() - 0.5) * 100}px)`,
                top: `calc(50% + ${Math.random() * 80}px)`,
                animation: `fadeUp ${Math.random() * 0.8 + 0.5}s ease-out forwards`
              }}
            />
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes fadeUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-80px); }
        }
      `}</style>
    </div>
  );
};

// ========== ANIMATED CODE COMPONENT ==========
const AnimatedCode = ({ lines, className = '' }: { lines: string[], className?: string }) => {
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  
  useEffect(() => {
    lines.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, idx]);
      }, idx * 150);
    });
  }, []);
  
  return (
    <div className={`font-mono text-sm ${className}`}>
      {lines.map((line, idx) => (
        <div 
          key={idx} 
          className={`transition-all duration-300 ease-out transform ${
            visibleLines.includes(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="text-gray-500 select-none mr-4">{String(idx + 1).padStart(2, '0')}</span>
          <span className="text-blue-400">{line}</span>
        </div>
      ))}
    </div>
  );
};

// ========== VS CODE EDITOR SCREENSHOT ==========
const CodeEditorScreenshot = ({ title = "deploy-app.tsx", language = "typescript" }) => {
  const code = [
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
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
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
            return (
              <div key={i} className={colorClass}>
                {line || " "}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
};

// ========== PARTNERS SECTION ==========
const Partners = () => {
  const partners = [
    { name: "TechHive Africa", logo: "🏢", bg: "from-blue-900/30 to-purple-900/30" },
    { name: "StartupGrind Lagos", logo: "🔥", bg: "from-red-900/30 to-orange-900/30" },
    { name: "Ingressive for Good", logo: "💡", bg: "from-yellow-900/30 to-amber-900/30" },
    { name: "AfriLabs", logo: "🌍", bg: "from-green-900/30 to-emerald-900/30" },
    { name: "Google Developer Groups", logo: "👨‍💻", bg: "from-indigo-900/30 to-blue-900/30" },
    { name: "Flutterwave", logo: "💸", bg: "from-pink-900/30 to-rose-900/30" },
  ];
  
  return (
    <section className="py-16 px-6 border-y border-gray-800 bg-gray-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Trusted by leading ecosystems</h2>
          <p className="text-gray-400">We partner with organizations that empower African tech talent</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, idx) => (
            <div key={idx} className={`bg-gradient-to-br ${partner.bg} border border-gray-800 rounded-xl p-4 text-center backdrop-blur-sm hover:scale-105 transition`}>
              <div className="text-3xl mb-2">{partner.logo}</div>
              <div className="text-sm font-medium">{partner.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== TESTIMONIALS ==========
const Testimonials = () => {
  const testimonials = [
    {
      name: "Amara Okonkwo",
      role: "CTO, Swiftly Logistics",
      content: "PCLOUDs reduced our deployment time by 70%. The API marketplace gave us access to SMS and payment APIs in minutes, not weeks.",
      avatar: "👩‍💻",
      rating: 5
    },
    {
      name: "Kwame Asante",
      role: "Full-stack developer, Freelance",
      content: "As a solo developer, I love the startup bundle. Domain + hosting + API credits for $19/mo is unbeatable. The CLI is buttery smooth.",
      avatar: "👨‍💻",
      rating: 5
    },
    {
      name: "Fatima El-Sayed",
      role: "Founder, EduTech Kenya",
      content: "We moved all our student projects to PCLOUDs. The static hosting and database tools just work. Support is responsive and helpful.",
      avatar: "👩‍🏫",
      rating: 5
    },
    {
      name: "Tunde Adebayo",
      role: "DevOps Engineer, Paystack",
      content: "Finally, a cloud platform built with African developers in mind. The API documentation is top-notch and the local pricing makes sense.",
      avatar: "🧑‍🔧",
      rating: 5
    }
  ];
  
  return (
    <section className="py-20 px-6 bg-gray-900/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Loved by developers across Africa</h2>
          <p className="text-gray-400">Join thousands of engineers building the future on PCLOUDs</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-gray-800/30 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{t.avatar}</div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
              <div className="flex mb-2">
                {[...Array(t.rating)].map((_, i) => <FiStar key={i} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">"{t.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== STATS SECTION (countries removed, now shown on globe) ==========
const Stats = () => {
  const [counts, setCounts] = useState({ 
    developers: 0, 
    apis: 0, 
    deployments: 0,
    uptime: 99.99
  });
  
  useEffect(() => {
    const targets = { developers: 12847, apis: 48, deployments: 253132 };
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
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
    <section className="py-12 px-6 border-y border-gray-800 bg-black/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-3xl md:text-4xl font-bold text-blue-400">{counts.developers.toLocaleString()}+</div>
          <div className="text-gray-500 text-sm mt-1">Developers</div>
        </div>
        <div>
          <div className="text-3xl md:text-4xl font-bold text-purple-400">{counts.apis}+</div>
          <div className="text-gray-500 text-sm mt-1">APIs available</div>
        </div>
        <div>
          <div className="text-3xl md:text-4xl font-bold text-green-400">{counts.deployments.toLocaleString()}+</div>
          <div className="text-gray-500 text-sm mt-1">Monthly deployments</div>
        </div>
        <div>
          <div className="text-3xl md:text-4xl font-bold text-red-400">{counts.uptime}%</div>
          <div className="text-gray-500 text-sm mt-1">Uptime SLA</div>
        </div>
      </div>
    </section>
  );
};

// ========== GLOBAL REACH SECTION (3D Globe) ==========
const GlobalReach = () => {
  return (
    <section className="py-20 px-6 bg-gray-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Our footprint across Africa</h2>
          <p className="text-gray-400">Serving developers in 12 countries and growing</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Globe3D />
          <div className="space-y-4">
            <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><FiGlobe className="text-blue-400" /> Active Regions</h3>
              <div className="grid grid-cols-2 gap-2">
                {countryMarkers.map(c => (
                  <div key={c.name} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-5 border border-blue-500/30">
              <p className="text-gray-300 text-sm">
                🌍 We're expanding across the continent. Next: Rwanda, Zambia, Botswana, and Senegal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ========== NAVBAR ==========
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-gray-950/90 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FiCloud className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">PCLOUDs</span>
          <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full ml-2">beta</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-gray-300">
          <a href="#domains" className="hover:text-white transition">Domains</a>
          <a href="#hosting" className="hover:text-white transition">Hosting</a>
          <a href="#api-marketplace" className="hover:text-white transition">APIs</a>
          <a href="#library" className="hover:text-white transition">Library</a>
          <a href="#cli" className="hover:text-white transition">CLI</a>
          <a href="#partners" className="hover:text-white transition">Partners</a>
          <a href="#docs" className="hover:text-white transition">Docs</a>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-gray-300 hover:text-white px-3 py-1.5 rounded-md transition">Sign in</button>
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-md font-medium transition shadow-lg shadow-blue-600/20">Get Started</button>
        </div>
      </div>
    </nav>
  );
};

// ========== HERO ==========
const Hero = () => {
  const codeLines = [
    'npx pclouds init my-app',
    'cd my-app',
    'pclouds deploy --prod',
    '✅ Deployment ready in 12.3s',
    '→ https://my-app.pclouds.africa'
  ];
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
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
          </div>
          <div className="relative">
            <div className="gradient-border"><div className="gradient-border-inner"><div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div><span className="text-xs text-gray-500">bash</span></div><AnimatedCode lines={codeLines} /></div></div>
            <div className="absolute -top-8 -right-8 text-7xl text-blue-500/10 font-mono select-none animate-pulse-slow">{'</>'}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ========== FEATURE CARD ==========
const FeatureCard = ({ icon: Icon, title, description, gradient = 'from-blue-500 to-purple-500' }) => (
  <div className="group relative bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1">
    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}><Icon className="text-white text-xl" /></div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
);

// ========== MODULES SECTION ==========
const ModulesSection = () => {
  const modules = [
    { icon: FiGlobe, title: 'Domain Services', description: 'Register .com, .ng, .africa domains with DNS management and WHOIS privacy.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: FiCloud, title: 'Cloud Hosting', description: 'Node.js, Laravel, static sites — with SSL, database tools, and file manager.', gradient: 'from-purple-500 to-pink-500' },
    { icon: FiGrid, title: 'API Marketplace', description: 'SMS, Email, Payment, WhatsApp, AI APIs — pay per usage, get API keys instantly.', gradient: 'from-green-500 to-emerald-500' },
    { icon: FiCode, title: 'Developer Library', description: 'Buy & sell reusable code: dashboards, boilerplates, integrations.', gradient: 'from-orange-500 to-red-500' },
    { icon: FiTerminal, title: 'CLI Tool', description: 'pcloud deploy — push from your terminal, manage env vars, view logs.', gradient: 'from-indigo-500 to-blue-500' },
    { icon: FiDatabase, title: 'Deployment Console', description: 'Central dashboard for projects, domains, databases, and API keys.', gradient: 'from-rose-500 to-pink-500' },
  ];
  return (
    <section className="py-20 px-6" id="features">
      <div className="max-w-7xl mx-auto"><div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ship</h2><p className="text-gray-400 max-w-2xl mx-auto">From domain registration to deployment, we've got African developers covered.</p></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{modules.map((mod, idx) => (<FeatureCard key={idx} {...mod} />))}</div></div>
    </section>
  );
};

// ========== API MARKETPLACE ==========
const ApiMarketplace = () => {
  const apis = [
    { name: 'SMS API', endpoint: 'https://api.pclouds.africa/v1/sms', price: '$0.005 per msg' },
    { name: 'WhatsApp API', endpoint: 'https://api.pclouds.africa/v1/whatsapp', price: '$0.01 per msg' },
    { name: 'Forex Rate API', endpoint: 'https://api.pclouds.africa/v1/forex', price: 'Free tier 1000/day' },
  ];
  return (
    <section className="py-20 px-6 bg-gray-900/30 border-y border-gray-800" id="api-marketplace">
      <div className="max-w-7xl mx-auto"><div className="grid lg:grid-cols-2 gap-12 items-center"><div><div className="inline-flex items-center gap-2 bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm mb-4"><FiCpu /> Core Differentiator</div><h2 className="text-3xl md:text-4xl font-bold mb-4">API Marketplace</h2><p className="text-gray-400 mb-6">Subscribe to production‑ready APIs with one click. Generate API keys, monitor usage, and pay only for what you consume.</p><div className="space-y-3">{apis.map((api, idx) => (<div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition"><div className="flex justify-between items-center flex-wrap gap-2"><span className="font-mono text-blue-400">{api.endpoint}</span><span className="text-xs bg-gray-900 px-2 py-1 rounded">{api.price}</span></div><div className="text-sm text-gray-400 mt-1">{api.name}</div></div>))}</div><button className="mt-6 text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">Browse all 20+ APIs <FiArrowRight /></button></div><div className="relative"><div className="code-block"><div className="text-gray-400 mb-2">// Test API in your browser</div><pre className="text-green-400">{`curl -X POST https://api.pclouds.africa/v1/sms \\\n  -H "X-API-Key: your_key" \\\n  -d '{"to":"+234...","message":"Hello"}'`}</pre></div></div></div></div>
    </section>
  );
};

// ========== STARTUP BUNDLE ==========
const StartupBundle = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto"><div className="gradient-border"><div className="gradient-border-inner bg-gradient-to-br from-gray-900 to-gray-950"><div className="grid md:grid-cols-2 gap-8 items-center"><div><div className="inline-flex items-center gap-2 bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-sm mb-4"><FiZap /> Launch Special</div><h3 className="text-2xl md:text-3xl font-bold mb-3">Startup Launch Bundle</h3><p className="text-gray-400 mb-4">Everything you need to launch your MVP: domain, hosting, email API, SMS credits, and deployment tools.</p><ul className="space-y-2 mb-6"><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 1 free .com.ng domain</li><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 6 months shared hosting</li><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 10,000 email API credits</li><li className="flex items-center gap-2 text-sm"><FiCheckCircle className="text-green-500" /> 500 SMS API credits</li></ul><div className="flex items-center gap-4 flex-wrap"><span className="text-3xl font-bold">$19<span className="text-sm text-gray-400">/month</span></span><button className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-medium">Claim bundle →</button></div></div><div className="relative"><div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700"><div className="flex items-center gap-2 mb-3"><FiTerminal className="text-gray-400" /><span className="text-sm font-mono">pclouds bundle create startup-2025</span></div><div className="h-px bg-gray-700 my-2"></div><div className="text-green-400 text-sm">✓ Bundle activated. Your infrastructure is ready.</div></div></div></div></div></div></div>
    </section>
  );
};

// ========== CLI PREVIEW ==========
const CliPreview = () => {
  const commands = ['$ pcloud deploy','→ Building your application...','→ Deploying to edge network...','✓ Deployment complete (12.3s)','→ https://my-app.pclouds.africa','$ pcloud logs --tail'];
  return (
    <section className="py-20 px-6 bg-gray-900/30" id="cli">
      <div className="max-w-7xl mx-auto text-center"><h2 className="text-3xl font-bold mb-3">Deploy from your terminal</h2><p className="text-gray-400 max-w-2xl mx-auto mb-10">The PCLOUDs CLI gives you full control. Push updates, manage env vars, and stream logs.</p><div className="max-w-2xl mx-auto code-block text-left"><AnimatedCode lines={commands} /><div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center"><span className="text-xs text-gray-500">pclouds-cli v1.0.0-beta</span><span className="text-green-400 text-sm flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> connected</span></div></div></div>
    </section>
  );
};

// ========== CODE SCREENSHOTS GALLERY ==========
const CodeScreenshots = () => {
  return (
    <section className="py-20 px-6 bg-gray-900/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Build with your favorite tools</h2>
          <p className="text-gray-400">Seamless integration into your existing workflow</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <CodeEditorScreenshot title="deploy-app.tsx" language="TypeScript" />
          <CodeEditorScreenshot title="api-usage.js" language="JavaScript" />
        </div>
        <div className="mt-8 max-w-2xl mx-auto">
          <CodeEditorScreenshot title="Dockerfile" language="dockerfile" />
        </div>
      </div>
    </section>
  );
};

// ========== FOOTER ==========
const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto"><div className="grid md:grid-cols-5 gap-8 mb-12"><div className="col-span-2"><div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><FiCloud className="text-white" /></div><span className="font-bold text-xl">PCLOUDs</span></div><p className="text-gray-500 text-sm max-w-xs">Building Africa's default infrastructure platform for developers and startups.</p><div className="flex gap-4 mt-4"><FiGithub className="text-gray-500 hover:text-white cursor-pointer transition" /><FiTwitter className="text-gray-500 hover:text-white cursor-pointer transition" /><FiLinkedin className="text-gray-500 hover:text-white cursor-pointer transition" /><FiMail className="text-gray-500 hover:text-white cursor-pointer transition" /></div></div><div><h4 className="font-semibold mb-3">Product</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#" className="hover:text-gray-300">Domains</a></li><li><a href="#" className="hover:text-gray-300">Hosting</a></li><li><a href="#" className="hover:text-gray-300">API Marketplace</a></li><li><a href="#" className="hover:text-gray-300">Library</a></li><li><a href="#" className="hover:text-gray-300">CLI</a></li></ul></div><div><h4 className="font-semibold mb-3">Developers</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#" className="hover:text-gray-300">Documentation</a></li><li><a href="#" className="hover:text-gray-300">API Reference</a></li><li><a href="#" className="hover:text-gray-300">Status</a></li><li><a href="#" className="hover:text-gray-300">GitHub</a></li></ul></div><div><h4 className="font-semibold mb-3">Company</h4><ul className="space-y-2 text-sm text-gray-500"><li><a href="#" className="hover:text-gray-300">About</a></li><li><a href="#" className="hover:text-gray-300">Blog</a></li><li><a href="#" className="hover:text-gray-300">Careers</a></li><li><a href="#" className="hover:text-gray-300">Contact</a></li></ul></div></div><div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-600">&copy; 2025 PCLOUDs — Empowering African developers. All rights reserved.</div></div>
    </footer>
  );
};

// ========== MAIN APP ==========
function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <Hero />
      <ModulesSection />
      <CodeScreenshots />
      <ApiMarketplace />
      <StartupBundle />
      <CliPreview />
      <AutoLaunchRocket />     {/* Auto-launch dark rocket */}
      <GlobalReach />          {/* 3D globe + country list */}
      <Partners />
      <Testimonials />
      <Stats />
      <Footer />
    </div>
  );
}

export default App;