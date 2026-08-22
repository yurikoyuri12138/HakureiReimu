# 灵梦接力数据生成脚本（自包含：素材在 ./img，信息在 ./灵梦接力信息.md）
# 用法：powershell -ExecutionPolicy Bypass -File scripts\generate-data.ps1
$ErrorActionPreference = 'Stop'
function ConvertTo-JsString([string]$s) {
  $sb = New-Object System.Text.StringBuilder
  [void]$sb.Append('"')
  foreach ($ch in $s.ToCharArray()) {
    switch ($ch) {
      '"'  { [void]$sb.Append('\"') }
      '\'  { [void]$sb.Append('\\') }
      "`n" { [void]$sb.Append('\n') }
      "`r" { [void]$sb.Append('\r') }
      "`t" { [void]$sb.Append('\t') }
      default {
        $code = [int][char]$ch
        if ($code -lt 0x20) { [void]$sb.Append('\u' + $code.ToString('x4')) }
        else { [void]$sb.Append($ch) }
      }
    }
  }
  [void]$sb.Append('"')
  return $sb.ToString()
}
function Get-BangNum([string]$s) {
  $cn = $null
  if ($s -match '^第(.+)棒$') { $cn = $Matches[1] }
  elseif ($s -match '^(预热|特典)第(.+)棒$') { $cn = $Matches[2] }
  if (-not $cn) { return 999 }
  $d = @{ '一'=1; '二'=2; '三'=3; '四'=4; '五'=5; '六'=6; '七'=7; '八'=8; '九'=9; '十'=10 }
  if ($cn -eq '十') { return 10 }
  if ($cn -match '^十(.+)$') { return 10 + $d[$Matches[1]] }
  if ($cn -match '^(.+)十$') { return $d[$Matches[1]] * 10 }
  if ($cn -match '^(.+)十(.+)$') { return $d[$Matches[1]] * 10 + $d[$Matches[2]] }
  if ($d.ContainsKey($cn)) { return $d[$cn] }
  return 999
}
function Get-InfoId([string]$stem) {
  $t = $stem.Trim()
  if ($t -match '^(第.+?棒)') { return $Matches[1] }
  if ($t -match '^(预热.+?棒|特典.+?棒)(?:-\d+)?(?:（封面）)?$') { return $Matches[1] }
  if ($t -match '^(SP棒|替补棒)-(.+?)(?:-\d+)?(?:（封面）)?$') { return ($Matches[1] + '-' + $Matches[2]).Trim() }
  return $t
}
$root = Split-Path -Parent $PSScriptRoot   # workplace2
$img = Join-Path $root 'img'
$mdPath = Join-Path $root '灵梦接力信息.md'
$out = Join-Path $root 'src\data\generated'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$utf8 = New-Object System.Text.UTF8Encoding($false)

# 作品分组（排除宣传图）
$files = Get-ChildItem $img -File | Where-Object {
  $_.Extension -in '.jpg','.jpeg','.png','.gif','.webp','.txt' -and
  $_.BaseName -notmatch '^(零宣图|一宣图|二宣图|座次表)$'
}
$groups = @{}
foreach ($f in $files) {
  $infoId = Get-InfoId $f.BaseName
  if ($groups.ContainsKey($infoId)) { $groups[$infoId] = @($groups[$infoId] + $f) }
  else { $groups[$infoId] = @($f) }
}

