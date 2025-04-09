import { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file

const App = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const totalTime = 25 * 60; // 25 minutes in seconds
  
  // Calculate progress (0 to 1)
  const progress = 1 - (timeRemaining / totalTime);
  
  // Update document title with timer countdown
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

  // Function to create a data URL for a donut timer of a given color and progress
  const createDonutTimerDataURL = (isRunning, progress, size = 32) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, size, size);
    
    // Calculate dimensions
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.floor(size * 0.34); // Slightly smaller than the canvas
    const lineWidth = Math.floor(size * 0.19); // Thicker line for better visibility
    
    // Set line width for the donut shape
    ctx.lineWidth = lineWidth;
    
    // Draw background circle (translucent light color)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    // Use a light red color for background when active, light blue when paused
    ctx.strokeStyle = isRunning ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 0, 255, 0.3)';
    ctx.stroke();
    
    // Draw progress arc
    if (progress > 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI/2, (-Math.PI/2) + (progress * 2 * Math.PI));
      // Use dark red when active, dark blue when paused
      ctx.strokeStyle = isRunning ? '#b00000' : '#0000b0';
      ctx.stroke();
    }
    
    return canvas.toDataURL('image/png');
  };
  
  // Update favicon based on timer state
  useEffect(() => {
    // Force favicon update with better browser compatibility
    const updateFaviconInBrowser = () => {
      try {
        // Generate favicons of multiple sizes
        const favicon32 = createDonutTimerDataURL(isActive, progress, 32);
        const favicon16 = createDonutTimerDataURL(isActive, progress, 16);
        
        // Remove all existing favicons
        const existingLinks = document.querySelectorAll("link[rel*='icon']");
        existingLinks.forEach(link => {
          document.head.removeChild(link);
        });
        
        // Add the main icon
        const mainIcon = document.createElement('link');
        mainIcon.rel = 'icon';
        mainIcon.href = favicon32;
        mainIcon.sizes = '32x32';
        document.head.appendChild(mainIcon);
        
        // Add a smaller icon for browsers that prefer it
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
    
    // Handle default state (completely reset timer)
    if (!isActive && timeRemaining === 25 * 60) {
      // For default state, still use our custom donut but with 0 progress
      updateFaviconInBrowser();
      return;
    }
    
    // Execute update
    updateFaviconInBrowser();
    
    // Also try again after delays for better browser compatibility
    const timeoutId1 = setTimeout(updateFaviconInBrowser, 100);
    const timeoutId2 = setTimeout(updateFaviconInBrowser, 500);
    
    // Clean up
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [isActive, progress, timeRemaining]);
  
  // Timer functionality
  useEffect(() => {
    let interval = null;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);
  
  const startTimer = () => {
    setIsActive(true);
  };
  
  const pauseTimer = () => {
    setIsActive(false);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(25 * 60);
  };
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        
        <div className="favicon-preview">
          <div 
            className="favicon-icon"
            style={{
              width: '48px',
              height: '48px',
              margin: '20px auto 0',
              position: 'relative',
              background: 'transparent',
              border: '9px solid',
              borderRadius: '50%',
              borderColor: isActive ? 
                'rgba(176, 0, 0, 0.8)' : 
                'rgba(0, 0, 176, 0.8)',
              boxSizing: 'border-box'
            }}
          >
            <div 
              className="progress-overlay"
              style={{
                position: 'absolute',
                top: '-9px',
                left: '-9px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                clipPath: `polygon(
                  50% 50%, 
                  50% 0%, 
                  ${progress > 0.125 ? '100% 0%' : `${50 + 50 * Math.tan(progress * 2 * Math.PI)}% 0%`},
                  ${progress > 0.375 ? '100% 100%' : progress > 0.125 ? `100% ${50 - 50 * Math.tan((progress - 0.25) * 2 * Math.PI)}%` : '50% 50%'},
                  ${progress > 0.625 ? '0% 100%' : progress > 0.375 ? `${50 - 50 * Math.tan((progress - 0.5) * 2 * Math.PI)}% 100%` : '50% 50%'},
                  ${progress > 0.875 ? '0% 0%' : progress > 0.625 ? `0% ${50 + 50 * Math.tan((progress - 0.75) * 2 * Math.PI)}%` : '50% 50%'},
                  ${progress > 0.875 ? `${50 - 50 * Math.tan((progress - 1) * 2 * Math.PI)}% 0%` : '50% 50%'}
                )`,
                background: 'transparent',
                border: '9px solid',
                borderColor: isActive ? 
                  'rgba(255, 0, 0, 0.8)' : 
                  'rgba(0, 0, 255, 0.8)',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <p style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
            Current favicon: {isActive ? 'Running (red)' : 'Paused (blue)'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;