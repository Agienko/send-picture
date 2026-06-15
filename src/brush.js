import {Rectangle} from "pixi.js";
import {PI2, randomFloat} from "./helpers.js";
import {closeGui, settings} from "./settings.js";
import {app} from "./main.js";

export class Brush {
    constructor(particles) {
        this.particles = particles;

        this.brushRadius = 150;

        this.clear = null;
        this.x = 0;
        this.y = 0;
        this.particleI = 0;


        app.stage.on('pointerdown', (e) => this.onPointerDown(e));
        app.stage.on('pointermove', (e) => this.onPointerMove(e));

        app.stage.on('pointerup', (e) => this.onPointerUp(e));
        app.stage.on('pointerupoutside', (e) => this.onPointerUp(e));
        app.stage.on('pointercancel', (e) => this.onPointerUp(e));

        window.addEventListener('resize', () => this.onResize());
        this.onResize();
    }
    onResize(){
        this.onPointerUp();
        const screenW = app.screen.width;
        const screenH = app.screen.height;
        app.stage.hitArea = new Rectangle(0, 0, screenW, screenH);

        const smallerSize = Math.min(screenW, screenH);
        this.brushRadius = smallerSize * 0.2
    }

    onPointerDown(e) {
        closeGui()
        this.x = e.global.x;
        this.y = e.global.y;

        const update = () => {

            const rad = this.brushRadius*settings.brashRadiusScale;
            for (let i = 0; i < settings.brashIterations; i++) {

                this.particleI = (this.particleI + 1) % this.particles.length;
                const p = this.particles[this.particleI];
                p.alpha = 0.8;
                p.at = performance.now();
                const rnd = Math.random() * PI2;
                const rndRadius = randomFloat(4, rad);
                p.x = this.x + Math.cos(rnd) * rndRadius;
                p.y = this.y + Math.sin(rnd) * rndRadius;
            }
            cancelAnimationFrame(this.clear)
            this.clear = requestAnimationFrame(update);
        }

        update();
    }

    onPointerMove(e) {
        if(settings.lockBrash) return;
        this.x = e.global.x;
        this.y = e.global.y;
    }

    onPointerUp(e) {
        if(settings.lockBrash) return;
        cancelAnimationFrame(this.clear)
        this.clear = null;
    }
}