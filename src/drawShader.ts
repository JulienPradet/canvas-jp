import { CanvasJpShader, CanvasJpShaderType } from "./Shader";

function getShaderType(
  gl: WebGLRenderingContext,
  type: CanvasJpShaderType
): number {
  switch (type) {
    case CanvasJpShaderType.fragment:
      return gl.FRAGMENT_SHADER;
    case CanvasJpShaderType.vertex:
      return gl.VERTEX_SHADER;
  }
}

function createShader(
  gl: WebGLRenderingContext,
  type: CanvasJpShaderType,
  source: string
) {
  var shader = gl.createShader(getShaderType(gl, type));
  if (!shader) {
    throw new Error("Invalid shader type: " + type);
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));

  gl.deleteShader(shader);
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  var program = gl.createProgram();
  if (!program) {
    throw new Error("Failed to create WebGL program");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

const defaultVertexShader = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;

    uniform vec2 u_resolution;

    varying vec2 v_texCoord;

    void main() {
        // convert the rectangle from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

        // pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points.
        v_texCoord = a_texCoord;
    }
`;

const defaultFragmentShader = `
    precision mediump float;

    // our texture
    uniform sampler2D u_image;
    uniform sampler2D u_kernel;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;

    void main() {
        // gl_FragColor = texture2D(u_image, v_texCoord);

        gl_FragColor = texture2D(u_kernel, v_texCoord);
    }
`;

function drawShader(
  gl: WebGLRenderingContext,
  shader: CanvasJpShader,
  {
    width,
    height,
    image,
  }: { width: number; height: number; image: TexImageSource }
) {
  const vertexShader = createShader(
    gl,
    CanvasJpShaderType.vertex,
    defaultVertexShader
  );

  var fragmentShader = createShader(
    gl,
    CanvasJpShaderType.fragment,
    shader.source || defaultFragmentShader
  );

  if (!vertexShader || !fragmentShader) {
    console.error(vertexShader, fragmentShader);
    throw new Error("Missing shader");
  }

  var program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    throw new Error("Program is undefined");
  }

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, width, height);

  // provide texture coordinates for the rectangle.
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    ]),
    gl.STATIC_DRAW
  );

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2; // 2 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // Turn on the texcoord attribute
  gl.enableVertexAttribArray(texcoordLocation);

  // bind the texcoord buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
  var size = 2; // 2 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    texcoordLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");
  gl.uniform2f(textureSizeLocation, image.width, image.height);

  var imageLocation = gl.getUniformLocation(program, "u_image0");
  const texture = createTexture(gl, image);
  gl.uniform1i(imageLocation, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const customUniforms = shader.options?.uniforms || [];
  customUniforms.forEach(({ name, type, value }) => {
    const unformLocation = gl.getUniformLocation(
      program as WebGLProgram,
      name + (type === "float[]" ? "[0]" : "")
    );
    if (type === "vec2") {
      gl.uniform2f(unformLocation, ...value);
    } else if (type === "vec4") {
      gl.uniform4f(unformLocation, ...value);
    } else if (type === "float[]") {
      gl.uniform1fv(unformLocation, value);
    } else if (type === "float") {
      gl.uniform1f(unformLocation, value);
    } else if (type === "texture") {
      const texture = createTexture(gl, value);
      gl.uniform1i(unformLocation, 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texture);
    }
  });

  // Draw the rectangle.
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}

function setRectangle(
  gl: WebGLRenderingContext,
  x: number,
  y: number,
  width: number,
  height: number
) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
}

// Create a texture.
const createTexture = (gl: WebGLRenderingContext, image: TexImageSource) => {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  return texture;
};

export { drawShader };
