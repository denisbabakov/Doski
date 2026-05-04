"use client";

// Five vertical strips of the hero image slide in alternating from top/bottom,
// "assembling" the image like plates locking into place.
const N = 5;

export default function HeroPanels({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: N }, (_, i) => {
        const leftPct  = ((i / N) * 100).toFixed(1);
        const rightPct = (((N - 1 - i) / N) * 100).toFixed(1);
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${rightPct}% 0 ${leftPct}%)` }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${imageUrl})`,
                animation: `${i % 2 === 0 ? "panel-slide-up" : "panel-slide-down"} 1.5s ${(i * 0.11).toFixed(2)}s cubic-bezier(0.16, 1, 0.3, 1) both`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
