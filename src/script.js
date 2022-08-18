import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
/**
 * Debug
 */

 const loadingBarElement = document.querySelector('.loading-bar')
 const loadingManager = new THREE.LoadingManager(
     () =>
     {
         window.setTimeout(() =>
         {
             gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })
             loadingBarElement.classList.add('ended')
             loadingBarElement.style.transform = ''
         }, 500)
     },
 
     (itemUrl, itemsLoaded, itemsTotal) =>
     {
         const progressRatio = itemsLoaded / itemsTotal
         loadingBarElement.style.transform = `scaleX(${progressRatio})`
     }
 )
 const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
 const overlayMaterial = new THREE.ShaderMaterial({
     transparent: true,
     uniforms:
     {
         uAlpha: { value: 1 }
     },
     vertexShader: `
         void main()
         {
             gl_Position = vec4(position, 1.0);
         }
     `,
     fragmentShader: `
         uniform float uAlpha;
 
         void main()
         {
             gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
         }
     `
 })
 const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.add(overlay)
const hitSound = new Audio('/sounds/hit.mp3');

const playHitSound = (collision) =>{

    const impactStrength = collision.contact.getImpactVelocityAlongNormal()

    if(impactStrength > 1.5)
    {
        hitSound.volume = Math.random()
        hitSound.currentTime = 0
        hitSound.play()
    }
}
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.load(
    '/models/billboard01/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.4, 0.4, 0.4)
        gltf.scene.position.set(-190,9,-21);
        gltf.scene.rotateY(Math.PI/2  );
        scene.add(gltf.scene) 
    }
)

gltfLoader.load(
    '/models/billboard01/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.4, 0.4, 0.4)
        gltf.scene.position.set(-190,9,21);
        gltf.scene.rotateY(Math.PI/2  );
        scene.add(gltf.scene) 
    }
)

gltfLoader.load(
    '/models/button/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.015, 0.015, 0.015)
        gltf.scene.position.set(-145,0.5,0);
        scene.add(gltf.scene)         
    }
)
gltfLoader.load(
    '/models/button/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.015, 0.015, 0.015)
        gltf.scene.position.set(-85,0.5,0);
        scene.add(gltf.scene)         
    }
)

gltfLoader.load(
    '/models/button/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.015, 0.015, 0.015)
        gltf.scene.position.set(-25,0.5,0);
        scene.add(gltf.scene)         
    }
)



const textureLoader = new THREE.TextureLoader(loadingManager)
const matcapTexture = textureLoader.load('/textures/matcaps/7.png');

/**
 * Textures
 */

const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/cubeMaps/09/px.png',
    '/textures/cubeMaps/09/nx.png',
    '/textures/cubeMaps/09/py.png',
    '/textures/cubeMaps/09/ny.png',
    '/textures/cubeMaps/09/pz.png',
    '/textures/cubeMaps/09/nz.png'
    
])


/**
 * Lights
 */
 const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
 scene.add(ambientLight)
 
 const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
 directionalLight.castShadow = true
 directionalLight.shadow.mapSize.set(1024, 1024)
 directionalLight.shadow.camera.far = 15
 directionalLight.shadow.camera.left = - 7
 directionalLight.shadow.camera.top = 7
 directionalLight.shadow.camera.right = 7
 directionalLight.shadow.camera.bottom = - 7
 directionalLight.position.set(5, 5, 5)
 scene.add(directionalLight)
 
 const light = new THREE.HemisphereLight(0xffffff,0xffffff,0.3)
 light.position.set(-85, 10, 0) // x: -85, y: 130, z: 0 
 scene.add(light);


 
 /**
  * Sizes
  */
 const sizes = {
     width: window.innerWidth,
     height: window.innerHeight
 }
 const aspectRatio = sizes.width/sizes.height;
 window.addEventListener('resize', () =>
 {
     // Update sizes
     sizes.width = window.innerWidth
     sizes.height = window.innerHeight
 
     // Update camera
     camera.aspect = sizes.width / sizes.height
     camera.updateProjectionMatrix()
 
     // Update renderer
     renderer.setSize(sizes.width, sizes.height)
     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
 })
 
 /**
  * Camera
  */
 const camera = new THREE.PerspectiveCamera(85, sizes.width / sizes.height, 0.01, 1000)
 camera.position.set(-250, 26 , 0); //250
 
 scene.add(camera)
 
 // Controls
 const controls = new OrbitControls(camera, canvas)
 controls.enableDamping = true
 
 
 /**
  * Renderer
  */
 const renderer = new THREE.WebGLRenderer({
     canvas: canvas
 })
 renderer.shadowMap.enabled = true
 renderer.shadowMap.type = THREE.PCFSoftShadowMap
 renderer.setSize(sizes.width, sizes.height)
 renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
 
 const objectsToUpdate = []
 
 const sphereGeometry = new THREE.SphereBufferGeometry(1 , 20 , 20);
 const sphereMateriral = new THREE.MeshStandardMaterial({
     metalness : 0.3,
     roughness : 0.4,
 })

