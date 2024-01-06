document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('.data-url').forEach((element) => {
        element.addEventListener('click', (event) => {
            window.location.href = element.dataset.url;
        });
    });
});