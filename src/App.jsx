/**
 * Pomodoro Timer Application
 * 
 * This application implements a Pomodoro timer with visual feedback in both the UI
 * and browser tab (favicon). The timer runs for 25 minutes and changes appearance
 * based on whether it's running (red) or paused (blue).
 * 
 * Features:
 * - Countdown timer with start, pause, and reset functionality
 * - Dynamic browser tab title showing current time and state
 * - Interactive favicon that displays timer progress in the browser tab
 * - Visual preview of the favicon state in the UI
 */

import { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  // State management
  const [isActive, setIsActive] = useState(false); // Controls if timer is running
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const totalTime = 25 * 60; // 25 minutes in seconds (constant)
  
  // Refs for tracking time and animation
  const timerEndRef = useRef(null);
  const rafIdRef = useRef(null);
  const intervalIdRef = useRef(null);
  
  // Calculate progress (0 to 1) - decreases as time passes
  const progress = 1 - (timeRemaining / totalTime);
  
  /**
   * Effect: Update document title based on timer state
   * 
   * This changes the browser tab title to show the current time and whether
   * the timer is running or paused, providing at-a-glance status even when
   * the tab is not in focus.
   */
  useEffect(() => {
    // Default title when no active timer
    if (!isActive && timeRemaining === 25 * 60) {
      document.title = 'Pomodoro Timer';
      return;
    }
    
    // Show paused state in title
    if (!isActive) {
      document.title = `${formatTime(timeRemaining)} - Paused`;
      return;
    }
    
    // Update title with current time when timer is active
    document.title = `${formatTime(timeRemaining)} - Pomodoro`;
  }, [isActive, timeRemaining]);

  /**
   * Creates a data URL for the donut-shaped timer favicon
   * 
   * This function generates the visual representation of the timer as a donut shape:
   * - Uses canvas to draw a donut with a progress arc
   * - Changes color based on timer state (red for active, blue for paused)
   * - Adjusts to different sizes for browser compatibility
   * 
   * @param {boolean} isRunning - Whether the timer is currently running
   * @param {number} progress - Current progress value (0 to 1)
   * @param {number} size - Size of the favicon in pixels (default: 32)
   * @returns {string} Data URL of the generated favicon image
   */
  const createDonutTimerDataURL = (isRunning, progress, size = 32) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, size, size);
    
    // Calculate dimensions using relative proportions for different sizes
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.floor(size * 0.42); // Smaller than canvas for better visibility
    const lineWidth = Math.floor(size * 0.19); // Thick line for better visibility at small sizes
    
    // Set line width for the donut shape
    ctx.lineWidth = lineWidth;
    
    // Draw background circle (translucent light color)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    // Use a light red color for background when active, light blue when paused
    ctx.strokeStyle = isRunning ? 'rgba(255, 0, 0, 0.3)' : 'rgba(236, 165, 98, 0.5)';
    ctx.stroke();
    
    // Draw progress arc - only if there is progress to show
    if (progress > 0) {
      ctx.beginPath();
      // Start from top (-Math.PI/2) and draw clockwise
      ctx.arc(centerX, centerY, radius, -Math.PI/2, (-Math.PI/2) + (progress * 2 * Math.PI));
      // Use dark red when active, dark blue when paused for better contrast
      ctx.strokeStyle = isRunning ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 123, 0)';
      ctx.stroke();
    }
    
    return canvas.toDataURL('image/png');
  };
  
  /**
   * Effect: Update favicon based on timer state
   * 
   * This effect ensures the browser tab favicon reflects the current timer state:
   * - Creates different sized favicons for browser compatibility
   * - Handles different browser quirks with multiple update attempts
   * - Changes color based on timer state (red=running, blue=paused)
   * - Shows progress as an arc in the donut
   */
  useEffect(() => {
    // Function to update favicon with robust browser compatibility
    const updateFaviconInBrowser = () => {
      try {
        // Generate favicons of multiple sizes for better browser compatibility
        // Different browsers prefer different sizes (16px vs 32px)
        const favicon32 = createDonutTimerDataURL(isActive, progress, 32);
        const favicon16 = createDonutTimerDataURL(isActive, progress, 16);
        
        // Remove all existing favicons to prevent conflicts
        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        existingLinks.forEach(link => {
          document.head.removeChild(link);
        });
        
        // Add the main icon (32x32)
        const mainIcon = document.createElement('link');
        mainIcon.rel = 'icon';
        mainIcon.href = favicon32;
        mainIcon.sizes = '32x32';
        document.head.appendChild(mainIcon);
        
        // Add a smaller icon (16x16) for browsers that prefer it
        const smallIcon = document.createElement('link');
        smallIcon.rel = 'icon';
        smallIcon.href = favicon16;
        smallIcon.sizes = '16x16';
        document.head.appendChild(smallIcon);
        
        // Also add a shortcut icon for IE compatibility
        const shortcutIcon = document.createElement('link');
        shortcutIcon.rel = 'shortcut icon';
        shortcutIcon.href = favicon32;
        document.head.appendChild(shortcutIcon);
        
        console.log(`Favicon updated - Running: ${isActive}, Progress: ${Math.round(progress * 100)}%`);
      } catch (err) {
        console.error('Error updating favicon:', err);
      }
    };
    
    // Execute update immediately
    updateFaviconInBrowser();
    
    // Also try again after delays for better browser compatibility
    // Some browsers need multiple attempts or delayed updates to show favicon changes
    const timeoutId1 = setTimeout(updateFaviconInBrowser, 100);
    const timeoutId2 = setTimeout(updateFaviconInBrowser, 500);
    
    // Clean up timeouts when component unmounts or dependencies change
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [isActive, progress, timeRemaining]);
  
  /**
   * Effect: Handle timer countdown logic
   * 
   * This effect manages the actual timer countdown using a combination of
   * requestAnimationFrame (for smooth UI) and setInterval (for background reliability):
   * - Uses absolute timestamps to calculate remaining time accurately
   * - Continues running even when the tab is not in focus
   * - Automatically stops the timer when it reaches zero
   */
  useEffect(() => {
    // Cleanup previous timers
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    // Only start timer if active and time remaining
    if (isActive && timeRemaining > 0) {
      // Initialize end time if not set
      if (!timerEndRef.current) {
        timerEndRef.current = Date.now() + (timeRemaining * 1000);
      }
      
      // Update function for both RAF and interval
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, timerEndRef.current - now);
        const newRemainingSeconds = Math.ceil(remaining / 1000);
        
        // Only update if the second has changed
        if (newRemainingSeconds !== timeRemaining) {
          setTimeRemaining(newRemainingSeconds);
        }
        
        // Check if timer completed
        if (newRemainingSeconds <= 0) {
          setIsActive(false);
          timerEndRef.current = null;
          
          // Clear timers
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
          
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
        }
      };
      
      // Function for requestAnimationFrame loop
      const rafLoop = () => {
        updateTimer();
        if (isActive && timeRemaining > 0) {
          rafIdRef.current = requestAnimationFrame(rafLoop);
        }
      };
      
      // Start RAF loop for smooth UI updates
      rafIdRef.current = requestAnimationFrame(rafLoop);
      
      // Also use interval as backup for background operation
      intervalIdRef.current = setInterval(updateTimer, 1000);
      
      // Set up visibility change handler
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          updateTimer(); // Immediately update when becoming visible
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up
      return () => {
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
        
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
    
    return undefined;
  }, [isActive, timeRemaining]);
  
  // Timer control functions
  const startTimer = () => {
    // Calculate the end time based on current time plus remaining time
    timerEndRef.current = Date.now() + (timeRemaining * 1000);
    setIsActive(true);
  };
  
  const pauseTimer = () => {
    // When pausing, store remaining time but clear end time
    setIsActive(false);
  };
  
  const resetTimer = () => {
    // Reset all state and refs
    setIsActive(false);
    setTimeRemaining(25 * 60);
    timerEndRef.current = null;
  };
  
  /**
   * Formats seconds into mm:ss display format
   * 
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string (mm:ss)
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  /**
   * Calculate clipPath for the circular progress indicator
   * 
   * This creates a polygon-based clipPath that represents a pie chart
   * showing the current progress. The complex calculation ensures the
   * arc follows the circular shape properly at all progress levels.
   */
  const getProgressClipPath = () => {
    return `polygon(
      50% 50%, 
      50% 0%, 
      ${progress > 0.125 ? '100% 0%' : `${50 + 50 * Math.tan(progress * 2 * Math.PI)}% 0%`},
      ${progress > 0.375 ? '100% 100%' : progress > 0.125 ? `100% ${50 - 50 * Math.tan((progress - 0.25) * 2 * Math.PI)}%` : '50% 50%'},
      ${progress > 0.625 ? '0% 100%' : progress > 0.375 ? `${50 - 50 * Math.tan((progress - 0.5) * 2 * Math.PI)}% 100%` : '50% 50%'},
      ${progress > 0.875 ? '0% 0%' : progress > 0.625 ? `0% ${50 + 50 * Math.tan((progress - 0.75) * 2 * Math.PI)}%` : '50% 50%'},
      ${progress > 0.875 ? `${50 - 50 * Math.tan((progress - 1) * 2 * Math.PI)}% 0%` : '50% 50%'}
    )`;
  };
  
  return (
    <div className="app-container">
      <div className="timer-card">
        <h1 className="app-title">Pomodoro Timer</h1>
        
        <div className="timer-display">
          {formatTime(timeRemaining)}
        </div>
        
        <div className="controls">
          {!isActive ? (
            <button 
              onClick={startTimer}
              className="btn btn-start"
            >
              Start
            </button>
          ) : (
            <button 
              onClick={pauseTimer}
              className="btn btn-pause"
            >
              Pause
            </button>
          )}
          
          <button 
            onClick={resetTimer}
            className="btn btn-reset"
          >
            Reset
          </button>
        </div>
        
        {/* Favicon preview - shows what appears in the browser tab */}
        <div className="favicon-preview">
          <div className={`favicon-icon ${isActive ? 'active' : 'paused'}`}>
            <div 
              className={`progress-overlay ${isActive ? 'active' : 'paused'}`}
              style={{
                clipPath: getProgressClipPath()
              }}
            />
          </div>
          <p className="favicon-label">
            Current favicon: {isActive ? 'Running (red)' : 'Paused (blue)'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;