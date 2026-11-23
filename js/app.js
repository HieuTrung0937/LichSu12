// =====================================================
// HISTORY 12 - APPLICATION CORE
// Module: APP
// [APP-001] Application initialization and shared utilities
// Purpose: Load data, coordinate modules, manage navigation
// =====================================================

import { initializeTimeline } from './timeline.js';
import { initializeLearning } from './learning.js';
import { initializeQuiz } from './quiz.js';

let navigationInitialized = false;

/**
 * [APP-002] Shared utility to load JSON files safely
 * Input: url (string)
 * Output: Promise resolving to parsed JSON data
 */
export async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${url}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to load ${url}:`, error);
    throw error;
  }
}

/**
 * [APP-003] Initialize application with independent error handling
 */
async function initializeApp() {
  try {
    console.log('Initializing History 12 application...');
    
    // Setup navigation
    if (!navigationInitialized) {
      setupNavigation();
      navigationInitialized = true;
    }
    
    // Initialize modules INDEPENDENTLY so one failure doesn't break others
    const initPromises = [
      initializeTimeline().catch(err => console.error('Timeline init failed:', err)),
      initializeLearning().catch(err => console.error('Learning init failed:', err)),
      initializeQuiz().catch(err => console.error('Quiz init failed:', err))
    ];
    
    await Promise.all(initPromises);
    console.log('Application initialization completed');
    
  } catch (error) {
    console.error('Critical app initialization error:', error);
    displayInitError();
  }
}

/**
 * [APP-004] Setup navigation using EVENT DELEGATION
 */
function setupNavigation() {
  document.addEventListener('click', (e) => {
    const navLink = e.target.closest('.nav-link');
    
    if (navLink) {
      e.preventDefault();
      const targetSection = navLink.dataset.section;
      
      if (!targetSection) return;
      
      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      navLink.classList.add('active');
      
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        if (section.id === targetSection) {
          section.classList.add('active');
        }
      });
    }
  });
}

/**
 * [APP-005] Display initialization error
 */
function displayInitError() {
  const main = document.querySelector('.app-main');
  if (main) {
    main.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #C62828;">
        <h2>Lỗi khởi tạo ứng dụng</h2>
        <p>Vui lòng tải lại trang hoặc kiểm tra Console (F12) để xem chi tiết.</p>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