//Physics

const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true
world.gravity.set(0 , -9.82 , 0);

//mats

const defaultMaterial = new CANNON.Material('default');

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction : 0.1,
        restitution : 0.35
    }
)

world.addContactMaterial(defaultContactMaterial);


//Raycaster
const raycaster = new THREE.Raycaster()
let intersection = null
const rayOrigin = new THREE.Vector3(- 3, 0, 0)
const rayDirection = new THREE.Vector3(40, 0, 0)

const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

window.addEventListener('click', () =>
{
    
    if(intersection)
    {
        if(intersection.object.name === 'second' )
        {
           var url = "";
           if(intersection.point.z > -24.6 && intersection.point.z < -13.02)
           {
                url = "https://github.com/Ashar2301"
           }
           else if(intersection.point.z > -11.8 && intersection.point.z < -0.32)
           {
                url = "https://offside-app.netlify.app/"
           }
           else if(intersection.point.z > 0.7 && intersection.point.z < 11.7)
           {
                url = "https://ctfy.netlify.app/"
           }
           else if(intersection.point.z > 13.2 && intersection.point.z < 24.7)
           {
                url = "https://github.com/Ashar2301"
           }
           window.open(url, "_blank");
        }
        else if(intersection.object.name === 'third' )
        {
            if(intersection.point.z >6.00 && intersection.point.z <15.00)
            {
                var url="";
                if(intersection.point.y > 13.58 && intersection.point.y < 16.68)
                {
                    url = "https://www.linkedin.com/in/ashar-rashid-107916187/"
                }
                else if(intersection.point.y > 9.09 && intersection.point.y < 12.57 )
                {
                   url = "https://github.com/ashar2301"
                }
                else if(intersection.point.y > 4.67 && intersection.point.y < 8.17)
                {
                    url = "https://www.instagram.com/datguyusher/"
                }
                else if(intersection.point.y > -4.17 && intersection.point.y < -1.01)
                {
                    url = "https://drive.google.com/drive/my-drive"
                }
                window.open(url, "_blank");
            }
            
        }
    }
})

const color = textureLoader.load('/textures/floor02/Stylized_Grass_003_basecolor.jpg')
const ao = textureLoader.load('/textures/floor02/Stylized_Grass_003_ambientOcclusion.jpg');
const normal = textureLoader.load('/textures/floor02/Stylized_Grass_003_normal.jpg');
const roughness = textureLoader.load('/textures/floor02/Stylized_Grass_003_roughness.jpg');
const height = textureLoader.load('/textures/floor02/Stylized_Grass_003_height.png')

const createFloor=(x,y,z,l,b,pos)=>{
    const floorShape = new CANNON.Box(new CANNON.Vec3(x/2,y/2,z));
    const floorBody = new CANNON.Body();
    floorBody.mass = 0;
    floorBody.addShape(floorShape);
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0) , Math.PI*0.5);
    floorBody.material = defaultMaterial;
    floorBody.position = new CANNON.Vec3(pos,0,0);
    world.addBody(floorBody);
    
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(l, b),
        new THREE.MeshStandardMaterial({
            color: 'gray',
            metalness: 0.3,
            roughness: 0.4,
            envMap: environmentMapTexture,
            envMapIntensity: 0.5,
            map: color,
            aoMap : ao,
            normalMap : normal,
            roughnessMap : roughness
        })
    )
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI * 0.5
    floor.position.x = pos;
    
    scene.add(floor)
}

createFloor(10,60,0.1,10,60,-205);

