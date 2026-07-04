import logoImage from '../../assets/logo-gosen.jpeg';

interface LogoProps {
  size?: number;
  showName?: boolean;
  nameClassName?: string;
}

export function Logo({ size = 40, showName = true, nameClassName }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={logoImage}
        alt="GOSEN"
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
      {showName && (
        <span className={nameClassName || 'text-2xl font-bold tracking-wide'}>GOSEN</span>
      )}
    </div>
  );
}
