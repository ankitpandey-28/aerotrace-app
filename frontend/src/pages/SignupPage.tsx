import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import AeroTraceLogo from '../components/brand/AeroTraceLogo';

// Core pillars of AeroTrace
const corePillars = [
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
    text: 'Track Movement',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4z" clipRule="evenodd" />
      </svg>
    ),
    text: 'Capture Memories',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
    text: 'Discover Places',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
    text: 'Build Your Life Map',
  },
];

// Human activity images - real people doing activities
const activityImages = [
  // Runner
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop',
  // Cyclist
  'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop',
  // Photographer
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2070&auto=format&fit=crop',
  // Explorer/Hiker
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
  // Traveler
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop',
];

const currentActivityIndex = Math.floor(Date.now() / 10000) % activityImages.length;
const activityImage = activityImages[currentActivityIndex];

export function SignupPage() {
  const { go } = useNavigation();
  const { signup } = useAuth();

  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex@aerotrace.app');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect for background image
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, 100]);
  const overlayY = useTransform(scrollY, [0, 500], [0, -50]);
  
  // Mouse parallax for floating effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      mouseX.set(x);
      mouseY.set(y);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please fill in all details');
      return;
    }
    signup(name, email);
    go('dashboard');
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="relative min-h-screen flex bg-[#050505] text-slate-100 overflow-hidden">
      {/* Left Side - Adventure/Travel Lifestyle Image */}
      <motion.div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        className="hidden lg:flex lg:w-1/2 relative"
      >
        <motion.div 
          style={{ y: bgY }}
          className="absolute inset-0 bg-cover bg-center"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              // Real human activity imagery - runner, cyclist, photographer, explorer, traveler
              backgroundImage: `url('${activityImage}')`,
            }}
          />
        </motion.div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-slate-950/20 to-slate-950/60" />
        
        {/* Animated route trace overlay with discovery markers */}
        <motion.div 
          style={{ y: overlayY }}
          className="absolute inset-0"
        >
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Animated route path */}
            <motion.path
              d="M10,80 Q25,20 40,50 T70,30 T90,70"
              fill="none"
              stroke="#22C55E"
              strokeWidth="0.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isVisible ? { pathLength: 1, opacity: 0.3 } : {}}
              transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
            />
            {/* Glow effect for route */}
            <motion.path
              d="M10,80 Q25,20 40,50 T70,30 T90,70"
              fill="none"
              stroke="#22C55E"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isVisible ? { pathLength: 1, opacity: 0.05 } : {}}
              transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
            />
            {/* Animated dots along route */}
            {[...Array(6)].map((_, i) => (
              <motion.circle
                key={i}
                r="0.8"
                fill={i % 2 === 0 ? '#4F8CFF' : '#22C55E'}
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: [0, 1, 0] } : {}}
                transition={{
                  duration: 2,
                  delay: 1 + i * 0.4,
                  repeat: Infinity,
                  repeatDelay: 1 + i * 0.3,
                }}
              >
                <animateMotion
                  dur={`${5 + i * 0.5}s`}
                  repeatCount="indefinite"
                  path="M10,80 Q25,20 40,50 T70,30 T90,70"
                />
              </motion.circle>
            ))}
            {/* Start and end markers */}
            <motion.circle
              cx="10" cy="80" r="1.5" fill="#4F8CFF"
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
            />
            <motion.circle
              cx="90" cy="70" r="1.5" fill="#22C55E"
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 2.5, type: 'spring', stiffness: 200 }}
            />
            {/* Pulse effect on end marker */}
            <motion.circle
              cx="90" cy="70" r="3"
              fill="none" stroke="#22C55E" strokeWidth="0.5"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isVisible ? { scale: [0.5, 2, 1], opacity: [0, 0.6, 0.3] } : {}}
              transition={{ duration: 2.5, delay: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Discovery markers floating along the path */}
            {[
              { x: 25, y: 35, label: 'Café' },
              { x: 55, y: 40, label: 'View' },
              { x: 75, y: 50, label: 'Park' }
            ].map((marker, i) => (
              <motion.g key={i}>
                <motion.circle
                  cx={marker.x} cy={marker.y} r="2"
                  fill="#F59E0B"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isVisible ? { scale: 1, opacity: 0.8 } : {}}
                  transition={{ delay: 1.5 + i * 0.3, type: 'spring', stiffness: 200 }}
                />
                <motion.text
                  x={marker.x} y={marker.y - 4}
                  fontSize="3" fill="rgba(255,255,255,0.6)"
                  textAnchor="middle"
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: [0, 0.6, 0] } : {}}
                  transition={{ delay: 2 + i * 0.3, duration: 3, repeat: Infinity }}
                >
                  {marker.label}
                </motion.text>
              </motion.g>
            ))}
          </svg>
        </motion.div>
        
        {/* Content overlay on image side with floating parallax */}
        <motion.div 
          style={{ x: springX, y: springY }}
          className="relative z-10 flex flex-col justify-center p-16 h-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="max-w-md">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-12 bg-white/30" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">Your Story</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Build your life map.
              </h2>
              <p className="text-slate-300 font-light text-lg leading-relaxed mb-8">
                Join fellow explorers tracking runs, walks, cycles, photography trips, travels, and custom adventures—turning every movement into a living story.
              </p>

              {/* Core Pillars */}
              <div className="space-y-3">
                {corePillars.map((pillar, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.6 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22C55E]/20 text-[#22C55E]">
                      {pillar.icon}
                    </div>
                    <span className="text-slate-200 font-light">{pillar.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
      </motion.div>

      {/* Right Side - Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        {/* Animated background glow */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#22C55E]/5 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div 
          className="w-full max-w-md relative z-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Logo - Premium AeroTrace */}
          <motion.div 
            className="mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <AeroTraceLogo 
              size="lg" 
              animated={true} 
              glowIntensity="subtle"
              className="cursor-pointer"
            />
          </motion.div>

          {/* Welcome Text */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              Start your journey
            </h2>
            <p className="text-slate-400 font-light">
              Create your account and begin tracing your adventures.
            </p>
          </motion.div>

          {/* Signup Form */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-5"
            initial="initial"
            animate={isVisible ? "animate" : "initial"}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Field 
                label="Full Name" 
                value={name} 
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Alex Morgan" 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Field 
                label="Email Address" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="alex@aerotrace.app" 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Field 
                label="Password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password" 
              />
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                className="text-xs text-rose-400 font-light"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <Button type="submit" variant="primary" className="w-full py-4 text-base font-semibold rounded-full bg-[#22C55E] hover:bg-[#34D378]">
                Start Your Journey
              </Button>
            </motion.div>
          </motion.form>

          {/* Terms */}
          <motion.p 
            className="mt-4 text-center text-xs text-slate-500 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            By creating an account, you agree to our{' '}
            <button className="text-slate-400 hover:text-white transition">Terms of Service</button>
            {' '}and{' '}
            <button className="text-slate-400 hover:text-white transition">Privacy Policy</button>.
          </motion.p>

          {/* Divider */}
          <motion.div 
            className="relative my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#050505] px-4 text-xs text-slate-500 uppercase tracking-wider">Or sign up with</span>
            </div>
          </motion.div>

          {/* Social Signup */}
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button
              type="button"
              variant="glass"
              size="md"
              className="py-4 text-sm font-semibold rounded-full"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </span>
            </Button>
            <Button
              type="button"
              variant="glass"
              size="md"
              className="py-4 text-sm font-semibold rounded-full"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </span>
            </Button>
          </motion.div>

          {/* Sign In Link */}
          <motion.p 
            className="mt-8 text-center text-sm text-slate-400 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Already have an account?{' '}
            <button 
              type="button"
              onClick={() => go('login')}
              className="text-[#4F8CFF] font-semibold hover:text-[#7ECBFF] transition-colors"
            >
              Sign in
            </button>
          </motion.p>

          {/* Footer links */}
          <motion.div 
            className="mt-8 flex justify-center gap-6 text-xs text-slate-600"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button onClick={() => go('safety')} className="hover:text-slate-400 transition">Privacy Policy</button>
            <span>·</span>
            <button className="hover:text-slate-400 transition">Terms of Service</button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default SignupPage;