const createTorus=(x,y,z)=>{
    const geometry = new THREE.TorusGeometry(2, 0.2, 16, 100 );
    const material = new THREE.MeshPhongMaterial( 
        { 
            color: 0xffff00 ,
            map : color,
        } );
    const torus = new THREE.Mesh( geometry, material );
    torus.position.set(x,y,z);
    torus.rotateX(Math.PI/2);
    scene.add( torus );
}

var circlesMap= [];

circlesMap.push({x : -205 , z : 10 , radius : 2 , object : null , restitution : 0.35});
circlesMap.push({x : -205 , z : 20 , radius : 2 , object : null , restitution : 0.40});
circlesMap.push({x : -205 , z : -10 , radius : 2 , object : null , restitution :0.45});
circlesMap.push({x : -205 , z : -20 , radius : 2 , object : null, restitution : 0.50});

circlesMap.push({x : -145 , z : 10 , radius : 2 , object : null , restitution : 0.35});
circlesMap.push({x : -145 , z : 20 , radius : 2 , object : null , restitution : 0.40});
circlesMap.push({x : -145 , z : -10 , radius : 2 , object : null , restitution :0.45});
circlesMap.push({x : -145 , z : -20 , radius : 2 , object : null, restitution : 0.50});

circlesMap.push({x : -85 , z : 10 , radius : 2 , object : null , restitution : 0.35});
circlesMap.push({x : -85 , z : 20 , radius : 2 , object : null , restitution : 0.40});
circlesMap.push({x : -85 , z : -10 , radius : 2 , object : null , restitution :0.45});
circlesMap.push({x : -85 , z : -20 , radius : 2 , object : null, restitution : 0.50});

createTorus(-205,0,10);  
createTorus(-205,0,20);
createTorus(-205,0,-10);
createTorus(-205,0,-20);

createTorus(-145,0.5,10);  
createTorus(-145,0.5,20);
createTorus(-145,0.5,-10);
createTorus(-145,0.5,-20);

createTorus(-85,0.5,10);  
createTorus(-85,0.5,20);
createTorus(-85,0.5,-10);
createTorus(-85,0.5,-20);

gltfLoader.load(
    '/models/football/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.015, 0.015, 0.015)
        gltf.scene.position.set(-205,1.5,0);
        scene.add(gltf.scene)  
        circlesMap[0].object = gltf.scene;
        circlesMap[4].object = gltf.scene;
        circlesMap[8].object = gltf.scene;
        objectsToUpdate[0].mesh = gltf.scene;       
    }
)
gltfLoader.load(
    '/models/basketball/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.8, 0.8, 0.8)
        gltf.scene.position.set(-205,1.5,0);
        circlesMap[1].object = gltf.scene;
        circlesMap[5].object = gltf.scene;
        circlesMap[9].object = gltf.scene;     
    }
)
gltfLoader.load(
    '/models/beach/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(1, 1, 1)
        gltf.scene.position.set(-205,1.5,0);
        circlesMap[2].object = gltf.scene;
        circlesMap[6].object = gltf.scene;
        circlesMap[10].object = gltf.scene;     
    }
)

gltfLoader.load(
    '/models/volley/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.55, 0.55, 0.55)
        gltf.scene.position.set(-205,1.5,0);
        circlesMap[3].object = gltf.scene;
        circlesMap[7].object = gltf.scene;
        circlesMap[11].object = gltf.scene;    
    }
)


