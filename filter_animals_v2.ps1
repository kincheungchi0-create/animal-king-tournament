# PowerShell script to Filter Animals by Image Existence V2
# This script holds the master data and only writes animals with valid images to digimon-data.js

$masterAnimals = @(
    @{name="African Lion"; type="fire"; label="Beast"; img="African_Lion.jpg"; hp=100; atk=35; def=20; spd=22; s1="King's Roar"; s2="Pride Assault"; s3="Neck Bite"},
    @{name="Bengal Tiger"; type="fire"; label="Beast"; img="Bengal_Tiger.jpg"; hp=100; atk=38; def=18; spd=24; s1="Ambush"; s2="Jungle Fury"; s3="Tiger Claw"},
    @{name="Grizzly Bear"; type="fire"; label="Beast"; img="Grizzly_Bear.jpg"; hp=100; atk=40; def=25; spd=15; s1="Maul"; s2="Bear Hug"; s3="Savage Swipe"},
    @{name="Komodo Dragon"; type="fire"; label="Reptile"; img="Komodo_Dragon.jpg"; hp=100; atk=32; def=22; spd=18; s1="Venom Bite"; s2="Tail Whip"; s3="Bacteria Infect"},
    @{name="Jaguar"; type="fire"; label="Beast"; img="Jaguar.jpg"; hp=100; atk=36; def=18; spd=26; s1="Skull Bite"; s2="Silent Stalk"; s3="Amazon Pounce"},
    @{name="Cheetah"; type="fire"; label="Beast"; img="Cheetah.jpg"; hp=100; atk=28; def=12; spd=40; s1="Speed Blitz"; s2="Throat Clamp"; s3="Mach Strike"},
    @{name="Leopard"; type="fire"; label="Beast"; img="Leopard.jpg"; hp=100; atk=30; def=16; spd=28; s1="Tree Ambush"; s2="Claw Slash"; s3="Predator Instinct"},
    @{name="Honey Badger"; type="fire"; label="Beast"; img="Honey_Badger.jpg"; hp=100; atk=25; def=30; spd=20; s1="Fearless Bite"; s2="Thick Skin"; s3="Badger Rage"},
    @{name="Wolverine"; type="fire"; label="Beast"; img="Wolverine.jpg"; hp=100; atk=28; def=28; spd=20; s1="Snow Pounce"; s2="Vicious Claw"; s3="Berserk"},
    @{name="Tasmanian Devil"; type="fire"; label="Beast"; img="Tasmanian_Devil.jpg"; hp=100; atk=26; def=15; spd=22; s1="Screech"; s2="Bone Crunch"; s3="Chaos Spin"},
    
    @{name="Great White Shark"; type="water"; label="Ocean"; img="Great_White_Shark.jpg"; hp=100; atk=42; def=20; spd=25; s1="Fin Strike"; s2="Deep Bite"; s3="Feeding Frenzy"},
    @{name="Orca"; type="water"; label="Ocean"; img="Orca.jpg"; hp=100; atk=45; def=25; spd=22; s1="Pod Hunt"; s2="Tail Slap"; s3="Apex Dive"},
    @{name="Saltwater Crocodile"; type="water"; label="Reptile"; img="Saltwater_Crocodile.jpg"; hp=100; atk=40; def=35; spd=12; s1="Death Roll"; s2="Snap Jaw"; s3="Ambush Lurk"},
    @{name="Hippopotamus"; type="water"; label="Beast"; img="Hippopotamus.jpg"; hp=100; atk=44; def=30; spd=18; s1="Jaw Crush"; s2="River Charge"; s3="Territorial Rage"},
    @{name="Polar Bear"; type="water"; label="Beast"; img="Polar_Bear.jpg"; hp=100; atk=38; def=28; spd=20; s1="Ice Paw"; s2="Seal Hunt"; s3="Arctic Fury"},
    @{name="Walrus"; type="water"; label="Ocean"; img="Walrus.jpg"; hp=100; atk=30; def=35; spd=10; s1="Tusk Strike"; s2="Blubber Shield"; s3="Ice Crush"},
    @{name="Giant Squid"; type="water"; label="Ocean"; img="Giant_Squid.jpg"; hp=100; atk=35; def=15; spd=20; s1="Tentacle Wrap"; s2="Beak Bite"; s3="Deep Pressure"},
    @{name="Blue Whale"; type="water"; label="Ocean"; img="Blue_Whale.jpg"; hp=100; atk=50; def=40; spd=10; s1="Tail Smash"; s2="Ocean Song"; s3="Tsunami Breach"},
    @{name="Electric Eel"; type="water"; label="Ocean"; img="Electric_Eel.jpg"; hp=100; atk=30; def=10; spd=25; s1="Shock"; s2="Volt Charge"; s3="Thunder Discharge"},
    @{name="Piranha"; type="water"; label="Ocean"; img="Piranha.jpg"; hp=100; atk=28; def=5; spd=30; s1="Swarm Bite"; s2="Flesh Tear"; s3="Blood Scent"},

    @{name="African Elephant"; type="nature"; label="Giant"; img="African_Elephant.jpg"; hp=100; atk=45; def=35; spd=15; s1="Trunk Slam"; s2="Tusk Gore"; s3="Stampede"},
    @{name="White Rhinoceros"; type="nature"; label="Giant"; img="White_Rhinoceros.jpg"; hp=100; atk=42; def=40; spd=18; s1="Horn Charge"; s2="Thick Hide"; s3="Tank Rush"},
    @{name="Mountain Gorilla"; type="nature"; label="Primate"; img="Mountain_Gorilla.jpg"; hp=100; atk=38; def=25; spd=22; s1="Ground Pound"; s2="Fist Smash"; s3="Kong Fury"},
    @{name="Silverback Gorilla"; type="nature"; label="Primate"; img="Silverback_Gorilla.jpg"; hp=100; atk=40; def=28; spd=20; s1="Chest Beat"; s2="Boulder Throw"; s3="Alpha Rage"},
    @{name="Cape Buffalo"; type="nature"; label="Giant"; img="Cape_Buffalo.jpg"; hp=100; atk=35; def=35; spd=20; s1="Headbutt"; s2="Horn Hook"; s3="Black Death Charge"},
    @{name="Giraffe"; type="nature"; label="Giant"; img="Giraffe.jpg"; hp=100; atk=25; def=20; spd=25; s1="High Kick"; s2="Neck Swing"; s3="Tower Stomp"},
    @{name="Moose"; type="nature"; label="Giant"; img="Moose.jpg"; hp=100; atk=30; def=25; spd=22; s1="Antler Ram"; s2="Forest Dash"; s3="Giant Kick"},
    @{name="Kangaroo"; type="nature"; label="Beast"; img="Kangaroo.jpg"; hp=100; atk=28; def=15; spd=30; s1="Bounce"; s2="Double Kick"; s3="Boxer Punch"},
    @{name="Cassowary"; type="nature"; label="Bird"; img="Cassowary.jpg"; hp=100; atk=35; def=15; spd=28; s1="Dagger Claw"; s2="Jump Kick"; s3="Jungle Sprint"},
    @{name="Wild Boar"; type="nature"; label="Beast"; img="Wild_Boar.jpg"; hp=100; atk=28; def=22; spd=24; s1="Tusk Gore"; s2="Mud Roll"; s3="Reckless Charge"},

    @{name="Golden Eagle"; type="light"; label="Bird"; img="Golden_Eagle.jpg"; hp=100; atk=32; def=15; spd=35; s1="Talon Grip"; s2="Sky Dive"; s3="Golden Strike"},
    @{name="Peregrine Falcon"; type="light"; label="Bird"; img="Peregrine_Falcon.jpg"; hp=100; atk=30; def=10; spd=50; s1="Stoop Dive"; s2="Sonic Claw"; s3="Mach Speed"},
    @{name="Great Horned Owl"; type="light"; label="Bird"; img="Great_Horned_Owl.jpg"; hp=100; atk=25; def=15; spd=28; s1="Silent Flight"; s2="Night Vision"; s3="Talon Crush"},
    @{name="Harpy Eagle"; type="light"; label="Bird"; img="Harpy_Eagle.jpg"; hp=100; atk=38; def=18; spd=25; s1="Monkey Hunter"; s2="Crushing Grip"; s3="Rainforest Lord"},
    @{name="Condor"; type="light"; label="Bird"; img="Condor.jpg"; hp=100; atk=25; def=20; spd=20; s1="Carrion Peck"; s2="Wing Buffet"; s3="High Altitude"},
    @{name="Peacock"; type="light"; label="Bird"; img="Peacock.jpg"; hp=100; atk=20; def=15; spd=22; s1="Fan Display"; s2="Beak Peck"; s3="Mystic Eye"},
    @{name="Ostrich"; type="light"; label="Bird"; img="Ostrich.jpg"; hp=100; atk=30; def=18; spd=38; s1="Mega Kick"; s2="Sprint"; s3="Beak Strike"},
    @{name="Secretary Bird"; type="light"; label="Bird"; img="Secretary_Bird.jpg"; hp=100; atk=28; def=12; spd=30; s1="Snake Stomp"; s2="Crest Display"; s3="Lethal Kick"},
    @{name="Albatross"; type="light"; label="Bird"; img="Albatross.jpg"; hp=100; atk=22; def=18; spd=25; s1="Ocean Glide"; s2="Wing Slap"; s3="Global Roam"},
    @{name="Snowy Owl"; type="light"; label="Bird"; img="Snowy_Owl.jpg"; hp=100; atk=24; def=15; spd=28; s1="Silent Hunter"; s2="Ice Talon"; s3="White Out"},

    @{name="King Cobra"; type="dark"; label="Reptile"; img="King_Cobra.jpg"; hp=100; atk=35; def=10; spd=30; s1="Venom Spit"; s2="Hood Flare"; s3="Neurotoxin"},
    @{name="Anaconda"; type="dark"; label="Reptile"; img="Anaconda.jpg"; hp=100; atk=38; def=25; spd=15; s1="Constrict"; s2="Suffocate"; s3="Man Eater"},
    @{name="Black Mamba"; type="dark"; label="Reptile"; img="Black_Mamba.jpg"; hp=100; atk=40; def=8; spd=45; s1="Strike"; s2="Evasion"; s3="Fatal Venom"},
    @{name="Scorpion"; type="dark"; label="Insect"; img="Scorpion.jpg"; hp=100; atk=32; def=25; spd=20; s1="Pincer Grip"; s2="Sting"; s3="Death Toxin"},
    @{name="Tarantula"; type="dark"; label="Insect"; img="Tarantula.jpg"; hp=100; atk=28; def=15; spd=25; s1="Fang Bite"; s2="Hair Flick"; s3="Spider Venom"},
    @{name="Hyena"; type="dark"; label="Beast"; img="Hyena.jpg"; hp=100; atk=30; def=22; spd=25; s1="Cackle"; s2="Pack Bite"; s3="Bone Breaker"},
    @{name="Vulture"; type="dark"; label="Bird"; img="Vulture.jpg"; hp=100; atk=20; def=20; spd=22; s1="Circle"; s2="Scavenge"; s3="Rot Peck"},
    @{name="Bat"; type="dark"; label="Mammal"; img="Bat.jpg"; hp=100; atk=18; def=10; spd=35; s1="Sonic Screech"; s2="Leech Life"; s3="Night Swarm"},
    @{name="Hornet"; type="dark"; label="Insect"; img="Hornet.jpg"; hp=100; atk=35; def=5; spd=40; s1="Sting"; s2="Buzz"; s3="Swarm Attack"},
    @{name="Mantis"; type="dark"; label="Insect"; img="Mantis.jpg"; hp=100; atk=40; def=15; spd=30; s1="Scythe Slash"; s2="Camouflage"; s3="Head Eater"},
    
    # Original 12 Backups (renamed/remapped to match new system if needed)
    @{name="Fire Dragon (KD)"; type="fire"; label="Reptile"; img="fire_dragon.jpg"; hp=100; atk=32; def=20; spd=20; s1="Bite"; s2="Claw"; s3="Inferno"},
    @{name="Mega T-Rex"; type="fire"; label="Dino"; img="mega_dragon.jpg"; hp=100; atk=50; def=30; spd=15; s1="Chomp"; s2="Roar"; s3="Jurassic Crush"}
)

