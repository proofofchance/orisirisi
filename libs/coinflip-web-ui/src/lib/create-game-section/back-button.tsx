import { ButtonProps } from '@orisirisi/orisirisi-web-ui';

export function BackButton({ ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="border-white border-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
    >
      <BackIcon />
    </button>
  );
}

function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={40} height={37} fill="none">
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M23.724 11.214a.773.773 0 0 0-1.064 0l-6.228 6.01a1.418 1.418 0 0 0 0 2.056l6.273 6.054a.773.773 0 0 0 1.057.008.71.71 0 0 0 .008-1.036l-5.74-5.54a.71.71 0 0 1 0-1.028l5.694-5.496a.708.708 0 0 0 0-1.028Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
