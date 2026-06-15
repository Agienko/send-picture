import {Assets, ColorMatrixFilter, RenderTexture, Sprite, Texture} from "pixi.js";
import {app} from "./main.js";

export class ReferenceSprite {
    constructor() {
        this.referenceSprite = new Sprite(Texture.EMPTY);
        this.referenceSprite.anchor.set(0.5);
        // app.stage.addChild(this.referenceSprite);

        this.extracted = null;
        this.brightnessCache = null;

        window.addEventListener('textureLoaded', (e) => {
            this.referenceSprite.texture = e.detail;
            this.#onResize();
        });

        window.addEventListener('resize', this.#onResize.bind(this));
    }

    #extractPixels() {
        const contrastFilter = new ColorMatrixFilter();
        contrastFilter.greyscale(0.5, true);

        this.referenceSprite.filters = [contrastFilter];

        const renderTexture = RenderTexture.create({
            width: app.screen.width,
            height: app.screen.height,
            resolution: 1
        });

        app.renderer.render({
            container: this.referenceSprite,
            target: renderTexture
        });

        this.referenceSprite.filters = null;
        contrastFilter.destroy(true);

        this.extracted = app.renderer.extract.pixels(renderTexture);

        renderTexture.destroy(true);
        this.#cacheExtracted();

    }
    #cacheExtracted(){
        const {pixels, width, height} = this.extracted;
        this.brightnessCache = new Float32Array(width * height);
        for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
            this.brightnessCache[j] = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3 / 255;
        }
    }

    #onResize() {
        app.renderer.resize(innerWidth, innerHeight);
        const screenW = app.screen.width;
        const screenH = app.screen.height;

        const textureW = this.referenceSprite.texture.width;
        const textureH = this.referenceSprite.texture.height;

        const scale = Math.min(screenW / textureW, screenH / textureH);

        this.referenceSprite.scale.set(scale);
        this.referenceSprite.x = screenW / 2;
        this.referenceSprite.y = screenH / 2;
        this.#extractPixels();
    }

    getBrightnessAt(x, y) {
        if (!this.extracted) return 0;
        x = x | 0;
        y = y | 0;

        if (x < 0 || x >= this.extracted.width || y < 0 || y >= this.extracted.height) return 0;

        return this.brightnessCache[y * this.extracted.width + x] ?? 0;
    }
}