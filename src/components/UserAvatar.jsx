export default function UserAvatar({ user, size = 'md' }) {
  const image = user?.profileImage || user?.photoURL || user?.photoUrl;
  const name = user?.name || user?.displayName || user?.email || 'User';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  const sizes = {
    xs:  'h-6 w-6 text-[10px]',
    sm:  'h-8 w-8 text-xs',
    md:  'h-10 w-10 text-sm',
    lg:  'h-14 w-14 text-lg',
    xl:  'h-20 w-20 text-2xl',
  };

  const ringColors = {
    xs:  'ring-1 ring-brand-500/50',
    sm:  'ring-2 ring-brand-500/40',
    md:  'ring-2 ring-brand-500/40',
    lg:  'ring-[3px] ring-brand-500/50 shadow-lg shadow-brand-900/50',
    xl:  'ring-4 ring-brand-500/50 shadow-xl shadow-brand-900/60',
  };

  const cls = `${sizes[size] || sizes.md} ${ringColors[size] || ringColors.md} shrink-0 rounded-full`;

  return image ? (
    <img
      className={`${cls} object-cover`}
      src={image}
      alt={`${name} profile`}
      referrerPolicy="no-referrer"
    />
  ) : (
    <span
      className={`${cls} flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white`}
      aria-label={`${name} profile`}
    >
      {initials}
    </span>
  );
}
