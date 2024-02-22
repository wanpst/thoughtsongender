function getRenderingContext() {
    const canvas = document.getElementById("canvasPsych");
    const gl = canvas.getContext("webgl");
    gl.canvas.width = gl.canvas.clientWidth;
    gl.canvas.height = gl.canvas.clientHeight;

    if (!gl) {
        const paragraph = document.createElement("p");
        const paragraphText = document.createTextNode(
            "Your browser or device does not support WebGL (seriously?!)"
        );
        paragraph.appendChild(paragraphText);
        document.body.appendChild(paragraph);
        return null;
    }

    return gl;
}

function initializeVBO(gl, state) {
    if (state.vbo) {
        gl.deleteBuffer(state.vbo);
    }
    state.vbo = gl.createBuffer();

    // just a rectangle, using 2d positions
    const vertexPositions = new Float32Array([
        -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
    ]);

    const positionLocation = gl.getAttribLocation(state.program, "position");

    gl.bindBuffer(gl.ARRAY_BUFFER, state.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);
}

function resizeCanvasToFit(gl) {
    let width = gl.canvas.clientWidth;
    let height = gl.canvas.clientHeight;
    if (gl.canvas.width != width || gl.canvas.height != height) {
        gl.canvas.width = width;
        gl.canvas.height = height;
    }
}

function psychLoop(timeStamp, gl, state) {
    resizeCanvasToFit(gl);

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(
        gl.getUniformLocation(state.program, "u_time"),
        timeStamp * 0.001
    );
    gl.uniform2f(
        gl.getUniformLocation(state.program, "u_resolution"),
        gl.canvas.width,
        gl.canvas.height
    );
    gl.uniform2f(
        gl.getUniformLocation(state.program, "u_mouse"),
        state.mouse_pos.x,
        state.mouse_pos.y
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame((timeStamp) =>
        psychLoop(timeStamp, gl, state)
    );
}

async function psychInit(event) {
    const state = {
        program: null,
        vbo: null,
        mouse_pos: { x: 0.0, y: 0.0 },
    };

    const gl = getRenderingContext();
    if (gl == null) return;

    // shader
    const sourceVertex = await fetch("assets/psych.vert").then((data) =>
        data.text()
    );
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, sourceVertex);
    gl.compileShader(vertexShader);

    const sourceFragment = await fetch("assets/psych.frag").then((data) =>
        data.text()
    );
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, sourceFragment);
    gl.compileShader(fragmentShader);

    state.program = gl.createProgram();
    gl.attachShader(state.program, vertexShader);
    gl.attachShader(state.program, fragmentShader);

    gl.linkProgram(state.program);

    gl.detachShader(state.program, vertexShader);
    gl.detachShader(state.program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (gl.getProgramParameter(state.program, gl.LINK_STATUS) == false) {
        const linkErrLog = gl.getProgramInfoLog(state.program);
        console.error(`Shader program linking unsuccessful: ${linkErrLog}`);
        return;
    }

    // vbo
    initializeVBO(gl, state);

    gl.canvas.addEventListener("mousemove", (event) => {
        state.mouse_pos.x = event.clientX;
        state.mouse_pos.y = event.clientY;
    });

    // the render loop begins
    gl.useProgram(state.program);
    window.requestAnimationFrame((timeStamp) =>
        psychLoop(timeStamp, gl, state)
    );
}

export { psychInit };
