$dir = "c:\Users\User\Desktop\BMG INTERIORS\bmginteriors"
$files = Get-ChildItem -Path $dir -Recurse -Filter *.html

foreach ($file in $files) {
    # Read the file as UTF-8
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    $changed = $false

    if ($content -match '₹') {
        $content = $content.Replace('₹', '&#8377;')
        $changed = $true
    }
    
    # Also replace raw "?" where it might be a corrupted character in specific strings if any 
    # but only if safe. Let's just fix the symbols:
    
    if ($content -match '→') {
        $content = $content.Replace('→', '&rarr;')
        $changed = $true
    }
    
    if ($content -match '—') {
        $content = $content.Replace('—', '&mdash;')
        $changed = $true
    }
    
    if ($content -match '”') {
        $content = $content.Replace('”', '&rdquo;')
        $changed = $true
    }
    
    if ($content -match '“') {
        $content = $content.Replace('“', '&ldquo;')
        $changed = $true
    }

    if ($content -match '’') {
        $content = $content.Replace('’', '&rsquo;')
        $changed = $true
    }
    
    if ($content -match '‘') {
        $content = $content.Replace('‘', '&lsquo;')
        $changed = $true
    }
    
    if ($content -match '✦') {
        $content = $content.Replace('✦', '&#10022;')
        $changed = $true
    }
    if ($content -match '◎') {
        $content = $content.Replace('◎', '&#9678;')
        $changed = $true
    }
    if ($content -match '⬡') {
        $content = $content.Replace('⬡', '&#11041;')
        $changed = $true
    }
    if ($content -match '◈') {
        $content = $content.Replace('◈', '&#9672;')
        $changed = $true
    }

    # Also check if there's any stray "1Cr+" and prefix it with the rupee symbol.
    if ($content -match '<div class="pstrip-n">1Cr\+</div>') {
        $content = $content.Replace('<div class="pstrip-n">1Cr+</div>', '<div class="pstrip-n">&#8377;1Cr+</div>')
        $changed = $true
    }

    if ($changed) {
        [IO.File]::WriteAllText($file.FullName, $content, [Text.Encoding]::UTF8)
        Write-Output "Fixed: $($file.Name)"
    }
}
Write-Output "Done."
