# PowerShell script to download SOUND EFFECTS from Wikimedia Commons
$ErrorActionPreference = "Stop"

$audioFiles = @{
    # Game Logic Name      = Wikimedia File Name
    "battle_theme.ogg"     = "Drum_cadence_A.ogg" # Powerful drums
    "crowd_cheer.ogg"      = "Applause.ogg" # Crowd cheering
    "roar.ogg"             = "Lion_roar.ogg" # Beast roar
    "hit_heavy.ogg"        = "Door_Heavy_Smash.ogg" # Heavy impact (using a door smash as proxy)
    "hit_fast.ogg"         = "Whip_crack.ogg" # Fast attack
    "win_fanfare.ogg"      = "Tada_fanfare.ogg" # Victory sound
    "ui_click.ogg"         = "Click_sound.ogg" # UI Click
    "gong.ogg"             = "Gong.ogg" # Start match
}

$destDir = "c:\digimon\audio"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
$baseUrl = "https://commons.wikimedia.org/wiki/Special:FilePath/"

Write-Host "Downloading Audio Assets..."

foreach ($key in $audioFiles.Keys) {
    $wikiFilename = $audioFiles[$key]
    $url = $baseUrl + [Uri]::EscapeDataString($wikiFilename)
    $output = Join-Path $destDir $key
    
    if (Test-Path $output) {
        Write-Host "Skipping $key (exists)"
        continue
    }

    Write-Host "Downloading $key..."
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AnimalKingAudio/1.0" -TimeoutSec 30
        Write-Host "  -> OK"
    } catch {
        Write-Host "  -> FAILED: $_"
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host "Audio download complete!"