gltfLoader.load(
    '/models/basketballhoop/scene.gltf',
    (gltf) =>
    {
        gltf.scene.position.set(-203,2,20);
        gltf.scene.rotateY(Math.PI);
        scene.add(gltf.scene)      
    }
)
gltfLoader.load(
    '/models/footballpost/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.0085, 0.0085, 0.0085)
        gltf.scene.position.set(-202,0,12);
        gltf.scene.rotateY(Math.PI/2);
        scene.add(gltf.scene)      
    }
)
gltfLoader.load(
    '/models/volleyballnet/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.010, 0.010, 0.010)
        gltf.scene.position.set(-202,0,-10);
        gltf.scene.rotateY(Math.PI/2);
        scene.add(gltf.scene)        
    }
)
gltfLoader.load(
    '/models/volleyballnet/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.010, 0.010, 0.010)
        gltf.scene.position.set(-202,0,-20);
       gltf.scene.rotateY(Math.PI/2);
        scene.add(gltf.scene)  ;   
    }
)
gltfLoader.load(
    '/models/basketballhoop/scene.gltf',
    (gltf) =>
    {
        gltf.scene.position.set(-143,2,20);
        gltf.scene.rotateY(Math.PI);
        scene.add(gltf.scene)  
    }
)
gltfLoader.load(
    '/models/footballpost/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.0085, 0.0085, 0.0085)
        gltf.scene.position.set(-142,0.5,12);
        gltf.scene.rotateY(Math.PI/2);
        scene.add(gltf.scene)      
    }
)
gltfLoader.load(
    '/models/volleyballnet/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.010, 0.010, 0.010)
        gltf.scene.position.set(-142,0,-10);
        gltf.scene.rotateY(Math.PI/2);
        scene.add(gltf.scene)      
    }
)
gltfLoader.load(
    '/models/volleyballnet/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.010, 0.010, 0.010)
        gltf.scene.position.set(-142,0,-20);
       gltf.scene.rotateY(Math.PI/2);
        scene.add(gltf.scene)  ;      
    }
)
gltfLoader.load(
    '/models/basketballhoop/scene.gltf',
    (gltf) =>
    {
        gltf.scene.position.set(-83,2,20);
        gltf.scene.rotateY(Math.PI);
        scene.add(gltf.scene)      
    }
)
gltfLoader.load(
    '/models/footballpost/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.0085, 0.0085, 0.0085)
        gltf.scene.position.set(-82,0.5,12);
        gltf.scene.rotateY(Math.PI/2);
        scene.add(gltf.scene)        
    }
)
gltfLoader.load(
    '/models/volleyballnet/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.010, 0.010, 0.010)
        gltf.scene.position.set(-82,0,-10);
        gltf.scene.rotateY(Math.PI/2);
        scene.add(gltf.scene)       
    }
)
gltfLoader.load(
    '/models/volleyballnet/scene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.010, 0.010, 0.010)
        gltf.scene.position.set(-82,0,-20);
       gltf.scene.rotateY(Math.PI/2);
        scene.add(gltf.scene)  ;     
    }
)

const createSphere = (radius , position)=>{
    const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMateriral
    )
    mesh.scale.set(radius,radius,radius);
    mesh.castShadow = true;
    mesh.position.copy(position);

    //cannon js body

    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass : 1,
        position : new CANNON.Vec3(0,3,0),
        shape ,
        material : defaultMaterial,
        allowSleep : false
    })

    body.position.copy(position);
    body.addEventListener('collide' , playHitSound);
    world.addBody(body);
    objectsToUpdate.push({mesh , body});
}

createSphere(0.5 , {x:-205 , y:3 , z:0});       //-205 -145 -85 -25 z=10

const colortexture = textureLoader.load('/textures/floor01/Subway_tiles_001_COLOR.jpg')
const aotexture = textureLoader.load('/textures/floor01/Subway_tiles_001_OCC.jpg');
const normaltexture = textureLoader.load('/textures/floor01/Subway_tiles_001_NORM.jpg');
const roughnessmap = textureLoader.load('/textures/floor01/Subway_tiles_001_ROUGH.jpg');

color.repeat.x = 4;
color.repeat.y = 4;
color.wrapS = THREE.RepeatWrapping;
color.wrapT = THREE.RepeatWrapping;

ao.repeat.x = 4;
ao.repeat.y = 4;
ao.wrapS = THREE.RepeatWrapping;
ao.wrapT = THREE.RepeatWrapping;

normal.repeat.x = 4;
normal.repeat.y = 4;
normal.wrapS = THREE.RepeatWrapping;
normal.wrapT = THREE.RepeatWrapping;

roughness.repeat.x = 4;
roughness.repeat.y = 4;
roughness.wrapS = THREE.RepeatWrapping;
roughness.wrapT = THREE.RepeatWrapping;

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    map : colortexture,
    aoMap : aotexture,
    normalMap : normaltexture,
    roughnessMap : roughnessmap
})

const boxMaterial2 = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
     map : color,
     aoMap : ao,
     normalMap : normal,
     roughnessMap : roughness
})

const createBox = (width, height, depth, position , mass) =>
{
    // Three.js mesh
    var mesh;
    if(height != 80)
    {
        mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    }
    else
    {
        mesh = new THREE.Mesh(boxGeometry, boxMaterial2)
    }
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    mesh.rotateX(Math.PI/2);
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth ))

    const body = new CANNON.Body({
        mass: mass,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position);
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0) , Math.PI*0.5);
    body.addEventListener('collide' , playHitSound);
    world.addBody(body)
    if(position.x == -205)
    {
        objectsToUpdate.push({mesh , body});
    }
}


