import { lazy, Suspense, memo } from 'react';

const VantaBackground = lazy(() => import('./VantaBackground').then(module => ({ default: module.VantaBackground })));

// Fallback component while loading
const VantaBackgroundSkeleton = () => (
  <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 to-purple-50" />
);

export const LazyVantaBackground = memo(function LazyVantaBackground() {
  return (
    <Suspense fallback={<VantaBackgroundSkeleton />}>
      <VantaBackground />
    </Suspense>
  );
});
