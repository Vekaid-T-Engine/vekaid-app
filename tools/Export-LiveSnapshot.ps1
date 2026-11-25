param([string]$Output = (Join-Path $env:LOCALAPPDATA 'VEKAID\live-snapshot.json'), [switch]$Watch)
$ErrorActionPreference='Stop'
function Write-Snapshot {
  $hardware=@{}
  try { $os=Get-CimInstance Win32_OperatingSystem; if($os.TotalVisibleMemorySize -gt 0){$hardware.ram_percent=[math]::Round(100*(1-$os.FreePhysicalMemory/$os.TotalVisibleMemorySize),1)} } catch {}
  try { $cpu=Get-CimInstance Win32_Processor | Measure-Object LoadPercentage -Average; if($null -ne $cpu.Average){$hardware.cpu_percent=[math]::Round($cpu.Average,1)} } catch {}
  try { if(Get-Command nvidia-smi -ErrorAction SilentlyContinue){ $line=& nvidia-smi --query-gpu=utilization.gpu,temperature.gpu --format=csv,noheader,nounits 2>$null | Select-Object -First 1; if($LASTEXITCODE -eq 0 -and $line -match '^\s*(\d+)\s*,\s*(\d+)\s*$'){$hardware.gpu_percent=[int]$Matches[1];$hardware.gpu_temperature_c=[int]$Matches[2]} } } catch {}
  $processes=@(Get-Process -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ProcessName)
  $rows=@(foreach($id in @('claude','codex','chatgpt-images','ollama','wangp')){
    $state='unknown'
    if($id -in @('claude','codex','ollama')){if($processes -contains $id){$state='process-present'}else{$state='process-absent'}}
    @{id=$id;state=$state;used_percent=$null;reset_at=$null}
  })
  $doc=@{format='vekaid.live.v1';observed_at=[DateTimeOffset]::UtcNow.ToString('o');providers=$rows;hardware=$hardware}
  $full=[IO.Path]::GetFullPath($Output);$dir=[IO.Path]::GetDirectoryName($full)
  [IO.Directory]::CreateDirectory($dir)|Out-Null
  $tmp=Join-Path $dir ([Guid]::NewGuid().ToString()+'.tmp')
  try{[IO.File]::WriteAllText($tmp,($doc|ConvertTo-Json -Depth 6),[Text.UTF8Encoding]::new($false));if([IO.File]::Exists($full)){[IO.File]::Replace($tmp,$full,$null)}else{[IO.File]::Move($tmp,$full)}}finally{if(Test-Path -LiteralPath $tmp){Remove-Item -LiteralPath $tmp -Force}}
  Write-Output $full
}
do {Write-Snapshot;if($Watch){Start-Sleep -Seconds 15}} while($Watch)
