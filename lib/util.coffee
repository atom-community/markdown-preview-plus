module.exports =
  encodeURI: (uri) ->
    if (typeof uri is 'string')
      window.encodeURI(uri)
    else
      uri
  decodeURI: (uri) ->
    if (typeof uri is 'string')
      window.decodeURI(uri)
    else
      uri
