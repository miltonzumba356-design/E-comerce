Add-Type -AssemblyName System.Drawing

$src = 'C:\Users\HP\Downloads\Community\src\assets\logo-gosen.jpeg'
$outDir = 'C:\Users\HP\Downloads\Community\public\icons'
$brandGold = [System.Drawing.Color]::FromArgb(255, 176, 140, 16)

$original = [System.Drawing.Bitmap]::FromFile($src)

# Square crop centered on the mark: full width (803), vertical band centered at y=683
$cropSize = 803
$cropY = 282
$squareCrop = New-Object System.Drawing.Bitmap($cropSize, $cropSize)
$g = [System.Drawing.Graphics]::FromImage($squareCrop)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($original, (New-Object System.Drawing.Rectangle(0, 0, $cropSize, $cropSize)), (New-Object System.Drawing.Rectangle(0, $cropY, $cropSize, $cropSize)), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

function Save-Resized([System.Drawing.Bitmap]$bitmap, [int]$size, [string]$path) {
    $resized = New-Object System.Drawing.Bitmap($size, $size)
    $gr = [System.Drawing.Graphics]::FromImage($resized)
    $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gr.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gr.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gr.DrawImage($bitmap, 0, 0, $size, $size)
    $gr.Dispose()
    $resized.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $resized.Dispose()
}

# Standard "any" icons — mark fills most of the tile (existing crop already has margin)
Save-Resized $squareCrop 512 (Join-Path $outDir 'icon-512.png')
Save-Resized $squareCrop 192 (Join-Path $outDir 'icon-192.png')
Save-Resized $squareCrop 180 (Join-Path $outDir 'apple-touch-icon.png')
Save-Resized $squareCrop 32 (Join-Path $outDir 'favicon-32.png')
Save-Resized $squareCrop 16 (Join-Path $outDir 'favicon-16.png')

# Maskable icon: extra gold padding so the mark sits inside the ~80% safe zone
$maskableCanvas = 1024
$maskable = New-Object System.Drawing.Bitmap($maskableCanvas, $maskableCanvas)
$gm = [System.Drawing.Graphics]::FromImage($maskable)
$gm.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$brush = New-Object System.Drawing.SolidBrush($brandGold)
$gm.FillRectangle($brush, 0, 0, $maskableCanvas, $maskableCanvas)
$inset = [int]($maskableCanvas * 0.16)
$innerSize = $maskableCanvas - (2 * $inset)
$gm.DrawImage($squareCrop, $inset, $inset, $innerSize, $innerSize)
$gm.Dispose()
Save-Resized $maskable 512 (Join-Path $outDir 'icon-512-maskable.png')

$brush.Dispose()
$squareCrop.Dispose()
$original.Dispose()

Write-Output 'PWA icons generated.'
