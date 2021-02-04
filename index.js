const exec = require('child_process').execFile;

// function timeDifference(startTimeInMilliSeconds, endTimeInMilliSeconds) {
//   return formattedTime(timeInMilliSeconds(endTimeInMilliSeconds) - timeInMilliSeconds(startTimeInMilliSeconds));
// }

const COMMAND = 'ffmpeg';

function execute(args) {
  return new Promise((resolve, reject) => {
    exec(COMMAND, args, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

function timeInMilliSeconds(formattedTime) {
  let splitTime = formattedTime.split(':');
  let secondsSplit = splitTime[2].split('.');
  return (((parseInt(splitTime[0]) * 60 * 60) + (parseInt(splitTime[1]) * 60) + (parseInt(secondsSplit[0]))) * 1000) + (parseInt(secondsSplit[1]) || 0);
}

function formattedTime(milliSeconds) {
  if (isNaN(milliSeconds) || milliSeconds < 0) {
    return null;
  }
  let formattedDate = new Date(milliSeconds).toISOString();
  let formattedTime = formattedDate.split('1970-01-01T')[1];
  return formattedTime.split('Z')[0];
}

function clip(inputFilePath, outputFilePath, startTime, endTime) {
  let duration = endTime - startTime;
  return execute(['-ss', formattedTime(startTime), '-i', inputFilePath, '-t', formattedTime(duration), outputFilePath, '-y']);
}

function split(inputFilePath, outputFilePath, clipPoints) {
  let splitQueue = [];
  clipPoints.forEach((cl, ci) => {
    if (clipPoints.length - 1 > ci) {
splitQueue.push(clip(inputFilePath, `${ci}-${outputFilePath}`, clipPoints[ci], clipPoints[ci+1]));
}
  });
  return Promise.all(splitQueue);
}

function parseAudio(inputFilePath, outputFilePath) {
  return execute(['-i', inputFilePath, '-f', 'mp2', outputFilePath]);
}

function parseAudioLowQuality(inputFilePath, outputFilePath) {
  return execute(['-i', inputFilePath, '-ac', '1', '-ab', '64000', outputFilePath]);
}

module.exports = {
  execute,
  clip,
  split,
  parseAudio,
  formattedTime,
  timeInMilliSeconds,
  parseAudioLowQuality,
};
