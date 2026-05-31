import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AeroTraceLogo from '../components/brand/AeroTraceLogo';

// ============================================
// ACTIVITY HERO IMAGES - Real human activities
// ============================================

const activityImages = [
  // Running
  {
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop',
    label: 'Running',
    icon: '🏃',
  },
  // Cycling
  {
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop',
    label: 'Cycling',
    icon: '🚴',
  },
  // Hiking
  {
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
    label: 'Hiking',
    icon: '🥾',
  },
  // Photography
  {
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2070&auto=format&fit=crop',
    label: 'Photography',
    icon: '📸',
  },
  // City Exploration
  {
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop',
    label: 'City Exploration',
    icon: '🏙️',
  },
  // Travel
  {
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop',
    label: 'Travel',
    icon: '✈️',
  },
];

// ============================================
// HOW AEROTRACE WORKS - Step by step flow
// ============================================

const workflowSteps = [
  {
    step: 1,
    title: 'Morning Run',
    subtitle: 'Start your activity',
    description: 'Begin any movement — run, walk, cycle, hike, or explore.',
    icon: '🌅',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    step: 2,
    title: 'Route Recorded',
    subtitle: 'GPS tracks your path',
    description: 'Every turn, every shortcut, every detour — beautifully mapped.',
    icon: '🗺️',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    step: 3,
    title: 'Photo Captured',
    subtitle: 'Snap a memory',
    description: 'That perfect light, that hidden corner — capture it.',
    icon: '📸',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    step: 4,
    title: 'Hidden Cafe Discovered',
    subtitle: 'Mark a discovery',
    description: 'Found something special? Pin it to your map.',
    icon: '🧭',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    step: 5,
    title: 'Journey Story Created',
    subtitle: 'Your story, told',
    description: 'Routes, memories, discoveries — woven into one living narrative.',
    icon: '📖',
    color: 'from-amber-500 to-rose-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
];

// ============================================
// REAL JOURNEYS - Example cards
// ============================================

const realJourneys = [
  {
    id: 1,
    title: 'Sunrise Trail Run',
    type: 'Running',
    location: 'Riverside Trail',
    distance: '8.2 km',
    memories: 3,
    discoveries: 1,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600&auto=format&fit=crop',
    time: 'This morning',
    icon: '🌅',
  },
  {
    id: 2,
    title: 'City Photography Walk',
    type: 'Photography',
    location: 'Old Town District',
    photos: 14,
    discoveries: 2,
    storyCreated: true,
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
    time: 'Yesterday',
    icon: '📸',
  },
  {
    id: 3,
    title: 'Evening Bike Ride',
    type: 'Cycling',
    location: 'Waterfront Path',
    distance: '15.4 km',
    memories: 2,
    discoveries: 1,
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=600&auto=format&fit=crop',
    time: '2 days ago',
    icon: '🚴',
  },
  {
    id: 4,
    title: 'Mountain Hike Adventure',
    type: 'Hiking',
    location: 'Pine Ridge Trail',
    distance: '12.1 km',
    memories: 7,
    discoveries: 3,
    storyCreated: true,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600&auto=format&fit=crop',
    time: 'Last week',
    icon: '🥾',
  },
];

// ============================================
// HERO SECTION - Activity Collage
// ============================================

function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  const { go } = useNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % activityImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Activity Background */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute inset-0 z-0"
      >
        {activityImages.map((activity, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${activity.image}')` }}
            />
          </motion.div>
        ))}
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-[#050505]/30 to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
      </motion.div>

      {/* Activity Type Indicators */}
      <motion.div 
        className="absolute top-32 z-20 flex gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5 }}
      >
        {activityImages.map((activity, index) => (
          <motion.div
            key={index}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all ${
              index === currentImageIndex 
                ? 'bg-white/20 border border-white/30 text-white' 
                : 'bg-white/5 border border-white/10 text-white/40'
            }`}
            animate={{
              scale: index === currentImageIndex ? 1.05 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm">{activity.icon}</span>
            <span className="text-[10px] uppercase tracking-wider font-medium">{activity.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Animated Journey Path SVG */}
      <motion.svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Animated path line */}
        <motion.path
          d="M100,600 Q300,400 500,500 T900,300 T1100,400"
          fill="none"
          stroke="url(#journeyGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 0.5 } : {}}
          transition={{ duration: 2.5, delay: 1, ease: 'easeInOut' }}
        />
        {/* Glow effect */}
        <motion.path
          d="M100,600 Q300,400 500,500 T900,300 T1100,400"
          fill="none"
          stroke="#4F8CFF"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isVisible ? { pathLength: 1, opacity: 0.1 } : {}}
          transition={{ duration: 2.5, delay: 1, ease: 'easeInOut' }}
        />
        {/* Animated dots along path */}
        {[...Array(8)].map((_, i) => (
          <motion.circle
            key={i}
            r="3"
            fill="#22C55E"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: [0, 1, 0] } : {}}
            transition={{
              duration: 2,
              delay: 1.5 + i * 0.3,
              repeat: Infinity,
              repeatDelay: 2 + i * 0.2,
            }}
          >
            <animateMotion
              dur={`${4 + i * 0.5}s`}
              repeatCount="indefinite"
              path="M100,600 Q300,400 500,500 T900,300 T1100,400"
            />
          </motion.circle>
        ))}
        <defs>
          <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4F8CFF" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Hero Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-30 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto"
      >
        {/* Animated Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8 md:mb-12"
        >
          <AeroTraceLogo size="xl" animated={true} glowIntensity="medium" />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-6"
        >
          Every Journey
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] via-[#7ECBFF] to-[#22C55E]">
            Leaves a Trace.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Track your runs, capture memories, discover hidden places,
          <br />
          <span className="text-slate-400">and turn every adventure into your story.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            className="px-10 py-4 text-base font-semibold rounded-full"
          >
            Start Your Journey
          </Button>
          <Button
            variant="glass"
            size="lg"
            onClick={() => go('login')}
            className="px-10 py-4 text-base font-semibold rounded-full"
          >
            Sign In
          </Button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-slate-500 to-transparent" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// HOW AEROTRACE WORKS SECTION
// ============================================

function HowItWorksSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]" />
      
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[80rem] rounded-full bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
            THE FLOW
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-white">
            How AeroTrace Works
          </h2>
          <p className="mt-4 text-lg text-slate-400 font-light max-w-2xl mx-auto">
            From movement to memory to story — your journey, beautifully told.
          </p>
        </div>

        {/* Workflow Steps - Horizontal Flow */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center z-20">
                  <span className="text-xs font-bold text-white">{step.step}</span>
                </div>

                {/* Card */}
                <Card className={`relative overflow-hidden ${step.bgColor} border ${step.borderColor} hover:border-white/20 transition-all duration-300`}>
                  {/* Gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color}`} />
                  
                  <div className="p-5">
                    {/* Icon */}
                    <div className="text-3xl mb-3">{step.icon}</div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                    
                    {/* Subtitle */}
                    <p className={`text-xs font-medium mb-3 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                      {step.subtitle}
                    </p>
                    
                    {/* Description */}
                    <p className="text-sm text-slate-400 font-light leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>

                {/* Arrow connector (hidden on last item) */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-20">
                    <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// REAL JOURNEYS SECTION
// ============================================

function RealJourneysSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#22C55E]">
            REAL JOURNEYS
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-white">
            Stories from the Map
          </h2>
          <p className="mt-4 text-lg text-slate-400 font-light max-w-2xl mx-auto">
            See how others are tracing their paths, capturing moments, and discovering new places.
          </p>
        </div>

        {/* Journey Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {realJourneys.map((journey, index) => (
            <motion.div
              key={journey.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <Card className="overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-white/15 transition-all duration-300">
                <div className="relative h-56 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${journey.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="text-xl">{journey.icon}</span>
                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white">
                      {journey.type}
                    </span>
                  </div>
                  
                  {/* Time */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] text-slate-300">
                      {journey.time}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-1">{journey.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                    <span>📍</span>
                    {journey.location}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    {journey.distance && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">📏</span>
                        <span className="text-slate-300 font-medium">{journey.distance}</span>
                      </div>
                    )}
                    {journey.photos && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">📸</span>
                        <span className="text-slate-300 font-medium">{journey.photos} photos</span>
                      </div>
                    )}
                    {journey.memories && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">💫</span>
                        <span className="text-slate-300 font-medium">{journey.memories} memories</span>
                      </div>
                    )}
                    {journey.discoveries && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">🧭</span>
                        <span className="text-slate-300 font-medium">{journey.discoveries} discoveries</span>
                      </div>
                    )}
                    {journey.storyCreated && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">📖</span>
                        <span className="text-amber-400 font-medium">Story created</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// YOUR LIFE MAP PREVIEW SECTION
// ============================================

function LifeMapPreviewSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Simulated map nodes
  const mapNodes = [
    { id: 1, x: 25, y: 30, type: 'home', label: 'Home', icon: '🏠' },
    { id: 2, x: 45, y: 20, type: 'memory', label: 'Morning Run', icon: '📸' },
    { id: 3, x: 65, y: 35, type: 'discovery', label: 'Hidden Cafe', icon: '🧭' },
    { id: 4, x: 35, y: 55, type: 'memory', label: 'Photo Spot', icon: '📸' },
    { id: 5, x: 75, y: 60, type: 'story', label: 'City Walk', icon: '📝' },
    { id: 6, x: 55, y: 45, type: 'milestone', label: 'Park', icon: '🌳' },
    { id: 7, x: 20, y: 70, type: 'discovery', label: 'Bookstore', icon: '🧭' },
    { id: 8, x: 85, y: 25, type: 'memory', label: 'Sunset View', icon: '📸' },
  ];

  // Simulated route path
  const routePath = "M25,30 Q35,25 45,20 T65,35 T75,60 T55,45 T35,55 T20,70";

  // Polaroid-style memory cards
  const polaroids = [
    { x: 48, y: 15, rotation: -5, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=200&auto=format&fit=crop' },
    { x: 68, y: 30, rotation: 3, image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=200&auto=format&fit=crop' },
    { x: 38, y: 50, rotation: -3, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=200&auto=format&fit=crop' },
  ];

  return (
    <section ref={containerRef} className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70rem] h-[70rem] rounded-full bg-gradient-to-r from-[#4F8CFF]/5 via-[#22C55E]/5 to-[#4F8CFF]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4F8CFF]">
              YOUR LIFE MAP
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              One Map. All Your Journeys.
            </h2>
            <p className="text-lg text-slate-400 font-light leading-relaxed mb-8">
              Watch your life unfold on a living map. Every run, walk, bike ride, and adventure
              becomes part of a beautiful tapestry — routes traced in color, memories pinned to
              exact locations, discoveries marked for return visits, and stories woven together.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400">🗺️</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Routes Traced</h4>
                  <p className="text-sm text-slate-500">Every path beautifully visualized</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400">📸</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Memories Pinned</h4>
                  <p className="text-sm text-slate-500">Polaroid snapshots at exact locations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-400">🧭</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Discoveries Marked</h4>
                  <p className="text-sm text-slate-500">Places to remember and revisit</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400">📖</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Stories Created</h4>
                  <p className="text-sm text-slate-500">Journeys beautifully told</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Map Preview with Polaroids */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <Card className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-white/10">
              {/* Map Container */}
              <div className="relative aspect-square">
                {/* Grid Background */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(79,140,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(79,140,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* Dark overlay for contrast */}
                <div className="absolute inset-0 bg-slate-950/60" />

                {/* SVG Map Layer */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  {/* Route Path - Animated */}
                  <motion.path
                    d={routePath}
                    fill="none"
                    stroke="url(#mapRouteGradient)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
                    transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
                  />

                  {/* Glow effect for route */}
                  <motion.path
                    d={routePath}
                    fill="none"
                    stroke="#4F8CFF"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={isInView ? { pathLength: 1, opacity: 0.1 } : {}}
                    transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
                  />

                  <defs>
                    <linearGradient id="mapRouteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4F8CFF" />
                      <stop offset="50%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#F43F5E" />
                    </linearGradient>
                  </defs>

                  {/* Map Nodes */}
                  {mapNodes.map((node, index) => {
                    const colors: Record<string, string> = {
                      home: '#F59E0B',
                      memory: '#D946EF',
                      discovery: '#10B981',
                      story: '#F43F5E',
                      milestone: '#06B6D4',
                    };
                    const color = colors[node.type] || '#4F8CFF';

                    return (
                      <motion.g key={node.id}>
                        {/* Pulse ring */}
                        <motion.circle
                          cx={node.x}
                          cy={node.y}
                          r="4"
                          fill={color}
                          initial={{ r: 0, opacity: 0 }}
                          animate={isInView ? { r: 4, opacity: 0.8 } : {}}
                          transition={{ delay: 1 + index * 0.15, duration: 0.3 }}
                        />
                        {/* Center dot */}
                        <motion.circle
                          cx={node.x}
                          cy={node.y}
                          r="2"
                          fill={color}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={isInView ? { scale: 1, opacity: 1 } : {}}
                          transition={{ delay: 1.2 + index * 0.15, duration: 0.3 }}
                        />
                        {/* Label */}
                        <motion.text
                          x={node.x}
                          y={node.y - 6}
                          textAnchor="middle"
                          fontSize="3"
                          fill="rgba(255,255,255,0.7)"
                          initial={{ opacity: 0 }}
                          animate={isInView ? { opacity: 1 } : {}}
                          transition={{ delay: 1.5 + index * 0.15 }}
                        >
                          {node.label}
                        </motion.text>
                      </motion.g>
                    );
                  })}
                </svg>

                {/* Floating Polaroid Memories */}
                {polaroids.map((polaroid, index) => (
                  <motion.div
                    key={index}
                    className="absolute hidden md:block"
                    style={{
                      left: `${polaroid.x}%`,
                      top: `${polaroid.y}%`,
                      transform: `rotate(${polaroid.rotation}deg)`,
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 2 + index * 0.3, duration: 0.5 }}
                  >
                    <div className="bg-white p-2 pb-4 rounded-sm shadow-xl">
                      <div className="w-20 h-16 overflow-hidden rounded-sm">
                        <img
                          src={polaroid.image}
                          alt="Memory"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex gap-3 text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Home</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Memory</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Discovery</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Story</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// MANIFESTO SECTION
// ============================================

function ManifestoSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[60rem] w-[60rem] rounded-full bg-gradient-to-r from-[#4F8CFF]/5 via-[#22C55E]/5 to-[#4F8CFF]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
          THE MANIFESTO
        </span>
        <blockquote className="mt-8 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-relaxed">
          "We explore because life is not a series of fitness loops or calendar appointments.
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#22C55E]"> We walk to detour</span>,
          we transit to observe, and we map to remember."
        </blockquote>
        <div className="mt-8 text-sm text-slate-500 uppercase tracking-widest font-light">
          — AeroTrace
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA SECTION
// ============================================

function CTASection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504214208698-ea1916a2195a?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-slate-950/80 to-slate-950/60" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
          Ready to Trace Your Story?
        </h2>
        <p className="text-lg text-slate-300 font-light mb-10 max-w-xl mx-auto">
          Join thousands of adventurers who are already mapping their lives, one journey at a time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            className="px-10 py-4 text-base font-semibold rounded-full"
          >
            Start Your Journey — It's Free
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================

function Footer() {
  const { go } = useNavigation();

  return (
    <footer className="relative py-12 px-6 border-t border-white/5 bg-[#050505]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <AeroTraceLogo size="sm" />

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} AeroTrace. Made for adventurers.
        </div>

        <div className="flex gap-6 text-xs text-slate-500">
          <button onClick={() => go('safety')} className="hover:text-white transition">
            Privacy
          </button>
          <button className="hover:text-white transition">Terms</button>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN LANDING PAGE
// ============================================

export function LandingPage() {
  const { go } = useNavigation();
  const { login } = useAuth();

  const handleGetStarted = () => {
    go('signup');
  };

  const handleEnterApp = () => {
    login('preview@aerotrace.app');
    go('dashboard');
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-slate-100 overflow-x-hidden">
      {/* Fixed Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 transition-all duration-300">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => go('landing')}
          whileHover={{ scale: 1.02 }}
        >
          <AeroTraceLogo size="sm" />
        </motion.div>

        <div className="flex items-center gap-3">
          <Button variant="glass" size="sm" onClick={() => go('login')} className="backdrop-blur-md">
            Sign in
          </Button>
          <Button variant="primary" size="sm" onClick={handleGetStarted}>
            Start Tracing
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <HowItWorksSection />
        <RealJourneysSection />
        <LifeMapPreviewSection />
        <ManifestoSection />
        <CTASection onGetStarted={handleGetStarted} />
        <Footer />
      </main>
    </div>
  );
}

export default LandingPage;