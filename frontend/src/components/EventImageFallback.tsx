interface EventImageFallbackProps {
  title: string;
  className?: string;
}

export const EventImageFallback = ({ title, className = '' }: EventImageFallbackProps) => {
  return (
    <div
      className={`bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center ${className}`}
    >
      <div className="text-center px-6">
        <svg
          className="mx-auto h-16 w-16 text-white opacity-80 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-white font-bold text-xl line-clamp-2">{title}</h3>
      </div>
    </div>
  );
};
