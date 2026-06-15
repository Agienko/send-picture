import {ParticleContainer} from "pixi.js";
import {settings} from "./settings.js";
import {SendParticle} from "./send-particle.js";
import {hideLoader, showLoader} from "./loader.js";
import {app} from "./main.js";

export class ParticleCreator extends ParticleContainer {
    constructor(){
        super({
            dynamicProperties: {
                position: true,  // Update positions each frame
                rotation: false,  // Update rotations each frame
                vertex: false,   // Static vertices
                uvs: false,     // Static texture coordinates
                color: true     // Static colors
            }
        })
        app.stage.addChild(this);

        this.eventMode = 'none';
        this.interactiveChildren = false;

        this.particles = Array.from({length: settings.particleCount}, () => new SendParticle(this));


        window.addEventListener('particleCountChanged', (e) => {
            showLoader()
            const newCount = e.detail;
            while (this.particles.length > newCount) this.particles.pop().destroy();
            while (this.particles.length < newCount) this.particles.push(new SendParticle(this));
            hideLoader()
        })

        window.addEventListener('colorChanged', (e) => {
            this.particles.forEach(p => p.tint = e.detail.color);
        })
    }

    getParticle(i){
        return this.particles[i];
    }
}