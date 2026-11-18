'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import StarField from '@/components/StarField'
import AmbientMusic from '@/components/AmbientMusic'

// ─── Animation Variants ──────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

// ─── Section Wrapper ─────────────────────────────────────
function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── QR Code Section ─────────────────────────────────────
function QRCodeSection() {
  const [showQR, setShowQR] = useState(false)
  const currentUrl = 'https://ahmed-ali-academic.vercel.app'

  return (
    <motion.div variants={fadeInUp} className="flex flex-col items-center gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <a
          href="/Academic_CV_Ahmed_Ali.pdf"
          download
          className="glass-card-hover rounded-2xl px-6 py-3 flex items-center gap-3 cursor-pointer group"
        >
          <svg className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span className="text-white/80 group-hover:text-white transition-colors text-sm font-medium">
            Download CV
          </span>
        </a>
        <button
          onClick={() => setShowQR(!showQR)}
          className="glass-card-hover rounded-2xl px-6 py-3 flex items-center gap-3 cursor-pointer group"
        >
          <svg className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
          </svg>
          <span className="text-white/80 group-hover:text-white transition-colors text-sm font-medium">
            {showQR ? 'Hide QR Code' : 'Share Portfolio'}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.8, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3"
          >
            <div className="glass-card rounded-2xl p-6 golden-border">
              <QRCodeSVG
                value={currentUrl}
                size={180}
                bgColor="transparent"
                fgColor="#d4af37"
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-xs text-white/40 text-center">Scan to open this portfolio</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Typing Effect Quote ─────────────────────────────────
function TypingQuote({ text }: { text: string }) {
  const [started, setStarted] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!started) return
    const timer = setInterval(() => setTick((t) => t + 1), 50)
    return () => clearInterval(timer)
  }, [started, text])

  const chars = started ? Math.min(text.length, tick) : 0
  const displayed = text.slice(0, chars)

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <span className="animate-typing-cursor text-amber-400">|</span>
      )}
    </span>
  )
}

// ─── Particle Ring around profile ────────────────────────
function OrbitRing() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-[-12px] rounded-full border border-amber-500/10 animate-rotate-slow" />
      <div className="absolute inset-[-24px] rounded-full border border-amber-500/5" style={{ animation: 'rotate-slow 30s linear infinite reverse' }} />
      <div className="absolute inset-[-12px] animate-rotate-slow">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400/60" />
      </div>
      <div className="absolute inset-[-24px]" style={{ animation: 'rotate-slow 30s linear infinite reverse' }}>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-300/40" />
      </div>
    </div>
  )
}

// ─── Social Links Data ───────────────────────────────────
const SOCIALS = [
  {
    name: 'LinkedIn',
    handle: 'Ahmed Mahmoud Saeed Ahmed Ali',
    url: 'https://www.linkedin.com/in/ahmedmahmoudsaeedahmedali',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: 'from-blue-600 to-blue-400',
  },
  {
    name: 'WhatsApp',
    handle: '+63 977 785 4717',
    url: 'https://wa.me/639777854717',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    color: 'from-green-500 to-green-400',
  },
  {
    name: 'Email',
    handle: 'ahmed.ali.academic@gmail.com',
    url: 'mailto:ahmed.ali.academic@gmail.com',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    color: 'from-amber-500 to-yellow-400',
  },
  {
    name: 'Phone',
    handle: '+63 977 785 4717',
    url: 'tel:+639777854717',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-400',
  },
]

