// Pulled in here rather than via tsconfig `types`, which would disable the
// automatic inclusion of every other @types package.
/// <reference types="@webgpu/types" />

declare module "*.wgsl" {
  const content: string
  export default content
}
