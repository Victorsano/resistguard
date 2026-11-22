# Fictional product labels, authored locally for repeatable scanner testing.
Add-Type -AssemblyName System.Drawing
$fixtureDirectory=Join-Path $PSScriptRoot '../public/test-labels'
New-Item -ItemType Directory -Force -Path $fixtureDirectory | Out-Null
$fixtures=Get-Content -Raw (Join-Path $PSScriptRoot '../data/scan-fixtures.json') | ConvertFrom-Json
foreach($fixture in $fixtures){
 $bitmap=[System.Drawing.Bitmap]::new(1200,750)
 $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
 $graphics.Clear([System.Drawing.Color]::FromArgb(248,250,245))
 $brush=[System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(20,60,54))
 $graphics.TextRenderingHint=[System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
 $y=50
 for($index=0;$index -lt $fixture.lines.Count;$index++){
   $fontSize=if($index -eq 1){48}else{if($index -eq 0){19}else{25}}
   $font=[System.Drawing.Font]::new('Arial',$fontSize)
   $graphics.DrawString($fixture.lines[$index],$font,$brush,55,$y)
   $font.Dispose()
   $y+=if($index -eq 0){110}else{95}
 }
 $bitmap.Save((Join-Path $fixtureDirectory $fixture.file),[System.Drawing.Imaging.ImageFormat]::Png)
 $brush.Dispose();$graphics.Dispose();$bitmap.Dispose()
}
Write-Output "Created $($fixtures.Count) fictional test labels."
