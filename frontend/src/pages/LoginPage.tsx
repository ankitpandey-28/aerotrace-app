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

export function LoginPage() {
  const { go } = useNavigation();
  const { login } = useAuth();
  
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
    if (!email) {
      setError('Please provide a valid email');
      return;
    }
    login(email);
    go('dashboard');
  };

  const handleSandboxLogin = () => {
    login('sandbox@aerotrace.app');
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
      {/* Left Side - Activity/Movement Image (Strava/Nike Run Club style) */}
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
              // Runner in motion - urban setting, activity focused
              backgroundImage: `url('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop')`,
            }}
          />
        </motion.div>
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-slate-950/20 to-slate-950/60" />
        
        {/* Animated route trace overlay */}
        <motion.div 
          style={{ y: overlayY }}
          className="absolute inset-0"
        >
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Animated route path */}
            <motion.path
              d="M10,80 Q25,20 40,50 T70,30 T90,70"
              fill="none"
              stroke="#4F8CFF"
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
              stroke="#4F8CFF"
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
                fill={i % 2 === 0 ? '#22C55E' : '#4F8CFF'}
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
              cx="10" cy="80" r="1.5" fill="#22C55E"
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
            />
            <motion.circle
              cx="90" cy="70" r="1.5" fill="#4F8CFF"
              initial={{ scale: 0, opacity: 0 }}
              animate={isVisible ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 2.5, type: 'spring', stiffness: 200 }}
            />
            {/* Pulse effect on end marker */}
            <motion.circle
              cx="90" cy="70" r="3"
              fill="none" stroke="#4F8CFF" strokeWidth="0.5"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isVisible ? { scale: [0.5, 2, 1], opacity: [0, 0.6, 0.3] } : {}}
              transition={{ duration: 2.5, delay: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
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
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">Your Journey</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Continue building your life map.
              </h2>
              <p className="text-slate-300 font-light text-lg leading-relaxed mb-8">
                Sign in to trace your movements, capture memories, discover new paths, and turn every moment into your story.
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
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4F8CFF]/20 text-[#4F8CFF]">
                      {pillar.icon}
                    </div>
                    <span className="text-slate-200 font-light">{pillar.text}</span>
                  </motion.div>
                ))}
              </div>

          {/* Activity Stats - Strava-style with staggered reveal */}
          <motion.div 
            className="flex gap-8 mt-12 pt-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            { [
              { value: '50K+', label: 'Explorers' },
              { value: '2M+', label: 'Journeys' },
              { value: '120+', label: 'Countries' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#4F8CFF]/5 blur-3xl"
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
              Welcome back
            </h2>
            <p className="text-slate-400 font-light">
              Continue building your life map.
            </p>
          </motion.div>

          {/* Login Form */}
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
              transition={{ delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Field 
                label="Password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password" 
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
              transition={{ delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Button type="submit" variant="primary" className="w-full py-4 text-base font-semibold rounded-full">
                Sign In
              </Button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div 
            className="relative my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#050505] px-4 text-xs text-slate-500 uppercase tracking-wider">Or continue with</span>
            </div>
          </motion.div>

          {/* Sandbox Login */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button
              type="button"
              variant="glass"
              size="md"
              className="w-full py-4 text-sm font-semibold rounded-full"
              onClick={handleSandboxLogin}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Sandbox Preview
              </span>
            </Button>
          </motion.div>

          {/* Sign Up Link */}
          <motion.p 
            className="mt-8 text-center text-sm text-slate-400 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={() => go('signup')}
              className="text-[#4F8CFF] font-semibold hover:text-[#7ECBFF] transition-colors"
            >
              Create account
            </button>
          </motion.p>

          {/* Footer links */}
          <motion.div 
            className="mt-8 flex justify-center gap-6 text-xs text-slate-600"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
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

export default LoginPage;