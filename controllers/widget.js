// setup api
var reste = require(WPATH('reste'));
var stripe = require(WPATH('stripe'));

(function constructor() {
    stripe.setupReste(reste);
    stripe.config(Alloy.CFG.stripe.key);
})();


// setup stripe id when we know it
function setStripeId(passedStripeId){
    stripe.stripeId = passedStripeId;
} $.setStripeId = setStripeId;

// if user does not have a stripe id we create one
function createStripeId(passedUserInfo, callbackSuccess, callbackError){
    stripe.createCustomer(passedUserInfo, callbackSuccess, callbackError);
} $.createStripeId = createStripeId;
