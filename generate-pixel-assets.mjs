import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const characterDir = path.join(root, "assets", "characters");
const foodDir = path.join(root, "assets", "food");
const drinkDir = path.join(root, "assets", "drinks");
const uiDir = path.join(root, "assets", "ui");
for (const directory of [characterDir, foodDir, drinkDir]) fs.mkdirSync(directory, { recursive:true });

const people = [
  ["khanh","male","#f1a66f","#29243b","#e94f37","#ffd34e","cap"],
  ["nhan","female","#f0b07d","#241c2c","#d5434c","#f4d35e","long"],
  ["phuoc-nguyen","male","#eab17e","#26243a","#3c75b8","#f8f2d0","glasses"],
  ["anh-quan","male","#e6a773","#3e2824","#39a89f","#ffd166","swept"],
  ["thien-an","male","#d79a6c","#181c28","#3c4655","#e85b3f","undercut"],
  ["hoang-linh","male","#e5a475","#4a2825","#e85c3f","#3bc4b4","headband"],
  ["an","male","#b87958","#2a1d22","#e68a2e","#f5efe0","curly"],
  ["duong","male","#e1a06f","#342126","#3877bb","#53d3c5","swept"],
  ["thuy","male","#e7ac7a","#252231","#4aa594","#fff1b5","short"],
  ["han","female","#e8aa79","#292239","#8665b5","#ffd7a2","long"],
  ["vu","male","#dea06e","#392126","#d44d48","#ffe08a","side"],
  ["quy","male","#e7a878","#36211d","#f07836","#4dc5b6","messy"],
  ["trang","female","#efb181","#3b2529","#e95e6a","#ffe08a","bob"],
  ["tran","female","#e2a06f","#281f32","#3da99d","#ffce52","ponytail"],
  ["hoc","male","#e8aa77","#332427","#7857a8","#f0db6f","messy"],
  ["tho","female","#dca075","#251f2c","#3a9b8f","#ecf5e9","bob"],
  ["thay-minh","male","#d59a70","#343036","#5b6d85","#f1d36a","formal"],
  ["co-lan","female","#e1a878","#2a252e","#446d9e","#f7e4a9","bob"],
  ["thay-phong","male","#dba173","#2b2934","#4d739f","#f2f0d8","glasses"],
  ["co-linh","female","#e7ad7e","#3b262d","#d65b73","#63c7bd","long"],
  ["thay-tung","male","#d8a073","#252535","#356b83","#e7e3c4","glasses"],
  ["co-huong","female","#dca172","#3a252a","#b65c74","#f3d17a","bob"],
  ["chu-thanh","male","#ca8f67","#2e292b","#596b75","#e8d08b","formal"],
  ["chu-sau","male","#c98d64","#38302b","#3a7d75","#f4c84c","cap"],
  ["chi-hong","female","#e0a274","#3d2428","#e45745","#ffd052","ponytail"],
  ["bac-tu","female","#c68f6b","#66504a","#8c6385","#f0d7a6","bob"],
  ["mystery","male","#d49a6f","#232435","#4c607d","#e75b45","cap"],
  ["generic-student-a","female","#e5a777","#34232d","#df6f7d","#ffd45a","bob"],
  ["generic-student-b","male","#d99a6c","#2b2631","#4d82b8","#f5df79","short"],
  ["generic-neighbor","female","#cd936d","#554039","#8a668f","#e6cc8b","bob"],
  ["generic-worker","male","#c88b63","#242a31","#4d706f","#f1be4b","cap"]
];

function hair(style, color) {
  const top = `<path fill="${color}" d="M40 47h12V35h16V27h40v8h14v12h8v35h-14V57H52v25H38V55h2z"/>`;
  if (style === "long") return top + `<path fill="${color}" d="M38 66h16v54H36V84h-6V60h8zm70 0h16v-6h8v24h-6v36h-18z"/>`;
  if (style === "bob") return top + `<path fill="${color}" d="M36 63h17v45H37zm72 0h18v45h-18z"/>`;
  if (style === "ponytail") return top + `<path fill="${color}" d="M114 47h20v14h10v37h-18V66h-12z"/>`;
  if (style === "curly") return `<g fill="${color}"><path d="M43 73H32V48h11V36h12V25h18v7h13V24h18v8h14v10h12v31h-13V57H50v16z"/><path d="M38 35h17v18H38zm25-17h18v20H63zm31 0h19v20H94zm21 17h18v20h-18z"/></g>`;
  if (style === "headband") return top + `<path fill="#f4d247" d="M42 43h84v8H42z"/>`;
  if (style === "undercut") return `<path fill="${color}" d="M42 47h10V35h18V27h55v18h-18V55H52v25H40z"/>`;
  if (style === "swept") return `<path fill="${color}" d="M38 58V43h13V32h20V24h58v15h-13v9H96V38H70v10H51v31H39z"/>`;
  if (style === "side") return `<path fill="${color}" d="M40 72V43h13V32h20V26h54v18h-18v9H88V42H52v30z"/>`;
  if (style === "messy") return `<path fill="${color}" d="M39 72V42h12V29h12V18h15v12h12V19h16v12h21v14h-13v11H97V44H51v28z"/>`;
  if (style === "glasses") return top;
  if (style === "cap") return `<path fill="${color}" d="M37 68V45h13V33h19V27h51v8h14v20H52v13z"/><path fill="#f3c84b" d="M52 20h68v16H52zm62 16h25v9h-25z"/>`;
  if (style === "formal") return `<path fill="${color}" d="M43 67V40h13V31h53v7h15v29h-13V49H54v18z"/><path fill="#787071" d="M53 29h58v8H53z"/>`;
  return top;
}