// ─── Section Header Component ────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-semibold golden-text">{title}</h3>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────
export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <StarField />
      <AmbientMusic />

      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection className="flex flex-col items-center gap-8">
            {/* Profile Photo with Orbit Ring */}
            <motion.div variants={fadeInUp} className="relative">
              <div className="relative w-40 h-40 md:w-48 md:h-48">
                <OrbitRing />
                <div className="absolute inset-0 rounded-full overflow-hidden golden-border animate-pulse-glow bg-gradient-to-br from-amber-500/20 to-yellow-600/20">
                  <img
                    src="/profile.jpg"
                    alt="Ahmed Ali — Philosopher and Educator"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>

            {/* Name & Title */}
            <motion.div variants={fadeInUp} className="space-y-3">
              <h1 className="text-4xl md:text-6xl font-bold golden-text tracking-tight">
                AHMED ALI
              </h1>
              <p className="text-lg md:text-xl text-white/70 font-light tracking-wide">
                Philosopher  ·  Author  ·  Educator  ·  Researcher
              </p>
            </motion.div>

            {/* Typing Quote */}
            <motion.div variants={fadeInUp} className="max-w-2xl mx-auto">
              <p className="text-base md:text-lg text-white/50 italic font-light">
                <TypingQuote text="&ldquo;The gap between what is and what should be is not a problem to be solved once, but a discipline to be practiced for a lifetime.&rdquo;" />
              </p>
            </motion.div>

            {/* Credentials Bar */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm">
              {[
                'BA Philosophy · Alexandria University',
                'PGDE · Al-Azhar University',
                'BPA Member',
                'IELTS Band 7',
              ].map((cred, i) => (
                <span
                  key={i}
                  className="glass-card px-3 py-1.5 rounded-full text-white/60 border border-amber-500/20"
                >
                  {cred}
                </span>
              ))}
            </motion.div>

            {/* Social Links */}
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link glass-card-hover w-12 h-12 rounded-xl flex items-center justify-center text-white/60 hover:text-amber-400"
                  title={`${social.name}: ${social.handle}`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </motion.div>

            {/* QR Code */}
            <motion.div variants={fadeInUp} className="pt-4">
              <QRCodeSection />
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div variants={fadeInUp} className="pt-8">
              <div className="flex flex-col items-center gap-2 text-white/30">
                <span className="text-xs uppercase tracking-widest">Explore Portfolio</span>
                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Profile Section ──────────────────────────── */}
      <section className="relative z-10 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeInUp}>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                }
                title="Profile"
              />
            </motion.div>
            <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 md:p-8 space-y-4">
              <p className="text-white/70 leading-relaxed text-sm md:text-base">
                Philosopher and educator with a Bachelor of Arts in Philosophy from Alexandria University and a Postgraduate Diploma in Education from Al-Azhar University. Research experience at Emory University, working under Dr. Rahimjon Abdugafurov on philosophical and theological manuscripts in Islamic civilization, and undergraduate formation under Prof. Dr. Ashraf Hassan Mansour, Chair of the Department of Philosophy at Alexandria University. Author of <em className="text-amber-300/80">Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI</em> (2026), a scholarly handbook engaging both Norman Webb&apos;s contemporary framework and the Islamic intellectual tradition from Al-Hasan al-Basri to Ibn Khaldun.
              </p>
              <p className="text-white/70 leading-relaxed text-sm md:text-base">
                ADEK-approved teacher and UAE Ministry of Education Licensed Teacher with eight years of experience across education, operations, and academic research in the UAE, UK, and Egypt. Member of the British Philosophical Association (BPA) since 2025. Bilingual in Arabic (native) and English (Academic IELTS Band 7). Creator and host of <em className="text-amber-300/80">Echoes of Wisdom</em>, a bilingual philosophy podcast with sixteen episodes across two seasons. Seeking to contribute to philosophy instruction and research at the university level.
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Research & Publications Section ──────────── */}
      <section className="relative z-10 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeInUp}>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                }
                title="Research & Publications"
              />
            </motion.div>

            {/* Book */}
            <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 md:p-8 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="w-40 h-56 md:w-48 md:h-72 rounded-lg overflow-hidden golden-border shadow-2xl shadow-amber-500/20">
                    <img
                      src="/depth-of-knowledge-front.jpg"
                      alt="Depth of Knowledge — Book Cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <h4 className="text-lg md:text-xl font-semibold text-amber-300">
                    Depth of Knowledge: A Practical Guide to Designing Rigorous Questions Without AI
                  </h4>
                  <p className="text-xs text-white/40 font-mono">
                    Independently published, First Edition, 2026  ·  ISBN: 979-8-1913137-5-7  ·  149 pages
                  </p>
                  <p className="text-sm text-white/60 leading-relaxed">
                    A scholarly handbook that restores to educators the craft of writing cognitively demanding questions from lesson content alone, without relying on AI tools. Grounded in Norman Webb&apos;s Depth of Knowledge framework, the work returns to Webb&apos;s original 1997 and 2002 monographs as primary sources and corrects the widespread misinterpretation perpetuated by the unauthorized &ldquo;DOK Wheel.&rdquo; The method is verified by reverse-coding. A substantial chapter traces the principle that recall is not reasoning through the Islamic intellectual tradition, from Al-Hasan al-Basri in the eighth century to Ibn Khaldun&apos;s four-level progression in the Muqaddimah (1377).
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="https://www.amazon.com/author/ahmed-ali"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Buy on Amazon
                    </a>
                    <a
                      href="https://phronesis-studio.com/en/publications/depth-of-knowledge"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-hover text-white/70 text-sm font-medium"
                    >
                      Book Details
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Emory Research */}
            <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 md:p-8 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-widest text-amber-400/70 font-mono">Research Appointment</span>
                </div>
                <h4 className="text-lg md:text-xl font-semibold text-white/90">
                  Research Assistant and Translator
                </h4>
                <p className="text-sm text-white/50">
                  Emory University  ·  with Ustadh Dr. Rahimjon Abdugafurov  ·  2017
                </p>
                <ul className="space-y-2 text-sm text-white/60 mt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5 flex-shrink-0">·</span>
                    <span>Transcribed and analysed philosophical and theological manuscripts in Islamic civilization under Dr. Abdugafurov&apos;s supervision, focusing on their philosophical and theological contexts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5 flex-shrink-0">·</span>
                    <span>Produced English–Arabic translations of academic works for bilingual educational settings, maintaining scholarly precision across both languages.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5 flex-shrink-0">·</span>
                    <span>Engaged primary-source manuscripts with attention to philological detail, doctrinal context, and the conceptual genealogies linking classical Islamic philosophy to contemporary philosophical questions.</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Echoes of Wisdom Podcast */}
            <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 md:p-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-widest text-amber-400/70 font-mono">Public Philosophy</span>
                </div>
                <h4 className="text-lg md:text-xl font-semibold text-white/90">
                  Creator and Host — Echoes of Wisdom Podcast
                </h4>
                <p className="text-sm text-white/50">
                  Independent Educational Initiative  ·  2026 – Present
                </p>
                <ul className="space-y-2 text-sm text-white/60 mt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5 flex-shrink-0">·</span>
                    <span>Produces and hosts a bilingual (Arabic/English) philosophy podcast with sixteen episodes across two seasons, spanning ethics, logic, epistemology, philosophy of mind, and political philosophy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1.5 flex-shrink-0">·</span>
                    <span>Bridges academic philosophy and public discourse, rendering complex ideas accessible while preserving their scholarly integrity.</span>
                  </li>
                </ul>
                <a
                  href="https://phronesis-studio.com/en/philosophy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-hover text-amber-300 text-sm font-medium mt-2"
                >
                  Explore Episodes & Articles
                </a>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Education Section ────────────────────────── */}
      <section className="relative z-10 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeInUp}>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 12.55c1.486.073 2.991.114 4.507.114a60.45 60.45 0 008.42-.681m-8.42.681A48.62 48.62 0 0012 20.904c1.512 0 3.003.062 4.47.18m0-6.998l-.247.145m.247-.145l-.247-.145m.247.145a48.6 48.6 0 00-.247-.145" />
                  </svg>
                }
                title="Education"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 md:p-8 mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                <h4 className="text-lg md:text-xl font-semibold text-amber-300">
                  Bachelor of Arts in Philosophy
                </h4>
                <span className="text-xs text-white/40 font-mono">Sep 2016 – May 2021  ·  Good</span>
              </div>
              <p className="text-sm text-white/50 mb-3">Faculty of Arts, Alexandria University, Egypt</p>
              <p className="text-sm text-white/60 leading-relaxed mb-3">
                Comprehensive programme covering formal, inductive, and mathematical logic; philosophy of science; metaphysics; philosophy of language; ethics and value theory; Greek, Islamic, modern, and contemporary philosophy; ancient Eastern thought; Islamic theology (Kalam) and Sufism; and logic and artificial intelligence. Included the study of philosophical texts in a European language throughout most academic semesters. Accredited and attested by authorities in Egypt and the UAE, with formal equivalency issued by the UAE Ministry of Education.
              </p>
              <p className="text-xs text-white/40 italic">
                Department Chair: Prof. Dr. Ashraf Hassan Mansour (recommendation letter available upon request).
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                <h4 className="text-lg md:text-xl font-semibold text-amber-300">
                  Postgraduate Diploma in Education
                </h4>
                <span className="text-xs text-white/40 font-mono">Sep 2024 – Sep 2025  ·  Very Good</span>
              </div>
              <p className="text-sm text-white/50 mb-3">Faculty of Education, Al-Azhar University, Egypt</p>
              <p className="text-sm text-white/60 leading-relaxed">
                Educational psychology and human development; philosophy and history of education; curriculum studies; instructional methodologies; educational administration and planning; micro-teaching and practical teaching experience. Accredited and attested, with UAE Ministry of Education equivalency.
              </p>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Teaching & Academic Experience ───────────── */}
      <section className="relative z-10 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeInUp}>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                }
                title="Academic & Teaching Experience"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-4">
              {/* Founder & Education Consultant */}
              <div className="glass-card rounded-2xl p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-2">
                  <h4 className="text-base md:text-lg font-semibold text-white/90">
                    Founder & Education Consultant
                  </h4>
                  <span className="text-xs text-white/40 font-mono">Aug 2026 – Present</span>
                </div>
                <p className="text-sm text-white/50 mb-2">Studio of Phronesis</p>
                <p className="text-sm text-white/60">Founded Studio of Phronesis as a practice grounded in philosophy and practical wisdom. Delivered an 8-module professional development program at Creative Learning International Center, Panglao, Bohol, Philippines (October to December 2026), grounded in Bloom&apos;s Taxonomy, Webb&apos;s DOK, Marzano&apos;s New Taxonomy, Understanding by Design, and Depth of Knowledge (2026), aligned to Philippine DepEd K to 3 standards. Each teacher produced a 16-point lesson plan, a cognitive depth audit, a five-question formative assessment with Plickers, and a final peer-reviewed classroom-ready lesson plan.</p>
                <a href="https://phronesis-studio.com/en/engagements" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-amber-400/80 hover:text-amber-400 transition-colors">
                  <span>Learn more about this program</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </a>
              </div>

              {/* Ain Al Khaleej */}
              <div className="glass-card rounded-2xl p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-2">
                  <h4 className="text-base md:text-lg font-semibold text-white/90">
                    MSC Studies & Islamic Education B Teacher; Lead, Non-Arabic Speaking Section
                  </h4>
                  <span className="text-xs text-white/40 font-mono">Sep 2025 – Jul 2026</span>
                </div>
                <p className="text-sm text-white/50 mb-3">Ain Al Khaleej Private School, American Division, UAE</p>
                <ul className="space-y-1.5 text-sm text-white/60">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1 flex-shrink-0">·</span>
                    <span>Designed and delivered curriculum with substantial philosophical content, including units on ethics, epistemology, philosophy of religion, and political philosophy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1 flex-shrink-0">·</span>
                    <span>Promoted from Subject Teacher to Lead of the Non-Arabic Speaking Section in Term 2.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1 flex-shrink-0">·</span>
                    <span>Appointed Faculty Head for Model United Nations (MUN); coached delegation to win Best School at MANORMUN V 2026.</span>
                  </li>
                </ul>
              </div>


            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Certifications & Credentials ─────────────── */}
      <section className="relative z-10 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeInUp}>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                }
                title="Certifications & Credentials"
              />
            </motion.div>
            <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 md:p-8">
              <ul className="space-y-3 text-sm text-white/60">
                {[
                  'Certified Professional Teaching License (Social Studies, Cycle 3), UAE Ministry of Education — Valid until February 2029',
                  'ADEK-Approved Teacher (MSC and Islamic Education B for Non-Arabic Speakers), Abu Dhabi, UAE',
                  'IELTS Academic Band 7, British Council — Valid until August 2027',
                  'Verification of Manuscripts in Philosophy and Theology, Bibliotheca Alexandrina — November 2021',
                  'Critical Thinking and Decision Making, LinkedIn Learning — July 2021',
                  'AI for Educators (Level 1), Teachy — October 2025',
                  'Network Fundamentals and Security, Mahara Tech (MCIT, Egypt) — June 2025',
                  'Advanced Person-in-Charge (PIC), Dubai Municipality — May 2025',
                  'Fire Warden (Level 2), Dubai Civil Defence — Valid until August 2026',
                ].map((cert, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Affiliations & Languages ─────────────────── */}
      <section className="relative z-10 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <motion.div variants={fadeInUp}>
              <SectionHeader
                icon={
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                  </svg>
                }
                title="Affiliations & Languages"
              />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 md:p-8">
                <h4 className="text-base font-semibold text-amber-300 mb-4">Affiliations</h4>
                <ul className="space-y-3 text-sm text-white/60">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 mt-1 flex-shrink-0">·</span>
                    <span>Member, British Philosophical Association (BPA), 2025 – Present</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 mt-1 flex-shrink-0">·</span>
                    <span>Co-organiser, 3rd Annual International Conference, Department of Philosophy, Alexandria University (Nov 2017)</span>
                  </li>
                </ul>
              </motion.div>
              <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 md:p-8">
                <h4 className="text-base font-semibold text-amber-300 mb-4">Languages</h4>
                <ul className="space-y-3 text-sm text-white/60">
                  <li className="flex items-center justify-between">
                    <span>Arabic</span>
                    <span className="text-white/40 text-xs font-mono">Native</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>English</span>
                    <span className="text-white/40 text-xs font-mono">Fluent (C1, IELTS Band 7)</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Urdu</span>
                    <span className="text-white/40 text-xs font-mono">Beginner</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Spanish</span>
                    <span className="text-white/40 text-xs font-mono">Beginner</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────── */}
      <footer className="relative z-10 mt-auto px-4 py-12 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <img src="/phronesis-logo.png" alt="" className="w-6 h-6 opacity-60" />
            <span>Ahmed Ali · Higher Education & Research Portfolio</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/30">
            <a href="https://phronesis-studio.com/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">Studio of Phronesis</a>
            <span>·</span>
            <a href="https://ahmed-ali-ops.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">Professional & Operations</a>
            <span>·</span>
            <a href="https://mr-ahmed-ali.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">K-12 Teaching</a>
          </div>
          <p className="text-xs text-white/20 pt-4">© 2026 Ahmed Ali. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
