import { useEffect, useRef } from 'react';

export function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    // Load scripts dynamically
    const loadVanta = async () => {
      try {
        // Load Three.js
        if (!(window as any).THREE) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Load Vanta Clouds
        if (!(window as any).VANTA) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.clouds.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Initialize Vanta with orange cloud color scheme
        if (vantaRef.current && (window as any).VANTA && !vantaEffect.current) {
          vantaEffect.current = (window as any).VANTA.CLOUDS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,

            // Orange cloud color scheme
            skyColor: 0xffe5b4,        // Light orange sky
            cloudColor: 0xffa500,      // Orange clouds
            cloudShadowColor: 0xcc8400, // Darker orange shadow
            sunColor: 0xffc04d,        // Soft orange sun
            sunGlareColor: 0xffb347,   // Orange glare

            // Performance settings
            backgroundColor: 0xffffff,
            speed: 1.2,
            scale: 1.0,
            scaleMobile: 1.0,
            backgroundAlpha: 0.95
          });

          console.log('✅ Vanta Clouds (orange) initialized successfully');
        }
      } catch (error) {
        console.error('❌ Failed to load Vanta:', error);
      }
    };

    loadVanta();

    // Cleanup
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="absolute inset-0 w-full h-full -z-10"
      style={{
        minHeight: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    />
  );
}
