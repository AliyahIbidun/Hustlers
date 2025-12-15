import React, { useEffect, useState } from 'react';

interface CharacterPortraitProps {
  speaker: string;
  mood?: string;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({ speaker, mood }) => {
  const [visible, setVisible] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(speaker);

  useEffect(() => {
    if (speaker !== currentSpeaker) {
      setVisible(false);
      const timer = setTimeout(() => {
        setCurrentSpeaker(speaker);
        setVisible(true);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [speaker, currentSpeaker]);

  // Don't show portrait for narrator or system messages if not desired, 
  // but for style, we can generate abstract ones or hide them.
  const isSystem = ['Narrator', 'System', 'Lagos'].includes(currentSpeaker);
  
  // Generate Avatar URL (DiceBear Micah style fits the gritty vector vibe)
  // We use the speaker name as the seed to ensure consistency
  const avatarUrl = `https://api.dicebear.com/9.x/micah/svg?seed=${currentSpeaker}&backgroundColor=transparent&mouth=smirk,laughing,smile&radius=0`;

  if (isSystem) return null;

  return (
    <div 
        className={`
            absolute bottom-0 left-1/2 transform -translate-x-1/2 
            transition-all duration-500 ease-out z-0
            ${visible ? 'translate-y-10 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-90'}
        `}
        style={{ height: '60vh', pointerEvents: 'none' }} // Tall enough to stand behind text
    >
      {/* Glow Effect behind character */}
      <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full transform scale-75 translate-y-20"></div>
      
      <img 
        src={avatarUrl} 
        alt={currentSpeaker} 
        className={`
            h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]
            ${mood === 'danger' ? 'grayscale contrast-125' : ''}
            ${mood === 'party' ? 'hue-rotate-180' : ''}
        `}
      />
    </div>
  );
};