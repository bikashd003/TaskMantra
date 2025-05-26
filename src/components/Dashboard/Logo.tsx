import { Building2 } from 'lucide-react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrganizationService } from '@/services/Organization.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface LogoProps {
  isExpanded: boolean;
}

const Logo = ({ isExpanded }: LogoProps) => {
  const [showOrgBranding, setShowOrgBranding] = useState(true);

  const { data: organization } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        return await OrganizationService.getOrganizations();
      } catch (error) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const hasOrganization = organization?.name;
  const organizationLogo = organization?.logo;
  const organizationName = organization?.name;

  const handleLogoClick = () => {
    if (hasOrganization) {
      setShowOrgBranding(!showOrgBranding);
    }
  };

  return (
    <div className="flex items-center justify-between px-3 py-3 logo-container border-b">
      {/* Logo and Text Container */}
      <div className="flex items-center min-w-0 overflow-hidden">
        {/* Logo Icon */}
        <div className="relative group flex-shrink-0">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          <div
            className="relative flex items-center justify-center w-10 h-10 rounded-xl shadow-sm group-hover:shadow-md transform group-hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={handleLogoClick}
            title={hasOrganization ? 'Click to toggle branding' : ''}
          >
            <AnimatePresence mode="wait">
              {showOrgBranding && hasOrganization ? (
                <motion.div
                  key="org-logo"
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8"
                >
                  <Avatar className="w-8 h-8 theme-shadow-sm">
                    <AvatarImage
                      src={organizationLogo}
                      alt={organizationName || 'Organization'}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white font-semibold text-sm">
                      {organizationName ? (
                        organizationName.charAt(0).toUpperCase()
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              ) : (
                <motion.div
                  key="taskmantra-logo"
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8"
                >
                  <Avatar className="w-8 h-8 theme-shadow-sm">
                    <AvatarImage
                      src="/logo_transparent.png"
                      alt="TaskMantra"
                      style={{ objectFit: 'contain' }}
                      className="object-contain"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white font-bold text-xs">
                      TM
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Logo Text */}
        <div
          className={`
            ml-3 overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'w-40 opacity-100' : 'w-0 opacity-0 h-0'}
          `}
        >
          <AnimatePresence mode="wait">
            {showOrgBranding && hasOrganization ? (
              <motion.div
                key="org-name"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="min-w-0"
              >
                <h1 className="font-['Outfit'] logo-text text-lg font-bold truncate">
                  {organizationName}
                </h1>
                <p className="text-xs theme-text-secondary truncate">Organization</p>
              </motion.div>
            ) : (
              <motion.div
                key="taskmantra-name"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="font-['Outfit'] logo-text text-lg font-bold">
                  Task<span className="text-primary">Mantra</span>
                </h1>
                {hasOrganization && (
                  <p className="text-xs theme-text-secondary">Click logo to switch</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Logo;
