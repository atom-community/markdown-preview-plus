$OutputVariable = (apm test --no-color --one) | Out-String
Write-Host $OutputVariable
if($OutputVariable.contains(", 0 failures,")){
  Write-Host "All fine"
}else{
  Throw "An error occurred"
}
