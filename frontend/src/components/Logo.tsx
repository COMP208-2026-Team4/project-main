import { useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const Logo: React.FC = () => {
  const logoRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = logoRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", e.clientX - rect.left + "px");
    el.style.setProperty("--y", e.clientY - rect.top + "px");
  }, []);

  return (
    <div className="size-16 grid place-self-start">
      <Link to="/dashboard" className="place-self-center">
        <div
          ref={logoRef}
          className="relative size-10 m-auto"
          onMouseMove={handleMouseMove}>
          <div className="mask-[url(/assets/logo.svg)] mask-cover size-full bg-radial-[at_var(--x,_100%)_var(--y,_100%)] from-cyan-300 to-fuchsia-900 hover:brightness-100 brightness-60 transition-[filter]" />
        </div>
      </Link>
    </div>
  );
};

export default Logo;
