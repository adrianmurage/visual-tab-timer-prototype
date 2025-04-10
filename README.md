# TypeScript Pomodoro Timer Application

A prototype pomodoro timer application with visual feedback through both UI and browser favicon.

## Features
  
- **Visual Feedback**
  - Dynamic favicon that updates with timer progress
  - Browser tab title updates with current timer status
  - Color-coded UI based on current timer type
  
- **Background Operation**
  - Timer continues running when tab is not in focus
  - Accurate timing using absolute timestamps
  - Visual updates when returning to the tab

## Getting Started

1. Clone the repository
    ```bash 
    git clone git@github.com:adrianmurage/visual-tab-timer-prototype.git
    ```
2. Install dependencies:
   ```bash
   yarn
   ```
3. Start the development server:
   ```bash
   yarn dev
   ```

## How It Works

### Core Timer Logic

The timer uses a combination of `requestAnimationFrame` and timestamps to ensure accurate timing, even when the browser tab is not in focus.

### Visual Effects

1. **Favicon Updates**: Creates a donut-shaped icon that shows timer progress
2. **Document Title**: Updates the browser tab title with timer status