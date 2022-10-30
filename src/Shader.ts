export enum CanvasJpShaderType {
  "fragment" = "fragment",
  "vertex" = "vertex",
}
export type CanvasJpShaderUniform =
  | { name: string; type: "vec2"; value: [number, number] }
  | { name: string; type: "vec4"; value: [number, number, number, number] }
  | { name: string; type: "float[]"; value: number[] }
  | { name: string; type: "float"; value: number }
  | { name: string; type: "texture"; value: TexImageSource };

export type CanvasJpShaderOptions = {
  uniforms: CanvasJpShaderUniform[];
};
export type CanvasJpShader = {
  __type: "Shader";
  type: CanvasJpShaderType;
  source: string;
  options?: CanvasJpShaderOptions;
  compositeOperation?: GlobalCompositeOperation;
};

export const Shader = (
  type: CanvasJpShaderType,
  source: string,
  options?: CanvasJpShaderOptions,
  compositeOperation?: GlobalCompositeOperation
): CanvasJpShader => ({
  __type: "Shader",
  type,
  source,
  options,
  compositeOperation,
});
