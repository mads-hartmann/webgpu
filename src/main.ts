import triangleWGSL from "./triangle.vert.wgsl?raw";

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

  const shaderModule = device.createShaderModule({ code: triangleWGSL });

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

await main();
