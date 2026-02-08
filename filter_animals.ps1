# PowerShell script to Filter Animals by Image Existence
# Generates a new digimon-data.js containing ONLY animals with valid local images

$animals = @(
    # FIRE / BEASTS
    @{name="African Lion";      type="fire"; img="African_Lion.jpg";      stats=@{hp=100; atk=35; def=20; spd=22}; skills=@("King's Roar", "Pride Assault", "Neck Bite")},
    @{name="Bengal Tiger";      type="fire"; img="Bengal_Tiger.jpg";      stats=@{hp=100; atk=38; def=18; spd=24}; skills=@("Ambush", "Jungle Fury", "Tiger Claw")},
    @{name="Grizzly Bear";      type="fire"; img="Grizzly_Bear.jpg";      stats=@{hp=100; atk=40; def=25; spd=15}; skills=@("Maul", "Bear Hug", "Savage Swipe")},
    @{name="Komodo Dragon";     type="fire"; img="Komodo_Dragon.jpg";     stats=@{hp=100; atk=32; def=22; spd=18}; skills=@("Venom Bite", "Tail Whip", "Bacteria Infect")},
    @{name="Jaguar";            type="fire"; img="Jaguar.jpg";            stats=@{hp=100; atk=36; def=18; spd=26}; skills=@("Skull Bite", "Silent Stalk", "Amazon Pounce")},
    @{name="Cheetah";           type="fire"; img="Cheetah.jpg";           stats=@{hp=100; atk=28; def=12; spd=40}; skills=@("Speed Blitz", "Throat Clamp", "Mach Strike")},
    @{name="Leopard";           type="fire"; img="Leopard.jpg";           stats=@{hp=100; atk=30; def=16; spd=28}; skills=@("Tree Ambush", "Claw Slash", "Predator Instinct")},
    @{name="Honey Badger";      type="fire"; img="Honey_Badger.jpg";      stats=@{hp=100; atk=25; def=30; spd=20}; skills=@("Fearless Bite", "Thick Skin", "Badger Rage")},
    @{name="Wolverine";         type="fire"; img="Wolverine.jpg";         stats=@{hp=100; atk=28; def=28; spd=20}; skills=@("Snow Pounce", "Vicious Claw", "Berserk")},
    @{name="Tasmanian Devil";   type="fire"; img="Tasmanian_Devil.jpg";   stats=@{hp=100; atk=26; def=15; spd=22}; skills=@("Screech", "Bone Crunch", "Chaos Spin")},
    @{name="Fire Dragon";       type="fire"; img="fire_dragon.jpg";       stats=@{hp=100; atk=30; def=20; spd=20}; skills=@("Flame Breath", "Claw Swipe", "Inferno")},
    @{name="Mega Dragon";       type="fire"; img="mega_dragon.jpg";       stats=@{hp=100; atk=45; def=35; spd=15}; skills=@("Chomp", "Tail Smash", "Meteor")},
    @{name="Thunder Lion";      type="fire"; img="thunder_lion.jpg";      stats=@{hp=100; atk=38; def=22; spd=25}; skills=@("Thunder Roar", "Zap", "Storm")},
    @{name="Phoenix";           type="fire"; img="phoenix.jpg";           stats=@{hp=100; atk=35; def=15; spd=30}; skills=@("Flame Wing", "Reborn", "Dive")},

    # WATER / OCEAN
    @{name="Great White Shark"; type="water"; img="Great_White_Shark.jpg"; stats=@{hp=100; atk=42; def=20; spd=25}; skills=@("Fin Strike", "Deep Bite", "Feeding Frenzy")},
    @{name="Orca";              type="water"; img="Orca.jpg";              stats=@{hp=100; atk=45; def=25; spd=22}; skills=@("Pod Hunt", "Tail Slap", "Apex Dive")},
    @{name="Saltwater Crocodile";type="water";img="Saltwater_Crocodile.jpg";stats=@{hp=100; atk=40; def=35; spd=12}; skills=@("Death Roll", "Snap Jaw", "Ambush Lurk")},
    @{name="Hippopotamus";      type="water"; img="Hippopotamus.jpg";      stats=@{hp=100; atk=44; def=30; spd=18}; skills=@("Jaw Crush", "River Charge", "Territorial Rage")},
    @{name="Polar Bear";        type="water"; img="Polar_Bear.jpg";        stats=@{hp=100; atk=38; def=28; spd=20}; skills=@("Ice Paw", "Seal Hunt", "Arctic Fury")},
    @{name="Walrus";            type="water"; img="Walrus.jpg";            stats=@{hp=100; atk=30; def=35; spd=10}; skills=@("Tusk Strike", "Blubber Shield", "Ice Crush")},
    @{name="Giant Squid";       type="water"; img="Giant_Squid.jpg";       stats=@{hp=100; atk=35; def=15; spd=20}; skills=@("Tentacle Wrap", "Beak Bite", "Deep Pressure")},
    @{name="Blue Whale";        type="water"; img="Blue_Whale.jpg";        stats=@{hp=100; atk=50; def=40; spd=10}; skills=@("Tail Smash", "Ocean Song", "Tsunami Breach")},
    @{name="Electric Eel";      type="water"; img="Electric_Eel.jpg";      stats=@{hp=100; atk=30; def=10; spd=25}; skills=@("Shock", "Volt Charge", "Thunder Discharge")},
    @{name="Piranha";           type="water"; img="Piranha.jpg";           stats=@{hp=100; atk=28; def=5;  spd=30}; skills=@("Swarm Bite", "Flesh Tear", "Blood Scent")},
    @{name="Ice Wolf";          type="water"; img="ice_wolf.jpg";          stats=@{hp=100; atk=25; def=18; spd=22}; skills=@("Frost Bite", "Howl", "Blizzard")},
    @{name="Frost Bear";        type="water"; img="frost_bear.jpg";        stats=@{hp=100; atk=35; def=30; spd=15}; skills=@("Ice Claw", "Maul", "Freeze")},
    @{name="Ocean Dolphin";     type="water"; img="ocean_dolphin.jpg";     stats=@{hp=100; atk=20; def=15; spd=35}; skills=@("Splash", "Sonic Wave", "Jump")},

    # NATURE / GIANTS
    @{name="African Elephant";  type="nature"; img="African_Elephant.jpg"; stats=@{hp=100; atk=45; def=35; spd=15}; skills=@("Trunk Slam", "Tusk Gore", "Stampede")},
    @{name="White Rhinoceros";  type="nature"; img="White_Rhinoceros.jpg"; stats=@{hp=100; atk=42; def=40; spd=18}; skills=@("Horn Charge", "Thick Hide", "Tank Rush")},
    @{name="Mountain Gorilla";  type="nature"; img="Mountain_Gorilla.jpg"; stats=@{hp=100; atk=38; def=25; spd=22}; skills=@("Ground Pound", "Fist Smash", "Kong Fury")},
    @{name="Silverback Gorilla";type="nature"; img="Silverback_Gorilla.jpg";stats=@{hp=100; atk=40; def=28; spd=20}; skills=@("Chest Beat", "Boulder Throw", "Alpha Rage")},
    @{name="Cape Buffalo";      type="nature"; img="Cape_Buffalo.jpg";     stats=@{hp=100; atk=35; def=35; spd=20}; skills=@("Headbutt", "Horn Hook", "Black Death Charge")},
    @{name="Giraffe";           type="nature"; img="Giraffe.jpg";          stats=@{hp=100; atk=25; def=20; spd=25}; skills=@("High Kick", "Neck Swing", "Tower Stomp")},
    @{name="Moose";             type="nature"; img="Moose.jpg";            stats=@{hp=100; atk=30; def=25; spd=22}; skills=@("Antler Ram", "Forest Dash", "Giant Kick")},
    @{name="Kangaroo";          type="nature"; img="Kangaroo.jpg";         stats=@{hp=100; atk=28; def=15; spd=30}; skills=@("Bounce", "Double Kick", "Boxer Punch")},
    @{name="Cassowary";         type="nature"; img="Cassowary.jpg";        stats=@{hp=100; atk=35; def=15; spd=28}; skills=@("Dagger Claw", "Jump Kick", "Jungle Sprint")},
    @{name="Wild Boar";         type="nature"; img="Wild_Boar.jpg";        stats=@{hp=100; atk=28; def=22; spd=24}; skills=@("Tusk Gore", "Mud Roll", "Reckless Charge")},
    @{name="Forest Deer";       type="nature"; img="forest_deer.jpg";      stats=@{hp=100; atk=20; def=15; spd=25}; skills=@("Kick", "Run", "Antler")},

    # LIGHT / SKY
    @{name="Golden Eagle";      type="light"; img="Golden_Eagle.jpg";      stats=@{hp=100; atk=32; def=15; spd=35}; skills=@("Talon Grip", "Sky Dive", "Golden Strike")},
    @{name="Peregrine Falcon";  type="light"; img="Peregrine_Falcon.jpg";  stats=@{hp=100; atk=30; def=10; spd=50}; skills=@("Stoop Dive", "Sonic Claw", "Mach Speed")},
    @{name="Great Horned Owl";  type="light"; img="Great_Horned_Owl.jpg";  stats=@{hp=100; atk=25; def=15; spd=28}; skills=@("Silent Flight", "Night Vision", "Talon Crush")},
    @{name="Harpy Eagle";       type="light"; img="Harpy_Eagle.jpg";       stats=@{hp=100; atk=38; def=18; spd=25}; skills=@("Monkey Hunter", "Crushing Grip", "Rainforest Lord")},
    @{name="Condor";            type="light"; img="Condor.jpg";            stats=@{hp=100; atk=25; def=20; spd=20}; skills=@("Carrion Peck", "Wing Buffet", "High Altitude")},
    @{name="Peacock";           type="light"; img="Peacock.jpg";           stats=@{hp=100; atk=20; def=15; spd=22}; skills=@("Fan Display", "Beak Peck", "Mystic Eye")},
    @{name="Ostrich";           type="light"; img="Ostrich.jpg";           stats=@{hp=100; atk=30; def=18; spd=38}; skills=@("Mega Kick", "Sprint", "Beak Strike")},
    @{name="Secretary Bird";    type="light"; img="Secretary_Bird.jpg";    stats=@{hp=100; atk=28; def=12; spd=30}; skills=@("Snake Stomp", "Crest Display", "Lethal Kick")},
    @{name="Albatross";         type="light"; img="Albatross.jpg";         stats=@{hp=100; atk=22; def=18; spd=25}; skills=@("Ocean Glide", "Wing Slap", "Global Roam")},
    @{name="Snowy Owl";         type="light"; img="Snowy_Owl.jpg";         stats=@{hp=100; atk=24; def=15; spd=28}; skills=@("Silent Hunter", "Ice Talon", "White Out")},
    @{name="Light Owl";         type="light"; img="light_owl.jpg";         stats=@{hp=100; atk=22; def=12; spd=28}; skills=@("Flash", "Swoop", "Light Beam")},
    @{name="Holy Tiger";        type="light"; img="holy_tiger.jpg";        stats=@{hp=100; atk=35; def=20; spd=25}; skills=@("Holy Claw", "Roar", "Divine Strike")},
    @{name="Sky Eagle";         type="light"; img="sky_eagle.jpg";         stats=@{hp=100; atk=30; def=15; spd=35}; skills=@("Wind", "Talon", "Aerial Ace")},

    # DARK / VENOM
    @{name="King Cobra";        type="dark";  img="King_Cobra.jpg";        stats=@{hp=100; atk=35; def=10; spd=30}; skills=@("Venom Spit", "Hood Flare", "Neurotoxin")},
    @{name="Anaconda";          type="dark";  img="Anaconda.jpg";          stats=@{hp=100; atk=38; def=25; spd=15}; skills=@("Constrict", "Suffocate", "Man Eater")},
    @{name="Black Mamba";       type="dark";  img="Black_Mamba.jpg";       stats=@{hp=100; atk=40; def=8;  spd=45}; skills=@("Strike", "Evasion", "Fatal Venom")},
    @{name="Scorpion";          type="dark";  img="Scorpion.jpg";          stats=@{hp=100; atk=32; def=25; spd=20}; skills=@("Pincer Grip", "Sting", "Death Toxin")},
    @{name="Tarantula";         type="dark";  img="Tarantula.jpg";         stats=@{hp=100; atk=28; def=15; spd=25}; skills=@("Fang Bite", "Hair Flick", "Spider Venom")},
    @{name="Hyena";             type="dark";  img="Hyena.jpg";             stats=@{hp=100; atk=30; def=22; spd=25}; skills=@("Cackle", "Pack Bite", "Bone Breaker")},
    @{name="Vulture";           type="dark";  img="Vulture.jpg";           stats=@{hp=100; atk=20; def=20; spd=22}; skills=@("Circle", "Scavenge", "Rot Peck")},
    @{name="Bat";               type="dark";  img="Bat.jpg";               stats=@{hp=100; atk=18; def=10; spd=35}; skills=@("Sonic Screech", "Leech Life", "Night Swarm")},
    @{name="Hornet";            type="dark";  img="Hornet.jpg";            stats=@{hp=100; atk=35; def=5;  spd=40}; skills=@("Sting", "Buzz", "Swarm Attack")},
    @{name="Mantis";            type="dark";  img="Mantis.jpg";            stats=@{hp=100; atk=40; def=15; spd=30}; skills=@("Scythe Slash", "Camouflage", "Head Eater")},
    @{name="Shadow Panther";    type="dark";  img="shadow_panther.jpg";    stats=@{hp=100; atk=35; def=18; spd=30}; skills=@("Shadow Claw", "Stealth", "Dark Bite")}
)