function portrait(id, gender, skin, hairColor, shirt, accent, style) {
  const glasses = style === "glasses" ? `<g fill="none" stroke="#272033" stroke-width="5"><path d="M55 72h23v17H55zm39 0h23v17H94zM78 78h16"/></g>` : "";
  const lashes = gender === "female" ? `<path fill="#2a2030" d="M56 70h22v6H56zm39 0h22v6H95z"/>` : "";
  const accessory = id === "an" ? `<g transform="translate(116 118)"><path fill="#ee8b27" stroke="#4b2921" stroke-width="5" d="M-18-18h27l9 9v18L9 18h-27l-9-9V-9z"/><path fill="none" stroke="#7c3527" stroke-width="3" d="M-22 0h36M-5-17v34"/></g>` : id === "hoang-linh" ? `<path stroke="#f5df9a" stroke-width="5" d="M117 112l24-23m-25-1l25 24"/>` : id === "phuoc-nguyen" ? `<path fill="#f6e7a6" stroke="#4b2921" stroke-width="4" d="M18 116h30v28H18z"/>` : id === "nhan" ? `<path fill="#d63d42" d="M27 119h16v12H27z"/><path fill="#fff" d="M33 121h4v8h-4zm-3 3h10v3H30z"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" shape-rendering="crispEdges">
  <path fill="${accent}" d="M0 0h160v160H0z"/><path fill="#fff1bd" d="M0 116h160v44H0z"/><path fill="#4b2921" d="M27 159v-35h14v-16h78v16h14v35z"/>
  <path fill="${shirt}" d="M33 159v-32h18v-14h58v14h18v32z"/><path fill="${accent}" d="M74 113h12v34H74z"/>
  <path fill="${skin}" d="M69 103h22v22H69zM35 68h17v25H35zm73 0h18v25h-18z"/>
  <path fill="#4b2921" d="M46 43h68v11h10v47h-10v13H98v9H62v-9H46v-13H36V54h10z"/>
  <path fill="${skin}" d="M50 48h60v10h10v40h-12v12H93v8H67v-8H52V98H42V58h8z"/>
  ${hair(style,hairColor)}
  ${lashes}<path fill="#2a2030" d="M58 75h12v14H58zm33 0h12v14H91z"/><path fill="#fff" d="M61 77h4v4h-4zm33 0h4v4h-4z"/>
  ${glasses}<path fill="#b86451" d="M72 96h18v5H72z"/><path fill="#f3c6a3" d="M77 85h7v9h-7z"/>
  ${accessory}</svg>`;
}

for (const item of people) fs.writeFileSync(path.join(characterDir, item[0] + ".svg"), portrait(...item));

