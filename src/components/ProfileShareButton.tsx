
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import ProfileShareModal from './ProfileShareModal';

interface ProfileShareButtonProps {
  profileId: string;
  customUsername?: string;
  isPublic: boolean;
  className?: string;
}

const ProfileShareButton = ({ profileId, customUsername, isPublic, className }: ProfileShareButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        size="sm"
        className={`${className} hover:bg-primary/10`}
      >
        <Share2 className="w-4 h-4" />
      </Button>
      
      <ProfileShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileId={profileId}
        customUsername={customUsername}
        isPublic={isPublic}
      />
    </>
  );
};

export default ProfileShareButton;
