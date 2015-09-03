require 'jasmine-tagged'

_ = require 'underscore-plus'
pathwatcher = require atom.packages.resourcePath + '/node_modules/pathwatcher/lib/main'

tags = [process.platform]

tags.push('notwercker') unless process.env.WERCKER_ROOT
tags.push('nottravis') unless process.env.TRAVIS

jasmineEnv = jasmine.getEnv()
original = jasmineEnv.setIncludedTags

jasmineEnv.setIncludedTags = (t) ->
  original(_.union tags, t)

afterEach ->
  pathwatcher.closeAllWatchers()
