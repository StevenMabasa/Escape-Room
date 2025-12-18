import * as THREE from 'three';

export function setupFirstPersonControls(camera, domElement = document.body) {
    const normalSpeed = 5.0;   // walk speed
    const sprintSpeed = 12.0;  // sprint speed
    let moveSpeed = normalSpeed;

    const lookSpeed = 0.001; // mouse sensitivity

    const keys = { forward: false, backward: false, left: false, right: false, sprint: false };
    let pitch = 0;
    let yaw = 0;

    function onMouseMove(event) {
        if (document.pointerLockElement !== domElement) return;

        yaw -= event.movementX * lookSpeed;
        pitch -= event.movementY * lookSpeed;

        const piHalf = Math.PI / 2 - 0.01;
        pitch = Math.max(-piHalf, Math.min(piHalf, pitch));
    }

    function onKeyDown(event) {
        switch (event.code) {
            case 'KeyW': keys.forward = true; break;
            case 'KeyS': keys.backward = true; break;
            case 'KeyA': keys.left = true; break;
            case 'KeyD': keys.right = true; break;
            case 'ShiftLeft':
            case 'ShiftRight':
                keys.sprint = true;
                moveSpeed = sprintSpeed;
                break;
        }
    }

    function onKeyUp(event) {
        switch (event.code) {
            case 'KeyW': keys.forward = false; break;
            case 'KeyS': keys.backward = false; break;
            case 'KeyA': keys.left = false; break;
            case 'KeyD': keys.right = false; break;
            case 'ShiftLeft':
            case 'ShiftRight':
                keys.sprint = false;
                moveSpeed = normalSpeed;
                break;
        }
    }

    domElement.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    domElement.addEventListener('click', () => {
        domElement.requestPointerLock();
    });

    function update(delta) {
        camera.rotation.order = "YXZ";
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;

        const direction = new THREE.Vector3();
        if (keys.forward) direction.z -= 1;
        if (keys.backward) direction.z += 1;
        if (keys.left) direction.x -= 1;
        if (keys.right) direction.x += 1;
        direction.normalize();

        if (direction.length() > 0) {
            const move = new THREE.Vector3();
            move.copy(direction).applyEuler(camera.rotation);
            move.y = 0;
            move.normalize();
            move.multiplyScalar(moveSpeed * delta);
            camera.position.add(move);
        }
    }

    function dispose() {
        domElement.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
    }

    return { update, dispose };
}
