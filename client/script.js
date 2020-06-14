// The max and min number of photos a customer can purchase
var MIN_PHOTOS = 1;
var MAX_PHOTOS = 10;

/* Method for changing the product quantity when a customer clicks the increment / decrement buttons */
var updateQuantity = function (evt) {
  if (evt && evt.type === 'keypress' && evt.keyCode !== 13) {
    return;
  }

  var isAdding = evt && evt.target.id === 'add';
  var inputEl = document.getElementById('quantity-input');
  var currentQuantity = parseInt(inputEl.value);

  document.getElementById('add').disabled = false;
  document.getElementById('subtract').disabled = false;

  // Calculate new quantity
  var quantity = evt
    ? isAdding
      ? currentQuantity + 1
      : currentQuantity - 1
    : currentQuantity;
  // Update number input with new value.
  inputEl.value = quantity;
  // Calculate the total amount and format it with currency symbol.
  var amount = config.unitAmount;
  var numberFormat = new Intl.NumberFormat(i18next.language, {
    style: 'currency',
    currency: config.currency,
    currencyDisplay: 'symbol',
  });
  var parts = numberFormat.formatToParts(amount);
  var zeroDecimalCurrency = true;
  for (var part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  amount = zeroDecimalCurrency ? amount : amount / 100;
  var total = (quantity * amount).toFixed(2);
  var formattedTotal = numberFormat.format(total);

  // document
  //   .getElementById('giving')
  //   .setAttribute('i18n-options', `{ "total": "${formattedTotal}" }`);
  // updateContent('button.submit');
};

/* Attach method */
// Array.from(document.getElementsByClassName('increment-btn')).forEach(
//   (element) => {
//     element.addEventListener('click', updateQuantity);
//   }
// );

/* Handle any errors returns from Checkout  */
var handleResult = function (result) {
  if (result.error) {
    var displayError = document.getElementById('error-message');
    displayError.textContent = result.error.message;
  }
};

// Create a Checkout Session with the selected quantity
var createCheckoutSession = function () {
  // var inputEl = document.getElementById('???');
  var unit_amount = 1000; // parseInt(inputEl.value);

  return fetch('/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      unit_amount: unit_amount, // Get from widgets
      // quantity: quantity,
      locale: i18next.language.toLowerCase().split('-')[0],
    }),
  }).then(function (result) {
    return result.json();
  });
};

/* Get your Stripe publishable key to initialize Stripe.js */
fetch('/config')
  .then(function (result) {
    return result.json();
  })
  .then(function (json) {
    window.config = json;
    var stripe = Stripe(config.publicKey);
    // updateQuantity();
    // Setup event handler to create a Checkout Session on submit
    document.querySelector('#submit').addEventListener('click', function (evt) {
      console.log("Submit pressed.");
      createCheckoutSession().then(function (data) {
        stripe
          .redirectToCheckout({
            sessionId: data.sessionId,
          })
          .then(handleResult);
      });
    });
  });
