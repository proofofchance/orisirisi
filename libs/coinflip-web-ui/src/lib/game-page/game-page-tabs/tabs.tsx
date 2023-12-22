import { PropsWithClassName, cn } from '@orisirisi/orisirisi-web-ui';
import { ReactNode, useState } from 'react';

interface TabsProps<TabId> extends PropsWithClassName {
  tabs: { title: string; id: TabId; body: ReactNode }[];
  defaultTabId?: TabId;
  bodyClassName?: string;
}
export function Tabs<TabId>({
  tabs,
  className,
  defaultTabId,
  bodyClassName,
}: TabsProps<TabId>) {
  const bodies = tabs.map(({ body }) => body);
  const defaultTabIndex = tabs.findIndex((tab) => tab.id === defaultTabId) || 0;
  const [activeBodyIndex, setActiveBodyIndex] = useState(defaultTabIndex);

  const titles = tabs.map(({ title }) => title);
  const isActiveTitle = (i: number) => i === activeBodyIndex;

  return (
    <div
      className={cn(
        'rounded-xl bg-[rgba(0,0,0,0.25)] w-100 h-[500px]',
        className
      )}
    >
      <div className="flex">
        {titles.map((title, i) => {
          return (
            <div
              className={cn(
                'flex-1 text-center cursor-pointer transition duration-75 ease-in-out py-4',
                isActiveTitle(i) && 'border-b-2 border-white',
                'hover:bg-[rgba(0,0,0,0.28)]'
              )}
              onClick={() => setActiveBodyIndex(i)}
              key={i}
            >
              {title}
            </div>
          );
        })}
      </div>
      <div
        id="tab-body"
        className={cn('px-4 flex justify-center h-[320px]', bodyClassName)}
      >
        {bodies[activeBodyIndex]}
      </div>
    </div>
  );
}
