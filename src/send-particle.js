import {Particle, Texture} from "pixi.js";
import {PI2, randomFloat} from "./helpers.js";
import {settings} from "./settings.js";
import {app} from "./main.js";


export class SendParticle extends Particle{
    constructor(stage) {
        super({
            texture: Texture.WHITE,
            tint: settings.color,
            alpha: 0,
        });

        this.stage = stage;

        this.speed = randomFloat(0.5, 1.5);
        this.angle = Math.random() * PI2;

        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;

        this.directionTimer = randomFloat(40, 100);
        this.targetAngle = Math.random() * PI2;
        this.at = 0;

        stage.addParticle(this);

    }

    onTick(gx, gy, brightness, now, delta) {
        this.directionTimer--;

        if (this.directionTimer <= 0) {
            this.targetAngle = Math.random() * PI2;
            this.directionTimer = randomFloat(30, 520);
        }

        if(this.directionTimer % 4 === 0){
            this.angle += Math.atan2(Math.sin(this.targetAngle - this.angle), Math.cos(this.targetAngle - this.angle)) * 0.035;

        }

        this.vx += Math.cos(this.angle) * settings.wanderForce;
        this.vy += Math.sin(this.angle) * settings.wanderForce;

        this.vx += gx * settings.textureForce;
        this.vy += gy * settings.textureForce;


        this.vx *= settings.friction;
        this.vy *= settings.friction;

        const maxSpeed = settings.maxSpeed;
        const speedSq = this.vx * this.vx + this.vy * this.vy;
        const maxSpeedSq = maxSpeed * maxSpeed;

        if (speedSq > maxSpeedSq) {
            const k = maxSpeed / Math.sqrt(speedSq);
            this.vx *= k;
            this.vy *= k;
        }

        if (this.x < 0 || this.x > app.screen.width) this.vx *= -1;

        if (this.y < 0 || this.y > app.screen.height) this.vy *= -1;

        this.x += this.vx*delta;
        this.y += this.vy*delta;



        this.alpha = (1 - (now - this.at) / settings.lifeTime) * brightness;

        if(this.alpha < 0.2){
            this.alpha = 0
        }

        const s = 0.5 + brightness * 0.5;
        this.scaleX = s;
        this.scaleY = s;
    }

    destroy(){
        this.alpha = 0;
        this.texture = null;

        this.stage.removeParticle(this);
        this.stage = null;
    }

}