const createFakeBox = (width, height, depth, position) => 
{
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    mesh.rotation.x = - Math.PI * 0.5
    scene.add(mesh)
}

const FakeBox = (width, height, depth, position) =>
{
    const texture1 = textureLoader.load('/textures/images/04.png')
    const texture2 = textureLoader.load('/textures/images/05.png')
    const Material = new THREE.MeshPhongMaterial({
        map : position.z > 0 ? texture1 : texture2
    })
    const mesh = new THREE.Mesh(boxGeometry, Material)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    mesh.rotation.y = Math.PI * 0.5
    scene.add(mesh)
}

const infoBoxes = [];

const createInfoBox = (width, height, depth, position , name , index) => 
{
    const texture1 = textureLoader.load('/textures/images/01.png')
    const texture2 = textureLoader.load('/textures/images/02.png')
    const texture3 = textureLoader.load('/textures/images/03.png')
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
    const boxMaterial1 = new THREE.MeshPhongMaterial({
        map : texture1
    })
    const boxMaterial2 = new THREE.MeshPhongMaterial({
        map : texture2
    })
    const boxMaterial3 = new THREE.MeshPhongMaterial({
        map : texture3
    })
    var mesh;
    switch(index)
    {
        case 1 : 
        {
            mesh = new THREE.Mesh(boxGeometry, boxMaterial1);
            mesh.scale.set(width, height, depth)
            break;
        }
        case 2 : 
        {
            mesh = new THREE.Mesh(boxGeometry, boxMaterial2);
            mesh.scale.set(width, height, depth)
            break;
        }
        case 3 : 
        {
            mesh = new THREE.Mesh(boxGeometry, boxMaterial3);
            mesh.scale.set(width-20, height-20, depth)
            break;
        }
    }

    
    mesh.castShadow = true
    mesh.position.copy(position)
    mesh.rotation.x = - Math.PI * 0.5
    mesh.rotation.y = - Math.PI * 0.5
    mesh.name = name
    mesh.visible = false;
    scene.add(mesh)
    infoBoxes.push(mesh);
}
const texture01 = textureLoader.load('/textures/images/06.png')
const frontBoxGeometry = new THREE.BoxGeometry(1, 1, 1)
const frontBoxMaterial = new THREE.MeshPhongMaterial({
    map: texture01
})
const frontMesh = new THREE.Mesh(frontBoxGeometry, frontBoxMaterial)
    frontMesh.scale.set(40, 40, 1)
    frontMesh.castShadow = true
    frontMesh.position.copy({ x: -220 , y: 26, z: 0 })
    frontMesh.rotation.y = Math.PI * 0.5
    scene.add(frontMesh)

//ball boxes

createFakeBox(10, 10, 0.5, { x: -185, y: 0, z: -21 })
createFakeBox(10, 10, 0.5, { x: -185, y: 0, z: 21 })

FakeBox(12, 5.5, 0.1, { x: -189.5 , y: 10, z: -21 })
FakeBox(12, 5.5, 0.1, { x: -189.5 ,y: 10, z: 21 })

createInfoBox(50, 50, 2.5, { x: -85, y: 100, z: 0 },'first' , 1)
createInfoBox(50, 50, 2.5, { x: -25, y: 100, z: 0 },'second', 2)
createInfoBox(50, 50, 2.5, { x: 1, y: 80, z: 0 },'third', 3)



createBox(10, 10, 0.5, { x: -190, y: 0, z: 8  },0)
createBox(10, 10, 0.5, { x: -190, y: 0, z: - 8 },0)
createFakeBox(10, 10, 0.5, { x: -175, y: 0, z: - 8 })
createBox(10, 10, 0.5, { x: -175, y: 0, z:  8 },0)
createFakeBox(10, 10, 0.5, { x: -160, y: 0, z: 8 })
createBox(10, 10, 0.5, { x: -160, y: 0, z:  -8 },0)

createBox(10, 80, 0.5, { x: -145, y: 0, z:  0 },0)

