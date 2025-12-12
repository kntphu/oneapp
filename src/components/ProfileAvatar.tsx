// src/components/ProfileAvatar.tsx

import React from 'react';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '@context/AuthContext';

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  onClick?: () => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  size = 'md', 
  className = '', 
  showName = false,
  onClick 
}) => {
  const { user } = useAuth();

  // Size configurations
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-2xl'
  };

  // Get user initials
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user?.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return user.name.charAt(0).toUpperCase();
    } else if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.name) {
      return user.name;
    } else if (user?.username) {
      return user.username;
    }
    return 'ผู้ใช้งาน';
  };

  // Get profile picture URL
  const getProfilePicture = () => {
    return (user as any)?.profilePicture || '';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Hide broken image and show fallback
    (e.target as HTMLImageElement).style.display = 'none';
    const fallbackElement = (e.target as HTMLImageElement).nextElementSibling;
    if (fallbackElement) {
      (fallbackElement as HTMLElement).style.display = 'flex';
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Avatar Container */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 shadow-card relative bg-gradient-orange flex items-center justify-center`}>
        {/* Profile Image */}
        {getProfilePicture() && (
          <img
            src={getProfilePicture()}
            alt={getDisplayName()}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
        
        {/* Fallback - Initials or Icon */}
        <div 
          className={`w-full h-full bg-gradient-orange flex items-center justify-center text-white font-semibold ${!getProfilePicture() ? 'flex' : 'hidden'}`}
          style={{ display: getProfilePicture() ? 'none' : 'flex' }}
        >
          {user ? (
            <span className={iconSizes[size]}>{getUserInitials()}</span>
          ) : (
            <FaUser className={iconSizes[size]} />
          )}
        </div>
      </div>

      {/* Name Display */}
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 truncate">
            {getDisplayName()}
          </span>
          {user?.role && (
            <span className="text-xs text-gray-500 truncate">
              {user.role}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;