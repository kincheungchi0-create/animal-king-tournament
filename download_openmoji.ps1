$baseUrl = "https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/svg"
$destDir = "c:\digimon\images"

# Ensure directory exists
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
}

$emojis = @{
    "fire_dragon.svg"   = "1F409" # Dragon
    "ice_wolf.svg"      = "1F43A" # Wolf
    "light_owl.svg"     = "1F989" # Owl
    "phoenix.svg"       = "1F99A" # Peacock (looks like phoenix) or 1F426 (Bird) -> actually 1F525 (Fire) is not an animal. Let's use 1F99A or similar. 
                             # Wait, Phoenix... Let's use 1F9A4 (Dodo) maybe? No. 
                             # Let's use 1F413 (Rooster) looks fiery? Or 1F985 (Eagle). 
                             # Actually OpenMoji has a Dragon 1F409 and a Sauropod 1F995 and T-Rex 1F996.
                             # Let's stick to: 
                             # Fire Dragon -> 1F409 (Dragon)
                             # Phoenix -> 1F9A9 (Flamingo? No). Let's use 1F99C (Parrot) - colorful.
    "holy_tiger.svg"    = "1F42F" # Tiger
    "thunder_lion.svg"  = "1F981" # Lion
    "frost_bear.svg"    = "1F43B" # Bear
    "sky_eagle.svg"     = "1F985" # Eagle
    "shadow_panther.svg"= "1F406" # Leopard
    "forest_deer.svg"   = "1F98C" # Deer
    "ocean_dolphin.svg" = "1F42C" # Dolphin
    "mega_dragon.svg"   = "1F996" # T-Rex
    "stegosaurus.svg"   = "1F995" # Sauropod
    "triceratops.svg"   = "1F996" # T-Rex works for now, or 1F40A (Crocodile)
}

# Override Phoenix with a better one if possible, but Parrot 1F99C is fine for now.

Write-Host "Downloading OpenMoji assets..."

foreach ($name in $emojis.Keys) {
    $code = $emojis[$name]
    $url = "$baseUrl/$code.svg"
    $output = Join-Path $destDir $name
    
    Write-Host "Downloading $name ($code)..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UserAgent "Mozilla/5.0"
        Write-Host "  -> Success"
    } catch {
        Write-Host "  -> Failed: $_"
    }
}

Write-Host "All downloads attempted."
