import {settings} from "../../settings.js";

const STORAGE_KEY = '_send_particle_settings_';

export const loadSettings = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch (e) {
        return {};
    }
};

const save = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving settings:', e);
    }
};

document.addEventListener('visibilitychange', (e) => {
    if (document.visibilityState === 'visible') return;
    save()
})

document.addEventListener('beforeunload', save)