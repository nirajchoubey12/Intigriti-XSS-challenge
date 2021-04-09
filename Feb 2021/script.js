function startGrade() {
  var text = document.getElementById("assignmentText").value;
  checkLength(text);
  result = window.result || {
    message: "Your submission is too short.",
    error: 1,
  }; //If the result object hasn't been defined yet, the submission must be too short
  if (result.error) {
    endGrade();
  } else {
    getQAnswer();
    if (!passQuiz()) {
      result.message = "We don't allow robots at the Unicodeversity (yet)!";
      result.error = 1;
    } else {
      result.grade = "ABCDEF"[Math.floor(Math.random() * 6)]; //Don't tell the students we don't actually read their submissions
    }
    endGrade();
  }
}

function endGrade() {
  document.getElementById("message").innerText = result.message;
  if (result.grade) {
    document.getElementById(
      "grade"
    ).innerText = `You got a(n) ${result.grade}!`;
  }
  document.getElementById("share").style.visibility = "initial";
  document.getElementById(
    "share-link"
  ).href = `https://challenge-0221.intigriti.io/?assignmentTitle=${
    document.getElementById("assignmentTitle").value
  }&assignmentText=${document.getElementById("assignmentText").value}`;
  delete result;
}

function checkLength(text) {
  if (text.length > 50) {
    result = { message: "Thanks for your submission!" };
  }
}

function getQAnswer() {
  var answer = document.getElementById("answer").value;
  if (/^[0-9]+$/.test(answer)) {
    if (typeof result !== "undefined") {
      result.questionAnswer = { value: answer };
    } else {
      result = { questionAnswer: { value: answer } };
    }
  }
}

function passQuiz() {
  if (typeof result.questionAnswer !== "undefined") {
    return eval(result.questionAnswer.value + " == " + question);
  }
  return false;
}

var question = `${Math.floor(Math.random() * 10) + 1} + ${
  Math.floor(Math.random() * 10) + 1
}`;

document.getElementById("question").innerText = `${question} = ?`;

document.getElementById("submit").addEventListener("click", startGrade);

const urlParams = new URLSearchParams(location.search);
if (urlParams.has("autosubmit")) {
  startGrade();
}