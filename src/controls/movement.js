import * as THREE from 'https://unpkg.com/three@0.180.0/build/three.module.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


const DIRECTIONS = ['w', 'a', 's', 'd'];

export class CharacterControls {
    walkDirection = new THREE.Vector3();
    rotateAngle = new THREE.Vector3(0, 1, 0);
    rotateQuaternion = new THREE.Quaternion();
    cameraTarget = new THREE.Vector3();

    fadeDuration = 0.2;
    walkSpeed = 7;

    cameraModes = { THIRD_PERSON: 0, FIRST_PERSON: 1 };
    currentCameraMode = 0; // start in third-person

    // for free look
    isFreeLook = false;
    yaw = 0;
    pitch = 0;
    mouseSensitivity = 0.002;

    constructor(model, mixer, animationsMap, orbitControl, camera, currentAction, collidableObjects) {
        this.model = model;
        this.mixer = mixer;
        this.animationsMap = animationsMap;
        this.orbitControl = orbitControl;
        this.camera = camera;

        this.currentAction = null;
        this.toggleRun = true;
        this.collidableObjects = collidableObjects;
        this.playAction(currentAction);

        this.addMouseControls();
    }

    addMouseControls() {
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement) { // pointer is locked
                this.yaw -= e.movementX * this.mouseSensitivity;
                this.pitch += e.movementY * this.mouseSensitivity;
                this.pitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, this.pitch));
            }
        });
    }


    playAction(name) {
        if (this.currentAction === name) return;
        if (this.currentAction) {
            const prev = this.animationsMap.get(this.currentAction);
            if (prev) prev.fadeOut(this.fadeDuration);
        }
        const action = this.animationsMap.get(name);
        if (action) {
            action.reset().fadeIn(this.fadeDuration).play();
            this.currentAction = name;
        }
    }

    toggleCameraMode() {
        this.currentCameraMode =
            this.currentCameraMode === this.cameraModes.THIRD_PERSON
                ? this.cameraModes.FIRST_PERSON
                : this.cameraModes.THIRD_PERSON;

        this.model.visible = this.currentCameraMode === this.cameraModes.THIRD_PERSON;
    }

    update(delta, keysPressed) {
        const directionPressed = DIRECTIONS.some((key) => keysPressed[key]);
        let play = directionPressed ? 'walk' : 'idle';

        if (this.currentAction !== play) {
            const toplay = this.animationsMap.get(play);
            const current = this.animationsMap.get(this.currentAction);
            if (current) current.fadeOut(this.fadeDuration);
            if (toplay) toplay.reset().fadeIn(this.fadeDuration).play();
            this.currentAction = play;
        }

        this.mixer.update(delta);

        if (this.currentAction === 'walk') {
            const directionOffset = this.directionoffset(keysPressed);
            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

            const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1),
                this.walkDirection.clone().normalize()
            );
            this.model.quaternion.rotateTowards(targetQuaternion, 0.2);

            const velocity = this.toggleRun ? this.walkSpeed : this.walkSpeed / 2;
            const moveX = this.walkDirection.x * velocity * delta;
            const moveZ = this.walkDirection.z * velocity * delta;
            // this.model.position.x += moveX;
            // this.model.position.z += moveZ;
            const nextPosition = this.model.position.clone();
            nextPosition.x += moveX;
            nextPosition.z += moveZ;

            // Simple bounding box around player
            const playerBox = new THREE.Box3().setFromCenterAndSize(
                nextPosition.clone().add(new THREE.Vector3(0, 3, 0)), // height offset
                new THREE.Vector3(2, 6, 2)
            );

            let collision = false;

           
            for (const obj of this.collidableObjects) {
                // Skip if object has no geometry or is far away
                if (!obj.geometry && !obj.children.length) continue;
                if (obj.position.distanceTo(this.model.position) > 30) continue;

                // Cache the bounding box once
                if (!obj.userData.box) {
                    obj.userData.box = new THREE.Box3().setFromObject(obj);
                }

                // Recompute only if object moves
                else if (obj.userData.lastPos) {
                    const pos = obj.position.clone();
                    if (!pos.equals(obj.userData.lastPos)) {
                        obj.userData.box.setFromObject(obj);
                        obj.userData.lastPos.copy(pos);
                    }
                } else {
                    obj.userData.lastPos = obj.position.clone();
                }

                // Check intersection
                if (playerBox.intersectsBox(obj.userData.box)) {
                    collision = true;
                    break;
                }
            }

            // Only move if no collision
            if (!collision) {
                this.model.position.x = nextPosition.x;
                this.model.position.z = nextPosition.z;
            }
        
            }

        this.updateCameraTarget();
    }

    directionoffset(keysPressed) {
        let directionOffset = 0;
        if (keysPressed['w']) {
            if (keysPressed['a']) directionOffset = Math.PI / 4;
            else if (keysPressed['d']) directionOffset = -Math.PI / 4;
        } else if (keysPressed['s']) {
            if (keysPressed['a']) directionOffset = Math.PI / 4 + Math.PI / 2;
            else if (keysPressed['d']) directionOffset = -Math.PI / 4 - Math.PI / 2;
            else directionOffset = Math.PI;
        } else if (keysPressed['a']) directionOffset = Math.PI / 2;
        else if (keysPressed['d']) directionOffset = -Math.PI / 2;
        return directionOffset;
    }

updateCameraTarget(delta = 0.016) {
    const smoothSpeed = 20; // higher = snappier camera follow
    const behindDistance = 5;
    const upDistance = 8;

    if (this.currentCameraMode === this.cameraModes.THIRD_PERSON) {

        // Build rotation from yaw & pitch
        const rotation = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));

        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(rotation).normalize();

        // Desired camera position
        const desiredPosition = new THREE.Vector3()
            .copy(this.model.position)
            .addScaledVector(forward, -behindDistance)
            .add(new THREE.Vector3(0, upDistance, 0));

        // SMOOTH camera movement using exponential damping
        this.camera.position.lerp(desiredPosition, 1 - Math.exp(-smoothSpeed * delta));

        // Target (what camera looks at)
        const desiredTarget = new THREE.Vector3().copy(this.model.position);
        desiredTarget.y += 5;

        // SMOOTH lookAt movement too
        this.cameraTarget.lerp(desiredTarget, 1 - Math.exp(-smoothSpeed * delta));
        this.camera.lookAt(this.cameraTarget);

        // Update orbit control target
        this.orbitControl.target.copy(this.cameraTarget);

        // Auto realign player when walking
        if (this.currentAction === 'walk') {
            const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.yaw, 0));
            this.model.quaternion.slerp(targetQuat, 0.1);
        }
    }

    else if (this.currentCameraMode === this.cameraModes.FIRST_PERSON) {
    const headHeight = 7.5;
    const cameraPosition = new THREE.Vector3().copy(this.model.position);
    cameraPosition.y += headHeight;

    // Directly set position to avoid vibration
    this.camera.position.copy(cameraPosition);

    // Use yaw/pitch for free look
    const rotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ')
    );
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(rotation).normalize();

    // Look directly forward from head
    const target = new THREE.Vector3().copy(cameraPosition).add(forward);
    this.camera.lookAt(target);

    // Update OrbitControl target for debugging
    this.orbitControl.target.copy(target);
}

}

}
