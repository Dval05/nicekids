import { renderSidebar } from './components/Sidebar.js';
import { renderHeader } from './components/Header.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    const headerContainer = document.getElementById('header-container');

    if (sidebarContainer) {
        renderSidebar(sidebarContainer);
    }
    
    if (headerContainer) {
        renderHeader(headerContainer);
    }
});
