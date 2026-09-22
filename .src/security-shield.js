/**
 * SORA STEALTH ANTI-INSPECTION ENGINE
 * Pure Silent Operation: No Disruptive Screens, Zero False Positives.
 * Neutralizes DevTools, console logs, and inspection shortcuts silently in the background.
 */
(function _soraStealthShield() {
  'use strict';

  // 1. SILENT CONSOLE SCRUBBING
  // Neutralizes console logging methods silently so internal data/traces are invisible
  try {
    var noop = function() {};
    var methods = [
      'log', 'debug', 'info', 'warn', 'error', 'table', 'trace',
      'dir', 'dirxml', 'group', 'groupCollapsed', 'groupEnd',
      'time', 'timeEnd', 'profile', 'profileEnd', 'count', 'assert'
    ];
    if (window.console) {
      for (var i = 0; i < methods.length; i++) {
        try {
          window.console[methods[i]] = noop;
        } catch(e) {}
      }
      try {
        Object.freeze(window.console);
      } catch(e) {}
    }
  } catch(e) {}

  // 2. SILENT KEYBOARD SHORTCUT NEUTRALIZER
  // Silently cancels DevTools, View Source, and Save shortcuts without any visual alerts
  window.addEventListener('keydown', function(e) {
    var k = e.key || e.keyCode;
    var isCtrl = e.ctrlKey || e.metaKey;
    var isShift = e.shiftKey;
    var isAlt = e.altKey;

    // F12
    if (k === 'F12' || k === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I (73), Ctrl+Shift+J (74), Ctrl+Shift+C (67), Ctrl+Shift+K (75)
    if (isCtrl && isShift && (k === 'I' || k === 'i' || k === 'J' || k === 'j' || k === 'C' || k === 'c' || k === 'K' || k === 'k' || k === 73 || k === 74 || k === 67 || k === 75)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Mac Cmd+Option+I / Cmd+Option+J / Cmd+Option+C
    if (e.metaKey && isAlt && (k === 'I' || k === 'i' || k === 'J' || k === 'j' || k === 'C' || k === 'c')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U (View Source - 85), Ctrl+S (Save - 83)
    if (isCtrl && (k === 'U' || k === 'u' || k === 'S' || k === 's' || k === 85 || k === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // 3. SILENT CONTEXT MENU BLOCKER (Capture Phase)
  // Suppresses right-click menu cleanly without intrusive popups
  window.addEventListener('contextmenu', function(e) {
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag !== 'input' && tag !== 'textarea') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // 4. PREVENT IMAGE DRAGGING
  window.addEventListener('dragstart', function(e) {
    if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
      e.preventDefault();
    }
  }, false);
})();
