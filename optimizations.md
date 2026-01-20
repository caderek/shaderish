# Potential optimizations

- multiple tiles scheduled to each worker - with falloff at the end to prevent starving the threads,
- better scheduling - each thread has its own section of the buffer, and they steal job from other sections only when finished with theirs.
- Use 32-bit integers with bit operations for colors instead of vec4
- Use webgl to render final buffer as a texture, with a fallback to putImageData,
