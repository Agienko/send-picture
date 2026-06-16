const loaderController = document.getElementById('loader');

export const showLoader = (text = 'Loading...') => {
    loaderController.querySelector('.loader-text').textContent = text;
    loaderController.classList.remove('hidden');
}

export const hideLoader = () => loaderController.classList.add('hidden');