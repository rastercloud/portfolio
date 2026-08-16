let fluidShader;

let smoothMouseX = 0.5;
let smoothMouseY = 0.5;

let mouseDelay = 0.045;

const vert = `
precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main(){

    vTexCoord = aTexCoord;

    vec4 pos = vec4(aPosition,1.0);

    pos.xy = pos.xy * 2.0 - 1.0;

    gl_Position = pos;
}
`;

const frag = `

precision highp float;

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;



float hash(vec2 p){

    return fract(
        sin(dot(p,vec2(127.1,311.7)))
        *43758.5453
    );

}



float noise(vec2 p){

    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i+vec2(1.0,0.0));
    float c = hash(i+vec2(0.0,1.0));
    float d = hash(i+vec2(1.0,1.0));


    vec2 u = f*f*(3.0-2.0*f);


    return mix(a,b,u.x)
        +(c-a)*u.y*(1.0-u.x)
        +(d-b)*u.x*u.y;

}



float fbm(vec2 p){

    float value = 0.0;

    float amplitude = 0.5;


    for(int i=0;i<5;i++){

        value += amplitude * noise(p);

        p *= 2.0;

        amplitude *= 0.5;

    }


    return value;

}



void main(){

    vec2 uv = vTexCoord;


    uv = uv*2.0-1.0;


    uv.x *= u_resolution.x/u_resolution.y;



    vec2 mouse = u_mouse*2.0-1.0;

    mouse.x *= u_resolution.x/u_resolution.y;



    // delikatna reakcja myszy

    float mouseDistance = length(uv-mouse);


    float mouseForce =
        smoothstep(
            0.55,
            0.0,
            mouseDistance
        );


    uv +=
        mouseForce *
        normalize(uv-mouse)
        *
        0.12;



    // główna ciecz (skala zmniejszona, żeby chmura była większa)

    vec2 uvCloud = uv * 1.4;

    vec2 warp;


    warp.x =
        fbm(
            uvCloud +
            vec2(
                u_time*0.06,
                u_time*0.04
            )
        );


    warp.y =
        fbm(
            uvCloud +
            vec2(
                -u_time*0.05,
                u_time*0.07
            )
        );



    float liquid =
        fbm(
            uvCloud +
            warp*1.6 +
            u_time*0.025
        );




    vec3 dark =
        vec3(
            0.015,
            0.035,
            0.12
        );


    vec3 blueDeep =
        vec3(
            0.05,
            0.18,
            0.55
        );


    vec3 blue =
        vec3(
            0.12,
            0.45,
            1.0
        );


    vec3 blueLight =
        vec3(
            0.4,
            0.68,
            1.0
        );



    vec3 color =
        mix(
            dark,
            blueDeep,
            smoothstep(
                0.25,
                0.65,
                liquid
            )
        );



    color =
        mix(
            color,
            blue,
            smoothstep(
                0.55,
                0.85,
                liquid
            )
        );



    color =
        mix(
            color,
            blueLight,
            smoothstep(
                0.78,
                1.0,
                liquid
            )
        );



    // miękki połysk szkła

    float shine =
        pow(
            smoothstep(
                0.45,
                1.0,
                liquid
            ),
            5.0
        );


    color += shine*0.22;



    

    float centerMask =
        smoothstep(
            1.25,
            1.1,
            length(uv * vec2(0.8, 1.0))
        );


    color *= mix(0.25, 1.15, centerMask);



    // przyciemnienie góry i dołu sekcji do czerni

    float verticalFade =
        smoothstep(
            1.0,
            0.6,
            abs(uv.y)
        );


    color *= verticalFade;



    // delikatne przyciemnienie rogów (bokami)

    float vignette =
        smoothstep(
            1.8,
            0.25,
            length(uv)
        );


    color *= vignette;



    gl_FragColor =
        vec4(
            color,
            1.0
        );

}

`;

function setup() {
    const container = document.getElementById("shader-bg");

    const canvas = createCanvas(
        container.offsetWidth,
        container.offsetHeight,
        WEBGL,
    );

    canvas.parent(container);

    noStroke();

    fluidShader = createShader(vert, frag);

    // Shader hero jest kosztowny (fbm x5 oktaw, podwójny warp) i renderuje
    // się co klatkę. Bez pauzy działa non-stop nawet gdy hero jest dawno
    // poza viewportem, obciążając GPU/wątek główny podczas całego scrolla
    // i powodując zacinanie przy innych ciężkich sekcjach (np. Three.js).
    // Zatrzymujemy pętlę draw(), gdy sekcja nie jest widoczna.
    new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                loop();
            } else {
                noLoop();
            }
        },
        { threshold: 0 },
    ).observe(container);
}

function draw() {
    shader(fluidShader);

    fluidShader.setUniform("u_time", millis() / 1000);

    fluidShader.setUniform("u_resolution", [width, height]);

    // płynne opóźnienie kursora

    let targetX = mouseX / width;

    let targetY = 1.0 - mouseY / height;

    smoothMouseX += (targetX - smoothMouseX) * mouseDelay;

    smoothMouseY += (targetY - smoothMouseY) * mouseDelay;

    fluidShader.setUniform("u_mouse", [smoothMouseX, smoothMouseY]);

    rect(-width / 2, -height / 2, width, height);
}

function windowResized() {
    const container = document.getElementById("shader-bg");

    resizeCanvas(container.offsetWidth, container.offsetHeight);
}
