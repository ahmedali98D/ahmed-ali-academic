'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

// Target gain — very low for subtle ambient background
const TARGET_GAIN = 0.03

export default function AmbientMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)

  const stopSource = useCallback(() => {
    try { sourceRef.current?.stop() } catch {}
    try { sourceRef.current?.disconnect() } catch {}
    sourceRef.current = null
  }, [])

  const playBuffer = useCallback(() => {
    if (!audioCtxRef.current || !gainNodeRef.current || !bufferRef.current) return

    // Resume context if suspended (required on mobile)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }

    stopSource()

    const source = audioCtxRef.current.createBufferSource()
    source.buffer = bufferRef.current
    source.loop = true
    source.connect(gainNodeRef.current)
    source.start(0)
    sourceRef.current = source
  }, [stopSource])

  const toggleMusic = useCallback(async () => {
    // ── FIRST TIME: init AudioContext, fetch & decode MP3 ──
    if (!audioCtxRef.current) {
      setIsLoading(true)
      try {
        const ctx = new AudioContext()
        const gain = ctx.createGain()
        gain.gain.value = 0 // start silent for fade-in
        gain.connect(ctx.destination)
        audioCtxRef.current = ctx
        gainNodeRef.current = gain

        // Fetch the audio with cache-bust
        const response = await fetch(`/haunted-ocean.mp3?v=${Date.now()}`)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        bufferRef.current = audioBuffer

        // Play with fade-in
        playBuffer()
        gain.gain.setTargetAtTime(TARGET_GAIN, ctx.currentTime, 1.5)

        setIsPlaying(true)
        setIsLoading(false)
      } catch {
        setIsLoading(false)
        audioCtxRef.current = null
        gainNodeRef.current = null
      }
      return
    }

    // ── TOGGLE PLAY/PAUSE ──
    const gain = gainNodeRef.current!
    const ctx = audioCtxRef.current!

    if (isPlaying) {
      // Fade out then stop
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
      setTimeout(() => {
        stopSource()
        setIsPlaying(false)
      }, 800)
    } else {
      // Resume context (mobile browsers suspend it on pause)
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }
      playBuffer()
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.setTargetAtTime(TARGET_GAIN, ctx.currentTime, 1.5)
      setIsPlaying(true)
    }
  }, [isPlaying, playBuffer, stopSource])

  useEffect(() => {
    return () => {
      stopSource()
      try { audioCtxRef.current?.close() } catch {}
      audioCtxRef.current = null
      gainNodeRef.current = null
    }
  }, [stopSource])

  return (
    <button
      onClick={toggleMusic}
      className="fixed bottom-6 right-6 z-50 glass-card rounded-full p-3.5 cursor-pointer group transition-all duration-300 hover:scale-110 hover:border-amber-500/40"
      title={isPlaying ? 'Pause music' : isLoading ? 'Loading...' : 'Play ambient music'}
      aria-label={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
      ) : isPlaying ? (
        <div className="flex items-center gap-0.5 h-5 w-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="music-bar w-0.5 bg-amber-400 rounded-full"
              style={{ animationDuration: `${0.6 + i * 0.1}s` }}
            />
          ))}
        </div>
      ) : (
        <svg className="w-5 h-5 text-amber-400/70 group-hover:text-amber-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      )}
    </button>
  )
}
