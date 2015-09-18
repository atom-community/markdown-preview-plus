Write-Host $PSVersionTable.PSVersion
$OutputVariable = (apm test --no-color --one --path $env:LOCALAPPDATA\Atom\resources\cli\atom.cmd) | Out-String
Write-Host $OutputVariable
if($OutputVariable.contains(", 0 failures,")){
  Write-Host "All fine"
}else{
  Throw "An error occurred"
}
