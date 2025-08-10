document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.rent').forEach(btn => {
        btn.addEventListener('click', () => alert('Item rented successfully!'));
    });
    document.querySelectorAll('.buy').forEach(btn => {
        btn.addEventListener('click', () => alert('Item purchased successfully!'));
    });
});
