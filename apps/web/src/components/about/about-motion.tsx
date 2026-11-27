'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ReactNode } from 'react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Scroll motion for the about page (PLAN-about-page §3.2). Sections stay server components and opt in
 * through data attributes:
 * - `data-reveal`: rises in once when it enters the viewport.
 * - `data-stagger`: its children rise in one after another.
 * - `data-scrub`: fades from dim to full while it scrolls through the middle of the screen.
 * - `data-progress="x" | "y"`: a line that grows while its `data-progress-scope` (or parent) scrolls by.
 * - `data-step`: gets `data-active` once it passes the middle of the screen.
 * - `data-count="27"`: counts up from zero the first time it is seen.
 * - `data-parallax="-12"`: drifts by that many percent while the hero scrolls away.
 * Everything is readable without JavaScript, and nothing moves with reduced motion.
 */
export function AboutMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Problem story: the sticky visual follows whichever step is in the middle of the screen. Runs with
      // reduced motion too (the CSS skips the transition); without JavaScript it shows the answer.
      for (const story of gsap.utils.toArray<HTMLElement>('[data-story]', scope.current)) {
        const visual = story.querySelector<HTMLElement>('[data-story-visual]')
        const steps = gsap.utils.toArray<HTMLElement>('[data-story-step]', story)
        if (!visual || steps.length === 0) continue
        const show = (index: number) => {
          visual.setAttribute('data-state', String(index))
          steps.forEach((step, i) => step.toggleAttribute('data-current', i === index))
        }
        story.setAttribute('data-story-ready', '')
        show(0)
        steps.forEach((step, i) => {
          ScrollTrigger.create({
            trigger: step,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => {
              if (self.isActive) show(i)
            },
          })
        })
      }

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        scope.current?.setAttribute('data-motion', '')
        const all = <T extends Element = HTMLElement>(selector: string) =>
          gsap.utils.toArray<T>(selector, scope.current)

        for (const el of all('[data-reveal]')) {
          gsap.from(el, {
            y: 32,
            autoAlpha: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        }

        for (const group of all('[data-stagger]')) {
          gsap.from(group.children, {
            y: 28,
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.09,
            ease: 'power3.out',
            scrollTrigger: { trigger: group, start: 'top 85%', once: true },
          })
        }

        for (const el of all('[data-scrub]')) {
          gsap.fromTo(
            el,
            { opacity: 0.16 },
            {
              opacity: 1,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 82%', end: 'top 48%', scrub: true },
            },
          )
        }

        // A row of steps in one sequence (trust flow): each step lights up, then its connector fills to
        // the next one, played once when the row comes into view.
        for (const sequence of all('[data-sequence]')) {
          const steps = gsap.utils.toArray<HTMLElement>('[data-step]', sequence)
          const lines = gsap.utils.toArray<HTMLElement>('[data-progress]', sequence)
          gsap.set(
            lines.filter((line) => line.dataset.progress === 'x'),
            { scaleX: 0 },
          )
          gsap.set(
            lines.filter((line) => line.dataset.progress === 'y'),
            { scaleY: 0 },
          )
          const timeline = gsap.timeline({
            scrollTrigger: { trigger: sequence, start: 'top 70%', once: true },
          })
          steps.forEach((step) => {
            timeline.call(() => step.setAttribute('data-active', ''))
            const own = gsap.utils.toArray<HTMLElement>('[data-progress]', step)
            if (own.length > 0) {
              timeline.to(
                own,
                { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'power2.inOut' },
                '+=0.15',
              )
            }
          })
        }

        for (const line of all('[data-progress]')) {
          if (line.closest('[data-sequence]')) continue
          const prop = line.dataset.progress === 'x' ? 'scaleX' : 'scaleY'
          gsap.fromTo(
            line,
            { [prop]: 0 },
            {
              [prop]: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: line.closest('[data-progress-scope]') ?? line.parentElement,
                // Same line as the step trigger below, so a segment finishes as the next step lights up.
                start: 'top 62%',
                end: 'bottom 62%',
                scrub: 0.4,
              },
            },
          )
        }

        for (const step of all('[data-step]')) {
          if (step.closest('[data-sequence]')) continue
          ScrollTrigger.create({
            trigger: step,
            start: 'top 62%',
            onEnter: () => step.setAttribute('data-active', ''),
            onLeaveBack: () => step.removeAttribute('data-active'),
          })
        }

        const splashing = document.documentElement.hasAttribute('data-splash')
        for (const el of all('[data-count]')) {
          // A number already on screen at load stays put unless the splash is covering it.
          if (!splashing && ScrollTrigger.isInViewport(el)) continue
          const target = Number(el.dataset.count)
          const counter = { value: 0 }
          el.textContent = '0'
          gsap.to(counter, {
            value: target,
            duration: 1.6,
            delay: splashing ? 1.9 : 0,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = String(Math.round(counter.value))
            },
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          })
        }

        const hero = scope.current?.querySelector('[data-hero]')
        if (hero) {
          for (const el of all('[data-parallax]')) {
            gsap.to(el, {
              yPercent: Number(el.dataset.parallax),
              ease: 'none',
              scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
            })
          }
        }
        return () => scope.current?.removeAttribute('data-motion')
      })
      return () => mm.revert()
    },
    { scope },
  )

  return <div ref={scope}>{children}</div>
}
