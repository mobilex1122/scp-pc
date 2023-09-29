const canvas = document.getElementById("canvas");
const gl =
	canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

if (!gl) {
	alert("WebGL not supported. Please use a WebGL-enabled browser.");
}

const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;

  void main(void) {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_position * 0.5 + 0.5;
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  uniform sampler2D u_texture;
  uniform float u_time;
  uniform float u_delay;

  varying vec2 v_texCoord;

  void main(void) {
    float delay = u_delay;
    vec2 offset = vec2(v_texCoord.x, v_texCoord.y - delay);
    vec4 color = texture2D(u_texture, offset);

    // Quantize to a limited color palette
    color = floor(color * 8.0) / 8.0;

    gl_FragColor = mix(color, vec4(1.0, 1.0, 1.0, 1.0), u_time);
  }
`;

const delay = 0.1; // Adjust the delay time (in seconds)

function compileShader(gl, source, type) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
	const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
	const fragmentShader = compileShader(
		gl,
		fragmentShaderSource,
		gl.FRAGMENT_SHADER
	);

	if (!vertexShader || !fragmentShader) {
		return null;
	}

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("Program linking error:", gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}

	return program;
}

const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
	gl.ARRAY_BUFFER,
	new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
	gl.STATIC_DRAW
);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(
	gl.ARRAY_BUFFER,
	new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]),
	gl.STATIC_DRAW
);

const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
gl.enableVertexAttribArray(texCoordLocation);
gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.viewport(0, 0, canvas.width, canvas.height);

const startTime = performance.now();

function draw() {
	const currentTime = performance.now();
	const elapsedTime = (currentTime - startTime) / 1000.0;

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);

	const timeUniformLocation = gl.getUniformLocation(program, "u_time");
	const delayUniformLocation = gl.getUniformLocation(program, "u_delay");

	gl.uniform1f(timeUniformLocation, elapsedTime);
	gl.uniform1f(delayUniformLocation, delay);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	requestAnimationFrame(draw);
}

draw();
