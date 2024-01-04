document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('.ticket').forEach((element) => {
        element.addEventListener('click', (event) => {
            window.location.href = element.dataset.url;
        });
    });
});