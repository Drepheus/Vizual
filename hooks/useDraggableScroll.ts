import { useRef, useEffect, useState } from 'react';

export function useDraggableScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const slider = ref.current;
    if (!slider) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setStartX(e.pageX - slider.offsetLeft);
      setScrollLeft(slider.scrollLeft);
      slider.style.cursor = 'grabbing';
      slider.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
      slider.style.cursor = 'grab';
      slider.style.removeProperty('user-select');
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      slider.style.cursor = 'grab';
      slider.style.removeProperty('user-select');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      slider.scrollLeft = scrollLeft - walk;
    };

    const handleWheel = (e: WheelEvent) => {
      // Allow vertical scrolling if we are at the edges, otherwise scroll horizontal
      // Actually, user requested "using scroll wheel", usually implies vertical wheel -> horizontal scroll
      if (e.deltaY !== 0) {
        // Check if we can scroll further
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        if ((slider.scrollLeft <= 0 && e.deltaY < 0) || (slider.scrollLeft >= maxScroll && e.deltaY > 0)) {
             return; // Let the parent handle it (vertical page scroll)
        }
        
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
      }
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);
    slider.addEventListener('wheel', handleWheel, { passive: false });

    slider.style.cursor = 'grab';

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
      slider.removeEventListener('wheel', handleWheel);
    };
  }, [isDragging, startX, scrollLeft]);

  return ref;
}
