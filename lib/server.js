(function() {
  var app, authorize, express, fs, git, jobs, moment, path, runner, stylus;

  express = require('express');

  stylus = require('stylus');

  fs = require('fs');

  path = require('path');

  runner = require('./runner');

  jobs = require('./jobs');

  git = require('./git');

  moment = require('moment');

  authorize = function(user, pass) {
    return user === git.user && pass === git.pass;
  };

  if (git.user && git.pass) {
    app = module.exports = express.createServer(express.basicAuth(authorize));
  } else {
    app = module.exports = express.createServer();
  }

  app.configure(function() {
    var coffeeDir, publicDir;
    app.set('views', __dirname + '/views');
    app.set('quiet', true);
    app.set('view engine', 'coffee');
    app.register('.coffee', require('coffeekup').adapters.express);
    app.set('view options', {
      layout: false
    });
    app.use(stylus.middleware({
      debug: false,
      src: __dirname + '/views',
      dest: __dirname + '/public',
      compile: function(str) {
        return stylus(str).set('compress', true);
      }
    }));
    coffeeDir = __dirname + '/views';
    publicDir = __dirname + '/public';
    app.use(express.compiler({
      src: coffeeDir,
      dest: publicDir,
      enable: ['coffeescript']
    }));
    app.use(express.logger());
    app.use(app.router);
    return app.use(express.static(__dirname + '/public'));
  });

  app.configure('development', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.configure('production', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.get('/', function(req, res) {
    return jobs.getAll(function(jobs) {
      return res.render('index', {
        project: path.basename(process.cwd()),
        jobs: jobs,
        moment: moment
      });
    });
  });

  app.get('/jobs', function(req, res) {
    return jobs.getAll(function(jobs) {
      return res.json(jobs);
    });
  });

  app.get('/job/:id', function(req, res) {
    return jobs.get(req.params.id, function(job) {
      return res.json(job);
    });
  });

  app.get('/job/:id/:attribute', function(req, res) {
    return jobs.get(req.params.id, function(job) {
      if (job[req.params.attribute] != null) {
        return res.json(job[req.params.attribute]);
      } else {
        return res.send("The job doesn't have the " + req.params.attribute + " attribute");
      }
    });
  });

  app.get('/clear', function(req, res) {
    return jobs.clear(function() {
      return res.redirect('/jobs');
    });
  });

  app.get('/add', function(req, res) {
    return jobs.addJob(function() {
      return res.redirect('/jobs');
    });
  });

  app.get('/ping', function(req, res) {
    return jobs.getLast(function(job) {
      if (job.failed) {
        return res.send(412);
      } else {
        return res.send(200);
      }
    });
  });

  app.post('/', function(req, res) {
    return jobs.addJob(function(job) {
      runner.build();
      if (req.xhr) {
        console.log(job);
        return res.json(job);
      } else {
        return res.redirect('/');
      }
    });
  });

}).call(this);
