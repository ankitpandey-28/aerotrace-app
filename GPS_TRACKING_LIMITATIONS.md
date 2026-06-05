# AeroTrace GPS Tracking: Browser Limitations & Reliability

AeroTrace utilizes browser-based Geolocation APIs to map coordinates during active journeys. Understanding the performance profiles and constraints of web browsers is critical to optimizing tracking reliability.

---

## 1. Core Browser Limitations

Modern web browsers (including Chrome, Safari, Firefox, iOS Safari, and Android Chrome) implement aggressive battery-saving and resource-preservation policies. When a web application is not in the active foreground tab, the following restrictions apply:

### A. Timer & Script Throttling
- When a tab is backgrounded (e.g., the user switches tabs or locks the screen), browsers throttle JavaScript timers (`setInterval`, `setTimeout`).
- In iOS Safari, execution can be completely suspended after a few seconds of inactivity, which pauses geolocation tracking callbacks.

### B. Geolocation Watch Throttling
- Mobile operating systems (especially iOS) restrict access to GPS hardware by background tabs to protect user privacy and save battery.
- Even if a watcher was started in the foreground, iOS Safari often suspends the watch event stream when the browser goes into the background or the device is locked.

### C. No Native Background Execution
- Unlike native iOS or Android applications, a web application cannot run a persistent background service (e.g., a native CoreLocation background worker).
- **Service Workers** can run in the background but do **not** have access to the Geolocation API without user interaction or active foreground tabs.

---

## 2. Improvements Implemented in AeroTrace

To maximize tracking reliability within browser constraints, the following enhancements have been implemented:

### A. In-App Background tracking
- Previously, GPS tracking was tied strictly to the `LiveJourneyPage` screen being active. Navigating within the React app (e.g., to look at the safety center, dashboard, or memory logs) destroyed and re-created the GPS watcher.
- **Fix**: The routing page check (`page === 'live-journey'`) was removed. Geolocation tracking now runs continuously in the React background as long as `isTracking` is active, regardless of the current in-app route. Navigating in-app no longer resets the watcher.

### B. Screen Wake Lock API Integration
- The **Screen Wake Lock API** has been integrated as an optional enhancement.
- When a journey starts, the application requests a Screen Wake Lock:
  ```typescript
  wakeLockSentinel = await navigator.wakeLock.request('screen');
  ```
- This requests that the operating system keep the device screen on (preventing auto-sleep and dimming).
- Keeping the screen active prevents the browser tab from entering a suspended state, maintaining continuous high-accuracy GPS logs.
- If the browser does not support Wake Lock (e.g., older browsers), it fails silently and tracking continues normally without any errors.

---

## 3. Best Practices for Users
To ensure the highest accuracy and prevent missing GPS points:
1. **Keep the App Open**: Keep the AeroTrace browser tab active and in the foreground.
2. **Disable Power Saving Mode**: Operating system power savers aggressively kill background tab execution.
3. **Screen Sleep Settings**: If Screen Wake Lock is unsupported by your browser, adjust your device settings to keep the screen active.
