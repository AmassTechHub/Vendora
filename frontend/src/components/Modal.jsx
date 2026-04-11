export default function Modal({ title, onClose, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-black/50 p-4 sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className={`my-auto flex w-full min-h-0 flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800 ${sizes[size]} max-h-[min(90dvh,920px)]`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4 dark:border-gray-700">
          <h3 id="modal-title" className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          <button type="button" onClick={onClose} className="text-xl leading-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">{children}</div>
      </div>
    </div>
  );
}
