document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const navDrawer = document.querySelector('.nav-drawer');
  
    menuButton.addEventListener('click', function() {
      navDrawer.classList.toggle('open');
    });
  });