fs.writeFileSync(path.join(characterDir, "homi.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" shape-rendering="crispEdges">
<path fill="#72d5cb" d="M0 0h160v160H0z"/><path fill="#fff1b8" d="M0 121h160v39H0z"/><path fill="#4b2921" d="M26 61h14V31h20v18h40V31h20v30h14v55h-13v20H39v-20H26z"/>
<path fill="#d98536" d="M32 63h18V40h10v19h40V40h10v23h18v48h-15v18H47v-18H32z"/><path fill="#fff0d2" d="M50 68h60v43h-12v13H62v-13H50z"/>
<path fill="#282332" d="M53 75h12v14H53zm42 0h12v14H95z"/><path fill="#fff" d="M56 77h4v4h-4zm42 0h4v4h-4z"/><path fill="#33242a" d="M71 91h19v13h-5v8H76v-8h-5z"/>
<path fill="#ef6b65" d="M75 110h13v11H75z"/><path fill="#d98536" d="M42 128h21v21H42zm56 0h21v21H98z"/><path fill="#fff0d2" d="M47 140h16v9H47zm51 0h16v9H98z"/></svg>`);

const foodSvgs = {
  "ca-vien":`<g fill="#f4a62d" stroke="#4b2921" stroke-width="6"><path d="M23 56h30v30H23z"/><path d="M52 39h32v32H52z"/><path d="M78 57h30v30H78z"/></g><path stroke="#9b4c25" stroke-width="5" d="M18 103L111 25"/>`,
  "bo-vien":`<g fill="#9c512f" stroke="#4b2921" stroke-width="6"><path d="M22 57h31v31H22z"/><path d="M50 38h34v34H50z"/><path d="M78 58h31v31H78z"/></g><path stroke="#e6b05c" stroke-width="5" d="M18 104L112 24"/>`,
  "xuc-xich":`<path fill="#e9593d" stroke="#4b2921" stroke-width="7" d="M19 76l49-45 28 3 13 15-4 27-51 43-28-4-12-15z"/><path fill="none" stroke="#ffd26a" stroke-width="5" d="M35 94l54-48M47 105l55-49"/>`,
  "pho-mai-que":`<g stroke="#4b2921" stroke-width="6"><path fill="#f3bc3c" d="M26 82l54-50 21 20-54 51z"/><path fill="#ffd963" d="M43 103l54-50 14 15-54 50z"/></g>`,
  "nem-chua-ran":`<g fill="#c96a3c" stroke="#4b2921" stroke-width="6"><path d="M22 81l50-46 18 20-49 46z"/><path d="M49 102l48-45 18 20-49 45z"/></g><path stroke="#f0a755" stroke-width="4" d="M39 75l14 14m18-39l14 14m-18 34l13 14"/>`,
  "banh-trang-tron":`<path fill="#eaf1e6" stroke="#4b2921" stroke-width="7" d="M15 50h98l-12 65H28z"/><path fill="#efc34a" d="M28 61h72v34H28z"/><g fill="#5b9d43"><path d="M31 61h12v12H31z"/><path d="M70 74h14v13H70z"/><path d="M88 58h12v12H88z"/></g><g fill="#df5a3d"><path d="M48 69h13v9H48z"/><path d="M39 87h15v8H39z"/></g>`,
  "mi-tron":`<path fill="#dfe9e7" stroke="#4b2921" stroke-width="7" d="M14 47h100l-14 68H28z"/><path fill="#efbd3f" d="M27 62h74v34H27z"/><path fill="none" stroke="#a85d2f" stroke-width="5" d="M30 70l14 9 13-9 14 9 13-9 14 9M30 88l14-8 13 8 14-8 15 8"/><path stroke="#4b2921" stroke-width="5" d="M88 18l-17 61m36-55L82 79"/>`,
  "ca-vien-curry":`<path fill="#e5ece9" stroke="#4b2921" stroke-width="7" d="M13 47h102l-14 68H27z"/><path fill="#d58a2b" d="M26 62h76v36H26z"/><g fill="#e7ae39" stroke="#7c4328" stroke-width="4"><path d="M33 66h23v22H33z"/><path d="M61 72h24v22H61z"/><path d="M82 60h20v21H82z"/></g><path fill="#55a04b" d="M49 58h12v13H49z"/>`
};
for (const [id, art] of Object.entries(foodSvgs)) {
  fs.writeFileSync(path.join(foodDir, id + ".svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" shape-rendering="crispEdges"><path fill="#fff0b8" d="M0 0h128v128H0z"/><path fill="#f8dc8a" d="M8 106h112v14H8z"/>${art}</svg>`);
}

const drinks = {
  "no-drink":["#ece8d7","#8b8174","×"],
  "tra-chanh":["#e6c23e","#6aaa45","C"],
  "tra-dao":["#e98a55","#f6b044","Đ"],
  "tra-tac":["#d9b93d","#5fa34b","T"],
  "tra-vai":["#e99aaa","#f0e6c8","V"]
};
for (const [id,[liquid,fruit,label]] of Object.entries(drinks)) {
  fs.writeFileSync(path.join(drinkDir,id + ".svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 112" shape-rendering="crispEdges"><path fill="#fff0bd" d="M0 0h96v112H0z"/><path fill="#4b2921" d="M20 24h58l-7 79H27z"/><path fill="#eaf5ef" d="M26 31h46l-6 65H32z"/><path fill="${liquid}" d="M29 49h40l-4 44H33z"/><path fill="${fruit}" d="M52 55h13v13H52z"/><path fill="#4b2921" d="M57 5h7v42h-7z"/><text x="44" y="78" text-anchor="middle" font-family="DejaVu Sans" font-size="18" font-weight="900" fill="#4b2921">${label}</text></svg>`);
}

const sauces = [
  ["sauce-chili","#df3e32","ỚT"],["sauce-ketchup","#ea5e38","CÀ"],["sauce-mayo","#f5e7ba","M"],["sauce-sweet","#df9a3f","NG"],["sauce-mix","#d56846","MX"]
];
for (const [id,color,label] of sauces) {
  fs.writeFileSync(path.join(uiDir,id + ".svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 96" shape-rendering="crispEdges"><path fill="#fff1be" d="M0 0h72v96H0z"/><path fill="#4b2921" d="M25 5h22v18h7v66H18V23h7z"/><path fill="${color}" d="M25 27h22v54H25z"/><path fill="#fff" d="M29 38h14v22H29z"/><text x="36" y="53" text-anchor="middle" font-family="DejaVu Sans" font-size="9" font-weight="900" fill="#4b2921">${label}</text></svg>`);
}

console.log(`Generated ${people.length + 1} portraits, ${Object.keys(foodSvgs).length} foods, ${Object.keys(drinks).length} drinks and ${sauces.length} sauces.`);