$jsHead = @"
// ANIMAL KING TOURNAMENT DATABASE
// Validated Animals (Image Exists)
// Generated by filter_animals_v2.ps1

const DIGIMON_DATABASE = [
"@

$jsBody = ""
$idCounter = 1

foreach ($a in $masterAnimals) {
    # Check if image exists
    if (Test-Path "c:\digimon\images\$($a.img)") {
        
        # Determine skill types
        # Default: Skill 1 = Normal, Skill 2 = Type, Skill 3 = Type (Strong)
        $t = $a.type
        
        $entry = "    { id: $idCounter, name: `"$($a.name)`", type: `"$t`", typeLabel: `"$($a.label)`", image: `"images/$($a.img)`", stats: { hp: 100, attack: $($a.atk), defense: $($a.def), speed: $($a.spd) }, skills: [ {name:`"$($a.s1)`", damage:20, type:`"normal`"}, {name:`"$($a.s2)`", damage:30, type:`"$t`"}, {name:`"$($a.s3)`", damage:50, type:`"$t`"} ] },"
        $jsBody += "`n$entry"
        $idCounter++
    }
}

$jsFoot = @"

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

$finalContent = $jsHead + $jsBody + $jsFoot
$finalContent | Set-Content "c:\digimon\digimon-data.js" -Encoding UTF8

Write-Host "Done! Generated database with $($idCounter - 1) valid animals."