createBox(10, 10, 0.5, { x: -130, y: 0, z: 8  },0)
createFakeBox(10, 10, 0.5, { x: -130, y: 0, z: - 8 },0)
createBox(10, 10, 0.5, { x: -115, y: 0, z: - 8 })
createFakeBox(10, 10, 0.5, { x: -115, y: 0, z:  8 },0)
createFakeBox(10, 10, 0.5, { x: -100, y: 0, z: 8 })
createBox(10, 10, 0.5, { x: -100, y: 0, z:  -8 },0)

createBox(10, 80, 0.5, { x: -85, y: 0, z:  0 },0)

createFakeBox(10, 10, 0.5, { x: -70, y: 0, z: 8  },0)
createBox(10, 10, 0.5, { x: -70, y: 0, z: - 8 },0)
createFakeBox(10, 10, 0.5, { x: -55, y: 0, z: - 8 })
createBox(10, 10, 0.5, { x: -55, y: 0, z:  8 },0)
createBox(10, 10, 0.5, { x: -40, y: 0, z: 8 })
createFakeBox(10, 10, 0.5, { x: -40, y: 0, z:  -8 },0)


createBox(10, 80, 0.5, { x: -25, y: 0, z:  0 },0)


var map={};
var checkpoints={};
var checkpointsLocations= [];
var btnStates = {};

btnStates[0] = false;

checkpointsLocations[1] = {x : -208 , y : 3 , z: 0};
checkpointsLocations[2] = {x : -148 , y : 3 , z: 0};
checkpointsLocations[3] = {x : -88 , y : 3 , z: 0};

var setMesh = null;

const verifyCircle=(x,z)=>{
    
    for(var i=0;i<circlesMap.length;i++)
    {
        if((Math.sqrt(Math.pow(x-circlesMap[i].x,2) + Math.pow(z-circlesMap[i].z,2) ))<circlesMap[i].radius)   
        {
            return circlesMap[i];
        }

    }
    return null;
}

const showInfoBox=(box)=>{
    
    var mesh;

    for(var i=0 ; i<infoBoxes.length;i++)
    {
        if(infoBoxes[i].name === box)
        {
            mesh = infoBoxes[i];
            break;
        }
    }

    mesh.visible = true;
    setMesh = mesh;
    animateDown();
}
const HideInfoBox=(box)=>{
    
    var mesh;

    for(var i=0 ; i<infoBoxes.length;i++)
    {
        if(infoBoxes[i].name === box)
        {
            mesh = infoBoxes[i];
            break;
        }
    }
    
    setMesh = mesh;
    animateUp();
    
}

const animateDown=()=>{

    var mesh = setMesh;
    mesh.position.y -= 0.5;

    if(mesh.name === 'third' && mesh.position.y >=10)
    {
        window.requestAnimationFrame(animateDown);
    }
    else if(mesh.position.y >=25)
    {
        window.requestAnimationFrame(animateDown);
    }
    
}
const animateUp=()=>{

    var mesh = setMesh;
    mesh.position.y += 0.5;

    if(mesh.position.y <=105)
    {
        window.requestAnimationFrame(animateUp);
    }
    else
    {
        mesh.visible = false;
    }
    
}
const verifyJump=(position)=>{
            if(position.x > -90 && position.x < -80)
            {
                if(position.z > -30 && position.z < 30)
                {
                    return true;
                }
            }
        
            if(position.x > -150 && position.x < -140)
            {
                if(position.z > -30 && position.z < 30)
                {
                    return true;
                }
            }

            if(position.x > -210 && position.x < -200)
            {
                if(position.z > -30 && position.z < 30)
                {
                    return true;
                }
            }
        
    for(var i=0;i<world.bodies.length;i++)
    {
        
        if(world.bodies[i].mass == 1)    continue; //the ball itself
        
        else if(position.x > world.bodies[i].position.x-5 && position.x < world.bodies[i].position.x+5)
        {
            if(position.z > world.bodies[i].position.z-5 && position.z < world.bodies[i].position.z+5)
            {
                return true;
            }
        }
    }

    return false;
}

var animationCamState = false;
var animationBoxState = false;

const startAnimationBegin=()=>{
    animationBoxState = true;
    animationCamState = true;
}


