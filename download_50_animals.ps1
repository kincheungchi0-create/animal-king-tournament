# PowerShell script to download 50+ ANIMAL KING images from Wikimedia Commons
$ErrorActionPreference = "Stop"

$files = @{
    # ImageName in JS       = Wikimedia File Name
    "African_Lion.jpg"      = "Lion_waiting_in_Namibia.jpg"
    "Bengal_Tiger.jpg"      = "Panthera_tigris_tigris.jpg"
    "Grizzly_Bear.jpg"      = "Grizzly_Bear._Sitka,_Alaska.jpg"
    "Komodo_Dragon.jpg"     = "Komodo_dragon_(Varanus_komodoensis).jpg"
    "Jaguar.jpg"            = "Jaguar_(Panthera_onca).jpg"
    "Cheetah.jpg"           = "Cheetah_(Acinonyx_jubatus)_male.jpg"
    "Leopard.jpg"           = "Leopard_africa.jpg"
    "Honey_Badger.jpg"      = "Mellivora_capensis_in_Kgalagadi.jpg"
    "Wolverine.jpg"         = "Gulo_gulo_2.jpg"
    "Tasmanian_Devil.jpg"   = "Tasmanian_Devil_2.jpg"
    
    "Great_White_Shark.jpg" = "Carcharodon_carcharias.jpg"
    "Orca.jpg"              = "Killerwhales_jumping.jpg"
    "Saltwater_Crocodile.jpg" = "Saltwater_Crocodile_at_Australia_Zoo.jpg"
    "Hippopotamus.jpg"      = "Hippopotamus_(Hippopotamus_amphibius)_bathing.jpg"
    "Polar_Bear.jpg"        = "Polar_Bear_AdF.jpg"
    "Walrus.jpg"            = "Walrus_(Odobenus_rosmarus)_on_Svalbard.jpg"
    "Giant_Squid.jpg"       = "Architeuthis_dux.jpg" # Usually a model or illustration, but let's try
    "Blue_Whale.jpg"        = "Blue_Whale_001_body_bw.jpg"
    "Electric_Eel.jpg"      = "Electric_eel_at_aquarium.jpg"
    "Piranha.jpg"           = "Piranha_fish.jpg"
    
    "African_Elephant.jpg"  = "African_Bush_Elephant.jpg"
    "White_Rhinoceros.jpg"  = "Ceratotherium_simum_kruger.jpg"
    "Mountain_Gorilla.jpg"  = "Mountain_Gorilla_Silverback_in_Bwindi.jpg"
    "Silverback_Gorilla.jpg"= "Gorilla_profile.jpg"
    "Cape_Buffalo.jpg"      = "Syncerus_caffer_caffer_01.jpg"
    "Giraffe.jpg"           = "Giraffe_standing.jpg"
    "Moose.jpg"             = "Moose_superior.jpg"
    "Kangaroo.jpg"          = "Kangaroo_Australia_01_11_2008_-_JP_-_01.jpg"
    "Cassowary.jpg"         = "Casuarius_casuarius_-_04.jpg"
    "Wild_Boar.jpg"         = "Wild_Boar_Hahnu_2.jpg"
    
    "Golden_Eagle.jpg"      = "Golden_Eagle_in_flight_-_5.jpg"
    "Peregrine_Falcon.jpg"  = "Peregrine_Falcon_flying.jpg"
    "Great_Horned_Owl.jpg"  = "Bubo_virginianus_06.jpg"
    "Harpy_Eagle.jpg"       = "Harpia_harpyja_001.jpg"
    "Condor.jpg"            = "Vultur_gryphus_-_01.jpg"
    "Peacock.jpg"           = "Peacock_plumage.jpg"
    "Ostrich.jpg"           = "Struthio_camelus_-_Etosha_2014_(1).jpg"
    "Secretary_Bird.jpg"    = "Sagittarius_serpentarius_01.jpg"
    "Albatross.jpg"         = "Diomedea_exulans_-_SE_Tasmania.jpg"
    "Snowy_Owl.jpg"         = "Bubo_scandiacus_0.jpg"
    
    "King_Cobra.jpg"        = "King_Cobra.jpg"
    "Anaconda.jpg"          = "Eunectes_murinus_2.jpg"
    "Black_Mamba.jpg"       = "Dendroaspis_polylepis.jpg"
    "Scorpion.jpg"          = "Scorpion_Photo.jpg"
    "Tarantula.jpg"         = "Brachypelma_smithi_2009_G03.jpg"
    "Hyena.jpg"             = "Spotted_hyena_(Crocuta_crocuta).jpg"
    "Vulture.jpg"           = "Griffon_Vulture_-_Gyps_fulvus.jpg"
    "Bat.jpg"               = "Big-eared-townsend-fledermaus.jpg"
    "Hornet.jpg"            = "Vespa_crabro_germany_201008.jpg"
    "Mantis.jpg"            = "Praying_Mantis_India.jpg"
}

$destDir = "c:\digimon\images"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
$baseUrl = "https://commons.wikimedia.org/wiki/Special:FilePath/"

Write-Host "Starting download of 50+ animals..."

foreach ($key in $files.Keys) {
    if (Test-Path "$destDir\$key") {
        Write-Host "Skipping $key (already exists)"
        continue
    }

    $wikiFilename = $files[$key]
    $url = $baseUrl + [Uri]::EscapeDataString($wikiFilename)
    $output = Join-Path $destDir $key

    Write-Host "Downloading $key..."
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AnimalKingGame/1.0" -TimeoutSec 15
        Write-Host "  -> OK"
    } catch {
        Write-Host "  -> FAILED: $_"
        # Create a dummy placeholder on failure so game doesn't break
        # Copy an existing one if possible, or leave it for the 'onerror' placeholder
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "Download complete!"
