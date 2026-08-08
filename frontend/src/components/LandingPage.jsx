import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, CreditCard, Users, ArrowRight, Target, Activity, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(heroProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroProgress, [0, 1], [1, 0]);

  const features = [
    {
      icon: <LayoutDashboard size={32} className="text-purple-400" />,
      title: "Advanced Analytics Dashboard",
      description: "Visualise your entire financial life with beautiful charts, intelligent analytics, and real-time data nodes. Instantly see your net worth, monthly cash flow, and spending patterns in one glance.",
      color: "#a855f7"
    },
    {
      icon: <Target size={32} className="text-pink-400" />,
      title: "Strict Budgeting Engine",
      description: "Set strict monthly limits per category. Get visual warnings when you are close to overspending. Never wonder where your money went at the end of the month again.",
      color: "#ec4899"
    },
    {
      icon: <CreditCard size={32} className="text-emerald-400" />,
      title: "Debt & Loan Manager",
      description: "Track money you have lent out or borrowed. Includes built-in interest calculations over time so you always know exactly what is owed and what has been paid off.",
      color: "#10b981"
    },
    {
      icon: <Users size={32} className="text-blue-400" />,
      title: "Chit Fund Organizer",
      description: "A unique feature tailored for community saving schemes. Track your monthly contributions, scheme durations, and total payouts seamlessly without messy spreadsheets.",
      color: "#3b82f6"
    },
    {
      icon: <Activity size={32} className="text-orange-400" />,
      title: "Transaction Ledger",
      description: "A highly filterable, lightning-fast ledger of every cent moving in or out of your accounts. Easily categorize, search, and audit your financial history.",
      color: "#f97316"
    }
  ];

  return (
    <div style={{ background: '#0f172a', color: 'white', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Top Nav (Absolute) */}
      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '2rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
        <div style={{ fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)' }}>F</div>
          FinSet
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/login" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 600, padding: '0.5rem 1rem', transition: 'color 0.2s' }}>Log In</Link>
          <Link to="/register" style={{ background: 'white', color: '#0f172a', textDecoration: 'none', fontWeight: 700, padding: '0.6rem 1.5rem', borderRadius: '30px', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(255,255,255,0.1)' }}>Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        style={{ minHeight: '100vh', paddingTop: '100px', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}
      >
        <motion.div style={{ position: 'absolute', width: '100%', height: '100%', y: heroY, zIndex: 0 }}>
          <img src="/hero_bg.png" alt="Background" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }} />
        </motion.div>
        
        <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 5%', position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem' }}>
          {/* Left Text */}
          <motion.div 
            style={{ flex: '1 1 500px', opacity: heroOpacity }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '0.5rem 1rem', borderRadius: '20px', color: '#c084fc', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <span style={{ width: '8px', height: '8px', background: '#c084fc', borderRadius: '50%', display: 'inline-block' }}></span>
              The Ultimate Finance Tracker
            </div>
            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 800, margin: '0 0 1.5rem 0', lineHeight: 1.1 }}>
              Take Control of Your <br/>
              <span style={{ background: 'linear-gradient(to right, #c084fc, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Financial Future.</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: '90%' }}>
              Stop wondering where your money went. Track budgets, manage debts, and organize community chit funds in one stunning, unified dashboard.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', color: 'white', padding: '1.2rem 2.5rem', borderRadius: '30px', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(124, 58, 237, 0.4)' }}>
                Start For Free <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center' }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, type: 'spring' }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: '600px', aspectRatio: '1/1' }}>
              <motion.img 
                src="/feature_1.png" 
                alt="Dashboard Abstract" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(124,58,237,0.3))' }}
                animate={{ y: [-15, 15] }}
                transition={{ repeat: Infinity, duration: 4, repeatType: 'reverse', ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section style={{ padding: '8rem 5%', background: '#1e293b', borderTop: '1px solid #334155', borderBottom: '1px solid #334155' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>How It Works</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>A simple, intuitive workflow to get your finances in order.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', position: 'relative' }}>
            {[
              { step: '01', title: 'Setup', desc: 'Create your account and define your initial balances and categories.' },
              { step: '02', title: 'Budget', desc: 'Set strict monthly limits to ensure you never overspend again.' },
              { step: '03', title: 'Track', desc: 'Log daily expenses, incomes, debts, and chit fund payouts seamlessly.' },
              { step: '04', title: 'Grow', desc: 'Watch your net worth increase through our visual analytics and charts.' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }}>{item.step}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{item.title}</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Scroll Features */}
      <section style={{ padding: '8rem 5%', position: 'relative' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'flex-start' }}>
          
          {/* Left Sticky Header */}
          <div style={{ flex: '1 1 400px', position: 'sticky', top: '20vh' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
              Everything you need in one place.
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
              FinSet replaces multiple apps and spreadsheets. Manage your day-to-day spending, long-term debts, and community savings all from a single dashboard.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['No hidden fees', 'Secure data encryption', 'Cross-device sync', 'Dark mode included'].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={20} color="#10b981" />
                  <span style={{ fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Scrolling Cards */}
          <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {features.map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '3rem', backdropFilter: 'blur(10px)' }}
              >
                <div style={{ width: '64px', height: '64px', background: `rgba(255,255,255,0.05)`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', border: `1px solid ${feat.color}40` }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>{feat.title}</h3>
                <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.7 }}>
                  {feat.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '8rem 5%', textAlign: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ maxWidth: '900px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)', borderRadius: '40px', padding: '5rem 2rem', border: '1px solid rgba(124, 58, 237, 0.3)' }}
        >
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Ready to Get Started?</h2>
          <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            Join the platform that is changing the way people manage their personal wealth and community savings.
          </p>
          <Link to="/register" style={{ background: 'white', color: '#0f172a', padding: '1.2rem 4rem', borderRadius: '40px', textDecoration: 'none', fontWeight: 800, fontSize: '1.25rem', boxShadow: '0 10px 30px rgba(255,255,255,0.1)' }}>
            Create Your Free Account
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 5%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b' }}>
        <div style={{ fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>F</div>
          FinSet
        </div>
        <p style={{ color: '#64748b', fontWeight: 500 }}>© 2026 FinSet Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
