// /*
//     "Plasma" Deobfuscated
//     Based on @XorDev: x.com/XorDev/status/1894123951401378051
// */
//
// void mainImage(out vec4 fragColor, in vec2 fragCoord)
// {
//     // 1. Setup Coordinates
//     vec2 res = iResolution.xy;
//     vec2 uv = (fragCoord * 2.0 - res) / res.y;
//
//     // 2. Calculate Depth/Vignette (z)
//     // In original: z is a vec2, but x and y are identical.
//     float distValue = 4.0 - 4.0 * abs(0.7 - dot(uv, uv));
//     vec2 z = vec2(distValue);
//
//     // 3. Initialize Fluid Coordinates (f)
//     vec2 f = uv * z;
//
//     // 4. Loop
//     fragColor = vec4(0.0);
//
//     // We loop 8 times.
//     // In the original, 'i' is a vec2. 'i.y' increments from 1 to 8. 'i.x' stays 0.
//     for (float y = 1.0; y <= 8.0; y++)
//     {
//         // Reconstruct the specific vector 'i' from the original code:
//         vec2 i_vec = vec2(0.0, y);
//
//         // Fluid Update (The Body of the original loop)
//         // Note: We MUST use i_vec here, not the scalar y.
//         // Original: f += cos(f.yx * i.y + i + iTime) / i.y + .7;
//         f += cos(f.yx * y + i_vec + iTime) / y + 0.7;
//
//         // Color Update (The 'Expression' part of the original for-loop)
//         // Original: O += (sin(f)+1.).xyyx * abs(f.x-f.y)
//         // This runs AFTER the fluid update in the standard for-loop execution order.
//         fragColor += (sin(f).xyyx + 1.0) * abs(f.x - f.y);
//     }
//
//     // 5. Tone Map
//     // Original: O = tanh(7.*exp(z.x-4.-p.y*vec4(-1,1,2,0))/O);
//     vec4 gradient = exp(z.x - 4.0 - uv.y * vec4(-1, 1, 2, 0));
//     fragColor = tanh(7.0 * gradient / fragColor);
// }

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 res = iResolution.xy;
    vec2 uv = (fragCoord * 2.0 - res) / res.y;
    float zVal = 4.0 - 4.0 * abs(0.7 - dot(uv, uv));
    vec2 z = vec2(zVal);
    vec2 f = uv * z;
    fragColor = vec4(0.0);

    for (float y = 1.0; y <= 8.0; y++)
    {
        vec2 i = vec2(0.0, y);
        f += cos(f.yx * y + i + iTime) / y + 0.7;
        fragColor += (sin(f).xyyx + 1.0) * abs(f.x - f.y);
    }

    vec4 gradient = exp(z.x - 4.0 - uv.y * vec4(-1, 1, 2, 0));
    fragColor = tanh(7.0 * gradient / fragColor);
}
