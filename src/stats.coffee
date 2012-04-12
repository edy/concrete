jobs = require './jobs'


stats = module.exports =
  
  #calls the callback with an array of jobs with date and build time
  buildTime: (callback) ->
    jobs.getAll (jobs) ->
      callback jobs.map (j) ->
        {
          runAt: j.startedTime
          buildTime: j.finishedTime - j.startedTime
        }

  numberOfTests: (callback) ->
    jobs.getAll (jobs) ->
      callback jobs.map (j) ->
        re = /(\d+) examples,/
        match = re.exec(j.log)
        count = if match
                  parseInt(match[1])
                else
                  0

        {
          runAt: j.startedTime
          numberOfTests: count
        }
