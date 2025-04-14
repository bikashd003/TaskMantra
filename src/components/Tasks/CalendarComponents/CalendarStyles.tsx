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
          transition: all 0.2s ease-in-out;
          animation: pulse-border 1.5s infinite ease-in-out;
        }

        @keyframes pulse-border {
          0% { box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.4); }
          50% { box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.7); }
          100% { box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.4); }
        }

        .task-dragging {
          opacity: 0.8;
          transform: scale(1.05) !important;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2) !important;
          z-index: 100 !important;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          backdrop-filter: blur(4px);
        }

        .task-resize-handle {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 8px;
          cursor: ew-resize;
          transition: all 0.2s ease;
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .task-resize-handle:hover,
        .task-resize-handle:active {
          background-color: rgba(59, 130, 246, 0.7);
          opacity: 1;
          width: 10px;
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

        .task-card {
          transition: all 0.2s ease-out;
        }

        .task-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .task-card:hover .task-resize-handle {
          opacity: 0.7;
        }

        /* Add a subtle glow effect to the task being dragged */
        .task-dragging::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border-radius: 6px;
          background: transparent;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          z-index: -1;
          animation: glow 1.5s infinite alternate;
        }

        @keyframes glow {
          from { box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); }
          to { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);
};

export default useCalendarStyles;