$jsContent = @"
// ANIMAL KING TOURNAMENT DATABASE
// Validated Animals (Image Exists)

const DIGIMON_DATABASE = [
"@

$validCount = 0
$idCounter = 1

foreach ($animal in $animals) {
    if (Test-Path "c:\digimon\images\$($animal.img)") {
        $skillsJson = @()
        foreach ($skill in $animal.skills) {
            # Determine skill type based on animal type mostly
            $skillType = if ($skill -match "Fire|Burn|Heat") { "fire" } 
                         elseif ($skill -match "Ice|Water|Frost|Cold") { "water" }
                         elseif ($skill -match "Toxin|Venom|Dark|Shadow") { "dark" }
                         elseif ($skill -match "Light|Holy|Flash") { "light" }
                         elseif ($skill -match "Nature|Vine|Root") { "nature" }
                         else { $animal.type } # Fallback to animal type
            
            $skillsJson += "{name:`"$skill`", damage:25, type:`"$skillType`"}"
        }
        $skillsString = $skillsJson -join ", "
        
        $entry = "    { id: $idCounter, name: `"$($animal.name)`", type: `"$($animal.type)`", typeLabel: `"$($animal.type)`", image: `"images/$($animal.img)`", stats: { hp: 100, attack: $($animal.stats.atk), defense: $($animal.stats.def), speed: $($animal.stats.spd) }, skills: [$skillsString] },"
        $jsContent += "`n$entry"
        $validCount++
        $idCounter++
    }
}

$jsContent += @"

];

// Type Effectiveness Chart
const TYPE_EFFECTIVENESS = {
    fire: { strong: ['nature'], weak: ['water'] },
    water: { strong: ['fire'], weak: ['nature'] },
    nature: { strong: ['water'], weak: ['fire'] },
    light: { strong: ['dark'], weak: ['dark'] },
    dark: { strong: ['light'], weak: ['light'] },
    neutral: { strong: [], weak: [] }
};
"@

$jsContent | Set-Content "c:\digimon\digimon-data.js" -Encoding UTF8
Write-Host "Generated database with $validCount valid animals."
