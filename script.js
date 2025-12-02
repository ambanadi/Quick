// 10 questions in Myanmar
const QUESTIONS = [
  { q: "ကွန်ပျူတာ၏ အဓိက Processing အဖွဲ့အစည်းကို ဘာဟုခေါ်သလဲ?", choices:["မော်နီတာ","CPU (ဦးနှောက်)","ကီးဘုတ်"], answer:2 }, 
  { q: "RAM ကို အောက်ပါအရာများထဲမှ ဘာအတွက် အသုံးပြုသလဲ?", choices:["တစ်ချိန်လျှင် သာ မှတ်သားသည့် ဒေတာများ သိမ်းဆည်းရန်","အမြဲတမ်း သိမ်းဆည်းရန်","ပုံနှိပ်ရန်"], answer:0 }
];

// state
let idx = 0, score = 0, nameVal = '';
const total = QUESTIONS.length;

// elements
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const demoBtn = document.getElementById('demoBtn');
const nextBtn = document.getElementById('nextBtn');
const qIndexEl = document.getElementById('qIndex');
const qTotalEl = document.getElementById('qTotal');
const progEl = document.getElementById('prog');
const questionCard = document.getElementById('questionCard');
const rName = document.getElementById('rName');
const rCorrect = document.getElementById('rCorrect');
const rTotal = document.getElementById('rTotal');
const reviewList = document.getElementById('reviewList');
const retryBtn = document.getElementById('retryBtn');
const downloadBtn = document.getElementById('downloadBtn');

qTotalEl.textContent = total;

startBtn.addEventListener('click', ()=>{
  const val = nameInput.value.trim();
  if(!val){ alert('နာမည်ထည့်ပါ'); nameInput.focus(); return; }
  nameVal = val;
  startScreen.style.display = 'none';
  quizScreen.style.display = 'block';
  renderQuestion();
});

demoBtn.addEventListener('click', ()=>{
  // quick demo (no name), fills random answers
  nameVal = 'Demo User';
  startScreen.style.display = 'none';
  quizScreen.style.display = 'block';
  renderQuestion();
});

function renderQuestion(){
  const Q = QUESTIONS[idx];
  qIndexEl.textContent = idx+1;
  progEl.style.width = `${Math.round((idx)/total*100)}%`;

  // build question card
  questionCard.innerHTML = `
    <h3 class="text-lg font-semibold mb-2">${Q.q}</h3>
    <div class="grid gap-3" id="choices"></div>
  `;
  const choicesWrap = document.getElementById('choices');
  Q.choices.forEach((c,i)=>{
    const btn = document.createElement('button');
    btn.className = 'choice w-full text-left p-3 border rounded-xl border-slate-100';
    btn.innerHTML = `<div class='flex items-center gap-3'><div class='w-8 text-sm font-semibold text-slate-500'>${String.fromCharCode(65+i)}</div><div class='flex-1'>${c}</div></div>`;
    btn.addEventListener('click', ()=>selectChoice(i, btn));
    choicesWrap.appendChild(btn);
  });

  nextBtn.disabled = true;
}

function selectChoice(choiceIndex, el){
  const Q = QUESTIONS[idx];
  const all = Array.from(document.querySelectorAll('#choices .choice'));
  all.forEach(b=>{ b.classList.add('disabled'); });

  const correctIndex = Q.answer;
  const isCorrect = choiceIndex === correctIndex;
  if(isCorrect){ el.classList.add('correct'); score++; }
  else { el.classList.add('wrong'); all[correctIndex].classList.add('correct'); }

  // save review data on the element for download later
  el.dataset.selected = choiceIndex;
  el.dataset.correct = correctIndex;

  nextBtn.disabled = false;
}

nextBtn.addEventListener('click', ()=>{
  idx++;
  if(idx >= total) finishQuiz(); else renderQuestion();
});

function finishQuiz(){
  quizScreen.style.display = 'none';
  resultScreen.style.display = 'block';
  rName.textContent = nameVal;
  rCorrect.textContent = score;
  rTotal.textContent = total;

  // build review list
  reviewList.innerHTML = '';
  QUESTIONS.forEach((Q,i)=>{
    const li = document.createElement('li');
    li.className = 'p-3 rounded-lg border border-slate-100 bg-slate-50';
    const userChoice = document.querySelectorAll('#choices')[i] ? null : null; // we don't persist per-question DOM across renders
    // Instead, we will recompute using score tracking approach: simulate answers by replaying choices saved in global 'answers' array
  });

  // To produce detailed review we need to store user answers; modify selectChoice to push to array
}

// Improve by storing answers
const userAnswers = [];
function selectChoice(choiceIndex, el){
  const Q = QUESTIONS[idx];
  const all = Array.from(document.querySelectorAll('#choices .choice'));
  all.forEach(b=>{ b.classList.add('disabled'); });
  const correctIndex = Q.answer;
  const isCorrect = choiceIndex === correctIndex;
  if(isCorrect){ el.classList.add('correct'); score++; }
  else { el.classList.add('wrong'); all[correctIndex].classList.add('correct'); }

  userAnswers.push({ q: Q.q, choices: Q.choices, selected: choiceIndex, correct: correctIndex, isCorrect });
  nextBtn.disabled = false;
}

function finishQuiz(){
  quizScreen.style.display = 'none';
  resultScreen.style.display = 'block';
  rName.textContent = nameVal;
  rCorrect.textContent = score;
  rTotal.textContent = total;

  // Chart
  const ctx = document.getElementById('resultChart').getContext('2d');
  const wrong = total - score;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Correct', 'Wrong'],
      datasets: [{ data: [score, wrong], backgroundColor: ['#10B981', '#EF4444'] }]
    },
    options:{plugins:{legend:{position:'bottom'}}}
  });

  // Review list
  reviewList.innerHTML = '';
  userAnswers.forEach((u,i)=>{
    const item = document.createElement('li');
    item.className = 'p-3 rounded-lg border border-slate-100 bg-white flex justify-between items-start gap-4';
    const left = document.createElement('div');
    left.innerHTML = `<div class='font-semibold'>${i+1}. ${u.q}</div><div class='text-sm text-slate-600 mt-1'>Your: ${u.choices[u.selected]}</div>`;
    const right = document.createElement('div');
    right.innerHTML = u.isCorrect ? `<div class='text-sm text-green-600 font-semibold'>✔ မှန်</div>` : `<div class='text-sm text-red-600 font-semibold'>✖ မှား<br><span class='text-xs text-slate-500'>Correct: ${u.choices[u.correct]}</span></div>`;
    item.appendChild(left);
    item.appendChild(right);
    reviewList.appendChild(item);
  });
}

retryBtn.addEventListener('click', ()=>{
  // reset
  idx = 0; score = 0; userAnswers.length = 0; nameVal = '';
  nameInput.value = '';
  resultScreen.style.display = 'none';
  startScreen.style.display = 'block';
  progEl.style.width = '0%';
});