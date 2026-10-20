import React, { useState } from 'react';

const UserAvatar = ({ src, name, size = 'md', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'A';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-16 h-16 text-2xl font-extrabold rounded-2xl',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const isLarge = size === 'lg';

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'Artisan'}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${selectedSize} ${isLarge ? 'rounded-2xl' : 'rounded-full'} object-cover border border-cyan-500/30 shrink-0 shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      className={`${selectedSize} ${
        isLarge
          ? 'rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/25'
          : 'rounded-full bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
      } flex items-center justify-center font-bold shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
