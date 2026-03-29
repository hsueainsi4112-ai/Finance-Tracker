// Mobile sidebar toggle
function toggleSidebar() {
    var s = document.querySelector('.sidebar');
    var o = document.getElementById('sidebarOverlay');
    var b = document.getElementById('hamburgerBtn');
    s.classList.toggle('open');
    o.classList.toggle('active');
    b.classList.toggle('open');
}
function closeSidebar() {
    document.querySelector('.sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
    document.getElementById('hamburgerBtn').classList.remove('open');
}
// Close sidebar when a nav link is clicked on mobile
document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('.side-menu a');
    links.forEach(function (link) {
        link.addEventListener('click', closeSidebar);
    });
});
