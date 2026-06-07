// Pool of beautiful SVGs representing the objects in the reference images.
// Styled in a premium, warm, retro aesthetic. ABSOLUTELY ZERO BLUE COLOR IS USED.
// All objects have a unique ID, descriptive name, default width, and inline SVG data.
const DESK_ASSETS = {
  telephone: {
    name: 'Retro Clear Telephone',
    width: 130,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Coiled red cord -->
      <path d="M 15 55 Q 5 60 10 70 Q 15 80 5 85 Q -2 90 8 95 Q 18 90 28 85 T 15 70" fill="none" stroke="#C84B31" stroke-width="4" stroke-linecap="round"/>
      <path d="M 12 73 C 2 78 5 88 15 85" fill="none" stroke="#B03A2E" stroke-width="3" />
      <!-- Phone Casing (Semi-transparent Glass/Warm tone) -->
      <rect x="25" y="40" width="50" height="42" rx="10" fill="#F4EFEA" stroke="#4A3F35" stroke-width="2" opacity="0.9" />
      <rect x="29" y="44" width="42" height="34" rx="6" fill="#E8DFD8" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Dial buttons (Green pad) -->
      <rect x="35" y="52" width="30" height="22" rx="3" fill="#606C38" />
      <!-- Small Buttons grid -->
      <circle cx="40" cy="56" r="1.5" fill="#FEFAE0" />
      <circle cx="45" cy="56" r="1.5" fill="#FEFAE0" />
      <circle cx="50" cy="56" r="1.5" fill="#FEFAE0" />
      <circle cx="55" cy="56" r="1.5" fill="#FEFAE0" />
      <circle cx="60" cy="56" r="1.5" fill="#FEFAE0" />
      <circle cx="40" cy="61" r="1.5" fill="#FEFAE0" />
      <circle cx="45" cy="61" r="1.5" fill="#FEFAE0" />
      <circle cx="50" cy="61" r="1.5" fill="#FEFAE0" />
      <circle cx="55" cy="61" r="1.5" fill="#FEFAE0" />
      <circle cx="60" cy="61" r="1.5" fill="#FEFAE0" />
      <circle cx="40" cy="66" r="1.5" fill="#FEFAE0" />
      <circle cx="45" cy="66" r="1.5" fill="#FEFAE0" />
      <circle cx="50" cy="66" r="1.5" fill="#FEFAE0" />
      <circle cx="55" cy="66" r="1.5" fill="#FEFAE0" />
      <circle cx="60" cy="66" r="1.5" fill="#FEFAE0" />
      <!-- Red Handset -->
      <path d="M 18 32 C 18 20, 82 20, 82 32 C 82 38, 74 38, 72 34 C 70 30, 60 30, 58 34 C 54 36, 46 36, 42 34 C 40 30, 30 30, 28 34 C 26 38, 18 38, 18 32 Z" fill="#C84B31" stroke="#4A3F35" stroke-width="2"/>
      <!-- Details -->
      <rect x="42" y="22" width="16" height="4" rx="2" fill="#B03A2E" />
      <circle cx="26" cy="32" r="4" fill="#E07A5F" opacity="0.6"/>
      <circle cx="74" cy="32" r="4" fill="#E07A5F" opacity="0.6"/>
    </svg>`
  },
  disposable_camera: {
    name: 'Disposable Camera',
    width: 100,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Camera Body -->
      <rect x="15" y="30" width="70" height="42" rx="4" fill="#1E1E1E" stroke="#4A3F35" stroke-width="2" />
      <!-- Yellow Front Panel -->
      <path d="M 17 32 L 65 32 L 55 70 L 17 70 Z" fill="#DDA15E" />
      <!-- Red Front Accent -->
      <path d="M 65 32 L 83 32 L 83 70 L 55 70 Z" fill="#C84B31" />
      <!-- Flash Window -->
      <rect x="22" y="36" width="12" height="8" rx="1" fill="#FEFAE0" stroke="#1E1E1E" stroke-width="1.5" />
      <!-- Lens -->
      <circle cx="50" cy="51" r="16" fill="#1E1E1E" stroke="#DDA15E" stroke-width="2" />
      <circle cx="50" cy="51" r="11" fill="#4A3F35" />
      <circle cx="53" cy="48" r="4" fill="#FEFAE0" opacity="0.8" />
      <circle cx="48" cy="53" r="2" fill="#FFFFFF" opacity="0.4" />
      <!-- Top Shutter Button & Dial -->
      <rect x="25" y="26" width="10" height="4" fill="#888" stroke="#1E1E1E" stroke-width="1" />
      <rect x="70" y="27" width="12" height="3" fill="#333" />
      <circle cx="76" cy="38" r="3" fill="#DDA15E" />
    </svg>`
  },
  fishbowl: {
    name: 'Goldfish Bowl',
    width: 110,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Fishbowl Glass Outline -->
      <circle cx="50" cy="55" r="36" fill="#FAF6F0" fill-opacity="0.6" stroke="#4A3F35" stroke-width="2" />
      <!-- Water level -->
      <path d="M 17 44 Q 50 49 83 44 A 36 36 0 0 1 17 76 Z" fill="#E6DFD3" fill-opacity="0.8"/>
      <!-- Sand / Gravel (Warm Sand color, NO BLUE) -->
      <path d="M 22 79 Q 50 72 78 79 A 36 36 0 0 1 22 79 Z" fill="#DDA15E" opacity="0.9" />
      <circle cx="35" cy="80" r="2" fill="#C84B31" />
      <circle cx="45" cy="83" r="2.5" fill="#8C7864" />
      <circle cx="55" cy="81" r="2" fill="#E6DFD3" />
      <circle cx="65" cy="82" r="3" fill="#8C7864" />
      <!-- Sea Grass (Sage Green) -->
      <path d="M 40 76 Q 35 62 42 50 Q 45 60 44 76 Z" fill="#606C38" />
      <path d="M 45 76 Q 52 58 48 45 Q 43 55 47 76 Z" fill="#283618" opacity="0.8"/>
      <!-- Gold Fish (Orange) -->
      <path d="M 54 60 C 58 55, 68 56, 72 61 C 70 63, 62 65, 54 60 Z" fill="#E07A5F" />
      <path d="M 70 60 L 78 54 L 75 62 Z" fill="#E07A5F" /> <!-- Tail -->
      <circle cx="57" cy="58" r="0.8" fill="#1E1E1E" />
      <!-- Bowl Rim -->
      <ellipse cx="50" cy="21" rx="18" ry="4" fill="#FAF6F0" stroke="#4A3F35" stroke-width="2" />
      <!-- Reflections -->
      <path d="M 20 40 Q 28 28 42 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    </svg>`
  },
  pager: {
    name: 'Lime Green Pager',
    width: 95,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Pager body (Translucent Lime Green) -->
      <rect x="15" y="32" width="70" height="42" rx="8" fill="#A3B18A" stroke="#283618" stroke-width="2.5" />
      <!-- Inner frame -->
      <rect x="20" y="37" width="60" height="32" rx="4" fill="#8F9F76" stroke="#283618" stroke-width="1.5" />
      <!-- LCD Screen -->
      <rect x="25" y="42" width="38" height="18" rx="2" fill="#E6DFD3" stroke="#283618" stroke-width="1.5" />
      <!-- Digital Text -->
      <text x="28" y="55" font-family="monospace" font-weight="bold" font-size="9" fill="#283618">08:04 AM</text>
      <!-- Action buttons -->
      <circle cx="71" cy="46" r="3" fill="#C84B31" stroke="#283618" stroke-width="1" />
      <rect x="67" y="53" width="8" height="3" rx="1" fill="#E07A5F" stroke="#283618" stroke-width="1" />
      <!-- Speaker grill slits -->
      <line x1="25" y1="64" x2="35" y2="64" stroke="#283618" stroke-width="1.5" stroke-linecap="round" />
      <line x1="25" y1="67" x2="32" y2="67" stroke="#283618" stroke-width="1.5" stroke-linecap="round" />
      <!-- Clip ridge on the side -->
      <rect x="11" y="42" width="4" height="22" rx="1" fill="#283618" />
    </svg>`
  },
  milk_jug: {
    name: 'Milk Jug',
    width: 95,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Glass Jug Body -->
      <path d="M 40 25 C 38 35, 25 45, 25 65 C 25 82, 75 82, 75 65 C 75 45, 62 35, 60 25 Z" fill="#F4EFEA" fill-opacity="0.5" stroke="#4A3F35" stroke-width="2" />
      <!-- Handle -->
      <path d="M 60 32 C 75 35, 80 58, 68 66" fill="none" stroke="#4A3F35" stroke-width="2" stroke-linecap="round" />
      <!-- Milk Level -->
      <path d="M 27 60 C 27 60, 50 63, 73 60 C 74 72, 72 78, 50 79 C 28 78, 26 72, 27 60 Z" fill="#FDFBF7" stroke="#E6DFD3" stroke-width="1" />
      <!-- Pouring spout and neck -->
      <path d="M 38 25 Q 35 22 36 18 Q 50 21 64 18 Q 65 22 62 25 Z" fill="#F4EFEA" stroke="#4A3F35" stroke-width="2" />
      <ellipse cx="50" cy="19" rx="13" ry="2" fill="#E6DFD3" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Highlights -->
      <path d="M 32 55 C 30 65, 32 72, 36 76" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
    </svg>`
  },
  butter: {
    name: 'Butter block on plate',
    width: 105,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Plate (Tray) -->
      <ellipse cx="50" cy="65" rx="42" ry="16" fill="#8C7864" stroke="#4A3F35" stroke-width="2" />
      <ellipse cx="50" cy="63" rx="36" ry="12" fill="#D6CDCE" />
      <!-- Butter Block -->
      <path d="M 30 52 L 65 44 L 72 56 L 37 64 Z" fill="#E6C564" stroke="#4A3F35" stroke-width="2" /> <!-- Top -->
      <path d="M 30 52 L 37 64 L 37 72 L 30 60 Z" fill="#D2AF47" stroke="#4A3F35" stroke-width="2" /> <!-- Left Side -->
      <path d="M 37 64 L 72 56 L 72 64 L 37 72 Z" fill="#F4D373" stroke="#4A3F35" stroke-width="2" /> <!-- Front -->
      <!-- Knife -->
      <path d="M 18 50 L 52 48 L 54 53 L 20 54 Z" fill="#8C8C8C" stroke="#4A3F35" stroke-width="1.5" /> <!-- Blade -->
      <path d="M 52 48 L 82 30 L 85 34 L 54 53 Z" fill="#E8DFD8" stroke="#4A3F35" stroke-width="1.5" /> <!-- Handle -->
      <circle cx="80" cy="33" r="1.5" fill="#4A3F35" />
    </svg>`
  },
  alarm_clock: {
    name: 'Retro Silver Alarm Clock',
    width: 100,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Legs -->
      <line x1="30" y1="78" x2="20" y2="88" stroke="#4A3F35" stroke-width="4" stroke-linecap="round" />
      <line x1="70" y1="78" x2="80" y2="88" stroke="#4A3F35" stroke-width="4" stroke-linecap="round" />
      <!-- Twin Bells -->
      <path d="M 16 35 C 14 20, 36 24, 30 38 Z" fill="#D6CDCE" stroke="#4A3F35" stroke-width="2" />
      <path d="M 84 35 C 86 20, 64 24, 70 38 Z" fill="#D6CDCE" stroke="#4A3F35" stroke-width="2" />
      <!-- Bell supports -->
      <rect x="25" y="32" width="6" height="8" transform="rotate(-20, 25, 32)" fill="#8C7864" />
      <rect x="69" y="30" width="6" height="8" transform="rotate(20, 69, 30)" fill="#8C7864" />
      <path d="M 45 22 L 55 22 L 50 32 Z" fill="#8C7864" stroke="#4A3F35" stroke-width="1.5"/>
      <!-- Main Case -->
      <circle cx="50" cy="58" r="30" fill="#E8DFD8" stroke="#4A3F35" stroke-width="2.5" />
      <circle cx="50" cy="58" r="26" fill="#FDFBF7" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Clock Face Numbers (Ticks) -->
      <circle cx="50" cy="37" r="1.5" fill="#4A3F35" />
      <circle cx="71" cy="58" r="1.5" fill="#4A3F35" />
      <circle cx="50" cy="79" r="1.5" fill="#4A3F35" />
      <circle cx="29" cy="58" r="1.5" fill="#4A3F35" />
      <!-- Clock Hands pointing to 8:04 -->
      <line x1="50" y1="58" x2="38" y2="50" stroke="#1E1E1E" stroke-width="2" stroke-linecap="round" /> <!-- Hour -->
      <line x1="50" y1="58" x2="52" y2="39" stroke="#1E1E1E" stroke-width="1.5" stroke-linecap="round" /> <!-- Minute -->
      <circle cx="50" cy="58" r="2.5" fill="#C84B31" />
    </svg>`
  },
  mug: {
    name: 'Checkered Mug',
    width: 95,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Handle -->
      <path d="M 72 45 C 88 45, 88 75, 72 75" fill="none" stroke="#1E1E1E" stroke-width="6" stroke-linecap="round"/>
      <path d="M 72 45 C 88 45, 88 75, 72 75" fill="none" stroke="#FDFBF7" stroke-width="2" stroke-linecap="round"/>
      <!-- Mug Body Checkered Pattern -->
      <rect x="25" y="35" width="48" height="48" rx="4" fill="#1E1E1E" stroke="#1E1E1E" stroke-width="2" />
      <!-- White Squares -->
      <rect x="27" y="37" width="11" height="11" fill="#FDFBF7" />
      <rect x="49" y="37" width="11" height="11" fill="#FDFBF7" />
      <rect x="38" y="48" width="11" height="11" fill="#FDFBF7" />
      <rect x="60" y="48" width="11" height="11" fill="#FDFBF7" />
      <rect x="27" y="59" width="11" height="11" fill="#FDFBF7" />
      <rect x="49" y="59" width="11" height="11" fill="#FDFBF7" />
      <rect x="38" y="70" width="11" height="11" fill="#FDFBF7" />
      <rect x="60" y="70" width="11" height="11" fill="#FDFBF7" />
      <!-- Pens standing inside -->
      <path d="M 32 35 L 26 15 L 34 15 Z" fill="#C84B31" stroke="#1E1E1E" stroke-width="1.5" />
      <path d="M 45 35 L 45 12 L 53 12 L 53 35 Z" fill="#606C38" stroke="#1E1E1E" stroke-width="1.5" />
      <path d="M 58 35 L 64 18 L 70 20 Z" fill="#DDA15E" stroke="#1E1E1E" stroke-width="1.5" />
    </svg>`
  },
  teddy_bear: {
    name: 'Teddy Bear',
    width: 105,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Ears -->
      <circle cx="32" cy="30" r="10" fill="#8C7864" stroke="#4A3F35" stroke-width="2" />
      <circle cx="32" cy="30" r="5" fill="#D6CDCE" />
      <circle cx="68" cy="30" r="10" fill="#8C7864" stroke="#4A3F35" stroke-width="2" />
      <circle cx="68" cy="30" r="5" fill="#D6CDCE" />
      <!-- Head -->
      <circle cx="50" cy="45" r="22" fill="#8C7864" stroke="#4A3F35" stroke-width="2" />
      <!-- Snout & Nose -->
      <ellipse cx="50" cy="50" rx="7" ry="5" fill="#FAF6F0" />
      <polygon points="47,48 53,48 50,51" fill="#4A3F35" />
      <!-- Sunglasses (Cool Bear) -->
      <rect x="31" y="38" width="16" height="9" rx="3" fill="#1E1E1E" />
      <rect x="53" y="38" width="16" height="9" rx="3" fill="#1E1E1E" />
      <line x1="47" y1="41" x2="53" y2="41" stroke="#1E1E1E" stroke-width="2.5" />
      <!-- Folded Arms & Body in White Shirt -->
      <path d="M 28 67 C 28 62, 72 62, 72 67 L 70 90 L 30 90 Z" fill="#FEFAE0" stroke="#4A3F35" stroke-width="2" />
      <path d="M 32 67 C 32 78, 68 78, 68 67" fill="none" stroke="#4A3F35" stroke-width="2" />
      <ellipse cx="50" cy="74" rx="14" ry="4" fill="#DDA15E" opacity="0.6"/>
    </svg>`
  },
  egg_carton: {
    name: 'Egg Carton',
    width: 100,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Carton box closed -->
      <path d="M 20 45 L 80 45 L 75 75 L 25 75 Z" fill="#E8DFD8" stroke="#4A3F35" stroke-width="2" />
      <path d="M 18 43 L 82 43 L 80 50 L 20 50 Z" fill="#F4EFEA" stroke="#4A3F35" stroke-width="2" />
      <!-- Latch -->
      <rect x="46" y="50" width="8" height="10" rx="2" fill="#D6CDCE" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Label stamped on top -->
      <rect x="30" y="52" width="12" height="18" fill="none" stroke="#8C7864" stroke-dasharray="2,2" />
      <text x="32" y="64" font-family="monospace" font-size="5" fill="#8C7864">N°6</text>
      <!-- Carton Ridges -->
      <line x1="28" y1="43" x2="28" y2="75" stroke="#D6CDCE" stroke-width="1.5" />
      <line x1="62" y1="43" x2="62" y2="75" stroke="#D6CDCE" stroke-width="1.5" />
    </svg>`
  },
  sardine_tin: {
    name: 'Sardine Tin',
    width: 105,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Canned Sardines oval silver -->
      <rect x="15" y="35" width="70" height="36" rx="10" fill="#D6CDCE" stroke="#4A3F35" stroke-width="2" />
      <rect x="18" y="38" width="64" height="30" rx="8" fill="#FAF6F0" stroke="#8C7864" stroke-width="1" />
      <!-- Label "SKARPSILL" -->
      <rect x="25" y="42" width="50" height="22" fill="#E07A5F" rx="2" />
      <text x="29" y="52" font-family="sans-serif" font-weight="bold" font-size="5.5" fill="#FEFAE0">SKARPSILL</text>
      <!-- Small Fish Drawing inside label -->
      <path d="M 35 58 Q 48 55 60 58 Q 63 56 65 59 Q 62 61 60 59" fill="none" stroke="#FEFAE0" stroke-width="0.8" />
      <!-- Tin key peel ring -->
      <circle cx="21" cy="53" r="3.5" fill="none" stroke="#4A3F35" stroke-width="1.5" />
      <line x1="24" y1="53" x2="28" y2="53" stroke="#4A3F35" stroke-width="1.5" />
    </svg>`
  },
  gummy_bear: {
    name: 'Gummy Bear',
    width: 70,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Gummy bear glossy orange/amber -->
      <!-- Ears -->
      <circle cx="35" cy="28" r="10" fill="#DDA15E" opacity="0.8" />
      <circle cx="65" cy="28" r="10" fill="#DDA15E" opacity="0.8" />
      <!-- Head -->
      <circle cx="50" cy="40" r="18" fill="#E07A5F" />
      <!-- Snout -->
      <circle cx="50" cy="44" r="5" fill="#FEFAE0" opacity="0.4" />
      <!-- Body -->
      <rect x="32" y="52" width="36" height="30" rx="10" fill="#E07A5F" />
      <!-- Arms -->
      <rect x="22" y="54" width="10" height="15" rx="5" fill="#DDA15E" opacity="0.9" />
      <rect x="68" y="54" width="10" height="15" rx="5" fill="#DDA15E" opacity="0.9" />
      <!-- Legs -->
      <rect x="30" y="78" width="14" height="12" rx="4" fill="#DDA15E" />
      <rect x="56" y="78" width="14" height="12" rx="4" fill="#DDA15E" />
      <!-- Gloss highlights -->
      <ellipse cx="44" cy="36" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.6" transform="rotate(-30, 44, 36)" />
      <path d="M 38 60 Q 36 68 38 72" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.4" />
    </svg>`
  },
  billiard_14: {
    name: 'Billiard 14 Ball',
    width: 80,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Green Billiard ball -->
      <circle cx="50" cy="50" r="38" fill="#606C38" stroke="#283618" stroke-width="2.5" />
      <!-- White central circle -->
      <circle cx="50" cy="50" r="16" fill="#FDFBF7" />
      <!-- Number 14 -->
      <text x="50" y="56" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle" fill="#1E1E1E">14</text>
      <!-- Shadow/Shine -->
      <path d="M 24 32 A 38 38 0 0 1 76 32 A 38 38 0 0 0 24 32 Z" fill="#FFFFFF" fill-opacity="0.15" />
      <ellipse cx="40" cy="24" rx="8" ry="4" fill="#FFFFFF" opacity="0.4" transform="rotate(-20, 40, 24)" />
    </svg>`
  },
  key: {
    name: 'Silver Key',
    width: 85,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Key Ring Head -->
      <circle cx="35" cy="50" r="18" fill="none" stroke="#4A3F35" stroke-width="4.5" />
      <circle cx="35" cy="50" r="18" fill="none" stroke="#D6CDCE" stroke-width="2" />
      <circle cx="35" cy="50" r="6" fill="#FDFBF7" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Key Shaft -->
      <rect x="52" y="47" width="34" height="6" fill="#D6CDCE" stroke="#4A3F35" stroke-width="2" />
      <!-- Key teeth -->
      <rect x="72" y="53" width="5" height="8" fill="#D6CDCE" stroke="#4A3F35" stroke-width="2" />
      <rect x="80" y="53" width="6" height="5" fill="#D6CDCE" stroke="#4A3F35" stroke-width="2" />
      <!-- Details -->
      <line x1="53" y1="50" x2="80" y2="50" stroke="#8C7864" stroke-width="1" />
    </svg>`
  },
  toy_gun: {
    name: 'Water Toy Gun',
    width: 95,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Transparent pink/orange toy gun -->
      <path d="M 20 40 L 68 38 L 72 48 L 48 50 L 45 74 L 32 74 L 34 50 L 20 48 Z" fill="#E07A5F" fill-opacity="0.8" stroke="#C84B31" stroke-width="2" />
      <!-- Trigger guard & trigger -->
      <path d="M 34 50 Q 42 56 46 50" fill="none" stroke="#C84B31" stroke-width="2" />
      <path d="M 39 49 Q 37 54 39 54" fill="none" stroke="#4A3F35" stroke-width="2" />
      <!-- Water chamber cap -->
      <ellipse cx="50" cy="35" rx="10" ry="4" fill="#DDA15E" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Nozzle tip -->
      <rect x="15" y="41" width="5" height="4" fill="#DDA15E" stroke="#4A3F35" stroke-width="1" />
    </svg>`
  },
  globe_notes: {
    name: 'Desk Globe and Notes',
    width: 105,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Stack of Notes (Beige/Cream) -->
      <polygon points="15,75 60,65 85,78 40,88" fill="#E8DFD8" stroke="#4A3F35" stroke-width="1.5" />
      <polygon points="15,72 60,62 85,75 40,85" fill="#FEFAE0" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Globe Stand -->
      <path d="M 38 68 C 38 52, 68 52, 68 68" fill="none" stroke="#8C7864" stroke-width="3.5" />
      <rect x="42" y="68" width="16" height="4" rx="1" fill="#4A3F35" />
      <!-- Globe Ball (Beige/Green, NO BLUE) -->
      <circle cx="53" cy="46" r="18" fill="#E6DFD3" stroke="#4A3F35" stroke-width="2" />
      <!-- Landmasses (Sage Green) -->
      <path d="M 40 40 Q 48 35 46 44 Q 40 48 40 40" fill="#A3B18A" />
      <path d="M 52 46 Q 64 38 60 48 Q 50 56 52 46" fill="#A3B18A" />
      <path d="M 48 56 Q 52 62 55 58 Z" fill="#A3B18A" />
      <!-- Meridian line -->
      <ellipse cx="53" cy="46" rx="18" ry="4" fill="none" stroke="#4A3F35" stroke-width="1.2" stroke-dasharray="2,2" transform="rotate(-30, 53, 46)" />
    </svg>`
  },
  tumbler: {
    name: 'White Ribbed Tumbler',
    width: 80,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Tumbler Body (Ribbed White) -->
      <path d="M 34 32 L 66 32 L 60 84 L 40 84 Z" fill="#FDFBF7" stroke="#4A3F35" stroke-width="2" />
      <!-- Ribbed Verticals -->
      <line x1="44" y1="36" x2="44" y2="80" stroke="#E8DFD8" stroke-width="1.5" />
      <line x1="50" y1="36" x2="50" y2="80" stroke="#E8DFD8" stroke-width="2" />
      <line x1="56" y1="36" x2="56" y2="80" stroke="#E8DFD8" stroke-width="1.5" />
      <!-- Lid -->
      <rect x="31" y="27" width="38" height="6" rx="2" fill="#FAF6F0" stroke="#4A3F35" stroke-width="2" />
      <!-- Straw curved -->
      <path d="M 50 27 L 50 12 Q 50 6 56 6 L 62 6" fill="none" stroke="#DDA15E" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  cat_plush: {
    name: 'Cat Face Plush',
    width: 100,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Cute Grey Cat Pillow -->
      <!-- Ears with Pink insides -->
      <polygon points="20,40 10,12 38,26" fill="#D6CDCE" stroke="#4A3F35" stroke-width="2" />
      <polygon points="23,35 17,18 34,26" fill="#E07A5F" opacity="0.6" />
      <polygon points="80,40 90,12 62,26" fill="#D6CDCE" stroke="#4A3F35" stroke-width="2" />
      <polygon points="77,35 83,18 66,26" fill="#E07A5F" opacity="0.6" />
      <!-- Head Base -->
      <ellipse cx="50" cy="50" rx="34" ry="26" fill="#D6CDCE" stroke="#4A3F35" stroke-width="2" />
      <!-- Eyes big and cute -->
      <ellipse cx="38" cy="46" rx="4" ry="5.5" fill="#1E1E1E" />
      <circle cx="36.5" cy="44" r="1.5" fill="#FFFFFF" />
      <ellipse cx="62" cy="46" rx="4" ry="5.5" fill="#1E1E1E" />
      <circle cx="60.5" cy="44" r="1.5" fill="#FFFFFF" />
      <!-- Cheeks Pink -->
      <ellipse cx="30" cy="54" rx="5" ry="3" fill="#E07A5F" opacity="0.7"/>
      <ellipse cx="70" cy="54" rx="5" ry="3" fill="#E07A5F" opacity="0.7"/>
      <!-- Mouth W-shape -->
      <path d="M 46 54 Q 48 57 50 54 Q 52 57 54 54" fill="none" stroke="#4A3F35" stroke-width="2" stroke-linecap="round" />
      <!-- Whiskers -->
      <line x1="22" y1="50" x2="10" y2="48" stroke="#4A3F35" stroke-width="1.5" />
      <line x1="22" y1="54" x2="8" y2="55" stroke="#4A3F35" stroke-width="1.5" />
      <line x1="78" y1="50" x2="90" y2="48" stroke="#4A3F35" stroke-width="1.5" />
      <line x1="78" y1="54" x2="92" y2="55" stroke="#4A3F35" stroke-width="1.5" />
    </svg>`
  },
  incense: {
    name: 'Incense Burner',
    width: 90,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Dish (Terracotta/Gold ceramic) -->
      <ellipse cx="50" cy="65" rx="30" ry="10" fill="#D67B52" stroke="#4A3F35" stroke-width="2" />
      <ellipse cx="50" cy="63" rx="24" ry="7" fill="#DDA15E" />
      <!-- Incense Holder Ball -->
      <circle cx="50" cy="61" r="5" fill="#8C7864" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Incense Stick (Sage Green/Brown stick) -->
      <line x1="50" y1="61" x2="30" y2="18" stroke="#8C7864" stroke-width="2" />
      <!-- Glowing Red ember -->
      <circle cx="30" cy="18" r="2" fill="#C84B31" />
      <!-- Smoke path -->
      <path d="M 30 18 Q 25 10 32 4 T 26 -4" fill="none" stroke="#E8DFD8" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    </svg>`
  },
  phone_charger: {
    name: 'Phone on Charging Stand',
    width: 100,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Charger Stand -->
      <rect x="35" y="70" width="30" height="8" rx="4" fill="#8C7864" stroke="#4A3F35" stroke-width="2" />
      <line x1="50" y1="70" x2="50" y2="44" stroke="#4A3F35" stroke-width="3" />
      <!-- Phone angled -->
      <rect x="32" y="24" width="36" height="42" rx="4" transform="rotate(-10, 50, 45)" fill="#1E1E1E" stroke="#4A3F35" stroke-width="2" />
      <!-- Battery charging screen details -->
      <rect x="36" y="27" width="28" height="36" rx="2" transform="rotate(-10, 50, 45)" fill="#2C2621" />
      <!-- Charging Lightning Bolt (Green/Gold) -->
      <polygon points="46,38 54,38 48,46 54,46 44,56 48,46 42,46" transform="rotate(-10, 50, 45)" fill="#A3B18A" />
      <!-- Small watch charging on side -->
      <circle cx="72" cy="52" r="8" fill="#1E1E1E" stroke="#4A3F35" stroke-width="1.5" />
      <path d="M 72 44 L 72 60" stroke="#4A3F35" stroke-width="3" stroke-linecap="round" />
    </svg>`
  },
  panda_pad: {
    name: 'Panda Mousepad',
    width: 110,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Soft Cream mousepad base -->
      <ellipse cx="50" cy="55" rx="42" ry="32" fill="#E8DFD8" stroke="#8C7864" stroke-width="1.5" />
      <!-- Panda illustration in center -->
      <!-- Body -->
      <ellipse cx="50" cy="58" rx="20" ry="14" fill="#FAF6F0" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Back feet & Arms black -->
      <ellipse cx="36" cy="62" rx="6" ry="8" fill="#1E1E1E" />
      <ellipse cx="64" cy="62" rx="6" ry="8" fill="#1E1E1E" />
      <!-- Head -->
      <circle cx="50" cy="42" r="12" fill="#FAF6F0" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Ears black -->
      <circle cx="40" cy="34" r="4.5" fill="#1E1E1E" />
      <circle cx="60" cy="34" r="4.5" fill="#1E1E1E" />
      <!-- Eye patches black -->
      <ellipse cx="46" cy="42" rx="2.5" ry="3.5" fill="#1E1E1E" transform="rotate(-15, 46, 42)" />
      <ellipse cx="54" cy="42" rx="2.5" ry="3.5" fill="#1E1E1E" transform="rotate(15, 54, 42)" />
      <!-- Tiny white eyes -->
      <circle cx="46" cy="41" r="0.8" fill="#FFFFFF" />
      <circle cx="54" cy="41" r="0.8" fill="#FFFFFF" />
      <polygon points="49,46 51,46 50,47.5" fill="#1E1E1E" />
      <!-- Text label -->
      <rect x="36" y="74" width="28" height="8" rx="2" fill="#4A3F35" />
      <text x="50" y="80" font-family="sans-serif" font-weight="bold" font-size="5" text-anchor="middle" fill="#FEFAE0">PANDA</text>
    </svg>`
  },
  tomato: {
    name: 'Tomato',
    width: 80,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Shiny Red Tomato -->
      <circle cx="50" cy="52" r="34" fill="#C84B31" stroke="#4A3F35" stroke-width="2" />
      <!-- Leaves crown on top (Sage Green) -->
      <polygon points="50,22 47,15 45,22" fill="#606C38" stroke="#4A3F35" stroke-width="1" />
      <polygon points="50,22 55,16 53,22" fill="#606C38" stroke="#4A3F35" stroke-width="1" />
      <polygon points="50,22 42,20 48,23" fill="#606C38" stroke="#4A3F35" stroke-width="1" />
      <polygon points="50,22 58,20 52,23" fill="#606C38" stroke="#4A3F35" stroke-width="1" />
      <polygon points="50,22 50,26 50,22" fill="#606C38" stroke="#4A3F35" stroke-width="1" />
      <!-- Highlights -->
      <ellipse cx="38" cy="38" rx="8" ry="4" fill="#FFFFFF" opacity="0.4" transform="rotate(-30, 38, 38)" />
      <!-- Shadow gradient overlay -->
      <path d="M 22 66 A 34 34 0 0 0 78 66 A 34 34 0 0 1 22 66 Z" fill="#1E1E1E" opacity="0.15" />
    </svg>`
  },
  glasses: {
    name: 'Black Glasses',
    width: 90,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Retro thick black frames -->
      <!-- Left frame -->
      <rect x="18" y="42" width="28" height="22" rx="8" fill="none" stroke="#1E1E1E" stroke-width="4.5" />
      <rect x="20" y="44" width="24" height="18" rx="6" fill="#FAF6F0" fill-opacity="0.4" stroke="#8C7864" stroke-width="1" />
      <!-- Right frame -->
      <rect x="54" y="42" width="28" height="22" rx="8" fill="none" stroke="#1E1E1E" stroke-width="4.5" />
      <rect x="56" y="44" width="24" height="18" rx="6" fill="#FAF6F0" fill-opacity="0.4" stroke="#8C7864" stroke-width="1" />
      <!-- Bridge -->
      <path d="M 46 48 Q 50 44 54 48" fill="none" stroke="#1E1E1E" stroke-width="4" />
      <!-- Temples / Arms -->
      <path d="M 18 46 Q 10 40 4 48" fill="none" stroke="#1E1E1E" stroke-width="3" stroke-linecap="round" />
      <path d="M 82 46 Q 90 40 96 48" fill="none" stroke="#1E1E1E" stroke-width="3" stroke-linecap="round" />
      <!-- Refraction highlight -->
      <line x1="24" y1="46" x2="38" y2="60" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6" />
      <line x1="60" y1="46" x2="74" y2="60" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6" />
    </svg>`
  },
  shrimp: {
    name: 'Aesthetic Cooked Shrimp',
    width: 80,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Curved Orange-Pink Cooked Shrimp -->
      <path d="M 28 65 C 22 45, 42 22, 68 25 C 72 26, 75 32, 70 36 C 52 32, 38 48, 42 62 C 43 65, 34 68, 28 65 Z" fill="#E07A5F" stroke="#4A3F35" stroke-width="2" />
      <!-- Tail fins -->
      <path d="M 68 25 L 82 12 L 80 24 L 68 25 Z" fill="#D67B52" stroke="#4A3F35" stroke-width="1.5" />
      <path d="M 68 25 L 86 21 L 78 28 L 68 25 Z" fill="#D67B52" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Segments striping (Mustard yellow/cream stripes) -->
      <path d="M 38 35 Q 44 32 48 37" fill="none" stroke="#FEFAE0" stroke-width="2.5" />
      <path d="M 32 46 Q 40 43 42 50" fill="none" stroke="#FEFAE0" stroke-width="2.5" />
      <path d="M 32 58 Q 38 56 38 62" fill="none" stroke="#FEFAE0" stroke-width="2.5" />
    </svg>`
  },
  desk_organizer: {
    name: 'Desk Letter Organizer',
    width: 95,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Letter Holder base -->
      <rect x="20" y="55" width="60" height="25" rx="3" fill="#2C2621" stroke="#4A3F35" stroke-width="2" />
      <!-- Slots and letters -->
      <!-- Back letter (yellow) -->
      <rect x="25" y="24" width="50" height="38" rx="2" fill="#DDA15E" stroke="#4A3F35" stroke-width="1.5" />
      <line x1="32" y1="32" x2="68" y2="32" stroke="#FAF6F0" stroke-width="2" />
      <line x1="32" y1="38" x2="58" y2="38" stroke="#FAF6F0" stroke-width="2" />
      <!-- Front letter (white) -->
      <rect x="32" y="38" width="40" height="28" rx="2" fill="#FAF6F0" stroke="#4A3F35" stroke-width="1.5" />
      <line x1="38" y1="44" x2="66" y2="44" stroke="#8C7864" stroke-width="1.5" />
      <line x1="38" y1="50" x2="56" y2="50" stroke="#8C7864" stroke-width="1.5" />
      <!-- Front acrylic panel (terracotta) -->
      <rect x="16" y="62" width="68" height="18" rx="2" fill="#D67B52" fill-opacity="0.8" stroke="#4A3F35" stroke-width="1.5" />
    </svg>`
  },
  hourglass: {
    name: 'Aesthetic Hourglass',
    width: 95,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Top and Bottom Bases (warm charcoal wood) -->
      <rect x="28" y="14" width="44" height="8" rx="2" fill="#2C2621" stroke="#4A3F35" stroke-width="2" />
      <rect x="28" y="78" width="44" height="8" rx="2" fill="#2C2621" stroke="#4A3F35" stroke-width="2" />
      <!-- Pillars decoration -->
      <rect x="31" y="22" width="4" height="56" rx="1" fill="#4A3F35" />
      <rect x="65" y="22" width="4" height="56" rx="1" fill="#4A3F35" />
      <!-- Hourglass Glass Body -->
      <path d="M 35 22 C 35 39, 47 46, 47 50 C 47 54, 35 61, 35 78 L 65 78 C 65 61, 53 54, 53 50 C 53 46, 65 39, 65 22 Z" fill="#FAF6F0" fill-opacity="0.85" stroke="#4A3F35" stroke-width="2.5" />
      <!-- Sand Top (Orange/Terracotta) -->
      <path d="M 37 22 L 63 22 C 63 32, 57 41, 52 45 C 51 46, 49 46, 48 45 C 43 41, 37 32, 37 22 Z" fill="#E07A5F" />
      <!-- Sand Bottom pile -->
      <path d="M 39 78 C 39 70, 44 65, 50 65 C 56 65, 61 70, 61 78 Z" fill="#E07A5F" />
      <!-- Falling static stream -->
      <line x1="50" y1="48" x2="50" y2="72" stroke="#E07A5F" stroke-width="1.5" stroke-dasharray="2,2" />
    </svg>`
  },
  google_calendar: {
    name: 'Google Calendar Stand',
    width: 95,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Desk Stand base (dark warm charcoal wood) -->
      <path d="M 18 78 L 82 78 L 74 68 L 26 68 Z" fill="#2C2621" stroke="#4A3F35" stroke-width="1.5" />
      <!-- Support Ring loops -->
      <circle cx="38" cy="22" r="4" fill="none" stroke="#8C7864" stroke-width="2.5" />
      <circle cx="62" cy="22" r="4" fill="none" stroke="#8C7864" stroke-width="2.5" />
      <!-- Calendar Main Card Paper -->
      <rect x="24" y="24" width="52" height="48" rx="4" fill="#FAF6F0" stroke="#4A3F35" stroke-width="2" />
      <!-- Banner / Header stripe with blue color -->
      <path d="M 24 28 C 24 26, 26 24, 28 24 L 72 24 C 74 24, 76 26, 76 28 L 76 38 L 24 38 Z" fill="#4285F4" stroke="#4A3F35" stroke-width="2" />
      <!-- Calendar Bind lines inside paper -->
      <line x1="38" y1="20" x2="38" y2="28" stroke="#4A3F35" stroke-width="2.5" />
      <line x1="62" y1="20" x2="62" y2="28" stroke="#4A3F35" stroke-width="2.5" />
      <!-- Minimalist Grid dots / lines mapping days with Google colors -->
      <rect x="32" y="44" width="8" height="6" rx="1.5" fill="#EA4335" />
      <rect x="46" y="44" width="8" height="6" rx="1.5" fill="#FBBC05" />
      <rect x="60" y="44" width="8" height="6" rx="1.5" fill="#34A853" />
      <rect x="32" y="56" width="8" height="6" rx="1.5" fill="#4285F4" />
      <rect x="46" y="56" width="8" height="6" rx="1.5" fill="#4A3F35" />
      <rect x="60" y="56" width="8" height="6" rx="1.5" fill="#8C7864" />
    </svg>`
  },
  wallet: {
    name: 'Dompet',
    width: 110,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M 15 30 Q 15 15 28 15 L 72 15 Q 85 15 85 30" fill="#E8C99A" stroke="#4A3F35" stroke-width="1.5" fill-opacity="0.7"/>
      <rect x="30" y="18" width="40" height="4" rx="2" fill="#C84B31" opacity="0.5"/>
      <rect x="0" y="30" width="100" height="65" rx="8" fill="#DDA15E" stroke="#4A3F35" stroke-width="2"/>
      <rect x="0" y="30" width="100" height="18" rx="4" fill="#C84B31" stroke="#4A3F35" stroke-width="1.5"/>
      <rect x="55" y="48" width="45" height="28" rx="6" fill="#FAF6F0" stroke="#4A3F35" stroke-width="1.5"/>
      <circle cx="92" cy="62" r="6" fill="#DDA15E" stroke="#4A3F35" stroke-width="1.5"/>
      <circle cx="92" cy="62" r="2.5" fill="#4A3F35"/>
      <line x1="10" y1="62" x2="48" y2="62" stroke="#4A3F35" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10" y1="70" x2="35" y2="70" stroke="#4A3F35" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  brain_insight: {
    name: 'Otak Insight',
    width: 110,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M 50 85 L 50 68" stroke="#8C7864" stroke-width="2" stroke-linecap="round"/>
      <rect x="38" y="85" width="24" height="6" rx="3" fill="#8C7864" stroke="#4A3F35" stroke-width="1.5"/>
      <path d="M 50 24 Q 50 38 50 68" fill="none" stroke="#4A3F35" stroke-width="1.2" stroke-dasharray="2,2"/>
      <path d="M 50 24 Q 56 20 64 26 Q 72 32 70 42 Q 68 50 58 54 Q 50 58 50 68" fill="#E8C99A" stroke="#4A3F35" stroke-width="2"/>
      <path d="M 50 24 Q 44 20 36 26 Q 28 32 30 42 Q 32 50 42 54 Q 50 58 50 68" fill="#E8C99A" stroke="#4A3F35" stroke-width="2"/>
      <path d="M 36 38 Q 44 42 50 40" fill="none" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 64 38 Q 56 42 50 40" fill="none" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 34 50 Q 42 48 50 50" fill="none" stroke="#606C38" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 66 50 Q 58 48 50 50" fill="none" stroke="#606C38" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="30" cy="32" r="4" fill="#DDA15E" stroke="#4A3F35" stroke-width="1.2"/>
      <circle cx="70" cy="32" r="4" fill="#DDA15E" stroke="#4A3F35" stroke-width="1.2"/>
      <line x1="22" y1="20" x2="18" y2="14" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15" y1="24" x2="9" y2="23" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="20" y1="30" x2="14" y2="32" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="78" y1="20" x2="82" y2="14" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="85" y1="24" x2="91" y2="23" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="80" y1="30" x2="86" y2="32" stroke="#C84B31" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  plant_growth: {
    name: 'Plant Growth',
    width: 110,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="75" width="50" height="20" rx="5" fill="#DDA15E" stroke="#4A3F35" stroke-width="2"/>
      <rect x="28" y="78" width="44" height="8" rx="2" fill="#C89A5A" opacity="0.5"/>
      <line x1="50" y1="75" x2="50" y2="32" stroke="#606C38" stroke-width="3" stroke-linecap="round"/>
      <path d="M 50 57 Q 35 52 28 40 Q 38 38 50 48" fill="#606C38" stroke="#4A3F35" stroke-width="1.2"/>
      <path d="M 50 44 Q 65 38 72 26 Q 62 24 50 34" fill="#283618" stroke="#4A3F35" stroke-width="1.2"/>
      <path d="M 50 32 Q 42 22 44 10 Q 52 16 54 30" fill="#606C38" stroke="#4A3F35" stroke-width="1.2"/>
      <circle cx="50" cy="8" r="5" fill="#C84B31" stroke="#4A3F35" stroke-width="1.5"/>
      <line x1="47" y1="8" x2="53" y2="8" stroke="#FAF6F0" stroke-width="1.5"/>
      <line x1="50" y1="5" x2="50" y2="11" stroke="#FAF6F0" stroke-width="1.5"/>
    </svg>`
  },
  laptop: {
    name: 'Laptop',
    width: 120,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="12" width="90" height="58" rx="5" fill="#E8DFD8" stroke="#4A3F35" stroke-width="2"/>
      <rect x="10" y="17" width="80" height="48" rx="3" fill="#FAF6F0" stroke="#4A3F35" stroke-width="1.5"/>
      <rect x="14" y="21" width="72" height="40" rx="2" fill="#283618"/>
      <rect x="18" y="25" width="30" height="4" rx="1" fill="#606C38" opacity="0.8"/>
      <rect x="18" y="32" width="20" height="3" rx="1" fill="#DDA15E" opacity="0.7"/>
      <rect x="18" y="38" width="25" height="3" rx="1" fill="#DDA15E" opacity="0.5"/>
      <rect x="18" y="44" width="18" height="3" rx="1" fill="#DDA15E" opacity="0.4"/>
      <rect x="54" y="30" width="6" height="14" rx="1" fill="#C84B31" opacity="0.85"/>
      <rect x="63" y="35" width="6" height="9" rx="1" fill="#DDA15E" opacity="0.85"/>
      <rect x="72" y="27" width="6" height="17" rx="1" fill="#606C38" opacity="0.85"/>
      <path d="M 0 72 Q 0 70 5 70 L 95 70 Q 100 70 100 72 L 100 76 Q 100 78 50 78 Q 0 78 0 76 Z" fill="#DDA15E" stroke="#4A3F35" stroke-width="1.5"/>
      <rect x="30" y="70" width="40" height="4" rx="1" fill="#C89A5A" opacity="0.6"/>
      <circle cx="50" cy="68" r="2" fill="#8C7864"/>
    </svg>`
  },
  matcha_cup: {
    name: 'Minuman Matcha',
    width: 110,
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M 36 44 Q 33 36 36 28" fill="none" stroke="#8C7864" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <path d="M 50 40 Q 47 30 50 20" fill="none" stroke="#8C7864" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <path d="M 64 44 Q 67 36 64 28" fill="none" stroke="#8C7864" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <ellipse cx="50" cy="88" rx="38" ry="7" fill="#DDA15E" stroke="#4A3F35" stroke-width="1.5"/>
      <path d="M 18 52 Q 16 88 50 88 Q 84 88 82 52 Z" fill="#FAF6F0" stroke="#4A3F35" stroke-width="2"/>
      <ellipse cx="50" cy="52" rx="32" ry="7" fill="#E8DFD8" stroke="#4A3F35" stroke-width="2"/>
      <path d="M 22 58 Q 20 88 50 88 Q 80 88 78 58 Q 64 64 50 64 Q 36 64 22 58 Z" fill="#606C38" opacity="0.85"/>
      <ellipse cx="50" cy="58" rx="28" ry="6" fill="#E8DFD8" stroke="#4A3F35" stroke-width="1"/>
      <path d="M 34 58 Q 42 54 50 58 Q 58 62 66 58" fill="none" stroke="#606C38" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 38 55 Q 44 58 50 55 Q 56 52 62 55" fill="none" stroke="#8C7864" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
      <path d="M 82 60 Q 96 60 96 70 Q 96 80 82 80" fill="none" stroke="#4A3F35" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  }
};
