'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-01-25T17:01:17.194Z',
    '2021-01-31T09:36:17.929Z',
    '2021-02-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24))); //milliseconds to days
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);

  /*  const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;*/
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  //Set time to 5 minutes
  let time = 300;

  //Call the timer every second
  const timer = setInterval(function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0); //to call padStart, we have to convert number to string
    const sec = String(time % 60).padStart(2, 0);

    //In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    //Decrease 1s
    time--;
  }, 1000);

  return timer;
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Create current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //month can be represented as 3 ways
      //month: 'long',
      //month: '2-digit'
      year: 'numeric', //year can be represented as 2 ways
      //year: 'long'
      //weekday: 'long', //we can use 'short' or 'narrow' for weekday
    };
    //    const locale = navigator.language; //this one coming from the browser
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    /*    const now = new Date();
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;*/

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      //Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      //Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
console.log(23 === 23.0);

//Base 10 = 0 to 9. 1/10 = 0.1
//Binary base 2 = 0 1
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3); //false. because of floating point

//Conversion
console.log(Number('23'));
console.log(+'23'); //when JS sees plus operation, it will do type coercion. so it will automatically convert all the operands to numbers.

//Parsing
console.log(Number.parseInt('30px', 10)); //'10' is radix
console.log(Number.parseInt('x30', 10));

console.log(Number.parseInt('2.5rem '));
console.log(Number.parseFloat(' 2.5rem '));

//Check if value is NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20X'));
console.log(Number.isNaN(23 / 0)); //infinity is also not a NaN

//Checking if value is number, not a string
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20X'));
console.log(Number.isFinite(23 / 0));

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));
*/

/*
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 10, 23, 11, 2));
console.log(Math.max(5, 10, '23', 11, 2));
console.log(Math.max(5, 10, '23px', 11, 2));

console.log(Math.min(5, 10, 23, 11, 2));
console.log(Math.PI * Number.parseFloat('10px') ** 2);

//Random
console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

//Rounding integers
console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3)); //ceil===round up
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3)); //floor===round down
console.log(Math.floor(23.9));

console.log(Math.trunc(23.3));

console.log(Math.trunc(-23.3)); //-23. just cut the decimal point
console.log(Math.floor(-23.3)); //-24

//Rounding decimals
console.log((2.7).toFixed(0)); //toFixed will always return a string and not a number
console.log((2.7).toFixed(3));
console.log((2.345).toFixed(2));
console.log(+(2.345).toFixed(2));

//Remainder operator
console.log(5 % 2);
console.log(5 / 2);

console.log(8 % 3);
console.log(8 / 3);

console.log(6 % 2);
console.log(6 / 2);

console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
*/

/*
console.log(2 ** 53 - 1); //this is the max number that JS can represent accurately, without 'BigInt'
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);

console.log(345678909832345612345678909876543212345678999943n); //with 'n', this means 'BigInt'
console.log(BigInt(34567890983)); //use this function when the number is relatively small

//Operations
console.log(10000n + 10000n);
console.log(123456789987654321234567898765434567890987n * 1000000n);
const huge = 98765432345678998765n;
const num = 23;
console.log(huge * BigInt(num));
//console.log(huge * num); //mixing BigInt with regular numbers is impossible
//console.log(Math.sqrt(16n)); //we can't use Math function with BigInt

//Exceptions
console.log(20n > 15);
console.log(20n === 20); //'===' doens't make type coercion. because the '20n' and '20''s have different primitive type, it's false
console.log(typeof 20n);
console.log(20n == 20); //'==' does make type coercion.
console.log(20n == '20'); //'==' does make type coercion.

console.log(huge + ' isREALLY big!!!!');

//Divisions
console.log(10n / 3n); //with BigInt, it will cut the decimal part
console.log(10 / 3);
*/

/*
//Create a date
const now = new Date();
console.log(now);

console.log(new Date('Jan 29 2021 09:53:42'));
console.log(new Date('December 24, 2015'));
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 19, 15, 23, 5)); //month is zero based. so when we use 10, it's november
//2037 year, 10th month(november), 19 day, 15 hour, 23 minute, 5 second

console.log(new Date(0)); //beginning of the Unix time
console.log(new Date(3 * 24 * 60 * 60 * 1000)); //3 days, 24 hours, 60 minutes, 60 seconds, 1000 milliseconds

//Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay()); //Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); //use when we want to convert a particular date object into a string that we can store somewhere

console.log(future.getTime()); //timestamp. it's milliseconds that have passed since January 1, 1970
console.log(Date.now()); //if we want current timestamp, we can use this
console.log(new Date(2142224580000));

future.setFullYear(2040);
console.log(future);
*/

/*
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPassed = (date1, date2) =>
  Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)); //milliseconds to days
const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(days1);
*/

/*
const num = 3884764.23;
const options = {
  style: 'currency',
  currency: 'EUR',
  //useGrouping: false, //if we define useGrouping as false, the number will be represented without the seperators

  //We can use style for three ways
  //1) style: 'currency',
  //   currency: 'EUR',
  //   With this way, unit has been ignored.

  //2) style: 'percent',
  //   With this way, we don't have to write any other elements.

  //3) style: 'unit',
  //   unit: 'mile-per-hour'
  //   unit: 'celsius'
  //   With this way, we can use various unit.
};

console.log('US: ', new Intl.NumberFormat('en-US', options).format(num));
console.log('GM: ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('SR: ', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
  `${navigator.language}: `,
  new Intl.NumberFormat(navigator.language, options).format(num)
);
*/

/*
//setTimeout. only executed for once
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
  //  'olives', //this will be ing1
  //  'spinach' //this will be ing2
); //3000 is 3 seconds. because 1000 milliseconds are 1 second. keep counting the time at the background
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer); //clear the setTimeout function. we need to give name for setTimeout function, if we want to clear it.

//setInterval. executed for repeatedly
setInterval(function () {
  const now = new Date();
  const hour = `${now.getHours()}`.padStart(2, 0);
  const min = `${now.getMinutes()}`.padStart(2, 0);
  const sec = `${now.getSeconds()}`.padStart(2, 0);
  console.log(`It's ${hour} : ${min} : ${sec}`);
}, 1000);
*/
