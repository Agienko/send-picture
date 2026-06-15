const loader = document.getElementById('loader');

export function showLoader(text = 'Loading...') {
    loader.querySelector('.loader-text').textContent = text;
    loader.classList.remove('hidden');
}

export function hideLoader() {
    loader.classList.add('hidden');
}