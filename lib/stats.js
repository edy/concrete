(function() {
  var jobs, stats;

  jobs = require('./jobs');

  stats = module.exports = {
    buildTime: function(callback) {
      return jobs.getAll(function(jobs) {
        return callback(jobs.map(function(j) {
          return {
            runAt: j.startedTime,
            buildTime: j.finishedTime - j.startedTime
          };
        }));
      });
    },
    numberOfTests: function(callback) {
      return jobs.getAll(function(jobs) {
        return callback(jobs.map(function(j) {
          var count, match, re;
          re = /(\d+) examples,/;
          match = re.exec(j.log);
          count = match ? parseInt(match[1]) : 0;
          return {
            runAt: j.startedTime,
            numberOfTests: count
          };
        }));
      });
    }
  };

}).call(this);
