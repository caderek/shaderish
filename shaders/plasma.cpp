// $ cc -O3 -o plasma plasma.cpp -lm
// $ ./plasma
// $ ffmpeg -i output-%03d.ppm -r 60 output.mp4

int main()
{
    char buf[256];
    for (int i = 0; i < 240; ++i) {
        snprintf(buf, sizeof(buf), "output-%03d.ppm", i);
        const char *output_path = buf;
        FILE *f = fopen(output_path, "wb");
        int w = 16*60;
        int h = 9*60;
        fprintf(f, "P6\n");
        fprintf(f, "%d %d\n", w, h);
        fprintf(f, "255\n");
        vec2 r = {(float)w, (float)h};
        float t = ((float)i/240)*2*M_PI;
        for (int y = 0; y < h; ++y){
            for (int x = 0; x < w; ++x) {
                vec4 o;
                vec2 FC = {(float)x, (float)y};
                //////////////////////////////
                // https://x.com/XorDev/status/1894123951401378051
                vec2 p=(FC*2.-r)/r.y,l,i,v=p*(l+=4.-4.*abs(.7-dot(p,p)));
                for(;i.y++<8.;o+=(sin(v.xyyx())+1.)*abs(v.x-v.y))v+=cos(v.yx()*i.y+i+t)/i.y+.7;
                o=tanh(5.*exp(l.x-4.-p.y*vec4(-1,1,2,0))/o);
                //////////////////////////////
                fputc(o.x*255, f);
                fputc(o.y*255, f);
                fputc(o.z*255, f);
            }
        }
        fclose(f);
        printf("Generated %s (%3d/%3d)\n", output_path, i + 1, 240);
    }
    return 0;
}
