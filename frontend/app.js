// frontend/app.js
// Script simple para verificar token al cargar páginas protegidas
(function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Si no hay token y no estamos en login o register, redirigir
    const path = window.location.pathname;
    if (!token && !path.includes('login.html') && !path.includes('register.html')) {
        window.location.href = '/login.html';
    }
})();