const keyDownFn = (args)=>{

    map[args.key] = true;
    if(args.key == 'q' || args.key == 'Q')
    {
        objectsToUpdate[0].body.velocity.x = 0;
        objectsToUpdate[0].body.velocity.z = 0;
        objectsToUpdate[0].body.velocity.y = 0;        
    }
    if(args.key == 'w' || args.key == 'W')
    {
        objectsToUpdate[0].body.velocity.x = 8;       
        objectsToUpdate[0].body.applyLocalForce(new CANNON.Vec3(0.01,0,0) , objectsToUpdate[0].body.position); 
    }
    if(args.key == 's' || args.key == 'S')
    {
        objectsToUpdate[0].body.velocity.x = -8;
    }
    if(args.key == 'a' || args.key == 'A')
    {
        if(map['w'] == true)
        {
            objectsToUpdate[0].body.velocity.z = -8;
            objectsToUpdate[0].body.velocity.x = 8;
        }
        else if(map['s'] == true)
        {
            objectsToUpdate[0].body.velocity.z = -8;
            objectsToUpdate[0].body.velocity.x = -8;
        }
        else
        {
            objectsToUpdate[0].body.velocity.z = -8;
        }
       
    }
    if(args.key == 'd' || args.key == 'D')
    {
        if(map['w'] == true)
        {
            objectsToUpdate[0].body.velocity.z = 8;
            objectsToUpdate[0].body.velocity.x = 8;
        }
        else if(map['s'] == true)
        {
            objectsToUpdate[0].body.velocity.z = 8;
            objectsToUpdate[0].body.velocity.x = -8;
        }
        else
        {
            objectsToUpdate[0].body.velocity.z = 8;
        }
        
    }

    if(args.key == ' ' && objectsToUpdate[0].body.position.y < 1 && verifyJump(objectsToUpdate[0].body.position))
    {
        if(objectsToUpdate[0].body.position.y < 5)
        {
            objectsToUpdate[0].body.velocity.y = 10;
        }
        if(objectsToUpdate[0].body.position.y >= 5)
        {
            objectsToUpdate[0].body.velocity.y /= 2;
        }
    }

    if(args.key == "Enter")
    {

        if(camera.position.x <= -220)
        {
            startAnimationBegin();
        }

        if(objectsToUpdate[0].body.position.x < -144 && objectsToUpdate[0].body.position.x > -146
            && objectsToUpdate[0].body.position.z < 2 && objectsToUpdate[0].body.position.z > -2)
        {
            btnStates[0] = !btnStates[0];

            if(btnStates[0])
            {
                showInfoBox('first');
            }
            else
            {
                HideInfoBox('first');
            }
        }

        else if(objectsToUpdate[0].body.position.x < -84 && objectsToUpdate[0].body.position.x > -86
            && objectsToUpdate[0].body.position.z < 2 && objectsToUpdate[0].body.position.z > -2)
        {
            btnStates[1] = !btnStates[1];

            if(btnStates[1])
            {
                showInfoBox('second');
            }
            else
            {
                HideInfoBox('second');
            }
        }

        else if(objectsToUpdate[0].body.position.x < -24 && objectsToUpdate[0].body.position.x > -26
            && objectsToUpdate[0].body.position.z < 2 && objectsToUpdate[0].body.position.z > -2)
        {
            btnStates[2] = !btnStates[2];

            if(btnStates[2])
            {
                showInfoBox('third');
            }
            else
            {
                HideInfoBox('third');
            }
        }

        else
        {
            var ret = verifyCircle(objectsToUpdate[0].body.position.x , objectsToUpdate[0].body.position.z);
            if(ret != null)
            {
                scene.remove(objectsToUpdate[0].mesh);
                scene.add(ret.object);
                objectsToUpdate[0].mesh = ret.object;
                objectsToUpdate[0].body.material.restitution = ret.restitution; 
                
            }
        }
    }
}
document.addEventListener("keydown" , keyDownFn);

const keyUpFn = (args)=>{

    map[args.key] = false;
    if(args.key == 'w' || args.key == 'W')
    {
        objectsToUpdate[0].body.velocity.x = (objectsToUpdate[0].body.velocity.x / 2);
    }
    if(args.key == 's' || args.key == 'S')
    {
        objectsToUpdate[0].body.velocity.x = (objectsToUpdate[0].body.velocity.x / 2);
    }
    if(args.key == 'd' || args.key == 'D')
    {
        objectsToUpdate[0].body.velocity.z = (objectsToUpdate[0].body.velocity.z / 2);
    }
    if(args.key == 'a' || args.key == 'A')
    {
        objectsToUpdate[0].body.velocity.z = (objectsToUpdate[0].body.velocity.z / 2);
    }
    if(args.key == ' ')
    {
        objectsToUpdate[0].body.velocity.y /= 2;
    }
}
document.addEventListener("keyup" , keyUpFn);

