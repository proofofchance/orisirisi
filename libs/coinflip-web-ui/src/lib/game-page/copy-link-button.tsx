import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import toast from 'react-hot-toast';

export function CopyGameLinkButton({ className }: PropsWithClassName) {
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);

    toast.success('Game link copied successfully!', {
      position: 'bottom-center',
    });
  };
  return (
    <button
      onClick={copyLink}
      className={cn(
        'bg-white hover:bg-slate-100 text-black fill-current focus:outline-none border-[1px] border-white w-16 h-16 hover:w-[66px] hover:h-[66px] flex justify-center items-center rounded-full shadow-md transition duration-75 ease-in-out',
        className
      )}
    >
      <span className="flex flex-col gap-1 justify-center items-center">
        <ShareIcon size={22} />
        <span className="text-[8px]">Copy Link</span>
      </span>
    </button>
  );
}

const ShareIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox={`0 0 48 48`}>
    <path d="M31.605 6.838a1.25 1.25 0 0 0-2.105.912v5.472c-.358.008-.775.03-1.24.072c-1.535.142-3.616.526-5.776 1.505c-4.402 1.995-8.926 6.374-9.976 15.56a1.25 1.25 0 0 0 2.073 1.075c4.335-3.854 8.397-5.513 11.336-6.219a17.713 17.713 0 0 1 3.486-.497l.097-.003v5.535a1.25 1.25 0 0 0 2.105.912l12-11.25a1.25 1.25 0 0 0 0-1.824l-12-11.25Zm-.999 8.904l.02.002h.002h-.001A1.25 1.25 0 0 0 32 14.5v-3.865L40.922 19L32 27.365V23.5c0-.63-.454-1.16-1.095-1.24h-.003l-.004-.001l-.01-.001l-.028-.003a8.425 8.425 0 0 0-.41-.03a13.505 13.505 0 0 0-1.134-.006c-.966.034-2.33.17-3.983.566c-2.68.643-6.099 1.971-9.778 4.653c1.486-6.08 4.863-8.958 7.96-10.362c1.841-.834 3.635-1.168 4.975-1.292c.668-.062 1.216-.07 1.591-.064a9.837 9.837 0 0 1 .525.022ZM12.25 8A6.25 6.25 0 0 0 6 14.25v21.5A6.25 6.25 0 0 0 12.25 42h21.5A6.25 6.25 0 0 0 40 35.75V33.5a1.25 1.25 0 0 0-2.5 0v2.25a3.75 3.75 0 0 1-3.75 3.75h-21.5a3.75 3.75 0 0 1-3.75-3.75v-21.5a3.75 3.75 0 0 1 3.75-3.75h8.25a1.25 1.25 0 1 0 0-2.5h-8.25Z"></path>
  </svg>
);
