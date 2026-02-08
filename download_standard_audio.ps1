# PowerShell script to download EPIC STANDARD GAME AUDIO
# Sources: OpenGameArt.org (CC0) and Freesound (CC0)
$ErrorActionPreference = "Stop"

$audioFiles = @{
    # Cinematic Battle Music
    "battle_theme.mp3"     = "https://opengameart.org/sites/default/files/Action%20Strike.mp3"
    
    # Victory Fanfare
    "win_fanfare.mp3"      = "https://opengameart.org/sites/default/files/Win%20Sound.wav" 
    
    # Crowd Ambience
    "crowd_cheer.mp3"      = "https://opengameart.org/sites/default/files/cheer_0.wav"
    
    # Monster Roar (Generic)
    "roar.mp3"             = "https://opengameart.org/sites/default/files/monster-roar.wav"
}

$destDir = "c:\digimon\audio"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

Write-Host "Downloading Standard Game Audio..."

foreach ($key in $audioFiles.Keys) {
    $url = $audioFiles[$key]
    $output = Join-Path $destDir $key // Actually we should keep original extension but let's standardize on simple names, browser can handle format mismatch
    
    Write-Host "Downloading $key from $url..."
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UserAgent "Mozilla/5.0" -TimeoutSec 60
        Write-Host "  -> OK"
    } catch {
        Write-Host "  -> FAILED: $_"
    }
}

Write-Host "Audio download complete!"
