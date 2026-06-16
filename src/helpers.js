import {Assets, Texture} from "pixi.js";
import {saveTextureFile} from "./controllers/db-controller/db-controller.js";
import {settings} from "./settings.js";

export const randomFloat = (min, max) => Math.random() * (max - min) + min;

export const PI2 = Math.PI * 2;


export const processFileToLoad = file => {
    if (!file) {
        Assets.load('/default.png').then(texture => {
            const event = new CustomEvent('textureLoaded', {detail: {texture, textureName: 'default'}});
            window.dispatchEvent(event);
        });
        return;
    }
        const url = URL.createObjectURL(file);

        const image = new Image();

        image.onload = () => {
            const texture = Texture.from(image);
            URL.revokeObjectURL(url);
            const event = new CustomEvent('textureLoaded', {detail: {texture, textureName: file.name}});
            window.dispatchEvent(event);
        };

        image.onerror = async (error) => {
            URL.revokeObjectURL(url);
            console.error('Texture error:', file.name);
            const texture = await Assets.load('/default.png');

            const event = new CustomEvent('textureLoaded', {detail: texture, textureName: 'default'});
            window.dispatchEvent(event);
        };

        image.src = url;
}

export const createFileInput = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change',  async (event) => {
        const file = event.target.files[0];
        if (file) void saveTextureFile(file);
        processFileToLoad(file);
    });

    return fileInput;

}