# 解析 md
$md = Get-Content $mdPath -Encoding UTF8
$entries = New-Object System.Collections.ArrayList
$cur = $null
foreach ($line in $md) {
  if ($line -match '^###\s+(.+?)\s+(\S+?)(?:（(代发)）)?\s*$') {
    if ($cur) { [void]$entries.Add($cur) }
    $cur = [ordered]@{ title = $Matches[1].Trim(); time = $Matches[2]; daifa = $line.Contains('代发'); creator = ''; creatorUrl = ''; links = @() }
  } elseif ($cur -and $line -match '^创作者\s+\[@([^\]]+)\]\(([^)]+)\)') {
    if (-not $cur.creator) { $cur.creator = $Matches[1]; $cur.creatorUrl = $Matches[2] }
    else { $cur.creator += ' / ' + $Matches[1] }
  } elseif ($cur -and $line -match '^创作者\s+@(\S+)') {
    if ($cur.creator) { $cur.creator += ' / ' + $Matches[1] } else { $cur.creator = $Matches[1] }
  } elseif ($cur -and $line -match '^(.+?)\s*\[([^\]]+)\]\((\S+?)\)\s*$') {
    $cur.links += [ordered]@{ type = $Matches[1].Trim(); label = $Matches[2]; url = $Matches[3] }
  }
}
if ($cur) { [void]$entries.Add($cur) }

# 合并信息
$merged = New-Object System.Collections.ArrayList
$unmatched = @()
foreach ($infoId in ($groups.Keys | Sort-Object { Get-BangNum $_ })) {
  $entry = $entries | Where-Object { $_.title -eq $infoId } | Select-Object -First 1
  if (-not $entry -and $infoId -like 'SP棒-*') {
    $entry = $entries | Where-Object { $_.title -eq 'SP棒' -and $_.creator -and $infoId -like ('*' + $_.creator + '*') } | Select-Object -First 1
  }
  if (-not $entry -and $infoId -like '替补棒-*') {
    $entry = $entries | Where-Object { $_.title -eq '替补棒' -and $_.creator -and $infoId -like ('*' + $_.creator + '*') } | Select-Object -First 1
  }
  if ($entry) {
    [void]$merged.Add([ordered]@{ title = $infoId; time = $entry.time; daifa = $entry.daifa; creator = $entry.creator; creatorUrl = $entry.creatorUrl; links = @($entry.links) })
  } else { $unmatched += $infoId }
}

# 输出 info.js
$lines = @('// 灵梦接力信息数据（ESM，由 灵梦接力信息.md 生成，已与本地作品合并）', 'export const INFO = [')
$first = $true
foreach ($e in $merged) {
  $linksJson = ($e.links | ForEach-Object { "{ type: $(ConvertTo-JsString $_.type), label: $(ConvertTo-JsString $_.label), url: $(ConvertTo-JsString $_.url) }" }) -join ', '
  $prefix = if ($first) { '  ' } else { ', ' }
  $lines += "$prefix{ title: $(ConvertTo-JsString $e.title), time: $(ConvertTo-JsString $e.time), daifa: $(if ($e.daifa) {'true'} else {'false'}), creator: $(ConvertTo-JsString $e.creator), creatorUrl: $(ConvertTo-JsString $e.creatorUrl), links: [ $linksJson ] }"
  $first = $false
}
$lines += ']'
[System.IO.File]::WriteAllText((Join-Path $out 'info.js'), ($lines -join "`r`n") + "`r`n", $utf8)

# 输出 works.js（原图路径，无压缩）
$wlines = @('// 灵梦接力作品清单（ESM，扫描 img/ 生成，使用原图）', 'export const WORKS = [')
$first = $true
$groups.GetEnumerator() | Sort-Object { Get-BangNum $_.Key } | ForEach-Object {
  $ws = $_.Value | Sort-Object @{ Expression = { if ($_.BaseName -match '-(\d+)$') { [int]$Matches[1] } else { 0 } } }, @{ Expression = { $_.Name } }
  $wsJson = ($ws | ForEach-Object {
    $stem = $_.BaseName.Trim()
    if ($_.Extension -eq '.txt') {
      "{ name: $(ConvertTo-JsString $stem), text: true }"
    } else {
      # 图片：优先使用已存在的 .webp（img/ 根目录现为 webp 版本），否则回退原文件
      $imgFile = if (Test-Path (Join-Path $img ($stem + '.webp'))) { $stem + '.webp' } else { $_.Name }
      if ($stem -match '封面') { "{ name: $(ConvertTo-JsString $stem), file: $(ConvertTo-JsString ('img/' + $imgFile)), thumb: $(ConvertTo-JsString ('img/thumbs/' + $stem + '.thumb.jpg')), video: true }" }
      else { "{ name: $(ConvertTo-JsString $stem), file: $(ConvertTo-JsString ('img/' + $imgFile)), thumb: $(ConvertTo-JsString ('img/thumbs/' + $stem + '.thumb.jpg')) }" }
    }
  }) -join ', '
  $prefix = if ($first) { '  ' } else { ', ' }
  $wlines += "$prefix{ infoId: $(ConvertTo-JsString $_.Key), works: [ $wsJson ] }"
  $first = $false
}
$wlines += ']'
[System.IO.File]::WriteAllText((Join-Path $out 'works.js'), ($wlines -join "`r`n") + "`r`n", $utf8)

