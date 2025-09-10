import { Monitor, Smartphone } from 'lucide-react';

interface InterfaceSelectorProps {
  isCompact: boolean;
  onToggle: (compact: boolean) => void;
}

export default function InterfaceSelector({ isCompact, onToggle }: InterfaceSelectorProps) {
  return (
    <div className="fixed top-4 left-4 z-50 lg:absolute lg:top-6 lg:left-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1.5">
        <div className="flex gap-2">
          <button
            onClick={() => onToggle(false)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all
              ${!isCompact 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            <Monitor size={14} />
            Completa
          </button>
          <button
            onClick={() => onToggle(true)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all
              ${isCompact 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            <Smartphone size={14} />
            Blog
          </button>
        </div>
      </div>
    </div>
  );
}