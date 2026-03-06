"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { GripVertical } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeContent: React.ReactNode;
  afterContent: React.ReactNode;
}

const INITIAL_SLIDER_PERCENT = 50;
const MIN_SLIDER_PERCENT = 18;
const MAX_SLIDER_PERCENT = 82;

function clampSliderPercent(value: number) {
  return Math.min(MAX_SLIDER_PERCENT, Math.max(MIN_SLIDER_PERCENT, value));
}

export function BeforeAfterSlider({
  beforeContent,
  afterContent,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const sliderPercent = useMotionValue(INITIAL_SLIDER_PERCENT);
  const clipRight = useTransform(sliderPercent, (value) => `${100 - value}%`);
  const beforeClipPath = useMotionTemplate`inset(0 ${clipRight} 0 0)`;
  const handleLeft = useTransform(sliderPercent, (value) => `${value}%`);
  const autoAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
  const autoDirectionRef = useRef<1 | -1>(1);
  const hasAutoStartedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    function stopAutoAnimation() {
      autoAnimationRef.current?.stop();
      autoAnimationRef.current = null;
    }

    function startAutoSweep() {
      stopAutoAnimation();

      const current = sliderPercent.get();
      const currentTarget =
        autoDirectionRef.current === 1 ? MAX_SLIDER_PERCENT : MIN_SLIDER_PERCENT;
      const target =
        Math.abs(current - currentTarget) < 0.5
          ? autoDirectionRef.current === 1
            ? MIN_SLIDER_PERCENT
            : MAX_SLIDER_PERCENT
          : currentTarget;

      const nextDirection = target === MAX_SLIDER_PERCENT ? 1 : -1;
      autoDirectionRef.current = nextDirection;

      const distance = Math.abs(target - current);
      const fullRange = MAX_SLIDER_PERCENT - MIN_SLIDER_PERCENT;
      const duration = Math.max(0.35, (distance / fullRange) * 1.4);

      autoAnimationRef.current = animate(sliderPercent, target, {
        duration,
        ease: "easeInOut",
        onComplete: () => {
          autoDirectionRef.current = nextDirection === 1 ? -1 : 1;
          if (!prefersReducedMotion && !isDragging && !isHovered && !hasInteracted) {
            startAutoSweep();
          }
        },
      });
    }

    if (prefersReducedMotion || isDragging || isHovered || hasInteracted) {
      stopAutoAnimation();
      return;
    }

    const kickoffDelay = hasAutoStartedRef.current ? 0 : 900;
    const kickoff = window.setTimeout(() => {
      hasAutoStartedRef.current = true;
      startAutoSweep();
    }, kickoffDelay);

    return () => {
      stopAutoAnimation();
      window.clearTimeout(kickoff);
    };
  }, [hasInteracted, isDragging, isHovered, prefersReducedMotion, sliderPercent]);

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    function updateFromPointer(clientX: number) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) {
        return;
      }

      const nextPercent = ((clientX - rect.left) / rect.width) * 100;
      sliderPercent.set(clampSliderPercent(nextPercent));
    }

    function handlePointerMove(event: PointerEvent) {
      updateFromPointer(event.clientX);
    }

    function handlePointerUp() {
      setIsDragging(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, sliderPercent]);

  function beginDrag(clientX: number) {
    setHasInteracted(true);
    setIsDragging(true);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) {
      return;
    }

    const nextPercent = ((clientX - rect.left) / rect.width) * 100;
    sliderPercent.set(clampSliderPercent(nextPercent));
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-[2rem] border border-theme-border bg-theme-panel shadow-[0_24px_70px_rgba(42,31,27,0.08)]"
      onPointerDown={(event) => beginDrag(event.clientX)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {/* After layer (full width, underneath) */}
      <div className="absolute inset-0">{afterContent}</div>

      {/* Before layer (revealed to the handle position) */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: beforeClipPath }}
      >
        {beforeContent}
      </motion.div>

      {/* Slider handle */}
      <motion.div
        className="absolute inset-y-0 z-10 cursor-ew-resize"
        style={{ left: handleLeft, transform: "translateX(-50%)" }}
      >
        <div className="relative h-full w-10">
          <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-lg" />
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-theme-primary bg-theme-panel shadow-lg">
            <GripVertical className="h-4 w-4 text-theme-primary" />
          </div>
        </div>
      </motion.div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-20">
        <span className="rounded-full bg-theme-panel-strong/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
          BEFORE
        </span>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <span className="rounded-full bg-theme-primary/90 px-3 py-1.5 text-xs font-bold text-theme-primary-foreground backdrop-blur-sm">
          AFTER
        </span>
      </div>
    </div>
  );
}
