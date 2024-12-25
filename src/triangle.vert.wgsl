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