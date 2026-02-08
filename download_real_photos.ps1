# PowerShell script to download REALISTIC animal photos from Wikimedia Commons
# Using Special:FilePath for direct redirects

$files = @{
    "fire_dragon.jpg"   = "Komodo_dragon_(Varanus_komodoensis).jpg"
    "ice_wolf.jpg"      = "Canis_lupus_standing_in_snow.jpg"
    "light_owl.jpg"     = "Tyto_alba_(Scopoli,_1769).jpg"
    "phoenix.jpg"       = "Golden_Eagle_in_flight_-_5.jpg" 
    "holy_tiger.jpg"    = "Panthera_tigris_tigris.jpg"
    "thunder_lion.jpg"  = "Lion_waiting_in_Namibia.jpg"
    "frost_bear.jpg"    = "Polar_Bear_AdF.jpg"
    "sky_eagle.jpg"     = "Bald_Eagle_-_Fachan_2.jpg"
    "shadow_panther.jpg"= "Black_Jaguar.jpg"
    "forest_deer.jpg"   = "Cervus_elaphus.jpg"
    "ocean_dolphin.jpg" = "Bottlenose_Dolphin_-_Tursiops_truncatus.jpg"
    "mega_dragon.jpg"   = "Dino_-_Tyrannosaurus_rex_model_-_5.jpg"
}

$destDir = "c:\digimon\images"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

$baseUrl = "https://commons.wikimedia.org/wiki/Special:FilePath/"

foreach ($key in $files.Keys) {
    $wikiFilename = $files[$key]
    $url = $baseUrl + [Uri]::EscapeDataString($wikiFilename)
    $output = Join-Path $destDir $key

    Write-Host "Downloading $key from $wikiFilename..."
    
    try {
        # -FollowRelLink is important for redirects
        # UserAgent is crucial for WikiMedia
        Invoke-WebRequest -Uri $url -OutFile $output -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AnimalBattleGame/1.0" -TimeoutSec 30
        Write-Host "  -> Success!"
    } catch {
        Write-Host "  -> Failed: $_"
    }
    
    # Sleep to be polite to the server
    Start-Sleep -Seconds 2
}
