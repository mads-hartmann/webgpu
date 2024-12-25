async function main() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.height = 512;
  canvas.width = 512;

  const context = canvas.getContext("webgpu");
  if (context === null) {
    console.error(
      "WebGPU is not supported on this device. Failed to get context"
    );
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();

  if (adapter === null) {
    console.error(
      "WebGPU is not supported on this device. Failed to get adapter."
    );
    return;
  }

  const device = await adapter.requestDevice();
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({ device: device, format: presentationFormat });

  const shaderWSGL = `
  @vertex fn vsmain(@builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 3>(
      vec2<f32>(0.0, 1.0),
      vec2<f32>(-1.0, -1.0),
      vec2<f32>(1.0, -1.0)
    );
    return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
  }

  @fragment fn psmain() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.5, 0.5, 1.0);
  }
  `;

  const shaderModule = device.createShaderModule({ code: shaderWSGL });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vsmain",
    },
    fragment: {
      module: shaderModule,
      entryPoint: "psmain",
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  const frame = () => {
    const commandEncoder = device.createCommandEncoder();
    const view = context.getCurrentTexture().createView();
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: view,
          loadOp: "clear",
          clearValue: [0, 0.5, 0.5, 1],
          storeOp: "store",
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  };
  frame();
}

console.log("Executing main");
await main();
