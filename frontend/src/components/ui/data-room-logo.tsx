import { cn } from '@/lib/utils';

const PATHS = (
  <>
    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15z" />
    <path d="M1.5 10.143V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.143A4.483 4.483 0 0019.5 12h-15a4.483 4.483 0 00-3 1.143z" />
  </>
);

interface DataRoomLogoIconProps {
  /** Size class for the wrapping div, e.g. "w-8 h-8" */
  size?: string;
  /** Extra classes for the container */
  className?: string;
  /** SVG fill color class — defaults to currentColor */
  fill?: string;
  /** Icon svg size class */
  iconSize?: string;
}

export function DataRoomLogoIcon({
  size = 'w-8 h-8',
  className,
  fill = 'currentColor',
  iconSize = 'w-4 h-4',
}: DataRoomLogoIconProps) {
  return (
    <div className={cn('flex items-center justify-center rounded-lg', size, className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={fill}
        className={iconSize}
      >
        {PATHS}
      </svg>
    </div>
  );
}
