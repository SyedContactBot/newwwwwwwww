import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { keys: ['Enter'], description: 'Send message' },
  { keys: ['Shift', 'Enter'], description: 'New line' },
  { keys: ['Ctrl', 'L'], description: 'Focus input' },
  { keys: ['Ctrl', '/'], description: 'Show shortcuts' },
  { keys: ['Ctrl', 'N'], description: 'New chat' },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Keyboard size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i} className="flex items-center">
                    {i > 0 && <span className="text-xs text-gray-400 mx-1">+</span>}
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                      {key}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-400">
            Use Cmd instead of Ctrl on Mac
          </p>
        </div>
      </div>
    </div>
  );
}
