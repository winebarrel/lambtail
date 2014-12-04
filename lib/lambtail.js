var AWS = require('aws-sdk');
var util = require('util');

function Lambtail(options) {
  options = options || {};
  this.cloudwatchlogs = new AWS.CloudWatchLogs(options);
  this.delay = options.delay || 1000;
  this.startTime = options.startTime || Date.now();
}

Lambtail.prototype.tail = function(functionName, callback) {
  var self = this;
  var lastTime = this.startTime;
  var logGroupName = '/aws/lambda/' + functionName;

  setInterval(function() {
    self.eachStream({logGroupName: logGroupName}, function(logStream) {
      var lastIngestionTime = logStream.lastIngestionTime;

      if (!lastIngestionTime || lastIngestionTime < lastTime) {
        return;
      }

      var params = {
        logGroupName: logGroupName,
        logStreamName: logStream.logStreamName,
        startTime: lastTime
      };

      self.eachLogEvent(params, function(logEvent) {
        if (logEvent.timestamp > lastTime) {
          if (callback) {
            callback(logEvent.message);
          } else {
            util.print(logEvent.message);
          }

          lastTime = logEvent.timestamp;
        }
      });
    });
  }, this.delay);
}

Lambtail.prototype.eachStream = function(params, callback) {
  this.cloudwatchlogs.describeLogStreams(params).eachPage(function(err, data) {
    if (err) {
      if (err.code == 'ResourceNotFoundException') {
        return;
      } else {
        throw err;
      }
    }

    if (data) {
      data.logStreams.forEach(callback);
    }
  });
}

Lambtail.prototype.eachLogEvent = function(params, callback) {
  this.cloudwatchlogs.getLogEvents(params, function(err, data) {
    if (err) {
      throw err;
    }

    data.events.forEach(callback);
  });
}

module.exports = Lambtail;