const restart=()=>{
    objectsToUpdate[0].body.velocity.x = 0;
    objectsToUpdate[0].body.velocity.y = 0;
    objectsToUpdate[0].body.velocity.z = 0;

    for(var i=3 ; i>= 1; i--)
    {
        if(checkpoints[i] == true)
        {
            objectsToUpdate[0].body.position.x = checkpointsLocations[i].x;
            objectsToUpdate[0].body.position.y = checkpointsLocations[i].y;
            objectsToUpdate[0].body.position.z = checkpointsLocations[i].z;
            return;
        }
    }
}
/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime  = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    world.step(1/60 , deltaTime , 3);

    for(const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
        object.mesh.rotateX(0);
        object.mesh.rotateY(0);
        object.mesh.rotateZ(0);
    }


    if(animationCamState)
    {
        if(camera.position.x < -215)
        {
            camera.position.x +=0.25;
            if(camera.position.x == -215)
            {
                animationCamState = false;
                objectsToUpdate[0].position.y = 10;
            }
        }
        if(camera.position.y != 7)
        {
            camera.position.y -=0.2375;
        }
    }
    if(animationBoxState)
    {
        if(frontMesh.position.y < 200)
        {
            frontMesh.position.y +=0.25;
        }
        else
        {
            animationBoxState = false;
        }
    }

    // Update controls
    if(objectsToUpdate[0].body.position.y < -3 || objectsToUpdate[0].body.position.x <= -220)
    {
        restart();
    }
    if(objectsToUpdate[0].body.position.x > -90 && objectsToUpdate[0].body.position.x < -80)
    {
        if(objectsToUpdate[0].body.position.z> -30 && objectsToUpdate[0].body.position.z < 30)
        {
            checkpoints[3] = true;
        }
    }
    if(objectsToUpdate[0].body.position.x > -150 && objectsToUpdate[0].body.position.x < -140)
    {
        if(objectsToUpdate[0].body.position.z> -30 && objectsToUpdate[0].body.position.z < 30)
        {
            checkpoints[2] = true;
        }
    }
    if(objectsToUpdate[0].body.position.x > -210 && objectsToUpdate[0].body.position.x < -200)
    {
        if(objectsToUpdate[0].body.position.z> -30 && objectsToUpdate[0].body.position.z < 30)
        {
            checkpoints[1] = true;
        }
    }


    //raycaster
    raycaster.setFromCamera(mouse, camera)

    const objectsToTest = infoBoxes;
    const intersects = raycaster.intersectObjects(objectsToTest)
    
    if(intersects.length)
    {
        intersection = intersects[0]
    }
    else
    {
        intersection = null
    }
    
    controls.update()

           
    if(camera.position.x >= -230)
    {
        if(objectsToUpdate[0].body.position.x < 0)
        {
            camera.position.x = objectsToUpdate[0].body.position.x - 10;
        }
        else if(objectsToUpdate[0].body.position.x > 0)
        {
            camera.position.x = objectsToUpdate[0].body.position.x - 10;
        }
                
        camera.position.y = 7;
        camera.position.z = objectsToUpdate[0].body.position.z; 
    }     

    var domE = document.getElementById('pg1');
    if(verifyCircle(objectsToUpdate[0].body.position.x , objectsToUpdate[0].body.position.z) != null)
    {
        domE.style.display = 'block';
    }
    else if((objectsToUpdate[0].body.position.x < -144 && objectsToUpdate[0].body.position.x > -146
        && objectsToUpdate[0].body.position.z < 2 && objectsToUpdate[0].body.position.z > -2)
        ||
        (objectsToUpdate[0].body.position.x < -84 && objectsToUpdate[0].body.position.x > -86
            && objectsToUpdate[0].body.position.z < 2 && objectsToUpdate[0].body.position.z > -2)
        ||
        (objectsToUpdate[0].body.position.x < -24 && objectsToUpdate[0].body.position.x > -26
            && objectsToUpdate[0].body.position.z < 2 && objectsToUpdate[0].body.position.z > -2))
    {
        domE.style.display = 'block';
    }
    else
    {
        domE.style.display = 'none';
    }

    
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()