# 输出 texts.js
$txtFiles = Get-ChildItem $img -File | Where-Object { $_.Extension -eq '.txt' }
if ($txtFiles.Count -gt 0) {
  $tlines = @('// 灵梦接力同人文文本数据（ESM，由 img/*.txt 生成）', 'export const TEXTS = [')
  $first = $true
  foreach ($tf in $txtFiles) {
    $infoId = Get-InfoId $tf.BaseName
    $txt = Get-Content $tf.FullName -Encoding UTF8 -Raw
    $prefix = if ($first) { '  ' } else { ', ' }
    $tlines += "$prefix{ name: $(ConvertTo-JsString $infoId), text: $(ConvertTo-JsString $txt) }"
    $first = $false
  }
  $tlines += ']'
  [System.IO.File]::WriteAllText((Join-Path $out 'texts.js'), ($tlines -join "`r`n") + "`r`n", $utf8)
} else {
  Write-Host '⚠ 未找到 img/*.txt，保留现有 texts.js'
}

# 输出 notes.js
$nlines = @('// 灵梦接力寄语数据（ESM，由 img/寄语/ 生成，title 标签部分为标题）', 'export const NOTES = {')
$first = $true
$noteCount = 0
foreach ($nf in (Get-ChildItem (Join-Path $img '寄语') -File -Filter '*.txt' | Sort-Object Name)) {
  $stem = $nf.BaseName
  if ($stem -match '^(第.+?棒)寄语$') { $infoId = $Matches[1] }
  elseif ($stem -match '^(第.+?棒)$') { $infoId = $Matches[1] }
  elseif ($stem -match '^特典棒([一二三四五六七])$') { $infoId = '特典第' + $Matches[1] + '棒' }
  elseif ($stem -match '^预热棒([一二三四五六七])$') { $infoId = '预热第' + $Matches[1] + '棒' }
  elseif ($stem -match '^(SP棒|替补棒)-') { $infoId = $stem }
  else { $infoId = $stem }
  $content = (Get-Content $nf.FullName -Encoding UTF8 -Raw).Trim()
  if (-not $content) { continue }
  $title = ''; $text = $content
  $m = [regex]::Match($content, '(?s)^<title"([^"]*)"\s*/title>\s*(.*)$')
  if ($m.Success) { $title = $m.Groups[1].Value.Trim(); $text = $m.Groups[2].Value.Trim() }
  $prefix = if ($first) { '  ' } else { ', ' }
  $nlines += "$prefix$(ConvertTo-JsString $infoId): { title: $(ConvertTo-JsString $title), text: $(ConvertTo-JsString $text) }"
  $first = $false
  $noteCount++
}
$nlines += '}'
[System.IO.File]::WriteAllText((Join-Path $out 'notes.js'), ($nlines -join "`r`n") + "`r`n", $utf8)

"作品棒次: $($groups.Count) | 合并信息: $($merged.Count) | 文本: $($txtFiles.Count) | 寄语: $noteCount | 无匹配: $($unmatched -join ', ')"