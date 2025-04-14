import { useEffect } from 'react';

// Add global styles for drag highlight
export const useCalendarStyles = () => {
  useEffect(() => {
    const styleId = 'calendar-drag-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        .calendar-day-highlight {
          background-color: rgba(59, 130, 246, 0.15) !important;
          box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.4) !important;
          transition: all 0.1s ease-in-out;
        }

        .task-dragging {
          opacity: 0.8;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          z-index: 100 !important;
        }

        .task-resize-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 6px;
          cursor: ew-resize;
          transition: all 0.15s ease;
          opacity: 0;
        }

        .task-resize-handle:hover,
        .task-resize-handle:active {
          background-color: rgba(59, 130, 246, 0.5);
          opacity: 1;
        }

        .task-resize-handle-start {
          left: 0;
          border-top-left-radius: 4px;
          border-bottom-left-radius: 4px;
        }

        .task-resize-handle-end {
          right: 0;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }

        .task-card:hover .task-resize-handle {
          opacity: 0.5;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);
};

export default useCalendarStyles;
