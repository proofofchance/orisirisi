import { SocialIcon } from 'react-social-icons';

export function SocialLinks() {
  return (
    <div className="fixed top-60 left-0">
      <div id="social-links" className="transition-all duration-200 ease-out">
        <div className="h-12 w-12 hover:h-14 hover:w-14">
          <SocialIcon
            style={{ height: '100%', width: '100%' }}
            target="_blank"
            url="https://twitter.com/proofofchance"
          />
        </div>
        <div className="h-12 w-12 hover:h-14 hover:w-14 mt-4">
          <SocialIcon
            style={{ height: '100%', width: '100%' }}
            target="_blank"
            url="https://discord.gg/gkPkAYpN"
          />
        </div>
        <div className="h-12 w-12 hover:h-14 hover:w-14 mt-4">
          <SocialIcon
            style={{ height: '100%', width: '100%' }}
            target="_blank"
            url="https://instagram.com/proofofchance"
          />
        </div>
        <div className="h-12 w-12 hover:h-14 hover:w-14 mt-4">
          <SocialIcon
            style={{ height: '100%', width: '100%' }}
            target="_blank"
            url="https://www.github.com/proofofchance"
          />
        </div>
        <div className="h-12 w-12 hover:h-14 hover:w-14 mt-4">
          <SocialIcon
            style={{ height: '100%', width: '100%' }}
            target="_blank"
            url="https://medium.com/@proofofchance"
          />
        </div>
      </div>
    </div>
  );
}
