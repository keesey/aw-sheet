import { D20_EDGE_PATHS, D20_FACE_PATHS } from "../../lib/icosahedron-icon";

export function D20Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <g fill="currentColor" fillOpacity="0.2" stroke="none">
        {D20_FACE_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill="none">
        {D20_EDGE_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
